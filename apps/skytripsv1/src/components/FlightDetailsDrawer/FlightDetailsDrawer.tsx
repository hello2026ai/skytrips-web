import React, { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import FlightItinerary from '../FlightItinerary';

import { airports } from '../../../../../libs/src/shared-utils/constants/airports';

interface FlightDetailsDrawerProps {
  flight: any;
  flightId: string;
  searchParams: any;
  onClose: () => void;
  formatDuration: (duration: string) => string;
  apiData?: any;
  onBookNow?: (flight: any) => void;
  priceData?: { price: number; originalPrice?: number; fare?: any };
  flightIndex?: number;
  activeTab?: string;
}

const FlightDetailsDrawer: React.FC<FlightDetailsDrawerProps> = ({
  flight,
  flightId,
  searchParams,
  onClose,
  formatDuration,
  apiData,
  onBookNow,
  priceData,
  flightIndex,
  activeTab,
}) => {
  const [serviceFees, setServiceFees] = useState<any>(null);

  console.log('flight', flight);

  useEffect(() => {
    const fetchServiceFees = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_REST_API}/service-fee`
        ); // Replace with your actual API endpoint
        const data = await response.json();
        setServiceFees(data.data);
      } catch (error) {
        console.error('Error fetching service fees:', error);
      }
    };

    fetchServiceFees();
  }, []);

  // Function to get city name from IATA code
  const getCityName = (iataCode: string): string => {
    // First try to find city name from the airports data
    const airport = airports.find((airport) => airport.IATA === iataCode);
    if (airport && airport.city) {
      return airport.city;
    }

    // Try to get from API data
    if (
      apiData?.dictionaries?.locations &&
      apiData.dictionaries.locations[iataCode]?.cityName
    ) {
      return apiData.dictionaries.locations[iataCode].cityName;
    }

    // Try to get from searchParams
    if (
      iataCode === searchParams?.originLocationCode &&
      searchParams?.originLocationName
    ) {
      return searchParams.originLocationName;
    }

    if (
      iataCode === searchParams?.destinationLocationCode &&
      searchParams?.destinationLocationName
    ) {
      return searchParams.destinationLocationName;
    }

    return iataCode; // Fallback to the code itself if city name not found
  };

  // Get origin and destination IATA codes and city names
  const originIata = flight.itineraries[0]?.segments[0]?.departure?.iataCode;
  const originCity = getCityName(originIata);

  const lastSegmentIndex = flight.itineraries[0]?.segments.length - 1;
  const destinationIata =
    flight.itineraries[0]?.segments[lastSegmentIndex]?.arrival?.iataCode;
  const destinationCity = getCityName(destinationIata);

  // useEffect(() => {
  //   const fetchFareRules = async () => {
  //     setIsLoadingFareRules(true);
  //     try {
  //       const response = await axiosInstance.post(
  //         '/flight-price',
  //         JSON.stringify(flight)
  //       );
  //       setFareRules(response.data.fareRules);
  //       setIsLoadingFareRules(false);
  //     } catch (error) {
  //       console.error('Error fetching fare rules:', error);
  //       setIsLoadingFareRules(false);
  //     }
  //   };

  //   fetchFareRules();
  // }, [flight]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    // Save the current body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Disable scrolling on the body
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling when component unmounts
    return () => {
      // Always restore the original overflow style when drawer closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 bg-container shadow-xl w-full sm:w-[90vw] md:w-auto md:max-w-[90vw] md:min-w-[500px] lg:w-[600px] xl:w-[700px] h-full overflow-y-auto z-50 transition-transform duration-300 transform translate-x-0 flex flex-col">
        <div className="flex justify-between items-center px-3 sm:px-4 py-4">
          <h3 className="title-t3 md:title-t3 text-background-on">
            {flight.itineraries.length === 1
              ? `${originCity} → ${destinationCity}`
              : `${originCity} ↔ ${destinationCity}`}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-dark-variant"
            >
              <X className="h-5 w-5 hover:text-primary-bright-variant" />
            </button>
          </div>
        </div>

        {/* Main content that takes up available space */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs for Flight Details, Fare Details, and Cancellation/Re-Issues */}
          <Tabs defaultValue="flight-details" className="w-full">
            <div className="bg-container px-2 sm:px-2 py-1 border-t">
              <TabsList className="grid w-full grid-cols-4 bg-transparent">
                <TabsTrigger
                  value="flight-details"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-indigo-950 rounded-none body-b2 text-neutral-dark px-1 sm:px-2"
                >
                  <span className="truncate whitespace-nowrap">
                    FLIGHT DETAILS
                  </span>
                </TabsTrigger>
                {activeTab !== 'recommended' && (
                  <TabsTrigger
                    value="fare-details"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-indigo-950 rounded-none body-b2 text-neutral-dark px-1 sm:px-2"
                  >
                    <span className="truncate whitespace-nowrap">
                      FARE DETAILS
                    </span>
                  </TabsTrigger>
                )}
                {activeTab !== 'recommended' && (
                  <TabsTrigger
                    value="cancellation"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-indigo-950 rounded-none body-b2 text-neutral-dark px-1 sm:px-2 text-xs sm:text-sm"
                  >
                    <span className="truncate whitespace-nowrap">
                      CANCELLATION
                    </span>
                  </TabsTrigger>
                )}
                {activeTab !== 'recommended' && (
                  <TabsTrigger
                    value="refund"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-indigo-950 rounded-none body-b2 text-neutral-dark px-1 sm:px-2 text-xs sm:text-sm"
                  >
                    <span className="truncate whitespace-nowrap">REISSUE</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Flight Details Tab Content */}
            <TabsContent value="flight-details" className="mt-0">
              <div className="relative px-2 sm:px-4 py-3 sm:py-4">
                {/* Refundability Information */}
                {flight.fareRules && (
                  <div className="flex justify-end">
                    <div className="rounded-md px-3 py-1 inline-block">
                      {(() => {
                        if (!flight.fareRules?.rules) {
                          return (
                            <p className="label-l3 text-primary-on flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="#EF4444"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              Non-refundable
                            </p>
                          );
                        }

                        const refundRule = flight.fareRules.rules.find(
                          (rule: {
                            category: string;
                            notApplicable?: boolean;
                          }) => rule.category === 'REFUND'
                        );

                        if (!refundRule || refundRule.notApplicable) {
                          return (
                            <p className="label-l3 text-error flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="#EF4444"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              Non-refundable
                            </p>
                          );
                        }

                        return (
                          <p className="label-l3 text-green-600 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="#22C55E"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 12l2 2 4-4" />
                            </svg>
                            Refundable
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <FlightItinerary
                  itineraries={flight.itineraries}
                  formatDuration={formatDuration}
                  flight={flight}
                  apiData={apiData}
                  activeTab={activeTab}
                />
              </div>
            </TabsContent>

            {/* Fare Details Tab Content */}
            <TabsContent value="fare-details" className="mt-0">
              <div className="px-2 sm:px-4 py-4 sm:py-6 bg-container ">
                <div className="bg-white rounded-md overflow-hidden border">
                  <div className="divide-y divide-gray-100">
                    {(() => {
                      // Get traveler prices from travelerPricings
                      const adultPricing =
                        flight.travelerPricings?.filter(
                          (tp: any) => tp.travelerType === 'ADULT'
                        ) || [];
                      const childPricing =
                        flight.travelerPricings?.filter(
                          (tp: any) => tp.travelerType === 'CHILD'
                        ) || [];
                      const infantPricing =
                        flight.travelerPricings?.filter(
                          (tp: any) => tp.travelerType === 'HELD_INFANT'
                        ) || [];

                      // Calculate counts
                      const adultCount =
                        adultPricing.length || searchParams?.adults || 1;
                      const childCount =
                        childPricing.length || searchParams?.children || 0;
                      const infantCount =
                        infantPricing.length || searchParams?.infants || 0;

                      // Get prices directly from travelerPricings or fall back to calculations
                      const adultBasePrice = adultPricing[0]?.price.base
                        ? parseFloat(
                            parseFloat(adultPricing[0].price.base).toFixed(2)
                          )
                        : parseFloat(
                            (parseFloat(flight.price.base) * 0.7).toFixed(2)
                          );

                      const childBasePrice = childPricing[0]?.price.base
                        ? parseFloat(
                            parseFloat(childPricing[0].price.base).toFixed(2)
                          )
                        : parseFloat(
                            (parseFloat(flight.price.base) * 0.5).toFixed(2)
                          );

                      const infantBasePrice = infantPricing[0]?.price.base
                        ? parseFloat(
                            parseFloat(infantPricing[0].price.base).toFixed(2)
                          )
                        : parseFloat(
                            (parseFloat(flight.price.base) * 0.2).toFixed(2)
                          );

                      // Calculate totals
                      const adultTotal = parseFloat(
                        (adultBasePrice * adultCount).toFixed(2)
                      );
                      const childTotal = parseFloat(
                        (childBasePrice * childCount).toFixed(2)
                      );
                      const infantTotal = parseFloat(
                        (infantBasePrice * infantCount).toFixed(2)
                      );
                      const baseFaresTotal = parseFloat(
                        (adultTotal + childTotal + infantTotal).toFixed(2)
                      );

                      // Use discounted pricing for display if available
                      const displayPrice = parseFloat(
                        (
                          priceData?.price ||
                          parseFloat(flight.price.grandTotal)
                        ).toFixed(2)
                      );
                      const originalPrice = parseFloat(
                        (
                          priceData?.originalPrice ||
                          parseFloat(flight.price.grandTotal)
                        ).toFixed(2)
                      );
                      const hasDiscount =
                        priceData?.originalPrice &&
                        priceData.originalPrice > displayPrice;

                      // Calculate actual tax and discount
                      const totalPrice = displayPrice;
                      const originalTotalPrice = originalPrice;

                      // Use actual tax from flight data if available, otherwise calculate
                      const actualTax = flight.price.taxes
                        ? parseFloat(parseFloat(flight.price.taxes).toFixed(2))
                        : parseFloat(
                            (
                              parseFloat(flight.price.grandTotal) -
                              baseFaresTotal
                            ).toFixed(2)
                          );

                      // Calculate discount amount
                      const discountAmount = hasDiscount
                        ? parseFloat((originalPrice - displayPrice).toFixed(2))
                        : 0;

                      return (
                        <div className="py-3 sm:py-4">
                          {/* Adult row */}
                          <div className="flex justify-between py-1 px-3 sm:px-6">
                            <div className="label-l1 text-background-on">
                              Base fare (Adult){' '}
                              {adultCount > 1 ? `x${adultCount}` : ''}
                            </div>
                            <div className="title-t4 text-background-on">
                              {flight.price.currency} {adultTotal.toFixed(2)}
                            </div>
                          </div>

                          {/* Child row (if applicable) */}
                          {childCount > 0 && (
                            <div className="flex justify-between py-1 px-3 sm:px-6">
                              <div className="label-l1 text-background-on">
                                Base fare (Child) x{childCount}
                              </div>
                              <div className="title-t4 text-background-on">
                                {flight.price.currency} {childTotal.toFixed(2)}
                              </div>
                            </div>
                          )}

                          {/* Infant row (if applicable) */}
                          {infantCount > 0 && (
                            <div className="flex justify-between py-1 px-3 sm:px-6">
                              <div className="label-l1 text-background-on">
                                Base fare (Infant) x{infantCount}
                              </div>
                              <div className="title-t4 text-background-on">
                                {flight.price.currency} {infantTotal.toFixed(2)}
                              </div>
                            </div>
                          )}

                          {/* Tax row */}
                          <div className="flex justify-between py-1 px-3 sm:px-6 border-t border-gray-200 mt-2 pt-2">
                            <div className="label-l1 text-background-on">
                              Tax
                            </div>
                            <div className="title-t4 text-background-on">
                              {flight.price.currency} {actualTax.toFixed(2)}
                            </div>
                          </div>

                          {/* Discount row (if applicable) */}
                          {hasDiscount && (
                            <div className="flex justify-between py-1 px-3 sm:px-6">
                              <div className="label-l1 text-green-600">
                                Discount
                              </div>
                              <div className="title-t4 text-green-600">
                                - {flight.price.currency}{' '}
                                {discountAmount.toFixed(2)}
                              </div>
                            </div>
                          )}

                          {/* Total row */}
                          <div className="flex justify-between pt-2 px-3 sm:px-6 mt-2 border-t border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                              <span className="body-b3 text-background-on">
                                Total
                              </span>
                              {hasDiscount && (
                                <span className="label-l3 text-green-600  px-2 py-1 bg-green-50 rounded">
                                  Best Value
                                </span>
                              )}
                            </div>
                            <div className="title-t4 text-background-on">
                              {hasDiscount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    {flight.price.currency}{' '}
                                    {originalTotalPrice.toFixed(2)}
                                  </span>
                                  <span className="font-medium text-primary">
                                    {flight.price.currency}{' '}
                                    {totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span>
                                  {flight.price.currency}{' '}
                                  {totalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Cancellation Tab Content */}
            <TabsContent value="cancellation" className="mt-0">
              <div className="p-2 sm:p-4 bg-container">
                <div className="bg-container border rounded-md overflow-hidden">
                  {flight.fareRules && (
                    <div className="divide-y">
                      {/* Cancellation Table */}
                      <div className="mb-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white">
                              <th className="p-3 text-left border-b title-t3 text-background-on">
                                Time Frame to cancel
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Before Scheduled departure time
                                </div>
                              </th>
                              <th className="p-3 text-left border-b title-t3 text-background-on border-l">
                                Airline Fee + SkyTrips Fee
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Per Passengers
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {flight.fareRules.rules?.map(
                              (rule: any, index: number) => {
                                if (rule.category === 'REFUND') {
                                  return (
                                    <>
                                      <tr
                                        key={index}
                                        className="bg-white border-b"
                                      >
                                        <td className="p-3 text-left border-t body-b5 text-background-on">
                                          0 hours to 24 hours
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on">
                                          <div className="flex items-center gap-2">
                                            <X className="h-4 w-4 text-red-500" />
                                            <span>Non-changeable</span>
                                          </div>
                                        </td>
                                      </tr>
                                      <tr
                                        key={index}
                                        className="bg-white border-b"
                                      >
                                        <td className="p-3 text-left border-t body-b5 text-background-on">
                                          24 hours to 365 days
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on">
                                          {rule.notApplicable
                                            ? 'Non-refundable'
                                            : rule.maxPenaltyAmount
                                            ? (() => {
                                                const cancellationFee =
                                                  serviceFees?.find(
                                                    (fee: any) =>
                                                      fee.name ===
                                                      'Cancellation Charge'
                                                  );
                                                const skyTripsFee =
                                                  cancellationFee?.amount || 0;
                                                const totalFee =
                                                  parseFloat(
                                                    rule.maxPenaltyAmount
                                                  ) + parseFloat(skyTripsFee);
                                                return `${
                                                  flight.price.currency
                                                } ${rule.maxPenaltyAmount} + ${
                                                  cancellationFee?.currencyCode ||
                                                  flight.price.currency
                                                } ${skyTripsFee}`;
                                              })()
                                            : 'Non-refundable'}
                                        </td>
                                      </tr>
                                    </>
                                  );
                                }
                                return null;
                              }
                            )}
                            {(!flight.fareRules.rules ||
                              !flight.fareRules.rules.some(
                                (rule: { category: string }) =>
                                  rule.category === 'REFUND'
                              )) && (
                              <tr className="bg-white border-b">
                                <td
                                  colSpan={2}
                                  className="p-3 text-left border-t body-b5 text-background-on text-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>Non-refundable</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Reissue Table */}
                      {/* <div className="mt-3 ">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white">
                              <th className="p-3 text-left border-b title-t3 text-background-on">
                                Time Frame to Reissue
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Before Scheduled departure time
                                </div>
                              </th>
                              <th className="p-3 text-left border-b title-t3 text-background-on border-l">
                                Airline Fees
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Per Passengers
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {flight.fareRules.rules?.map(
                              (rule: any, index: number) => {
                                if (rule.category === 'REVALIDATION') {
                                  return (
                                    <div>
                                      <tr
                                        key={index}
                                        className="bg-white border-b"
                                      >
                                        <td className="p-3 text-left border-t body-b5 text-background-on">
                                          0 hours to 24 hours
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on">
                                          Revalidation not allowed
                                        </td>
                                      </tr>
                                      <tr
                                        key={index}
                                        className="bg-white border-b"
                                      >
                                        <td className="p-3 text-left border-t body-b5 text-background-on">
                                          0 hours to 24 hours
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on">
                                          {rule.notApplicable
                                            ? 'Revalidation not allowed'
                                            : rule.maxPenaltyAmount
                                            ? `Penalty Amount: ${rule.maxPenaltyAmount}`
                                            : 'Revalidation not allowed'}
                                        </td>
                                      </tr>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                            {(!flight.fareRules.rules ||
                              !flight.fareRules.rules.some(
                                (rule: { category: string }) =>
                                  rule.category === 'REVALIDATION'
                              )) && (
                              <tr className="bg-white border-b">
                                <td
                                  colSpan={2}
                                  className="p-3 text-left border-t body-b5 text-background-on text-center"
                                >
                                  Revalidation not allowed
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div> */}
                    </div>
                  )}
                  {!flight.fareRules && (
                    <div className="p-4 border-b">
                      <p className="body-b1 text-neutral-dark">
                        No fare rules found.
                      </p>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="p-4">
                    <h3 className="body-b3 text-background-on mb-2">
                      Terms & Conditions
                    </h3>
                    <ul className="space-y-2 label-l3 text-background-on list-disc pl-5">
                      <li>
                        All cancellation and reschedule fees are indicative and
                        subject to change without prior notice from the
                        airlines.
                      </li>
                      <li>
                        Skytrips does not guarantee the final cancellation or
                        reschedule fees as these are determined by the airline.
                      </li>
                      <li>
                        Airlines do not allow additional baggage for infants
                        added to the booking.
                      </li>
                      <li>
                        In restricted or special cases, amendments or
                        cancellations may not be allowed.
                      </li>
                      <li>
                        Always reconfirm with Skytrips or the airline before
                        submitting a cancellation or amendment request.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Refund Tab Content */}
            <TabsContent value="refund" className="mt-0">
              <div className="p-2 sm:p-4 bg-container">
                <div className="bg-container border rounded-md overflow-hidden">
                  {flight.fareRules && (
                    <div className="divide-y">
                      {/* Refund Rules Table */}
                      <div className="mb-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white">
                              <th className="p-3 text-left border-b title-t3 text-background-on w-[35%]">
                                Time Frame
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Before Scheduled departure time
                                </div>
                              </th>
                              <th className="p-3 text-left border-b title-t3 text-background-on border-l w-[65%]">
                                Airline Fee + SkyTrips Fee + Fare Difference
                                <div className="label-l3 text-neutral-dark mt-1">
                                  Per Passenger
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {flight.fareRules.rules?.map(
                              (rule: any, index: number) => {
                                if (rule.category === 'EXCHANGE') {
                                  return (
                                    <>
                                      <tr className="bg-white border-b">
                                        <td className="p-3 text-left border-t body-b5 text-background-on w-[35%]">
                                          0 hours to 24 hours
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on w-[65%]">
                                          <div className="flex items-center gap-2">
                                            <X className="h-4 w-4 text-red-500" />
                                            <span>Non-changeable</span>
                                          </div>
                                        </td>
                                      </tr>
                                      <tr className="bg-white border-b">
                                        <td className="p-3 text-left border-t body-b5 text-background-on w-[35%]">
                                          24 hours to 365 days
                                        </td>
                                        <td className="p-3 text-left border-t border-l body-b5 text-background-on w-[65%]">
                                          {rule.notApplicable ? (
                                            <div className="flex items-center gap-2">
                                              <X className="h-4 w-4 text-red-500" />
                                              <span>Non-changeable</span>
                                            </div>
                                          ) : rule.maxPenaltyAmount ? (
                                            (() => {
                                              const reissueFee =
                                                serviceFees?.find(
                                                  (fee: any) =>
                                                    fee.name ===
                                                    'Reissue Charge'
                                                );
                                              const skyTripsFee =
                                                reissueFee?.amount || 0;
                                              const totalFee =
                                                parseFloat(
                                                  rule.maxPenaltyAmount
                                                ) + parseFloat(skyTripsFee);
                                              return `${
                                                flight.price.currency
                                              } ${rule.maxPenaltyAmount} + ${
                                                reissueFee?.currencyCode ||
                                                flight.price.currency
                                              } ${skyTripsFee} `;
                                            })()
                                          ) : (
                                            <div className="flex items-center gap-2">
                                              <X className="h-4 w-4 text-red-500" />
                                              <span>Non-changeable</span>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    </>
                                  );
                                }
                                return null;
                              }
                            )}
                            {(!flight.fareRules.rules ||
                              !flight.fareRules.rules.some(
                                (rule: { category: string }) =>
                                  rule.category === 'EXCHANGE'
                              )) && (
                              <tr className="bg-white border-b">
                                <td
                                  colSpan={2}
                                  className="p-3 text-left border-t body-b5 text-background-on text-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>Non-changeable</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="p-4">
                        <h3 className="body-b3 text-background-on mb-2">
                          Terms & Conditions
                        </h3>
                        <ul className="space-y-2 label-l3 text-background-on list-disc pl-5">
                          <li>
                            All cancellation and reschedule fees are indicative
                            and subject to change without prior notice from the
                            airlines.
                          </li>
                          <li>
                            Skytrips does not guarantee the final cancellation
                            or reschedule fees as these are determined by the
                            airline.
                          </li>
                          <li>
                            Airlines do not allow additional baggage for infants
                            added to the booking.
                          </li>
                          <li>
                            In restricted or special cases, amendments or
                            cancellations may not be allowed.
                          </li>
                          <li>
                            Always reconfirm with Skytrips or the airline before
                            submitting a cancellation or amendment request.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {!flight.fareRules && (
                    <div className="p-4 border-b">
                      <p className="body-b1 text-neutral-dark">
                        No refund rules found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Book Now button at the bottom */}
        {onBookNow && (
          <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-gray-200 shadow-lg flex justify-center">
            <button
              onClick={() => {
                // Check if this is a Best Value flight and store in localStorage
                const hasDiscount =
                  priceData?.originalPrice &&
                  priceData.originalPrice > priceData.price;
                if (
                  hasDiscount &&
                  flightIndex !== undefined &&
                  priceData?.originalPrice
                ) {
                  const bestValueInfo = {
                    isManualFareApplied: true,
                    appliedManualFareIds: [priceData.fare?.id],
                    fareDetails: {
                      id: priceData.fare?.id,
                      title: priceData.fare?.title,
                      customLabel: priceData.fare?.customLabel,
                      fareDeductionValueType:
                        priceData.fare?.fareDeductionValueType,
                      deductionValue: priceData.fare?.deductionValue,
                      farePerPassengers: priceData.fare?.farePerPassengers,
                      originalPrice: priceData.originalPrice,
                      discountedPrice: priceData.price,
                      flightBasePrice: parseFloat(flight.price.base),
                      flightGrandTotal: parseFloat(flight.price.grandTotal),
                    },
                  };

                  localStorage.setItem(
                    'skytrips_best_value_booking',
                    JSON.stringify(bestValueInfo)
                  );
                  console.log(
                    '🏆 Best Value booking stored in localStorage from drawer:',
                    bestValueInfo
                  );
                } else {
                  // Clear any existing Best Value data if this is not a Best Value flight
                  localStorage.removeItem('skytrips_best_value_booking');
                }

                onBookNow(flight);
              }}
              className="px-5 py-2 bg-primary hover:bg-[#5143d9] text-white font-medium rounded-md title-t3 text-primary-on"
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FlightDetailsDrawer;
