import React, { useEffect, useState } from 'react';
import { Calendar, Users, Copy } from 'lucide-react';
import { authFetch } from '../../utils/authFetch';
import { toast } from 'sonner';

const Overview = () => {
  const [latestBooking, setLatestBooking] = useState(null);

  useEffect(() => {
    const fetchLatestBooking = async () => {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user-booking/manual-and-online-booking`
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch booking');
        }
        // Get the latest booking (first item in the array)
        if (data.data && data.data.length > 0) {
          setLatestBooking(data.data[0]);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to fetch booking');
      }
    };

    fetchLatestBooking();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!latestBooking) return null;

  const bookingReference =
    latestBooking.manualBookingId || latestBooking.passengerNameRecord;
  const daysToGo = Math.ceil(
    (new Date(latestBooking.departureDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-container px-2 md:px-6 py-5 rounded-sm space-y-6">
      <div>
        <h1 className="title-t1 text-background-on">Profile Overview</h1>
        <p className="label-l1 text-neutral-dark">
          Welcome back! Here's your account summary and recent activity.
        </p>
      </div>

      {/* Booking Confirmation Card */}
      <div className="bg-green-50 p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 rounded-full p-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="title-t2 font-semibold text-green-700">
            Your booking is confirmed
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="label-l1 text-green-700">Booking reference:</span>
          <span className="label-l3 bg-container px-2 py-1 rounded border">
            {bookingReference}
          </span>
          <button
            onClick={() => copyToClipboard(bookingReference)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <p className="label-l2 text-neutral-dark">
          A confirmation email and itinerary will be sent to{' '}
          {latestBooking.user.email} within 24 hours
        </p>

        <p className="label-l2 text-neutral-dark">
          Make a note of your booking reference to check your details
        </p>
      </div>

      {/* Trip Card */}
      <div className="bg-primary-bright-variant text-primary-on p-6 rounded-lg">
        <div className="flex flex-col gap-3 md:gap-0 md:flex-row justify-between items-start">
          {/* <div className="flex justify-between items-start gap-3"> */}
          <div className="space-y-4">
            {(latestBooking.destinationAirport?.municipality ||
              latestBooking.destination) && (
              <h2 className="title-t1 ">
                {latestBooking.destinationAirport?.municipality ||
                  latestBooking.destination}{' '}
                Trip
              </h2>
            )}
            <div className="flex items-center gap-6">
              {daysToGo > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{daysToGo} days to go!</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="label-l2 ">
                  {latestBooking.flightTickets?.length ||
                    latestBooking.detail?.travelers?.length ||
                    1}{' '}
                  passengers
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Booking reference:</span>
              <span className="bg-primary label-l3 px-2 py-1 rounded">
                {bookingReference}
              </span>
            </div>
          </div>
          {/* <div className="block md:hidden bg-container text-primary px-3 py-1 rounded-full label-l2 ">
              {latestBooking.firstDepartureAirline?.airlineName}
            </div> */}
          {/* </div> */}

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2">
            <div className=" bg-container text-primary px-3 py-1 rounded-full label-l2 font-medium">
              {latestBooking.firstDepartureAirline?.airlineName}
            </div>
            <div className="flex items-center gap-2 bg-primary text-primary-on px-3 py-1 rounded-full label-l2">
              <span>{latestBooking.origin}</span>
              <span>→</span>
              <span>{latestBooking.destination}</span>
            </div>
          </div>
        </div>

        {/* <div className="mt-4">
          <button className="bg-container text-primary  px-4 py-2 label-l1 rounded-md  hover:bg-blue-50 transition-colors">
            Manage Booking
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Overview;
