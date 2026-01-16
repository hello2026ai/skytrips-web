import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Ticket,
  Heart,
  TrendingDown,
  Settings,
  X,
  CheckCircle,
  Menu,
  ChevronDown,
  Facebook,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { authFetch } from '../utils/authFetch';
import { toast } from 'sonner';
import { FaWhatsapp, FaViber, FaRegCommentDots } from 'react-icons/fa';
import ReferAndEarnSection from './ReferAndEarnSection';

const sidebarItems = [
  {
    label: 'Overview',
    href: '/account/overview',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'My Bookings',
    href: '/account/bookings',
    icon: <Ticket size={20} />,
  },
  {
    label: 'Account',
    href: '/account/settings',
    icon: <Settings size={20} />,
    children: [
      {
        label: 'Profile',
        href: '/account/settings/profile',
        icon: <User size={20} />,
      },
      {
        label: 'Add Passenger',
        href: '/account/settings/passengers',
        icon: <User size={20} />,
      },
      {
        label: 'Security Settings',
        href: '/account/settings/security',
        icon: <Settings size={20} />,
      },
      {
        label: 'Delete Account',
        href: '/account/settings/delete-account',
        icon: <X size={20} className="text-red-500" />,
      },
    ],
  },
];

// Simple Modal component
const Modal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full   hover:border"
        >
          <X size={20} color="white" />
        </button>
        {children}
      </div>
    </div>
  );
};

// Add onTabChange prop to the props type
type CustomSidebarProps = {
  activePath: string;
  onTabChange?: (tab: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
};

// Map hrefs to tab keys for tab navigation
const hrefToTab: Record<string, string> = {
  '/account/overview': 'overview',
  '/account/profile': 'profile',
  '/account/passengers': 'passengers',
  '/account/security': 'security',
  '/account/delete-account': 'delete-account',
  '/account/bookings': 'bookings',
  '/account/settings': 'settings',
  // Legacy support for old URLs
  '/account/settings/profile': 'profile',
  '/account/settings/passengers': 'passengers',
  '/account/settings/security': 'security',
  '/account/settings/delete-account': 'delete-account',
};

const CustomSidebar = ({
  activePath,
  onTabChange,
  mobileOpen,
  setMobileOpen,
}: CustomSidebarProps) => {
  const [user, setUser] = useState<{
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    isVerified?: boolean;
    referralCode?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(
    activePath === 'profile' ||
      activePath === 'passengers' ||
      activePath === 'security' ||
      activePath === 'delete-account' ||
      activePath === 'settings'
  );
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add this useEffect to sync dropdown with activePath
  useEffect(() => {
    setAccountSettingsOpen(
      activePath === 'profile' ||
        activePath === 'passengers' ||
        activePath === 'security' ||
        activePath === 'delete-account' ||
        activePath === 'settings'
    );
  }, [activePath]);

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : '';

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res: Response) => res.json())
      .then((data: any) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [success]);

  const handleSendVerification = () => {
    setShowVerifyModal(true);
    setError('');
    setOtp('');
  };

  const handleVerifyOtp = async () => {
    if (!user?.email || otp.length !== 6) return;
    setVerifying(true);
    setError('');
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: otp }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Invalid or expired code');
        throw new Error(data.message || 'Invalid or expired code');
      }
      toast.success(data.message || 'Email verified successfully!');
      setSuccess(true);
      setShowVerifyModal(false);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    }
    setVerifying(false);
  };

  const handleResendOtp = async () => {
    if (!user?.email) return;
    setSending(true);
    setError('');
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/resend-verification-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to resend OTP');
        throw new Error(data.message || 'Failed to resend OTP');
      }
      toast.success(data.message || 'OTP resent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
    setSending(false);
  };

  // Use referralCode from user data or fallback

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://skytrips.com.au/';
  console.log('baseUrl', baseUrl);
  // Sidebar content as a function for reuse
  const sidebarContent = (
    <>
      <div className="flex flex-col items-center px-4 pb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-on h5">
          {user?.firstName
            ? user.firstName.charAt(0).toUpperCase()
            : user?.email
            ? user?.email.charAt(0).toUpperCase()
            : '?'}
        </div>
        {loading ? (
          <span className="text-gray-400 text-sm">Loading...</span>
        ) : user?.email ? (
          <>
            {/* <span className="text-gray-700 label-l3 text-background-on break-all">
              {user.email}
            </span> */}
            <span
              className={`label-l3 mt-1 flex items-center gap-1 ${
                user.isVerified
                  ? 'text-green-600'
                  : 'text-primary-bright-variant cursor-pointer hover:underline'
              }`}
              onClick={!user.isVerified ? handleSendVerification : undefined}
              role={!user.isVerified ? 'button' : undefined}
              tabIndex={!user.isVerified ? 0 : undefined}
            >
              {user.isVerified ? (
                <>
                  <CheckCircle size={14} className="text-green-600" /> Verified
                </>
              ) : (
                'Verify your email'
              )}
            </span>
          </>
        ) : (
          <span className="text-gray-400 label-l2">Not logged in</span>
        )}
      </div>
      <nav>
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    type="button"
                    className={`flex items-center gap-3 px-4  rounded-sm label-l1 transition-colors w-full text-left text-background-on hover:bg-primary-variant`}
                    onClick={() => setAccountSettingsOpen((open) => !open)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span
                      className="ml-auto transition-transform"
                      style={{
                        transform: accountSettingsOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  {accountSettingsOpen && (
                    <ul className="pl-8 mt-1 space-y-0">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <button
                            type="button"
                            className={`flex items-center gap-2 px-3 py-2 rounded label-l2 w-full text-left ${
                              activePath === hrefToTab[child.href]
                                ? 'bg-primary text-primary-on'
                                : 'text-background-on hover:bg-primary-variant'
                            }`}
                            onClick={() => {
                              onTabChange && onTabChange(hrefToTab[child.href]);
                              setMobileOpen && setMobileOpen(false);
                            }}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className={`flex items-center gap-3 px-4 py-2 rounded-sm label-l1 transition-colors w-full text-left ${
                    activePath === hrefToTab[item.href]
                      ? 'bg-primary text-primary-on'
                      : 'text-background-on hover:bg-primary-variant'
                  }`}
                  onClick={() => {
                    onTabChange && onTabChange(hrefToTab[item.href]);
                    setMobileOpen && setMobileOpen(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {/* Refer & Earn Section */}
      {baseUrl && (
        <ReferAndEarnSection
          referralCode={user?.referralCode || ''}
          baseUrl={baseUrl}
        />
      )}
    </>
  );

  useEffect(() => {
    if (showReferralModal || showVerifyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showReferralModal, showVerifyModal]);

  return (
    <>
      {/* Sidebar for desktop */}
      <aside className="w-56 bg-container  min-h-full py-4 px-1 hidden md:block">
        {sidebarContent}
      </aside>
      {/* Sidebar drawer for mobile */}
      {/* {mobileOpen && setMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
      
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-gray-50 border-r min-h-full py-4 shadow-xl animate-slide-in-left">
            <button
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )} */}
      <Modal open={showVerifyModal} onClose={() => setShowVerifyModal(false)}>
        <div className="p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="mb-2 text-sm text-center">
            We've sent a 6-digit verification code to{' '}
            <span className="font-semibold text-blue-700">{user?.email}</span>
          </p>
          <div className="flex gap-2 mb-4">
            {[...Array(6)].map((_, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={otp[idx] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(otp.substring(0, idx) + val + otp.substring(idx + 1));
                  if (val && idx < 5) {
                    const next = document.getElementById(
                      `otp-input-${idx + 1}`
                    );
                    if (next) (next as HTMLInputElement).focus();
                  }
                }}
                id={`otp-input-${idx}`}
                className="w-10 h-12 text-center border rounded text-lg"
                autoFocus={idx === 0}
                onPaste={
                  idx === 0
                    ? (e) => {
                        const paste = e.clipboardData
                          .getData('text')
                          .replace(/[^0-9]/g, '');
                        if (paste.length === 6) {
                          setOtp(paste);
                          setTimeout(() => {
                            const last = document.getElementById('otp-input-5');
                            if (last) (last as HTMLInputElement).focus();
                          }, 0);
                          e.preventDefault();
                        }
                      }
                    : undefined
                }
              />
            ))}
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded mb-2 disabled:opacity-50"
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || verifying}
          >
            {verifying ? 'Verifying...' : 'Verify Account'}
          </button>
          <div className="text-sm mt-2">
            Didn't receive the code?{' '}
            <button
              className="text-blue-600 underline"
              onClick={handleResendOtp}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomSidebar;
