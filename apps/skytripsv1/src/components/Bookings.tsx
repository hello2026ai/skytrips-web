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
  //   { key: 'cancelled', label: 'Cancelled' },
];

function getAirlineNameByIATA(iataCode: string): string {
  if (!iataCode) return '';
  const airline = airlineData.airlinecodes.find(
    (a: any) => a.iata === iataCode
  );
  return airline ? airline.name : iataCode;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  // Handle both date-only strings and ISO date strings
  return dateString.split('T')[0];
};

interface BookingType {
  id: string;
  departureDate: string;
  status: string;
  // ... other booking properties
}

interface BookingsProps {
  me: any;
  loading: boolean;
}

const Bookings: React.FC<BookingsProps> = ({ me, loading }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (loading) return;
      setLoadingBookings(true);

      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user-booking/manual-and-online-booking`
        );
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to fetch bookings');
          throw new Error(data.message || 'Failed to fetch bookings');
        }
        setBookings(data.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch bookings');
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [loading]);

  const today = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (booking: BookingType) =>
      booking.departureDate >= today &&
      (booking.status === 'PAID' || booking.status === 'ISSUED')
  );

  const pastBookings = bookings.filter(
    (booking: BookingType) =>
      booking.departureDate < today &&
      (booking.status === 'PAID' || booking.status === 'ISSUED')
  );

  const getBookingId = (booking: any) => {
    if (booking.bookingType === 'MANUAL') {
      return booking.manualBookingId || booking.manualPassengerNameRecord;
    }
    return booking.passengerNameRecord || booking.bookingId;
  };

  const getOriginName = (booking: any) => {
    if (booking.bookingType === 'MANUAL') {
      return (
        booking.originAirport?.municipality ||
        booking.originAirport?.name ||
        booking.origin
      );
    }
    return (
      booking.originAirport?.municipality ||
      booking.origin?.municipality ||
      booking.origin?.name ||
      ''
    );
  };

  const getDestinationName = (booking: any) => {
    if (booking.bookingType === 'MANUAL') {
      return (
        booking.destinationAirport?.municipality ||
        booking.destinationAirport?.name ||
        booking.destination
      );
    }
    return (
      booking.destinationAirport?.municipality ||
      booking.destination?.municipality ||
      booking.destination?.name ||
      ''
    );
  };

  const getFlightTime = (booking: any) => {
    // Removing time display for consistency
    return '';
  };

  const filteredUpcomingBookings = upcomingBookings.filter(
    (booking) =>
      getBookingId(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getOriginName(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getDestinationName(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredPastBookings = pastBookings.filter(
    (booking) =>
      getBookingId(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getOriginName(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getDestinationName(booking)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const renderBookingCard = (booking: any) => {
    const isManual = booking.bookingType === 'MANUAL';
    const bookingId = getBookingId(booking);
    const originName = getOriginName(booking);
    const destinationName = getDestinationName(booking);
    const flightTime = getFlightTime(booking);

    return (
      <div
        key={booking.id}
        className="rounded-xl border rounded-md flex flex-col md:flex-row gap-0 md:gap-4 items-center shadow-sm mb-4"
      >
        {/* Left: Placeholder or airline logo */}
        <div className="bg-gray-200 flex flex-col items-center justify-center min-w-[180px] md:min-w-[200px] p-4 relative rounded-l-xl z-0">
          <span className="absolute top-4 left-4 bg-container text-gray-600 text-xs font-semibold px-3 py-1 rounded-full border">
            {/* {isManual ? 'Manual Flight' : 'Flight'} */}
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
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="h4 text-background-on mb-0">
                {originName} to {destinationName}
              </h2>
              <div className="flex items-center gap-2 text-neutral-dark label-l2 text-base mb-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(booking.departureDate)}{' '}
                  {booking.arrivalDate &&
                    `- ${formatDate(booking.arrivalDate)}`}
                  {flightTime && ` (${flightTime})`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`${
                  activeTab === 'upcoming'
                    ? 'bg-green-100 text-success border-green-200'
                    : 'bg-dark text-neutral-dark border-gray-200'
                } label-l3 font-semibold px-3 py-1 rounded-full border`}
              >
                {booking.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 mb-1">
            <div>
              <p className="label-l2 text-neutral-dark">Booking ID</p>
              <p className="body-b2 text-background-on">{bookingId}</p>
            </div>
            {/* {isManual &&
              booking.flightTickets &&
              booking.flightTickets.length > 0 && (
                <div>
                  <p className="label-l2 text-neutral-dark">Passengers</p>
                  <p className="body-b2 text-background-on">
                    {booking.flightTickets
                      .map((ticket: any) => ticket.passengerName)
                      .join(', ')}
                  </p>
                </div>
              )} */}
            <div>
              <p className="label-l2 text-neutral-dark">Travel Class</p>
              <p className="body-b2 text-background-on">
                {booking.travelClass}
              </p>
            </div>
            <div>
              <p className="label-l2 text-neutral-dark">Trip Type</p>
              <p className="body-b2 text-background-on">
                {booking.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </p>
            </div>
            <div>
              <p className="label-l2 text-neutral-dark">Price</p>
              <p className="body-b2 text-background-on">
                {booking.currencyCode ? booking.currencyCode : 'AUD'}{' '}
                {booking.sellingPrice}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center bg-white border rounded-md px-4 py-2 w-full">
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
            className={`px-4 py-2 label-l1 w-full rounded-sm ${
              activeTab === tab.key
                ? 'bg-primary text-primary-on'
                : 'bg-dark text-background-on'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upcoming' && (
        <div className="bg-container p-4">
          {loadingBookings ? (
            <div>Loading...</div>
          ) : filteredUpcomingBookings.length === 0 ? (
            <div>No bookings found.</div>
          ) : (
            filteredUpcomingBookings.map(renderBookingCard)
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="bg-container p-4">
          {loadingBookings ? (
            <div>Loading...</div>
          ) : filteredPastBookings.length === 0 ? (
            <div>No bookings found.</div>
          ) : (
            filteredPastBookings.map(renderBookingCard)
          )}
        </div>
      )}

      {activeTab === 'cancelled' && (
        <div className="bg-container p-4 h5 text-center text-background-on">
          Coming Soon...
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12">
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
              className="border rounded-lg px-6 py-3 body-b2 text-background-on hover:bg-gray-100 transition"
              onClick={() =>
                window.open('/terms-and-conditions#re-issue-policy', '_blank')
              }
            >
              View Policy
            </button>
          </div>

          {/* Card 3 */}
          <div className="flex-1 border  rounded-xl p-6 flex flex-col justify-between  bg-opacity-5">
            <div>
              <h3 className="title-t4  text-background-on mb-2">
                Contact Support
              </h3>
              <p className="label-l2 text-neutral-dark mb-6">
                Need assistance with your booking? Our support team is here to
                help.
              </p>
            </div>
            <button
              className="bg-primary rounded-lg px-6 py-3 body-b2 text-secondary-on hover:bg-[#5143d9] transition"
              //   me="bg-primary  rounded-lg px-6 py-3 body-b2 text-secondary-on  hover:bg-[#5143d9] transition"
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
