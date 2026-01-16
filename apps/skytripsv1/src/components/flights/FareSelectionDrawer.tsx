import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../lib/axiosConfig';

interface Amenity {
  code: string;
  description: string;
  isChargeable: boolean;
  amenityType: string;
  amenityProvider?: {
    name: string;
  };
}

interface FareRule {
  category: 'EXCHANGE' | 'REFUND' | 'REVALIDATION';
  maxPenaltyAmount?: string;
  notApplicable?: boolean;
}

interface FareRules {
  rules: FareRule[];
}

interface FareSegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  class: string;
  includedCheckedBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
  includedCabinBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
  amenities?: Amenity[];
}

interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment?: FareSegment[];
}

interface FareOption {
  title: string;
  subtitle: string;
  price: string;
  features: Array<{
    included: boolean;
    text: string;
  }>;
}

interface FareSelectionDrawerProps {
  isOpen: boolean;
  onSelect?: (fareType: string) => void;
  onClose?: () => void;
  flightOffer?: any; // Replace 'any' with your FlightOffer type
}

const FareSelectionDrawer: React.FC<FareSelectionDrawerProps> = ({
  isOpen,
  onSelect,
  onClose,
  flightOffer,
}) => {
  const [brandedFares, setBrandedFares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBrandedFares = async () => {
      if (!flightOffer || !isOpen) return;

      setIsLoading(true);
      try {
        const response = await axiosInstance.post(
          '/flight-branded-fares-upsell?page=1&limit=10',
          flightOffer
        );

        setBrandedFares(response.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching branded fares:', error);

        // Check if it's a 400 error with "No upsell offer can be found" message
        if (
          error.response?.status === 400
          //    &&
          //   error.response?.data?.message === 'No upsell offer can be found'
        ) {
          // Create a branded fare object from the selected flight offer
          const travelerPricing = flightOffer.travelerPricings?.[0];
          const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];

          // Use the original flight offer as the default fare
          const defaultFare = {
            ...flightOffer,
            travelerPricings: flightOffer.travelerPricings?.map(
              (pricing: TravelerPricing) => ({
                ...pricing,
                fareDetailsBySegment: pricing.fareDetailsBySegment?.map(
                  (segment: FareSegment) => ({
                    ...segment,
                    brandedFareLabel:
                      segment.brandedFareLabel ||
                      segment.brandedFare ||
                      'Standard',
                    amenities: [
                      // Include cabin baggage
                      {
                        description: segment.includedCabinBags
                          ? segment.includedCabinBags.quantity
                            ? `Cabin baggage ${segment.includedCabinBags.quantity}PC`
                            : `Cabin baggage ${segment.includedCabinBags.weight}${segment.includedCabinBags.weightUnit}`
                          : 'N/A',
                        isChargeable: false,
                        amenityType: 'BAGGAGE',
                        amenityProvider: {
                          name: 'BrandedFare',
                        },
                      },
                      // Include checked baggage
                      {
                        description: segment.includedCheckedBags
                          ? segment.includedCheckedBags.quantity
                            ? `Checked baggage ${segment.includedCheckedBags.quantity}PC`
                            : `Checked baggage ${segment.includedCheckedBags.weight}${segment.includedCheckedBags.weightUnit}`
                          : 'N/A',
                        isChargeable: false,
                        amenityType: 'BAGGAGE',
                        amenityProvider: {
                          name: 'BrandedFare',
                        },
                      },
                      // Add other amenities from the original segment
                      ...(segment.amenities || []).filter(
                        (amenity: Amenity) =>
                          amenity.amenityType !== 'BAGGAGE' ||
                          amenity.isChargeable
                      ),
                      // Add refund information from fareRules
                      {
                        description: (() => {
                          const refundRule = flightOffer.fareRules?.rules?.find(
                            (rule: FareRule) => rule.category === 'REFUND'
                          );
                          if (refundRule?.maxPenaltyAmount) {
                            return `Refundable (Penalty: ${flightOffer.price?.currency} ${refundRule.maxPenaltyAmount})`;
                          }
                          return refundRule?.notApplicable
                            ? 'Non-refundable'
                            : 'Refundable';
                        })(),
                        isChargeable: true,
                        amenityType: 'REFUND',
                        amenityProvider: {
                          name: 'BrandedFare',
                        },
                      },
                      // Add exchange information from fareRules
                      {
                        description: (() => {
                          const exchangeRule =
                            flightOffer.fareRules?.rules?.find(
                              (rule: FareRule) => rule.category === 'EXCHANGE'
                            );
                          if (exchangeRule?.maxPenaltyAmount) {
                            return `Flight changes allowed (Fee: ${flightOffer.price?.currency} ${exchangeRule.maxPenaltyAmount})`;
                          }
                          return exchangeRule?.notApplicable
                            ? 'No flight changes allowed'
                            : 'Flight changes allowed';
                        })(),
                        isChargeable: true,
                        amenityType: 'EXCHANGE',
                        amenityProvider: {
                          name: 'BrandedFare',
                        },
                      },
                    ],
                  })
                ),
              })
            ),
          };

          setBrandedFares([defaultFare]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandedFares();
  }, [flightOffer, isOpen]);

  // Content component to avoid duplication
  const FareContent = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
      }
    };

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -320 : 320; // Width of one card + gap
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (container) {
        handleScroll(); // Initial check
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }, [brandedFares.length]);

    return (
      <div className="relative">
        {/* Desktop view - horizontal scroll */}
        <div className="hidden md:block relative px-4">
          {/* Left scroll button */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Right scroll button */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              className={cn(
                'inline-flex gap-4 py-4 px-2 min-w-full',
                isLoading && 'flex justify-center'
              )}
            >
              {isLoading ? (
                <div className="w-full flex-1 flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                    <span className="text-sm text-gray-600">
                      Loading fares...
                    </span>
                  </div>
                </div>
              ) : brandedFares.length > 0 ? (
                brandedFares.map((fare) => {
                  const travelerPricing = fare.travelerPricings?.[0];
                  const fareDetails =
                    travelerPricing?.fareDetailsBySegment?.[0];

                  // Get included baggage info
                  const includedCheckedBags = fareDetails?.includedCheckedBags;
                  const cabinBaggage = fareDetails?.amenities?.find(
                    (a: Amenity) =>
                      a.amenityType === 'BAGGAGE' && !a.isChargeable
                  );

                  // Get other amenities
                  const amenities = fareDetails?.amenities || [];
                  const features = [
                    {
                      text: `Cabin baggage: ${
                        fareDetails?.includedCabinBags?.quantity
                          ? `${fareDetails.includedCabinBags.quantity}PC`
                          : fareDetails?.includedCabinBags?.weight
                          ? `${fareDetails.includedCabinBags.weight}${fareDetails.includedCabinBags.weightUnit}`
                          : 'Not included'
                      }`,
                      included: !cabinBaggage?.isChargeable,
                    },
                    {
                      text: `Checked baggage: ${
                        fareDetails?.includedCheckedBags?.quantity
                          ? `${fareDetails.includedCheckedBags.quantity}PC`
                          : fareDetails?.includedCheckedBags?.weight
                          ? `${fareDetails.includedCheckedBags.weight}${fareDetails.includedCheckedBags.weightUnit}`
                          : 'Not included'
                      }`,
                      included: !!includedCheckedBags,
                    },
                    // {
                    //   text: 'Seat selection',
                    //   included: !amenities.find(
                    //     (a: Amenity) => a.amenityType === 'PRE_RESERVED_SEAT'
                    //   )?.isChargeable,
                    // },
                    // {
                    //   text: 'Meals',
                    //   included: !amenities.find(
                    //     (a: Amenity) => a.amenityType === 'MEAL'
                    //   )?.isChargeable,
                    // },
                    {
                      text: (() => {
                        // First check branded fare rules
                        const exchangeRule = fare.fareRules?.rules?.find(
                          (rule: FareRule) => rule.category === 'EXCHANGE'
                        );
                        // If no branded fare rules, check main flight offer rules
                        const mainExchangeRule =
                          flightOffer.fareRules?.rules?.find(
                            (rule: FareRule) => rule.category === 'EXCHANGE'
                          );
                        const finalExchangeRule =
                          exchangeRule || mainExchangeRule;

                        if (finalExchangeRule?.maxPenaltyAmount) {
                          return `Flight changes allowed (Fee: ${fare.price?.currency} ${finalExchangeRule.maxPenaltyAmount})`;
                        }
                        return finalExchangeRule?.notApplicable
                          ? 'No flight changes allowed'
                          : 'Flight changes allowed';
                      })(),
                      included: !(
                        fare.fareRules?.rules || flightOffer.fareRules?.rules
                      )?.find((rule: FareRule) => rule.category === 'EXCHANGE')
                        ?.notApplicable,
                    },
                    {
                      text: (() => {
                        // First check branded fare rules
                        const refundRule = fare.fareRules?.rules?.find(
                          (rule: FareRule) => rule.category === 'REFUND'
                        );
                        // If no branded fare rules, check main flight offer rules
                        const mainRefundRule =
                          flightOffer.fareRules?.rules?.find(
                            (rule: FareRule) => rule.category === 'REFUND'
                          );
                        const finalRefundRule = refundRule || mainRefundRule;

                        if (finalRefundRule?.maxPenaltyAmount) {
                          return `Refundable (Penalty: ${fare.price?.currency} ${finalRefundRule.maxPenaltyAmount})`;
                        }
                        return finalRefundRule?.notApplicable
                          ? 'Non-refundable'
                          : 'Refundable';
                      })(),
                      included: !(
                        fare.fareRules?.rules || flightOffer.fareRules?.rules
                      )?.find((rule: FareRule) => rule.category === 'REFUND')
                        ?.notApplicable,
                    },
                  ];

                  return (
                    <div key={fare.id} className="w-[300px] flex-shrink-0">
                      <div
                        className={cn(
                          'bg-white rounded-lg p-4 border hover:border-primary transition-colors cursor-pointer h-full',
                          'flex flex-col'
                        )}
                        onClick={() => onSelect?.(fare.id)}
                      >
                        <div className="mb-4">
                          {/* <h3 className="text-lg font-semibold text-gray-900">
                            {fareDetails?.brandedFareLabel ||
                              fareDetails?.brandedFare ||
                              'Economy'}{' '}
                            Fare
                          </h3> */}
                          <p className="text-sm text-gray-600">
                            {fareDetails?.cabin || 'Economy'} Class
                          </p>
                          <div className="mt-2 text-xl font-bold text-primary">
                            {fare.price?.currency}{' '}
                            {Math.floor(parseFloat(fare.price?.total || '0'))}
                          </div>
                        </div>

                        <div className="flex-grow">
                          <div className="space-y-2">
                            {features.map((feature, featureIndex) => (
                              <div
                                key={featureIndex}
                                className="flex items-center text-sm text-gray-700"
                              >
                                {feature.included ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {feature.text}
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-[#5143d9] transition-colors"
                          onClick={() => onSelect?.(fare.id)}
                        >
                          Select {fareDetails?.brandedFare || 'Standard'} Fare
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                // defaultFares.map((fare) => (
                //   <div key={fare.title} className="w-[300px] flex-shrink-0">
                //     <div
                //       className={cn(
                //         'bg-white rounded-lg p-4 border hover:border-primary transition-colors cursor-pointer h-full',
                //         'flex flex-col'
                //       )}
                //       onClick={() => onSelect?.(fare.title)}
                //     >
                //       <div className="mb-4">
                //         <h3 className="text-lg font-semibold text-gray-900">
                //           {fare.title}
                //         </h3>
                //         <p className="text-sm text-gray-600">{fare.subtitle}</p>
                //         <div className="mt-2 text-xl font-bold text-primary">
                //           AUD {fare.price}
                //         </div>
                //       </div>

                //       <div className="flex-grow">
                //         <div className="space-y-2">
                //           {fare.features.map((feature, featureIndex) => (
                //             <div
                //               key={featureIndex}
                //               className="flex items-center text-sm text-gray-700"
                //             >
                //               {feature.included ? (
                //                 <svg
                //                   xmlns="http://www.w3.org/2000/svg"
                //                   className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                //                   viewBox="0 0 20 20"
                //                   fill="currentColor"
                //                 >
                //                   <path
                //                     fillRule="evenodd"
                //                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                //                     clipRule="evenodd"
                //                   />
                //                 </svg>
                //               ) : (
                //                 <svg
                //                   xmlns="http://www.w3.org/2000/svg"
                //                   className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                //                   viewBox="0 0 20 20"
                //                   fill="currentColor"
                //                 >
                //                   <path
                //                     fillRule="evenodd"
                //                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                //                     clipRule="evenodd"
                //                   />
                //                 </svg>
                //               )}
                //               {feature.text}
                //             </div>
                //           ))}
                //         </div>
                //       </div>

                //       <button
                //         className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-[#5143d9] transition-colors"
                //         onClick={() => onSelect?.(fare.title)}
                //       >
                //         Select {fare.title}
                //       </button>
                //     </div>
                //   </div>
                // ))
                <h2 className="h2 text-center text-background-on">
                  No Fare Options Available
                </h2>
              )}
            </div>
          </div>
        </div>

        {/* Mobile view - grid layout */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {isLoading ? (
            <div className="flex justify-center items-center w-full min-h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin h-10 w-10 text-primary" />
                <span className="text-sm text-gray-600">Loading fares...</span>
              </div>
            </div>
          ) : brandedFares.length > 0 ? (
            brandedFares.map((fare) => {
              const travelerPricing = fare.travelerPricings?.[0];
              const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];

              // Get included baggage info
              const includedCheckedBags = fareDetails?.includedCheckedBags;
              const cabinBaggage = fareDetails?.amenities?.find(
                (a: Amenity) => a.amenityType === 'BAGGAGE' && !a.isChargeable
              );

              // Get other amenities
              const amenities = fareDetails?.amenities || [];
              const features = [
                {
                  text: `Cabin baggage: ${
                    cabinBaggage?.description || 'Not included'
                  }`,
                  included: !cabinBaggage?.isChargeable,
                },
                {
                  text: `Checked baggage: ${
                    includedCheckedBags
                      ? `${includedCheckedBags.weight}${includedCheckedBags.weightUnit}`
                      : 'Not included'
                  }`,
                  included: !!includedCheckedBags,
                },
                // {
                //   text: 'Seat selection',
                //   included: !amenities.find(
                //     (a: Amenity) => a.amenityType === 'PRE_RESERVED_SEAT'
                //   )?.isChargeable,
                // },
                // {
                //   text: 'Meals',
                //   included: !amenities.find(
                //     (a: Amenity) => a.amenityType === 'MEAL'
                //   )?.isChargeable,
                // },
                {
                  text: (() => {
                    // First check branded fare rules
                    const exchangeRule = fare.fareRules?.rules?.find(
                      (rule: FareRule) => rule.category === 'EXCHANGE'
                    );
                    // If no branded fare rules, check main flight offer rules
                    const mainExchangeRule = flightOffer.fareRules?.rules?.find(
                      (rule: FareRule) => rule.category === 'EXCHANGE'
                    );
                    const finalExchangeRule = exchangeRule || mainExchangeRule;

                    if (finalExchangeRule?.maxPenaltyAmount) {
                      return `Flight changes allowed (Fee: ${fare.price?.currency} ${finalExchangeRule.maxPenaltyAmount})`;
                    }
                    return finalExchangeRule?.notApplicable
                      ? 'No flight changes allowed'
                      : 'Flight changes allowed';
                  })(),
                  included: !(
                    fare.fareRules?.rules || flightOffer.fareRules?.rules
                  )?.find((rule: FareRule) => rule.category === 'EXCHANGE')
                    ?.notApplicable,
                },
                {
                  text: (() => {
                    // First check branded fare rules
                    const refundRule = fare.fareRules?.rules?.find(
                      (rule: FareRule) => rule.category === 'REFUND'
                    );
                    // If no branded fare rules, check main flight offer rules
                    const mainRefundRule = flightOffer.fareRules?.rules?.find(
                      (rule: FareRule) => rule.category === 'REFUND'
                    );
                    const finalRefundRule = refundRule || mainRefundRule;

                    if (finalRefundRule?.maxPenaltyAmount) {
                      return `Refundable (Penalty: ${fare.price?.currency} ${finalRefundRule.maxPenaltyAmount})`;
                    }
                    return finalRefundRule?.notApplicable
                      ? 'Non-refundable'
                      : 'Refundable';
                  })(),
                  included: !(
                    fare.fareRules?.rules || flightOffer.fareRules?.rules
                  )?.find((rule: FareRule) => rule.category === 'REFUND')
                    ?.notApplicable,
                },
              ];

              return (
                <div
                  key={fare.id}
                  className={cn(
                    'bg-white rounded-lg p-4 border hover:border-primary transition-colors cursor-pointer',
                    'flex flex-col h-full'
                  )}
                  onClick={() => onSelect?.(fare.id)}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {fareDetails?.brandedFare || 'Standard'} Fare
                    </h3>
                    <p className="text-sm text-gray-600">
                      {fareDetails?.cabin || 'Economy'} Class
                    </p>
                    <div className="mt-2 text-xl font-bold text-primary">
                      {fare.price?.currency}{' '}
                      {Math.floor(parseFloat(fare.price?.total || '0'))}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="space-y-2">
                      {features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center text-sm text-gray-700"
                        >
                          {feature.included ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {feature.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-[#5143d9] transition-colors"
                    onClick={() => onSelect?.(fare.id)}
                  >
                    Select {fareDetails?.brandedFare || 'Standard'} Fare
                  </button>
                </div>
              );
            })
          ) : (
            <h2 className="h2 text-center text-background-on">
              No Fare Options Available
            </h2>
            // defaultFares.map((fare) => (
            //   <div
            //     key={fare.title}
            //     className={cn(
            //       'bg-white rounded-lg p-4 border hover:border-primary transition-colors cursor-pointer',
            //       'flex flex-col h-full'
            //     )}
            //     onClick={() => onSelect?.(fare.title)}
            //   >
            //     <div className="mb-4">
            //       <h3 className="text-lg font-semibold text-gray-900">
            //         {fare.title}
            //       </h3>
            //       <p className="text-sm text-gray-600">{fare.subtitle}</p>
            //       <div className="mt-2 text-xl font-bold text-primary">
            //         AUD {fare.price}
            //       </div>
            //     </div>

            //     <div className="flex-grow">
            //       <div className="space-y-2">
            //         {fare.features.map((feature, featureIndex) => (
            //           <div
            //             key={featureIndex}
            //             className="flex items-center text-sm text-gray-700"
            //           >
            //             {feature.included ? (
            //               <svg
            //                 xmlns="http://www.w3.org/2000/svg"
            //                 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
            //                 viewBox="0 0 20 20"
            //                 fill="currentColor"
            //               >
            //                 <path
            //                   fillRule="evenodd"
            //                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            //                   clipRule="evenodd"
            //                 />
            //               </svg>
            //             ) : (
            //               <svg
            //                 xmlns="http://www.w3.org/2000/svg"
            //                 className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
            //                 viewBox="0 0 20 20"
            //                 fill="currentColor"
            //               >
            //                 <path
            //                   fillRule="evenodd"
            //                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            //                   clipRule="evenodd"
            //                 />
            //               </svg>
            //             )}
            //             {feature.text}
            //           </div>
            //         ))}
            //       </div>
            //     </div>

            //     <button
            //       className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-[#5143d9] transition-colors"
            //       onClick={() => onSelect?.(fare.title)}
            //     >
            //       Select {fare.title}
            //     </button>
            //   </div>
            // ))
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop view - Drawer */}
      <div className="hidden md:block">
        <div
          className={cn(
            'w-full overflow-hidden transition-all duration-300 ease-in-out border-t',
            isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="w-full bg-gray-50">
            <FareContent />
          </div>
        </div>
      </div>

      {/* Mobile view - Modal */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 bg-white rounded-t-xl transition-transform duration-300 transform',
            isOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Select Fare</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <FareContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default FareSelectionDrawer;
