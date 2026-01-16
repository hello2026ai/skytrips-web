'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  ChevronDown,
  Menu,
  Phone,
  X,
  User,
  LogOut,
  Ticket,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import SignInModal from './auth/SignInModal';
import { authFetch } from '../utils/authFetch';

interface CurrencyOption {
  value: string;
  flag: string;
  alt: string;
}

const currencyOptions: CurrencyOption[] = [
  {
    value: 'AUD',
    flag: '/assets/navbar/australiaFlag.png',
    alt: 'Australia Flag',
  },
  {
    value: 'JPY',
    flag: '/assets/navbar/japanFlag.webp',
    alt: 'Japan Flag',
  },
  {
    value: 'NPR',
    flag: '/assets/navbar/nepalFlag.png',
    alt: 'Nepal Flag',
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('AUD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<{
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
  } | null>(null);
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // TEMPORARILY USING ONLY AUD
    // Future implementation will restore multi-currency support
    let currentDomain = '';
    const finalCurrency = 'AUD'; // Currently hardcoded to AUD

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname.endsWith('.au')) {
        currentDomain = '.au';
      } else if (hostname.endsWith('.np')) {
        currentDomain = '.np';
      } else if (hostname.endsWith('.jp')) {
        currentDomain = '.jp';
      } else {
        // Default to .au for localhost and other domains
        currentDomain = '.au';
      }
    }

    // Get saved domain for comparison
    const savedDomain = localStorage.getItem('lastDomain');

    // Determine if we need to dispatch event (only on domain change)
    const shouldDispatchEvent = !savedDomain || savedDomain !== currentDomain;

    // Update state and localStorage
    if (finalCurrency !== selectedCurrency) {
      setSelectedCurrency(finalCurrency);
    }
    localStorage.setItem('selectedCurrency', finalCurrency);
    localStorage.setItem('lastDomain', currentDomain);

    // Dispatch event only when domain changes
    if (shouldDispatchEvent) {
      const currencyChangeEvent = new CustomEvent('currencyChange', {
        detail: { currency: finalCurrency },
      });
      window.dispatchEvent(currencyChangeEvent);
    }

    /* ORIGINAL MULTI-CURRENCY IMPLEMENTATION - Kept for future reference
    // Determine current domain and its currency from window location
    let currentDomain = '';
    let domainCurrency = 'AUD'; // default currency

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname.endsWith('.au')) {
        currentDomain = '.au';
        domainCurrency = 'AUD';
      } else if (hostname.endsWith('.np')) {
        currentDomain = '.np';
        domainCurrency = 'NPR';
      } else if (hostname.endsWith('.jp')) {
        currentDomain = '.jp';
        domainCurrency = 'JPY';
      } else {
        // Default to .au for localhost and other domains
        currentDomain = '.au';
        domainCurrency = 'AUD';
      }
    }

    // Check saved values
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedDomain = localStorage.getItem('lastDomain');

    let finalCurrency = domainCurrency;
    let shouldDispatchEvent = false;

    if (!savedCurrency || savedDomain !== currentDomain) {
      // First visit or domain changed - use domain currency
      finalCurrency = domainCurrency;
      shouldDispatchEvent = true;
    } else {
      // Same domain - use saved currency (user preference)
      finalCurrency = savedCurrency;
    }

    // Update state and localStorage
    if (finalCurrency !== selectedCurrency) {
      setSelectedCurrency(finalCurrency);
    }
    localStorage.setItem('selectedCurrency', finalCurrency);
    localStorage.setItem('lastDomain', currentDomain);

    // Dispatch event only when currency actually changes or domain changes
    if (shouldDispatchEvent) {
      const currencyChangeEvent = new CustomEvent('currencyChange', {
        detail: { currency: finalCurrency },
      });
      window.dispatchEvent(currencyChangeEvent);
    }
    */
  }, []);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (token) {
      authFetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          if (res.status === 404) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            router.push('/');
            return null;
          }
          const data = await res.json();
          setUser(data);
          return data;
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [isSignInModalOpen]);

  // Listen for profileUpdated event to refresh user data
  useEffect(() => {
    function handleProfileUpdated() {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then(async (res) => {
            if (res.status === 401) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              setUser(null);
              router.push('/');
              return null;
            }
            const data = await res.json();
            setUser(data);
            return data;
          })
          .catch(() => setUser(null));
      }
    }
    window.addEventListener('profileUpdated', handleProfileUpdated);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Add new click outside handler for currency dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
    }
    if (showCurrencyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCurrencyDropdown]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);

    // Update localStorage when user manually changes currency
    localStorage.setItem('selectedCurrency', currency);

    // Dispatch custom event for currency change
    const currencyChangeEvent = new CustomEvent('currencyChange', {
      detail: { currency },
    });
    window.dispatchEvent(currencyChangeEvent);
  };

  const displayName = user ? `${user.firstName || ''}`.trim() : '';
  const sinceText = user?.createdAt
    ? `Since ${new Date(user.createdAt).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      })}`
    : '';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value on mount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSignInSuccess = async (loginData: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${loginData.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const handleUserLogin = async (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken: string }>;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_REST_API}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${customEvent.detail.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Add event listener
    window.addEventListener('userLoggedIn', handleUserLogin);

    // Cleanup
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  return (
    <header className="container ">
      <div className="py-3 flex items-center justify-between ">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push('/')}
        >
          <Image
            src="/assets/logo.svg"
            alt="SkyTrips"
            width={100}
            height={100}
          />
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {/* <div className="relative" ref={currencyRef}>
              {router.pathname !== '/book' && (
                <>
                  <div
                    className="bg-container border border-2 label-l2 text-background-on focus:outline-none cursor-pointer px-1.5 py-1 rounded-sm flex items-center gap-2"
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                  >
                    <Image
                      src={
                        currencyOptions.find(
                          (opt) => opt.value === selectedCurrency
                        )?.flag || currencyOptions[0].flag
                      }
                      alt={
                        currencyOptions.find(
                          (opt) => opt.value === selectedCurrency
                        )?.alt || currencyOptions[0].alt
                      }
                      width={20}
                      height={15}
                      className="inline-block"
                    />
                    <span>{selectedCurrency}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showCurrencyDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {showCurrencyDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-container border rounded-sm shadow-lg z-50">
                      {currencyOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center label-l2 text-background-on gap-2 px-3 py-2 bg-container hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCurrencyChange(option.value)}
                        >
                          <Image
                            src={option.flag}
                            alt={option.alt}
                            width={20}
                            height={15}
                            className="inline-block"
                          />
                          <span>{option.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div> */}
            {user !== null ? (
              <div
                className="bg-primary relative flex items-center space-x-2 md:px-3 md:py-0.5 px-1 py-1.5 rounded-full"
                ref={avatarRef}
              >
                <div
                  className="cursor-pointer hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-container text-primary h5"
                  title={user.email}
                >
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : '?'}
                </div>
                <div
                  className="flex flex-row items-center gap-2 cursor-pointer"
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between  gap-1">
                      <span className="label-l2  text-primary-on">
                        {displayName
                          ? displayName
                          : user?.email && user.email.length > 10
                          ? user.email.slice(0, 10) + '...'
                          : user?.email || 'User'}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-1">
                      <span className="text-[8px] md:text-[11px] text-primary-on">
                        {sinceText}
                      </span>
                      <span className="hidden md:inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-on" />
                </div>
                {showProfileDropdown && (
                  <div
                    className={`absolute right-0  w-64 bg-white border rounded shadow z-50 ${
                      mobileAccountOpen ? 'mt-[18rem]' : 'mt-[13rem]'
                    }`}
                  >
                    {/* Only show this list in mobile view */}
                    {isMobile && (
                      <div>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2 border-b label-l1"
                          onClick={() => {
                            router.push('/account/overview');
                            setShowProfileDropdown(false);
                          }}
                        >
                          <LayoutDashboard size={20} />
                          Overview
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2 border-b label-l1"
                          onClick={() => {
                            router.push('/account/bookings');
                            setShowProfileDropdown(false);
                          }}
                        >
                          <Ticket size={20} />
                          My Bookings
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2 border-b "
                          onClick={() => setMobileAccountOpen((prev) => !prev)}
                        >
                          <Settings size={20} />
                          Account
                          <ChevronDown
                            className={`ml-auto transition-transform ${
                              mobileAccountOpen ? 'rotate-180' : ''
                            }`}
                            size={18}
                          />
                        </button>
                        {mobileAccountOpen && (
                          <div className="pl-8 label-l1">
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2"
                              onClick={() => {
                                router.push('/account/profile');
                                setShowProfileDropdown(false);
                              }}
                            >
                              <User size={20} />
                              Profile
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2"
                              onClick={() => {
                                router.push('/account/passengers');
                                setShowProfileDropdown(false);
                              }}
                            >
                              <User size={20} />
                              Add Passenger
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2"
                              onClick={() => {
                                router.push('/account/security');
                                setShowProfileDropdown(false);
                              }}
                            >
                              <Settings size={20} />
                              Security Settings
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-primary-variant flex items-center gap-2"
                              onClick={() => {
                                router.push('/account/delete-account');
                                setShowProfileDropdown(false);
                              }}
                            >
                              <X size={20} className="text-red-500" />
                              Delete Account
                            </button>
                          </div>
                        )}
                        {/* Logout always visible in mobile dropdown */}
                        <button
                          className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-red-600 label-l1"
                          onClick={() => {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('user');
                            setShowProfileDropdown(false);
                            setUser(null);
                            router.push('/');
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Sign out
                        </button>
                      </div>
                    )}
                    {/* ...existing dropdown content for desktop (if any)... */}
                    {/* Existing profile dropdown content remains here for desktop */}
                    {!isMobile && (
                      <div className="flex flex-col ">
                        <button
                          className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 label-l1 text-background-on"
                          onClick={() => {
                            router.push('/account/overview');
                            setShowProfileDropdown(false);
                          }}
                        >
                          <LayoutDashboard size={20} className="h-4 w-4 mr-1" />{' '}
                          Overview
                        </button>
                        <button
                          className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 label-l1 text-background-on"
                          onClick={() => {
                            router.push('/account/settings/profile');
                            setShowProfileDropdown(false);
                          }}
                        >
                          <User size={20} className="h-4 w-4 mr-1" /> Profile
                        </button>
                        <button
                          className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 label-l1 text-background-on"
                          onClick={() => {
                            router.push('/account');
                            setShowProfileDropdown(false);
                          }}
                        >
                          <Ticket size={20} className="h-4 w-4 mr-1" /> My
                          Bookings
                        </button>
                        {/* Logout always visible in desktop dropdown */}
                        <button
                          className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-red-600 label-l1"
                          onClick={() => {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('user');
                            setShowProfileDropdown(false);
                            setUser(null);
                            router.push('/');
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="bg-primary label-l2 text-primary-on focus:outline-none cursor-pointer px-3 py-1.5 rounded-sm flex items-center"
                onClick={() => setIsSignInModalOpen(true)}
              >
                <User className="inline-block mr-1 h-4 w-4" />
                Sign In / Register
              </div>
            )}
            {/* <div className="hidden md:flex items-center bg-gradient-to-r from-[#0C0073] to-[#0D3BAE] text-white px-2  py-2 rounded-full shadow-lg">
              <div className="bg-white p-1 rounded-full mr-2">
                <Image
                  src="/assets/icons/callIcon.svg"
                  alt="logo"
                  width={18}
                  height={18}
                />
              </div>

              <div>
                <span className="label-l2 hidden md:inline ">
                  {' '}
                  Need help? Call Us:
                </span>
                <span className="title-t4"> +61 240720886</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
    </header>
  );
}
