import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../../lib/axiosConfig';
import {
  Clock,
  Plane,
  CreditCard,
  User,
  Map,
  Phone,
  Mail,
  ReceiptText,
} from 'lucide-react';
import { NextSeo } from 'next-seo';

// Add print-specific styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .booking-confirmation-content, 
    .booking-confirmation-content * {
      visibility: visible;
    }
    .booking-confirmation-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

export default function ItineraryConfirmation() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [storedPNR, setStoredPNR] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Get the booking ID from the URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');
        console.log('URL bookingId:', bookingId);

        let attempts = 0;
        const maxAttempts = 5; // Try up to 5 times
        const retryDelay = 1000; // 1 second between attempts

        while (attempts < maxAttempts) {
          // Retrieve booking data from localStorage
          const storedData = localStorage.getItem(
            'skytrips_itinerary_booking_data'
          );
          const storedFlightData = localStorage.getItem(
            'skytrips_itinerary_flight_data'
          );
          const storedPNR = localStorage.getItem(
            'skytrips_itinerary_booking_PNR'
          );
          if (storedPNR) {
            setStoredPNR(storedPNR);
          }

          console.log(`Attempt ${attempts + 1} - storedData:`, storedData);
          console.log(
            `Attempt ${attempts + 1} - storedFlightData:`,
            storedFlightData
          );

          if (storedFlightData) {
            try {
              const parsedFlightData = JSON.parse(storedFlightData);
              console.log('parsedFlightData:', parsedFlightData);

              // Create combined data from flight data
              const combinedData = {
                id: parsedFlightData.bookingId,
                flightOffers: [parsedFlightData.flight], // Add flight details
                dictionaries: parsedFlightData.dictionaries,
                bookingId: parsedFlightData.bookingId,
                bookingPaymentId: parsedFlightData.bookingPaymentId,
                travelers: [] as any[],
                contacts: [] as Array<{
                  addresseeName: { firstName: string; lastName: string };
                  emailAddress: string;
                  phones: Array<{
                    countryCallingCode: string;
                    number: string;
                    deviceType: string;
                  }>;
                }>,
              };

              console.log('Setting combinedData:', combinedData);
              setBookingData(combinedData);
              console.log('Retrieved and combined booking data:', combinedData);
              return; // Exit if successful
            } catch (error) {
              console.error(
                `Attempt ${attempts + 1} - Error parsing booking data:`,
                error
              );
            }
          }

          // If we have a booking ID but no stored data, try to fetch from API
          if (!storedFlightData && bookingId && attempts === maxAttempts - 1) {
            try {
              const response = await axiosInstance.get(
                `/flight-booking/${bookingId}`
              );
              if (response.data) {
                setBookingData(response.data);
                console.log('Retrieved booking data from API:', response.data);
                return;
              }
            } catch (apiError) {
              console.error('Error fetching booking data from API:', apiError);
            }
          }

          // Wait before next attempt
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempts++;
        }

        // If we get here, all attempts failed
        console.log('Failed to load booking data after all attempts');
      } catch (error) {
        console.error('Error in loadBookingData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, []);

  // Clear localStorage only after we've successfully loaded the data
  useEffect(() => {
    if (bookingData) {
      return () => {
        console.log('Clearing booking data from localStorage');
        localStorage.removeItem('skytrips_booking_data');
        localStorage.removeItem('skytrips_booking_reference');
        localStorage.removeItem('skytrips_flight_data');
      };
    }
  }, [bookingData]);

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time to display in a readable format
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format duration (e.g., PT13H5M to 13h 5m)
  const formatDuration = (durationString: string) => {
    if (!durationString) return '';
    return durationString
      .replace('PT', '')
      .replace('H', 'h ')
      .replace('M', 'm');
  };

  // Function to print only the booking confirmation content
  const handlePrint = () => {
    window.print();
  };

  // Function to return to the home page and clear localStorage
  const handleReturn = () => {
    localStorage.removeItem('skytrips_booking_data');
    localStorage.removeItem('skytrips_booking_reference');
    localStorage.removeItem('skytrips_flight_data');
    router.push('/');
  };

  return (
    <>
      <NextSeo
        title="SkyTrips | Book Cheap Flights to Nepal"
        description="Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!"
        canonical="https://skytrips.com.au/"
        openGraph={{
          url: 'https://skytrips.com.au/',
          title: 'SkyTrips | Book Cheap Flights to Nepal',
          description:
            'Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!',
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: 'SkyTrips',
            },
          ],
          site_name: 'SkyTrips',
        }}
      />
      <style jsx global>
        {printStyles}
      </style>
      <Navbar />
      <div className="max-w-4xl mx-auto my-4">
        <div
          className="bg-white rounded-lg shadow-md overflow-hidden booking-confirmation-content"
          ref={confirmationRef}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-200"></div>
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-blue-700 animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Plane className="h-8 w-8 text-blue-700" />
                  </div>
                </div>
                <p className="text-blue-900 font-medium">
                  Loading your booking details...
                </p>
                <div className="mt-2 bg-blue-50 px-4 py-2 rounded-full animate-pulse">
                  <p className="text-xs text-blue-700">Please wait a moment</p>
                </div>
              </div>
            </div>
          ) : !bookingData ? (
            <div className="p-8 md:p-12 text-center">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
                  <h2 className="h3 text-gray-800 mb-2">
                    Booking Information Not Found
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't locate your booking details in our system.
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-6 text-left bg-blue-50 p-4 rounded-lg">
                    <h3 className="title-t3 text-blue-900 mb-2 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      This could be because:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2 pl-6">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Your booking session has expired or timed out
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          The booking process was not completed successfully
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          There was a technical issue during the booking
                          confirmation
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Your browser cache was cleared during the booking
                          process
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="title-t3 text-gray-800 mb-3">
                      What would you like to do?
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        className="bg-white border border-blue-700 text-blue-700 px-6 py-3 rounded-md label-l1 hover:bg-blue-50 transition-colors flex items-center justify-center"
                        onClick={() => router.push('/')}
                      >
                        <Plane className="w-4 h-4 mr-2" />
                        Search Flights
                      </button>
                      <button
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md label-l1 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        onClick={() => router.push('/')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Support
                      </button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>
                      If you believe this is an error and you have a valid
                      booking,
                    </p>
                    <p>
                      please contact our customer support team with your booking
                      reference.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="bg-gradient-to-r from-[#0C0073] to-[#0D3BAE] text-primary-on p-6 text-center">
                <h1 className="h3 mb-2">Booking Confirmed!</h1>
                <p className="label-l1 text-primary-on">
                  Thank you for your reservation. Your flight has been
                  confirmed.
                </p>
                {bookingData?.id && (
                  <p className="mt-4 bg-white bg-opacity-10 inline-block px-4 py-2 rounded-full label-l1 text-primary-on">
                    Booking Reference{' '}
                    <span className="font-semibold">
                      {storedPNR ? storedPNR : bookingData.bookingId}
                    </span>
                  </p>
                )}
              </div>

              <div className="p-6">
                {/* Flight Itinerary Section */}
                <div className="mb-4">
                  <h2 className="h4 text-background-on mb-2 pb-1 border-b border-gray-200 flex items-center">
                    <Plane className="mr-2 h-5 w-5 text-blue-700" /> Flight
                    Itinerary
                  </h2>

                  {bookingData.flightOffers?.[0]?.itineraries?.length > 0 && (
                    <div
                      className={`grid  ${
                        bookingData.flightOffers[0].itineraries.length > 1
                          ? 'grid-cols-1 md:grid-cols-2 gap-3'
                          : 'grid-cols-1 max-w-xl mx-auto'
                      }`}
                    >
                      {bookingData.flightOffers[0].itineraries.map(
                        (itinerary: any, itineraryIndex: number) => (
                          <div
                            key={`itinerary-${itineraryIndex}`}
                            className="mb-2"
                          >
                            <h3 className="title-t4 text-background-on text-sm mb-2 mt-2">
                              {itineraryIndex === 0 ? 'Outbound' : 'Return'}{' '}
                              Journey
                            </h3>

                            {itinerary.segments.map(
                              (segment: any, segmentIndex: number) => (
                                <div
                                  key={`segment-${segmentIndex}`}
                                  className="mb-2 border rounded-lg p-2 w-full "
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      <img
                                        src={`https://pics.avs.io/80/40/${segment.carrierCode}.png`}
                                        alt={`${segment.carrierCode} logo`}
                                        className="h-5 mr-1"
                                        onError={(e: any) => {
                                          e.target.src =
                                            '/assets/plane-icon.svg';
                                          e.target.className = 'h-4 mr-1';
                                        }}
                                      />
                                      <p className="label-l3 text-background-on ml-2">
                                        {segment.carrierCode} {segment.number}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="bg-blue-100 label-l3 text-primary-bright-variant px-1.5 py-0.5 rounded  inline-flex items-center">
                                        <Clock className="h-3 w-3 mr-0.5" />
                                        {formatDuration(segment.duration)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between space-x-1">
                                    <div className="text-center w-[25%]">
                                      <p className="label-l1 text-background-on">
                                        {formatTime(segment.departure.at)}
                                      </p>
                                      <p className="label-l3 text-background-on">
                                        {segment.departure.iataCode}
                                      </p>
                                      <p className="label-l3 text-background-on">
                                        {segment.departure.terminal
                                          ? `T${segment.departure.terminal}`
                                          : ''}
                                      </p>
                                    </div>

                                    <div className="flex-1 px-1">
                                      <div className="w-full h-px bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 relative">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-700 absolute -left-1 top-1/2 transform -translate-y-1/2"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-700 absolute -right-1 top-1/2 transform -translate-y-1/2"></div>
                                      </div>
                                    </div>

                                    <div className="text-center w-[25%]">
                                      <p className="label-l1 text-background-on">
                                        {formatTime(segment.arrival.at)}
                                      </p>
                                      <p className="label-l3 text-background-on">
                                        {segment.arrival.iataCode}
                                      </p>
                                      <p className="label-l3 text-background-on">
                                        {segment.arrival.terminal
                                          ? `T${segment.arrival.terminal}`
                                          : ''}
                                      </p>
                                    </div>

                                    <div className="text-center ml-1 pl-1 border-l border-gray-300 w-[20%]">
                                      <p className="label-l3 text-background-on">
                                        {
                                          formatDate(
                                            segment.departure.at
                                          ).split(',')[0]
                                        }
                                      </p>
                                      <p className="label-l3 text-background-on">
                                        {
                                          formatDate(
                                            segment.departure.at
                                          ).split(',')[1]
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 px-1">
                  <div className="bg-gray-50 rounded-lg p-3 flex flex-col sm:flex-row justify-center gap-3 no-print">
                    <button
                      className="bg-primary text-primary-on px-4 py-2 rounded-md label-l1 hover:bg-blue-800 transition-colors flex items-center justify-center flex-1 max-w-xs mx-auto sm:mx-0"
                      onClick={handlePrint}
                    >
                      <ReceiptText className="h-4 w-4 mr-2" />
                      Print Confirmation
                    </button>
                    <button
                      className="bg-white border border-[#0229ef] label-l1 text-primary-on-variant px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center justify-center flex-1 max-w-xs mx-auto sm:mx-0"
                      onClick={handleReturn}
                    >
                      Back to Home
                    </button>
                  </div>

                  <div className="text-center mt-3 label-l1 text-background-on">
                    <p>
                      Thank you for choosing Sky Trips for your travel needs.
                    </p>
                    <p className="">
                      If you need assistance, please contact our customer
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
