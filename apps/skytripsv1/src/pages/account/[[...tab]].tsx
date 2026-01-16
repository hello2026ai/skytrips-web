import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CustomSidebar from '../../components/CustomSidebar';
import PersonalInfo from '../../components/PersonalInfo';
import PassengerDetails from '../../components/PassengerDetails';
import SecuritySettings from '../../components/SecuritySettings';
import Bookings from '../../components/Bookings';
import ReferAndEarnSection from '../../components/ReferAndEarnSection';
import Overview from '../../components/Overview';

import { Menu } from 'lucide-react';
import { authFetch } from '../../utils/authFetch';
import DeleteAccount from '../../components/DeleteAccount';

const getActiveTab = (tabArr: string[] | undefined): string => {
  if (!tabArr || tabArr.length === 0) return 'overview';
  if (tabArr[0] === 'overview') return 'overview';
  if (tabArr[0] === 'bookings') return 'bookings';
  if (tabArr[0] === 'profile') return 'profile';
  if (tabArr[0] === 'passengers') return 'passengers';
  if (tabArr[0] === 'security') return 'security';
  if (tabArr[0] === 'delete-account') return 'delete-account';
  // Legacy support for /settings paths
  if (tabArr[0] === 'settings') {
    if (tabArr[1] === 'profile') return 'profile';
    if (tabArr[1] === 'passengers') return 'passengers';
    if (tabArr[1] === 'security') return 'security';
    if (tabArr[1] === 'delete-account') return 'delete-account';
    return 'profile'; // default to profile if /settings
  }
  return 'overview';
};

const getPathFromTab = (tab: string): string => {
  switch (tab) {
    case 'overview':
      return '/account/overview';
    case 'profile':
      return '/account/profile';
    case 'passengers':
      return '/account/passengers';
    case 'security':
      return '/account/security';
    case 'delete-account':
      return '/account/delete-account';
    case 'bookings':
      return '/account/bookings';
    default:
      return '/account/overview';
  }
};

const Account = () => {
  const router = useRouter();
  const tabArr = Array.isArray(router.query.tab) ? router.query.tab : [];
  const activeTab = getActiveTab(tabArr as string[]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Fetch /me data once
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        setLoading(true);
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/auth/me`
        );
        const data = await res.json();
        setMe(data);
      } catch (err) {
        setMe(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  // Add refreshMe function
  const refreshMe = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/me`
      );
      const data = await res.json();
      setMe(data);
    } catch (err) {
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    router.push(getPathFromTab(tab));
    setMobileSidebarOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'profile':
        return <PersonalInfo me={me} loading={loading} refreshMe={refreshMe} />;
      case 'passengers':
        return <PassengerDetails me={me} loading={loading} />;
      case 'security':
        return <SecuritySettings me={me} loading={loading} />;
      case 'delete-account':
        return <DeleteAccount me={me} loading={loading} />;
      case 'bookings':
        return <Bookings me={me} loading={loading} />;
      default:
        return <Overview />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="w-full md:hidden">
          {me && (
            <ReferAndEarnSection
              referralCode={me.referralCode || ''}
              baseUrl={
                process.env.NEXT_PUBLIC_BASE_URL || 'https://skytrips.com.au'
              }
            />
          )}
        </div>
        <div className="flex flex-row">
          <div className="sticky top-8 mt-8 self-start hidden md:block">
            <CustomSidebar
              activePath={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
          <div className="block md:hidden">
            <CustomSidebar
              activePath={activeTab}
              onTabChange={handleTabChange}
              mobileOpen={mobileSidebarOpen}
              setMobileOpen={setMobileSidebarOpen}
            />
          </div>
          <div className="flex-1 md:p-8 md:pr-0 mt-3 md:mt-0">
            {renderTabContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Account;
