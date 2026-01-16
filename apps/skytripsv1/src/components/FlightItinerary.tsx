import React, { useEffect } from 'react';
import Image from 'next/image';

interface SegmentProps {
  carrierCode: string;
  number: string;
  operating?: {
    carrierCode: string;
  };
  departure?: {
    at: string;
    iataCode: string;
    terminal?: string;
  };
  arrival?: {
    at: string;
    iataCode: string;
    terminal?: string;
  };
  duration: string;
  transitTime?: string;
}

interface ItineraryProps {
  segments: SegmentProps[];
}

// Add baggage related interfaces
interface CabinBags {
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}

interface CheckedBags {
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}

interface FareDetailsBySegment {
  segmentId: string;
  includedCabinBags?: CabinBags;
  includedCheckedBags?: CheckedBags;
}

interface TravelerPricing {
  travelerId: string;
  travelerType: string;
  fareOption?: string;
  fareDetailsBySegment?: FareDetailsBySegment[];
}

interface FlightItineraryProps {
  itineraries: ItineraryProps[];
  formatDuration: (duration: string) => string;
  getTransitTime?: (segment: any) => string;
  flight?: any;
  apiData?: any;
  activeTab?: string;
}

const FlightItinerary: React.FC<FlightItineraryProps> = ({
  itineraries,
  formatDuration,
  getTransitTime,
  flight,
  apiData,
  activeTab,
}) => {
  console.log('itineraries in detail flight itinerary', itineraries);
  console.log('flight object:', flight);
  console.log('flight dictionaries:', flight?.dictionaries);
  console.log('apiData:', apiData);

  // Add a useEffect to normalize dictionary data for easier access
  useEffect(() => {
    console.log('FlightItinerary received data:', {
      flightDictionaries: flight?.dictionaries,
      apiDataDictionaries: apiData?.dictionaries,
    });

    // Log which carriers are available in the dictionaries
    if (flight?.dictionaries?.carriers) {
      console.log(
        'Available carriers in flight.dictionaries:',
        Object.keys(flight.dictionaries.carriers)
      );
    }

    if (apiData?.dictionaries?.carriers) {
      console.log(
        'Available carriers in apiData.dictionaries:',
        Object.keys(apiData.dictionaries.carriers)
      );
    }

    if (
      apiData?.dictionaries?.airlines &&
      Array.isArray(apiData.dictionaries.airlines)
    ) {
      console.log(
        'Available airlines in apiData.dictionaries:',
        apiData.dictionaries.airlines.map(
          (airline: any) => `${airline.code}: ${airline.name}`
        )
      );
    }
  }, [flight, apiData]);

  // Function to get airline name - unified to handle both pages' dictionary formats
  const getAirlineName = (carrierCode: string): string => {
    // Try all possible dictionary sources in order of priority

    // 1. Try flight.dictionaries.carriers (direct mapping)
    if (
      flight?.dictionaries?.carriers &&
      flight.dictionaries.carriers[carrierCode]
    ) {
      return flight.dictionaries.carriers[carrierCode];
    }

    // 2. Try apiData.dictionaries.carriers (direct mapping)
    if (
      apiData?.dictionaries?.carriers &&
      apiData.dictionaries.carriers[carrierCode]
    ) {
      return apiData.dictionaries.carriers[carrierCode];
    }

    // 3. Try looking in airline arrays if available
    if (
      flight?.dictionaries?.airlines &&
      Array.isArray(flight.dictionaries.airlines)
    ) {
      const airline = flight.dictionaries.airlines.find(
        (a: any) => a.code === carrierCode
      );
      if (airline && airline.name) return airline.name;
    }

    if (
      apiData?.dictionaries?.airlines &&
      Array.isArray(apiData.dictionaries.airlines)
    ) {
      const airline = apiData.dictionaries.airlines.find(
        (a: any) => a.code === carrierCode
      );
      if (airline && airline.name) return airline.name;
    }

    // If all lookup attempts fail, return the carrier code
    return carrierCode;
  };

  // Use the same getAirlineName function for operating carriers for consistency
  const getOperatingAirlineName = getAirlineName;

  // Internal function to calculate transit time
  const calculateTransitTime = (
    currentSegment: SegmentProps,
    previousSegment: SegmentProps
  ): string => {
    if (!currentSegment?.departure?.at || !previousSegment?.arrival?.at) {
      return '';
    }

    try {
      // Try to use transitTime from current segment first
      if (currentSegment.transitTime) {
        const matches = currentSegment.transitTime.match(/PT(\d+)H(\d+)M/);
        if (matches) {
          const [_, hours, mins] = matches;
          return `${hours}h ${mins}min`;
        }
      }

      // Fallback to calculation if transitTime is not available or invalid
      const currentDeparture = new Date(currentSegment.departure.at);
      const previousArrival = new Date(previousSegment.arrival.at);

      const transitTimeMs =
        currentDeparture.getTime() - previousArrival.getTime();
      const transitTimeMin = Math.floor(transitTimeMs / (1000 * 60));
      const hours = Math.floor(transitTimeMin / 60);
      const mins = transitTimeMin % 60;

      return `${hours}h ${mins}min`;
    } catch (error) {
      console.error('Error calculating transit time:', error);
      return '';
    }
  };

  // Function to find the baggage info for a segment
  const findBaggageInfo = (
    segmentNumber: string,
    segmentIndex: number,
    itineraryIndex: number
  ): FareDetailsBySegment | null => {
    if (!flight?.travelerPricings || flight.travelerPricings.length === 0) {
      return null;
    }

    const adultTraveler = flight.travelerPricings.find(
      (tp: TravelerPricing) => tp.travelerType === 'ADULT'
    );

    if (
      !adultTraveler?.fareDetailsBySegment ||
      adultTraveler.fareDetailsBySegment.length === 0
    ) {
      return null;
    }

    // First try to match by segment number
    let fareSegment = adultTraveler.fareDetailsBySegment.find(
      (fs: FareDetailsBySegment) => fs.segmentId === segmentNumber
    );

    // If not found, calculate the correct segment index based on itinerary
    if (!fareSegment) {
      // For outbound segments (itineraryIndex 0), use index directly
      if (itineraryIndex === 0) {
        if (segmentIndex < adultTraveler.fareDetailsBySegment.length) {
          fareSegment = adultTraveler.fareDetailsBySegment[segmentIndex];
        }
      }
      // For return segments (itineraryIndex 1), count outbound segments first
      else if (itineraryIndex === 1 && itineraries[0]) {
        const outboundSegmentsCount = itineraries[0].segments.length;
        const returnSegmentIndex = outboundSegmentsCount + segmentIndex;

        if (returnSegmentIndex < adultTraveler.fareDetailsBySegment.length) {
          fareSegment = adultTraveler.fareDetailsBySegment[returnSegmentIndex];
        }
        // Fallback to just using the second segment
        else if (adultTraveler.fareDetailsBySegment.length > 1) {
          fareSegment = adultTraveler.fareDetailsBySegment[1];
        }
      }
    }

    return fareSegment || null;
  };

  console.log('itineraries', itineraries);

  return (
    <div className="space-y-6">
      {/* Map through each itinerary (outbound, return, etc.) */}
      {itineraries.map((itinerary: ItineraryProps, itineraryIndex: number) => (
        <div key={`itinerary-${itineraryIndex}`} className="mb-4">
          <div className="bg-container rounded-md p-4 mb-4">
            <div className="body-b3 text-background-on mb-3">
              {itineraryIndex === 0 ? 'Outbound Flight' : 'Return Flight'}
            </div>

            {/* Dynamically render all flight segments within this itinerary */}
            {itinerary.segments.map(
              (segment: SegmentProps, segmentIndex: number) => (
                <React.Fragment
                  key={`itinerary-${itineraryIndex}-segment-${segmentIndex}`}
                >
                  {segmentIndex > 0 && (
                    <div className="flex items-center justify-center my-2">
                      <hr className="flex-grow border-gray-300" />
                      <div className="mx-4 bg-gray-200 rounded-full text-center py-1 px-4">
                        <p className="body-b2  text-background-on">
                          Transit Time:{' '}
                          {calculateTransitTime(
                            segment,
                            itinerary.segments[segmentIndex - 1]
                          )}
                        </p>
                      </div>
                      <hr className="flex-grow border-gray-300" />
                    </div>
                  )}

                  <div className={segmentIndex > 0 ? ' pt-2 ' : ''}>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      {/* First row on mobile: Logo and airline info side by side */}
                      <div className="flex flex-row mb-4 md:mb-0">
                        {/* Airline logo */}
                        <div className="flex-shrink-0 w-1/5 md:w-4/12 flex justify-center items-center">
                          <img
                            src={`https://pics.avs.io/200/40/${segment.carrierCode}.png`}
                            alt={`${segment.carrierCode || 'Airline'} logo`}
                            className="h-5 object-contain w-16"
                            onError={(e: any) => {
                              e.target.src = '/assets/plane-icon.svg';
                            }}
                          />
                        </div>

                        {/* Airline info */}
                        <div className="w-4/5 md:w-8/12 pl-1">
                          <h3 className="label-l2 text-background-on">
                            {getOperatingAirlineName(segment.carrierCode)}
                          </h3>
                          <p className="label-l3  text-neutral-dark">
                            {segment.carrierCode}
                            {segment.number}
                          </p>
                          <p className="label-l3  text-neutral-dark">
                            {segment.operating &&
                            segment.operating.carrierCode !==
                              segment.carrierCode
                              ? `Operated by: ${getOperatingAirlineName(
                                  segment.operating.carrierCode
                                )}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {/* Second row on mobile: departure/arrival details in same row */}
                      <div className="md:w-8/12 flex flex-row justify-between items-center">
                        {/* Departure */}
                        <div className="text-left mb-3 md:mb-0 w-1/3 ml-2">
                          <p className="label-l3   text-neutral-dark">
                            {segment.departure?.at
                              ? new Date(
                                  segment.departure.at
                                ).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: 'short',
                                  weekday: 'short',
                                })
                              : ''}
                          </p>
                          <h3 className="title-t3 text-background-on">
                            {segment.departure?.at
                              ? new Date(
                                  segment.departure.at
                                ).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                })
                              : ''}
                          </h3>
                          <p className="label-l3  text-neutral-dark">
                            {segment.departure?.iataCode}

                            {segment?.departure?.terminal
                              ? `, Terminal ${segment?.departure?.terminal}`
                              : ''}
                          </p>
                        </div>

                        {/* Flight path */}
                        <div className="flex-grow mx-2 md:mx-4 relative w-1/3">
                          <div className="text-center label-l3  text-neutral-dark mb-2">
                            {formatDuration(segment.duration)}
                          </div>
                          <div className="flex items-center justify-between relative">
                            {/* Container for airplane with background matching the container */}
                            <div className="z-10 relative bg-white p-1">
                              <Image
                                src="/assets/plane-icon.svg"
                                width={20}
                                height={20}
                                alt="Airline"
                              />
                            </div>
                            <hr className="absolute top-1/2 left-0 right-0 border-gray-300 m-0 z-0" />
                            <div className="w-5 h-5 bg-primary rounded-full z-10"></div>
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right w-1/3">
                          <p className="label-l3  text-neutral-dark">
                            {segment.arrival?.at
                              ? new Date(segment.arrival.at).toLocaleDateString(
                                  'en-US',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    weekday: 'short',
                                  }
                                )
                              : ''}
                          </p>
                          <h3 className="title-t3 text-background-on">
                            {segment.arrival?.at
                              ? new Date(segment.arrival.at).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  }
                                )
                              : ''}
                          </h3>
                          <p className="label-l3 text-neutral-dark">
                            {segment.arrival?.iataCode}

                            {segment?.arrival?.terminal
                              ? `, Terminal ${segment?.arrival?.terminal}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Baggage information for this segment */}
                    {activeTab !== 'recommended' ||
                      (flight.isGroupFare !== true && (
                        <div className="mt-3  ">
                          <div className="flex flex-col md:flex-row md:items-center">
                            {/* Cabin baggage */}
                            <div className="flex items-center mb-2 md:mb-0 md:mr-6 ">
                              <Image
                                src="/assets/icons/baggageIcon.svg"
                                width={15}
                                height={15}
                                alt="Cabin Bag"
                                className="me-2 flex-shrink-0"
                              />
                              <span className="label-l3 text-neutral-dark inline-flex items-center ">
                                {(() => {
                                  // Find baggage info
                                  const baggageInfo = findBaggageInfo(
                                    segment.number,
                                    segmentIndex,
                                    itineraryIndex
                                  );

                                  // Handle cabin bags display
                                  if (
                                    baggageInfo?.includedCabinBags !== undefined
                                  ) {
                                    // Check if weight is provided directly
                                    if (
                                      'weight' in
                                        baggageInfo.includedCabinBags &&
                                      baggageInfo.includedCabinBags.weight !==
                                        undefined
                                    ) {
                                      const weight =
                                        baggageInfo.includedCabinBags.weight;
                                      const weightUnit =
                                        baggageInfo.includedCabinBags
                                          .weightUnit || 'KG';
                                      return `Cabin Baggage: ${weight} ${weightUnit}`;
                                    }
                                    // Otherwise use quantity if available
                                    else if (
                                      'quantity' in
                                        baggageInfo.includedCabinBags &&
                                      baggageInfo.includedCabinBags.quantity !==
                                        undefined
                                    ) {
                                      const cabinQuantity =
                                        baggageInfo.includedCabinBags.quantity;
                                      if (cabinQuantity === 0) {
                                        return 'Cabin Baggage: 0 KG';
                                      } else if (cabinQuantity > 0) {
                                        // Display as "7+7+..." for hand carry when quantity > 0
                                        return `Cabin Baggage: ${Array(
                                          cabinQuantity
                                        )
                                          .fill('7')
                                          .join('+')} KG`;
                                      }
                                    }
                                  }
                                  return 'Cabin Baggage: N/A';
                                })()}
                              </span>
                            </div>

                            {/* Checked baggage */}
                            <div className="flex items-center">
                              <Image
                                src="/assets/icons/baggageIcon.svg"
                                width={15}
                                height={15}
                                alt="Cabin Bag"
                                className="me-2 flex-shrink-0"
                              />
                              <span className="label-l3 text-neutral-dark inline-flex items-center">
                                {(() => {
                                  // Find baggage info
                                  const baggageInfo = findBaggageInfo(
                                    segment.number,
                                    segmentIndex,
                                    itineraryIndex
                                  );

                                  // Handle checked bags display
                                  if (baggageInfo?.includedCheckedBags) {
                                    // If weight is specified directly
                                    if (
                                      'weight' in
                                        baggageInfo.includedCheckedBags &&
                                      baggageInfo.includedCheckedBags.weight !==
                                        undefined
                                    ) {
                                      const weight =
                                        baggageInfo.includedCheckedBags.weight;
                                      const weightUnit =
                                        baggageInfo.includedCheckedBags
                                          .weightUnit || 'KG';
                                      return `Checked Baggage: ${weight} ${weightUnit}`;
                                    }
                                    // If quantity is specified, display as 23+23+... KG
                                    else if (
                                      'quantity' in
                                        baggageInfo.includedCheckedBags &&
                                      baggageInfo.includedCheckedBags
                                        .quantity !== undefined
                                    ) {
                                      const quantity =
                                        baggageInfo.includedCheckedBags
                                          .quantity;
                                      if (quantity === 0) {
                                        return 'Checked Baggage: 0 KG';
                                      } else if (quantity > 0) {
                                        return `Checked Baggage: ${Array(
                                          quantity
                                        )
                                          .fill('23')
                                          .join('+')} KG`;
                                      }
                                    }
                                  }
                                  return 'Checked Baggage: N/A';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </React.Fragment>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightItinerary;
