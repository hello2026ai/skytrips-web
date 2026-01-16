import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  FaWhatsapp,
  FaViber,
  FaRegCommentDots,
  FaFacebookMessenger,
  FaFacebook,
} from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { toast } from 'sonner';
import { authFetch } from '../utils/authFetch';

interface ReferAndEarnSectionProps {
  referralCode: string;
  baseUrl: string;
}

interface ReferralData {
  referrals: number;
  totalAmount: number;
  remainingAmount: number;
  currencyCode: string;
  status: string;
}

interface ReferralHistory {
  id: string;
  referralCode: string;
  referrerId: string;
  amount: number;
  currencyCode: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    bookingNumber: string;
    bookingDate: string;
    bookingAmount: number;
    currencyCode: string;
    paymentStatus: string;
    manualPassengerNameRecord?: string;
    passengerNameRecord?: string;
    createdAt: string;
    user: {
      email: string;
    };
  };
  payment: {
    id: string;
    paymentDate: string;
    paymentAmount: number;
    currencyCode: string;
  };
  referSetting: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currencyCode: string;
  };
}

interface ReferralHistoryResponse {
  data: ReferralHistory[];
  meta: {
    total: number;
    limit: number;
    page: number;
  };
}

interface ReferralSetting {
  id: string;
  name: string;
  description: string;
  amount: number;
  currencyCode: string;
}

const ReferAndEarnSection: React.FC<ReferAndEarnSectionProps> = ({
  referralCode,
  baseUrl,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Fixed limit of 5 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [referralSetting, setReferralSetting] =
    useState<ReferralSetting | null>(null);
  const referralLink = `${baseUrl}?ref=${referralCode}`;

  useEffect(() => {
    const fetchReferralSettings = async () => {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user/refer-and-earn/setting`
        );
        const data = await response.json();
        console.log('data', data);
        if (response.ok && data.data.length > 0) {
          setReferralSetting(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching referral settings:', error);
      }
    };

    fetchReferralSettings();
  }, []);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user/refer-and-earn`
        );
        const data = await response.json();
        if (response.ok) {
          setReferralData(data);
        } else {
          console.error('Failed to fetch referral data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  useEffect(() => {
    const fetchReferralHistory = async () => {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user/refer-and-earn/referrals?page=${page}&limit=${limit}`
        );
        const data: ReferralHistoryResponse = await response.json();
        if (response.ok) {
          setReferralHistory(data.data);
          setTotalPages(Math.ceil(data.meta.total / limit));
        } else {
          console.error('Failed to fetch referral history:', data);
        }
      } catch (error) {
        console.error('Error fetching referral history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (showModal) {
      fetchReferralHistory();
    }
  }, [showModal, page, limit]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      {/* Refer & Earn Card */}
      <div className="mt-6 rounded-xl bg-gradient-to-r from-[#0c0073] to-[#5143d9] p-4 text-primary-on shadow-md flex flex-col items-center ">
        <div className="flex items-start w-full justify-between mb-2">
          <div>
            <div className="title-t3 text-primary-on">Refer & Earn</div>
            <div className="label-l3 text-primary-on opacity-90">
              Share and Save
            </div>
          </div>
          <span className="px-1">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 17l-4.33 2.27 1.04-4.5L5 10.73l4.57-.39L12 6l2.43 4.34 4.57.39-3.71 3.99 1.04 4.5z"
                fill="#FFD600"
              />
            </svg>
          </span>
        </div>
        <div className="label-l3 text-primary-on mb-3 text-left w-full opacity-90">
          Invite friends and earn rewards for every successful booking
        </div>
        <button
          className="w-full bg-container text-primary hover:bg-[#d9d9d9] py-2 rounded-lg transition"
          onClick={() => setShowModal(true)}
        >
          Share & Earn
        </button>
      </div>

      {/* Modal */}
      {showModal &&
        typeof window !== 'undefined' &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center bg-black bg-opacity-50 pt-8 md:pt-0">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative z-[10000]">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-white hover:border"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18" stroke="#fff" strokeWidth="2" />
                  <path d="M6 6L18 18" stroke="#fff" strokeWidth="2" />
                </svg>
              </button>
              <div className="p-6 max-w-lg w-full max-h-[60vh] md:max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#0c0073] to-[#5143d9] rounded-t-xl -mx-6 -mt-6 px-6 py-4">
                  <h2 className="title-t2 text-primary-on mb-1">
                    Invite friends and earn rewards!
                  </h2>
                  <p className="label-l3 text-primary-on">
                    Invite your friends to SkyTrips and earn{' '}
                    {referralSetting?.currencyCode}{' '}
                    {referralSetting?.amount || 0} for each friend who completes
                    a booking.
                  </p>
                </div>
                <div className="mt-6">
                  <div className="title-t4 text-background-on mb-1">
                    Share your link!
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm text-gray-700"
                      value={referralLink}
                      readOnly
                      onFocus={(e) => e.target.select()}
                    />
                    <div className="relative flex items-center">
                      <button
                        className="bg-gray-200 px-3 py-1 rounded label-l2 font-medium"
                        onClick={() => {
                          navigator.clipboard.writeText(referralLink);
                          setCopied(true);
                          toast.success('Referral link copied!');
                          setTimeout(() => setCopied(false), 1200);
                        }}
                        onBlur={() => setCopied(false)}
                      >
                        Copy
                      </button>
                      {copied && (
                        <span className="absolute left-1/2 -translate-x-1/2 -top-7 label-l3 bg-dark text-background-on rounded px-2 py-1 shadow z-10 whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="title-t4 text-background-on mb-1">
                    Share to your network!
                  </div>
                  <div className="flex gap-4 mb-4">
                    {/* Messenger */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        referralLink
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition">
                        <FaFacebook className="w-4 h-4 text-blue-600" />
                      </div>
                    </a>
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${referralLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition">
                        <FaWhatsapp className="w-4 h-4 text-green-500" />
                      </div>
                    </a>

                    {/* Gmail */}
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&su=Sharing My SkyTrips Referral link for Your Next Booking&body=I'm sharing my SkyTrips referral link with you! If you're planning to book a flight, please consider using my link below: %0A${referralLink}%0A%0AWhen you book your flight through this link, I'll receive a small reward from SkyTrips.%0A%0AThanks in advance for the support!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:block"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition">
                        <SiGmail className="w-4 h-4 text-red-500" />
                      </div>
                    </a>

                    {/* Viber */}
                    <div
                      onClick={() => {
                        const link = `viber://forward?text=${encodeURIComponent(
                          referralLink
                        )}`;
                        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                          window.location.href = link;
                        } else if (navigator.share) {
                          navigator.share({
                            title: 'Referral',
                            text: referralLink,
                          });
                        } else {
                          navigator.clipboard.writeText(referralLink);
                        }
                      }}
                      className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition block md:hidden"
                    >
                      <FaViber className="w-4 h-4 text-purple-500" />
                    </div>

                    <div
                      onClick={() => {
                        const link = `imo://share?text=${encodeURIComponent(
                          referralLink
                        )}`;
                        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                          window.location.href = link;
                        } else if (navigator.share) {
                          navigator.share({
                            title: 'Referral',
                            text: referralLink,
                          });
                        } else {
                          navigator.clipboard.writeText(referralLink);
                        }
                      }}
                      className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition block md:hidden"
                    >
                      <FaRegCommentDots className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Facebook */}
                  </div>

                  {/* Referral Journey Summary */}
                  <div className="mt-6">
                    <div className="title-t3 text-background-on mb-1 text-center">
                      Your Referral Journey
                    </div>
                    <div className="label-l2 text-neutral-dark text-center mb-4">
                      Earn {referralSetting?.currencyCode}{' '}
                      {referralSetting?.amount || 0} for every friend who
                      completes their first booking with SkyTrips!
                    </div>
                    <div className="flex flex-col sm:flex-row gap-7 w-full justify-center">
                      <div className="flex-1 min-w-[70px] bg-green-50 border border-green-100 rounded-xl py-4 px-0 flex flex-col items-center">
                        <span className="h5 text-success">
                          {loading ? '...' : referralData?.referrals || 0}
                        </span>
                        <span className="label-l1 text-background-on mt-1">
                          Paid Bookings
                        </span>
                      </div>

                      <div className="flex-1 min-w-[70px] bg-yellow-50 border border-yellow-100 rounded-xl py-4 px-0 flex flex-col items-center">
                        <span className="h5 text-secondary-light">
                          {loading
                            ? '...'
                            : `${referralData?.currencyCode || 'AUD'} ${
                                referralData?.totalAmount || 0
                              }`}
                        </span>
                        <span className="label-l1 text-background-on mt-1">
                          Total Earned
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Referral Bookings */}
                  <div className="mt-8">
                    <div className="title-t3 text-background-on mb-3">
                      Recent Referral Bookings
                    </div>
                    <div className="flex flex-col gap-4">
                      {historyLoading ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : referralHistory.length > 0 ? (
                        <>
                          {referralHistory.map((referral) => (
                            <div
                              key={referral.id}
                              className="flex flex-row items-start  justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="title-t4 text-background-on">
                                    {referral.booking
                                      .manualPassengerNameRecord ||
                                      referral.booking.passengerNameRecord}
                                  </span>
                                  <span className="label-l3 text-neutral-dark">
                                    {formatDate(referral.booking.createdAt)}
                                  </span>
                                  {referral?.booking?.paymentStatus ===
                                    'PAID' && (
                                    <span className="bg-green-100 text-green-700 label-l3 rounded-full px-3 py-1 ml-2">
                                      {referral?.booking?.paymentStatus
                                        ? 'Completed'
                                        : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="label-l2 text-background-on">
                                  {referral.booking.user.email}
                                </div>
                              </div>
                              <div className="flex flex-col items-end mt-3 sm:mt-0">
                                <span className="text-primary title-t3">
                                  {referral.currencyCode} {referral.amount}
                                </span>
                                <span className="text-neutral-dark text-xs">
                                  Earned
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No referral bookings yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ReferAndEarnSection;
