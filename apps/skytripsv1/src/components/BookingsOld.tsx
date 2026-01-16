import { useState, useEffect } from 'react';
import { Calendar, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '../utils/authFetch';
import airlineData from 'libs/src/shared-utils/constants/airline.json';
import Image from 'next/image';
import { airports } from 'libs/src/shared-utils/constants/airports.js';
import React from 'react';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

function getAirlineNameByIATA(iataCode: string): string {
  if (!iataCode) return '';
  const airline = airlineData.airlinecodes.find(
    (a: any) => a.iata === iataCode
  );
  return airline ? airline.name : iataCode;
}

function getAirportNameByIATA(iataCode: string): string {
  if (!iataCode) return '';
  const airport = airports.find((a: any) => a.IATA === iataCode);
  return airport ? airport.city : iataCode;
}

interface BookingsProps {
  me: any;
  loading: boolean;
}

const Bookings: React.FC<BookingsProps> = ({ me, loading }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (activeTab !== 'upcoming') return;
      if (loading) return;
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        flightDepartureStartDate: today,
      });
      params.append('status', 'ISSUED');
      params.append('status', 'PAID');
      try {
        const res = await authFetch(
          `${
            process.env.NEXT_PUBLIC_REST_API
          }/user-booking?${params.toString()}`
        );
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to fetch bookings');
          throw new Error(data.message || 'Failed to fetch bookings');
        }
        setUpcomingBookings(data.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch bookings');
        setUpcomingBookings([]);
      }
    };
    fetchBookings();
  }, [activeTab, loading]);

  useEffect(() => {
    const fetchPastBookings = async () => {
      if (activeTab !== 'past') return;

      setLoadingPast(true);
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        flightDepartureEndDate: yesterday,
      });

      try {
        const res = await authFetch(
          `${
            process.env.NEXT_PUBLIC_REST_API
          }/user-booking?${params.toString()}`
        );
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to fetch bookings');
          throw new Error(data.message || 'Failed to fetch bookings');
        }
        setPastBookings(data.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch bookings');
        setPastBookings([]);
      } finally {
        setLoadingPast(false);
      }
    };

    fetchPastBookings();
  }, [activeTab]);

  const filteredUpcomingBookings = upcomingBookings.filter(
    (booking) =>
      booking.passengerNameRecord
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAirportNameByIATA(
        booking.detail?.flightOffers?.[0]?.itineraries?.[0]?.segments?.[0]
          ?.arrival?.iataCode || ''
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );
  const filteredPastBookings = pastBookings.filter(
    (booking) =>
      booking.passengerNameRecord
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAirportNameByIATA(
        booking.detail?.flightOffers?.[0]?.itineraries?.[0]?.segments?.[0]
          ?.arrival?.iataCode || ''
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center bg-white border rounded-md px-4 py-2 w-full ">
          <svg
            className="w-5 h-5 text-gray-400 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
            placeholder="Search by booking ID or destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2  label-l1 w-full rounded-sm ${
              activeTab === tab.key
                ? 'bg-primary text-primary-on'
                : 'bg-dark text-background-on'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'upcoming' && (
          <div className="bg-container p-4">
            {loading ? (
              <div>Loading...</div>
            ) : filteredUpcomingBookings.length === 0 ? (
              <div>No bookings found.</div>
            ) : (
              filteredUpcomingBookings.map((booking) => {
                const flightOffer = booking.detail?.flightOffers?.[0];
                const outboundSegments =
                  flightOffer?.itineraries?.[0]?.segments || [];
                const inboundSegments =
                  flightOffer?.itineraries?.[1]?.segments || [];

                const departure = outboundSegments[0]?.departure;
                const finalArrival =
                  outboundSegments[outboundSegments.length - 1]?.arrival;
                const airlineCode = outboundSegments[0]?.carrierCode;
                const flightNumber = outboundSegments[0]?.number;
                const airlineName = getAirlineNameByIATA(airlineCode || '');

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border rounded-md flex flex-col md:flex-row gap-0 md:gap-4 items-center shadow-sm mb-4"
                  >
                    {/* Left: Placeholder or airline logo */}
                    <div className="bg-gray-200 flex flex-col items-center justify-center min-w-[180px] md:min-w-[200px] p-4 relative rounded-l-xl z-0">
                      <span className="absolute top-4 left-4 bg-container text-gray-600 text-xs font-semibold px-3 py-1 rounded-full border">
                        Flight
                      </span>
                      <div className="w-24 h-24 md:w-36 md:h-36 bg-gray-100 rounded-lg border flex items-center justify-center ">
                        {/* <svg
                          width="40"
                          height="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4l3 3" />
                        </svg> */}
                        <Image
                          src="/assets/logo.svg"
                          alt="airline logo"
                          width={100}
                          height={40}
                        />
                      </div>
                    </div>
                    {/* Right: Booking details */}
                    <div className="flex-1 px-6 py-4 flex flex-col gap-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h2 className="h4 text-background-on mb-0">
                            {departure?.iataCode
                              ? getAirportNameByIATA(departure.iataCode)
                              : ''}{' '}
                            to{' '}
                            {finalArrival?.iataCode
                              ? getAirportNameByIATA(finalArrival.iataCode)
                              : ''}
                          </h2>
                          <div className="flex items-center gap-2 text-neutral-dark label-l2 text-base mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {departure?.at
                                ? new Date(departure.at)
                                    .toISOString()
                                    .split('T')[0]
                                : ''}
                              {flightOffer?.itineraries?.length > 1 &&
                              flightOffer?.itineraries[1]?.segments[0]
                                ?.departure?.at
                                ? ` - ${
                                    new Date(
                                      flightOffer.itineraries[1].segments[0].departure.at
                                    )
                                      .toISOString()
                                      .split('T')[0]
                                  }`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-success label-l3 font-semibold px-3 py-1 rounded-full border border-green-200">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-8  mb-1">
                        <div>
                          <p className="label-l2 text-neutral-dark">
                            Booking ID
                          </p>
                          <p className="body-b2 text-background-on">
                            {booking.passengerNameRecord}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Airline</p>
                          <p className="body-b2 text-background-on">
                            {airlineName}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Flight</p>
                          <p className="body-b2 text-background-on">
                            {airlineCode}
                            {flightNumber}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Price</p>
                          <p className="body-b2 text-background-on">
                            {flightOffer?.price?.billingCurrency
                              ? flightOffer?.price?.billingCurrency
                              : flightOffer?.price?.currency}{' '}
                            {booking.sellingPrice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        {activeTab === 'past' && (
          <div className="bg-container p-4">
            {loadingPast ? (
              <div>Loading...</div>
            ) : filteredPastBookings.length === 0 ? (
              <div>No bookings found.</div>
            ) : (
              filteredPastBookings.map((booking) => {
                const flightOffer = booking.detail?.flightOffers?.[0];
                const outboundSegments =
                  flightOffer?.itineraries?.[0]?.segments || [];
                const inboundSegments =
                  flightOffer?.itineraries?.[1]?.segments || [];

                const departure = outboundSegments[0]?.departure;
                const finalArrival =
                  outboundSegments[outboundSegments.length - 1]?.arrival;
                const airlineCode = outboundSegments[0]?.carrierCode;
                const flightNumber = outboundSegments[0]?.number;
                const airlineName = getAirlineNameByIATA(airlineCode || '');

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border flex flex-col md:flex-row gap-0 md:gap-4 items-center shadow-sm mb-4"
                  >
                    {/* Left: Placeholder or airline logo */}
                    <div className="bg-gray-200 flex flex-col items-center justify-center min-w-[180px] md:min-w-[200px] p-4 relative rounded-l-xl z-0">
                      <span className="absolute top-4 left-4 bg-container text-gray-600 text-xs font-semibold px-3 py-1 rounded-full border">
                        Flight
                      </span>
                      <div className="w-24 h-24 md:w-36 md:h-36 bg-gray-100 rounded-lg border flex items-center justify-center ">
                        <Image
                          src="/assets/logo.svg"
                          alt="airline logo"
                          width={100}
                          height={40}
                        />
                      </div>
                    </div>
                    {/* Right: Booking details */}
                    <div className="flex-1 px-6 py-4 flex flex-col gap-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h2 className="h4 text-background-on mb-0">
                            {departure?.iataCode
                              ? getAirportNameByIATA(departure.iataCode)
                              : ''}{' '}
                            to{' '}
                            {finalArrival?.iataCode
                              ? getAirportNameByIATA(finalArrival.iataCode)
                              : ''}
                          </h2>
                          <div className="flex items-center gap-2 text-neutral-dark label-l2 text-base mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {departure?.at
                                ? new Date(departure.at)
                                    .toISOString()
                                    .split('T')[0]
                                : ''}
                              {flightOffer?.itineraries?.length > 1 &&
                              flightOffer?.itineraries[1]?.segments[0]
                                ?.departure?.at
                                ? ` - ${
                                    new Date(
                                      flightOffer.itineraries[1].segments[0].departure.at
                                    )
                                      .toISOString()
                                      .split('T')[0]
                                  }`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-dark text-neutral-dark label-l3  px-4 py-1 rounded-full border border-gray-200">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-8  mb-1">
                        <div>
                          <p className="label-l2 text-neutral-dark">
                            Booking ID
                          </p>
                          <p className="body-b2 text-background-on">
                            {booking.passengerNameRecord}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Airline</p>
                          <p className="body-b2 text-background-on">
                            {airlineName}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Flight</p>
                          <p className="body-b2 text-background-on">
                            {airlineCode}
                            {flightNumber}
                          </p>
                        </div>
                        <div>
                          <p className="label-l2 text-neutral-dark">Price</p>
                          <p className="body-b2 text-background-on">
                            {flightOffer?.price?.billingCurrency
                              ? flightOffer?.price?.billingCurrency
                              : flightOffer?.price?.currency}{' '}
                            {booking.sellingPrice}
                          </p>
                        </div>
                      </div>
                      {/* <hr className="my-2" />
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <button className="ml-auto label-l1  border border-[#0c0073] text-primary rounded px-5 py-1.5 font-semibold hover:bg-gray-100">
                          View Details
                        </button>
                      </div> */}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        {activeTab === 'cancelled' && (
          <div className="bg-container p-4 h5 text-center text-background-on">
            Coming Soon...
          </div>
        )}
      </div>
      {/* Help Section */}
      <div className="bg-container rounded-md p-6 mt-8 shadow-sm">
        <h2 className="h4 text-background-on mb-6">
          Need Help With Your Booking?
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Card 1 */}
          <div className="flex-1 border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="title-t4 text-background-on mb-2">
                Cancellation Policy
              </h3>
              <p className="label-l2 text-neutral-dark mb-6">
                Cancel your booking easily—fees apply based on airline rules and
                fare conditions.
              </p>
            </div>
            <button
              className="border rounded-lg px-6 py-3 body-b2 text-background-on hover:bg-gray-100 transition"
              onClick={() =>
                window.open(
                  '/terms-and-conditions#cancellation-change',
                  '_blank'
                )
              }
            >
              View Policy
            </button>
          </div>
          {/* Card 2 */}
          <div className="flex-1 border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="title-t4 text-background-on mb-2">
                Re-Issue Policy
              </h3>
              <p className="label-l2 text-neutral-dark mb-6">
                Need to change your flight? Skytrips offers easy ticket
                re-issuance with a minimal service fee.
              </p>
            </div>
            <button
              className="border rounded-lg px-6 py-3 body-b2 text-background-on  hover:bg-gray-100 transition"
              onClick={() =>
                window.open('/terms-and-conditions#re-issue-policy', '_blank')
              }
            >
              View Policy
            </button>
          </div>
          {/* Card 3 */}
          <div className="flex-1 border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="title-t4 text-background-on mb-2">
                Contact Support
              </h3>
              <p className="label-l2 text-neutral-dark mb-6">
                Need assistance with your booking? Our support team is here to
                help.
              </p>
            </div>
            <button
              className="bg-primary  rounded-lg px-6 py-3 body-b2 text-secondary-on  hover:bg-[#5143d9] transition"
              onClick={() => window.open('/contact-us', '_blank')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
