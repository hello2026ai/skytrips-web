import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import { encodeData } from '../../utils/urlEncoding';

interface FareTab {
  id: string;
  label: string;
}

interface FareOffer {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  originIcon?: string;
  destinationIcon?: string;
  airline?: {
    airlineName: string;
    airlineCode: string;
  };
  originalDeal?: any; // Original API deal object
  currencyCode: string;
}

interface AirportInfo {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
}

interface RouteData {
  airline?: {
    id: string;
    airlineName: string;
    airlineCode: string;
    country?: string;
    alliance?: string;
    airlineType?: string;
    yearOfEstablishment?: string;
    totalDestination?: string;
    totalFleet?: string;
    logoUrl?: string;
    description?: string;
  };
  dealCategories?: Array<{
    id: string;
    title: string;
    description: string;
    deals?: any[];
    subCategories?: Array<{
      id: string;
      title: string;
      description: string;
      deals?: any[];
    }>;
  }>;
}

interface PagesSpecialFareProps {
  routeData?: RouteData | null;
}

// Subcategory component to handle local state
const SubCategorySection: React.FC<{
  category: any;
  fares: Record<string, FareOffer[]>;
  generateEncodedParams: (fare: FareOffer) => string;
  handleFareCardClick: (e: React.MouseEvent, fare: FareOffer) => void;
  handleShareClick: (e: React.MouseEvent, fare: FareOffer) => void;
  selectedCurrency: string;
  convertedPrices: Record<string, number>;
}> = ({
  category,
  fares,
  generateEncodedParams,
  handleFareCardClick,
  handleShareClick,
  selectedCurrency,
  convertedPrices,
}) => {
  const subCategoryTabs = category
    .subCategories!.filter(
      (subCat: any) => subCat.deals && subCat.deals.length > 0
    )
    .map((subCat: any) => ({
      id: subCat.title.toLowerCase().replace(/\s+/g, '-'),
      label: subCat.title,
    }));

  const [localActiveTab, setLocalActiveTab] = useState(
    subCategoryTabs.length > 0 ? subCategoryTabs[0].id : ''
  );

  return (
    <div className="mb-8">
      <h2 className="h3 text-background-on">{category.title}</h2>
      <p className="label-l1 mb-6">{category.description}</p>

      {/* Tabs for subcategories */}
      <div className="flex flex-wrap justify-start gap-2 mb-4">
        {subCategoryTabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setLocalActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md label-l1 hover:shadow-md transition-shadow ${
              localActiveTab === tab.id
                ? 'bg-primary text-primary-on'
                : 'bg-container text-background-on'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subcategory deals */}
      {fares[localActiveTab]?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fares[localActiveTab].map((fare) => (
            <a
              key={fare.id}
              href={`/flights-results?q=${generateEncodedParams(fare)}`}
              onClick={(e) => handleFareCardClick(e, fare)}
              className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            >
              <div className="relative w-full h-[200px]">
                <img
                  src={
                    fare.originalDeal?.ogImageUrl
                      ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                          /\/$/,
                          ''
                        )}/${fare.originalDeal.ogImageUrl.replace(/^\//, '')}`
                      : '/assets/images/bg/home-au-bg.jpg'
                  }
                  alt={`${fare.origin} to ${fare.destination} flight deal`}
                  loading="lazy"
                  width="100%"
                  height="200"
                  className="rounded-t-lg object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <div className="title-t4 text-secondary-bright">
                  {fare.airline && (
                    <div>
                      <span>{fare.airline.airlineName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-left mb-1">
                  <div className="flex items-center">
                    <span className="title-t3 text-background-on">
                      {fare.origin}
                    </span>
                  </div>
                  <div className="flex items-center mx-2">
                    <svg
                      className="w-4 h-4 text-background-on"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex items-center">
                    <span className="title-t3 text-background-on">
                      {fare.destination}
                    </span>
                  </div>
                </div>
                <div className="label-l1 text-background-on mb-3">
                  {fare.departureDate}
                  {fare.returnDate ? ` - ${fare.returnDate}` : ' (One-way)'}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline">
                    <div className="title-t4 text-background-on mr-2">
                      from{' '}
                    </div>
                    <div className="title-t4 text-secondary-bright">
                      {selectedCurrency}{' '}
                      {convertedPrices[fare.id] !== undefined
                        ? Number(convertedPrices[fare.id]).toFixed(2)
                        : Number(fare.price).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleShareClick(e, fare)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Share this fare"
                  >
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const PagesSpecialFare: React.FC<PagesSpecialFareProps> = ({ routeData }) => {
  const router = useRouter();
  const [tabs, setTabs] = useState<FareTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [fares, setFares] = useState<Record<string, FareOffer[]>>({});
  const [totalDeals, setTotalDeals] = useState<number>(0);
  const [hasActiveDeals, setHasActiveDeals] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    // Initialize with the currency from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || 'AUD';
    }
    return 'AUD';
  });
  const [convertedPrices, setConvertedPrices] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Add effect to sync with currency changes
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail.currency;
      setSelectedCurrency(newCurrency);
    };

    window.addEventListener(
      'currencyChange',
      handleCurrencyChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'currencyChange',
        handleCurrencyChange as EventListener
      );
    };
  }, []);

  // Add useEffect to update activeTab when fares change
  useEffect(() => {
    // Find the first tab that has data
    const firstTabWithData = tabs.find((tab) => fares[tab.id]?.length > 0);
    if (firstTabWithData) {
      setActiveTab(firstTabWithData.id);
    }

    // Check if there are any active deals
    const totalActiveDeals = Object.values(fares).reduce(
      (sum, cityFares) => sum + cityFares.length,
      0
    );
    setHasActiveDeals(totalActiveDeals > 0);
  }, [fares]);

  // Map of origin cities to airport codes
  const cityToIataCode: Record<string, string> = {
    Sydney: 'SYD',
    Melbourne: 'MEL',
    Brisbane: 'BNE',
    Adelaide: 'ADL',
    Perth: 'PER',
    KTM: 'KTM', // Kathmandu
  };

  // Add this function after the cityToIataCode mapping
  const isDateValid = (dateStr: string): boolean => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      // Set today's time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      return date >= today;
    } catch (error) {
      console.error('Error validating date:', dateStr, error);
      return false;
    }
  };

  // Process deals data from routeData prop
  useEffect(() => {
    console.log('=== Processing routeData ===');
    console.log('routeData:', routeData);

    if (
      !routeData ||
      !routeData.dealCategories ||
      routeData.dealCategories.length === 0
    ) {
      console.log('No routeData or dealCategories found');
      return;
    }

    console.log('dealCategories count:', routeData.dealCategories.length);

    const formatDate = (dateStr: string) => {
      try {
        if (!dateStr || dateStr === '') return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          const today = new Date();
          return format(today, 'EEE, MMM d');
        }
        return format(date, 'EEE, MMM d');
      } catch (error) {
        console.error('Error formatting date:', dateStr, error);
        const today = new Date();
        return format(today, 'EEE, MMM d');
      }
    };

    const newTabs: FareTab[] = [];
    const newFares: Record<string, FareOffer[]> = {};
    let totalDealsCount = 0;

    // Process each deal category
    routeData.dealCategories.forEach((category) => {
      console.log('Processing category:', category.title);
      console.log('Category deals:', category.deals);

      // Check if category has deals
      const categoryHasDeals = category.deals && category.deals.length > 0;
      const categoryHasSubCategories =
        category.subCategories && category.subCategories.length > 0;

      // Check if any subcategory has deals
      const hasSubCategoryDeals =
        categoryHasSubCategories &&
        category.subCategories!.some(
          (subCat) => subCat.deals && subCat.deals.length > 0
        );

      console.log(
        'categoryHasDeals:',
        categoryHasDeals,
        'categoryHasSubCategories:',
        categoryHasSubCategories,
        'hasSubCategoryDeals:',
        hasSubCategoryDeals
      );

      // Skip if no deals in category and no deals in subcategories
      if (!categoryHasDeals && !hasSubCategoryDeals) {
        console.log(
          'Skipping category - no deals in category or subcategories'
        );
        return;
      }

      // Only create main category tab if it has deals
      // If category has no deals but subcategories have deals, skip main tab
      if (categoryHasDeals) {
        // Create tab ID from category title (lowercase, replace spaces with hyphens)
        const tabId = category.title.toLowerCase().replace(/\s+/g, '-');

        // Add main category as a tab
        newTabs.push({
          id: tabId,
          label: category.title,
        });

        // Initialize fares array for this tab
        newFares[tabId] = [];

        // Process deals in main category
        console.log('Processing', category.deals!.length, 'deals in category');
        category.deals!.forEach((deal: any) => {
          console.log(
            'Processing deal:',
            deal.title,
            'Status:',
            deal.publishedStatus
          );

          // Only process deals with ACTIVE status
          if (deal.publishedStatus !== 'ACTIVE') {
            console.log('Skipping deal - not ACTIVE');
            return;
          }

          // Skip if departure date is in the past
          if (!isDateValid(deal.departureDate)) {
            console.log('Skipping deal - invalid date:', deal.departureDate);
            return;
          }

          // Skip if origin or destination are missing
          if (!deal.origin || !deal.destination) {
            console.log('Skipping deal - missing origin or destination');
            return;
          }

          // Skip if airline is missing
          if (!deal.airline) {
            console.log('Skipping deal - no airline');
            return;
          }

          console.log('Deal passed all checks - adding to fares');

          // Get origin and destination
          const originCode =
            typeof deal.origin === 'object'
              ? deal.origin.iataCode
              : deal.origin;
          const destinationCode =
            typeof deal.destination === 'object'
              ? deal.destination.iataCode
              : deal.destination;

          const originCity =
            typeof deal.origin === 'object'
              ? deal.origin.municipality || originCode
              : originCode;
          const destinationCity =
            typeof deal.destination === 'object'
              ? deal.destination.municipality || destinationCode
              : destinationCode;

          const fareOffer: FareOffer = {
            id: deal.id || String(Math.random()),
            origin: originCity,
            destination: destinationCity,
            departureDate: formatDate(deal.departureDate),
            price: deal.price,
            originIcon: '/assets/icons/flag-australia.svg',
            destinationIcon: '/assets/icons/flag-nepal.svg',
            airline: deal.airline,
            originalDeal: deal,
            currencyCode: deal.currencyCode || 'AUD',
          };

          if (deal.returnDate) {
            fareOffer.returnDate = formatDate(deal.returnDate);
          }

          newFares[tabId].push(fareOffer);
          totalDealsCount++;
        });
      }

      // Process subCategories as separate tabs if they have deals
      if (categoryHasSubCategories && category.subCategories) {
        category.subCategories.forEach((subCategory) => {
          if (!subCategory.deals || subCategory.deals.length === 0) {
            return;
          }

          // Use just subcategory title for tab ID when parent has no deals
          const subTabId = categoryHasDeals
            ? `${category.title
                .toLowerCase()
                .replace(/\s+/g, '-')}-${subCategory.title
                .toLowerCase()
                .replace(/\s+/g, '-')}`
            : subCategory.title.toLowerCase().replace(/\s+/g, '-');

          newTabs.push({
            id: subTabId,
            label: subCategory.title,
          });

          newFares[subTabId] = [];

          subCategory.deals.forEach((deal: any) => {
            if (deal.publishedStatus !== 'ACTIVE') {
              return;
            }

            if (!isDateValid(deal.departureDate)) {
              return;
            }

            if (!deal.origin || !deal.destination) {
              return;
            }

            if (!deal.airline) {
              return;
            }

            const originCode =
              typeof deal.origin === 'object'
                ? deal.origin.iataCode
                : deal.origin;
            const destinationCode =
              typeof deal.destination === 'object'
                ? deal.destination.iataCode
                : deal.destination;

            const originCity =
              typeof deal.origin === 'object'
                ? deal.origin.municipality || originCode
                : originCode;
            const destinationCity =
              typeof deal.destination === 'object'
                ? deal.destination.municipality || destinationCode
                : destinationCode;

            const fareOffer: FareOffer = {
              id: deal.id || String(Math.random()),
              origin: originCity,
              destination: destinationCity,
              departureDate: formatDate(deal.departureDate),
              price: deal.price,
              originIcon: '/assets/icons/flag-australia.svg',
              destinationIcon: '/assets/icons/flag-nepal.svg',
              airline: deal.airline,
              originalDeal: deal,
              currencyCode: deal.currencyCode || 'AUD',
            };

            if (deal.returnDate) {
              fareOffer.returnDate = formatDate(deal.returnDate);
            }

            newFares[subTabId].push(fareOffer);
            totalDealsCount++;
          });
        });
      }
    });

    setTabs(newTabs);
    setFares(newFares);
    setTotalDeals(totalDealsCount);

    console.log('=== Final Results ===');
    console.log('Total tabs created:', newTabs.length);
    console.log('Tabs:', newTabs);
    console.log('Total deals:', totalDealsCount);
    console.log('Fares:', newFares);

    // Set active tab to first tab with data
    if (newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  }, [routeData]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const generateEncodedParams = (fare: FareOffer): string => {
    try {
      // If we have the original deal object, use it for accurate data
      if (fare.originalDeal) {
        const deal = fare.originalDeal;

        // Extract origin and destination from the complete deal
        const originObj = typeof deal.origin === 'object' ? deal.origin : null;
        const destinationObj =
          typeof deal.destination === 'object' ? deal.destination : null;

        // Get the IATA codes
        const originCode = originObj ? originObj.iataCode : deal.origin;
        const destinationCode = destinationObj
          ? destinationObj.iataCode
          : deal.destination;

        // Determine if this is a one-way or round trip based on returnDate
        const hasReturnDate = deal.returnDate && deal.returnDate !== '';
        const tripType = hasReturnDate ? 'ROUND_TRIP' : 'ONE_WAY';

        // Format dates as YYYY-MM-DD for the API
        const departureDate = format(
          new Date(deal.departureDate),
          'yyyy-MM-dd'
        );

        // Only format return date if it exists
        const returnDate = hasReturnDate
          ? format(new Date(deal.returnDate), 'yyyy-MM-dd')
          : '';

        // Create detailed airport objects for compatibility with SearchWidget
        // NOTE: SearchWidget expects specific fields: code, name, city, country
        const fromAirport = {
          code: originCode, // SearchWidget expects 'code' instead of 'iataCode'
          iataCode: originCode,
          city: (originObj && originObj.municipality) || fare.origin,
          name: (originObj && originObj.name) || `${fare.origin} Airport`,
          country:
            (originObj && (originObj.country || originObj.isoCountry)) ||
            'Australia',
          displayName: `${
            (originObj && originObj.municipality) || fare.origin
          } (${originCode})`,
        };

        const toAirport = {
          code: destinationCode, // SearchWidget expects 'code' instead of 'iataCode'
          iataCode: destinationCode,
          city:
            (destinationObj && destinationObj.municipality) ||
            (fare.destination === 'KTM' ? 'Kathmandu' : fare.destination),
          name:
            (destinationObj && destinationObj.name) ||
            `${
              fare.destination === 'KTM' ? 'Kathmandu' : fare.destination
            } Airport`,
          country:
            (destinationObj &&
              (destinationObj.country || destinationObj.isoCountry)) ||
            'Nepal',
          displayName: `${
            (destinationObj && destinationObj.municipality) ||
            (fare.destination === 'KTM' ? 'Kathmandu' : fare.destination)
          } (${destinationCode})`,
        };

        // Save airport info to localStorage with explicit structure matching SearchWidget expectations
        localStorage.setItem(
          'skytrips_airports',
          JSON.stringify({
            fromAirport,
            toAirport,
          })
        );

        // Create date objects for the dateRange
        const departureDateObj = new Date(deal.departureDate);
        const returnDateObj = hasReturnDate ? new Date(deal.returnDate) : null;

        // Prepare search params using the original deal data
        const searchParams: any = {
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDate,
          adults: 1,
          children: 0,
          infants: 0,
          travelClass: deal.travelClass || 'ECONOMY',
          tripType: deal.tripType || tripType,
          currencyCode: selectedCurrency,
          maxResults: 250,

          // Include complete airport info with correct structure for SearchWidget
          fromAirport,
          toAirport,

          // Include the airline information if available
          airline: deal.airline,

          // Include the original deal ID and OG image URL
          dealId: deal._id || deal.id,
          ogImageUrl: deal.ogImageUrl,
          // Ensure originalDeal is properly passed with all necessary fields
          originalDeal: {
            ...deal,
            id: deal._id || deal.id,
            ogImageUrl: deal.ogImageUrl,
            // Ensure we pass the full URL structure
            ogImageFullUrl: deal.ogImageUrl
              ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                  /\/$/,
                  ''
                )}/${deal.ogImageUrl.replace(/^\//, '')}`
              : null,
          },

          // Include price information for sharing
          price: fare.price,
          estimatedPrice: fare.price, // Also include as estimatedPrice for fallback
        };

        // Add return date only if it exists
        if (hasReturnDate) {
          searchParams.returnDate = returnDate;

          // Include the dateRange object for the date picker component only if round trip
          searchParams.dateRange = {
            from: departureDateObj.toISOString(),
            to: returnDateObj ? returnDateObj.toISOString() : null,
          };

          // Create origin destinations array for API - for round trip
          searchParams.originDestinations = [
            {
              id: 1,
              originLocationCode: originCode,
              destinationLocationCode: destinationCode,
              departureDateTimeRange: { date: departureDate },
            },
            {
              id: 2,
              originLocationCode: destinationCode,
              destinationLocationCode: originCode,
              departureDateTimeRange: { date: returnDate },
            },
          ];
        } else {
          // For one-way trips, only include the outbound journey
          searchParams.dateRange = {
            from: departureDateObj.toISOString(),
            to: null,
          };

          // Create origin destinations array for API - for one way
          searchParams.originDestinations = [
            {
              id: 1,
              originLocationCode: originCode,
              destinationLocationCode: destinationCode,
              departureDateTimeRange: { date: departureDate },
            },
          ];
        }

        // Encode the search params and redirect to flights-results
        // Use encodeURIComponent to safely handle all characters
        const encodedParams = encodeData(searchParams);
        return encodedParams;
      }

      // If we don't have the original deal, fall back to the previous implementation
      // Parse dates from the fare data (e.g., "Tue, Jun 10" to proper date format)
      const parseCardDate = (dateStr: string): string => {
        try {
          // Handle format like "Tue, Jun 10" or "Tue, July 17"
          const [_, monthStr, dayStr] = dateStr.split(' ');
          const month = monthStr.toLowerCase();
          const day = parseInt(dayStr);

          // Map month names to month numbers
          const monthMap: Record<string, number> = {
            jan: 0,
            january: 0,
            feb: 1,
            february: 1,
            mar: 2,
            march: 2,
            apr: 3,
            april: 3,
            may: 4,
            jun: 5,
            june: 5,
            jul: 6,
            july: 6,
            aug: 7,
            august: 7,
            sep: 8,
            september: 8,
            oct: 9,
            october: 9,
            nov: 10,
            november: 10,
            dec: 11,
            december: 11,
          };

          // Use current year, or next year if the month is earlier than current month
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          let year = currentDate.getFullYear();

          if (monthMap[month] < currentMonth) {
            // If the specified month is earlier than current month, assume it's next year
            year += 1;
          }

          // Create a new date with the parsed values
          const date = new Date(year, monthMap[month], day);
          return format(date, 'yyyy-MM-dd');
        } catch (error) {
          console.error('Error parsing date:', dateStr, error);
          // Fallback to current date + offset
          const today = new Date();
          return format(
            addDays(today, dateStr.includes('departure') ? 10 : 20),
            'yyyy-MM-dd'
          );
        }
      };

      // Check if return date exists and is valid
      const hasReturnDate = fare.returnDate && fare.returnDate.trim() !== '';
      const tripType = hasReturnDate ? 'ROUND_TRIP' : 'ONE_WAY';

      // Parse departure and return dates from fare data
      const departureDate = parseCardDate(fare.departureDate);
      const returnDate =
        hasReturnDate && fare.returnDate ? parseCardDate(fare.returnDate) : '';

      // Get airport codes
      const originCode = cityToIataCode[fare.origin] || fare.origin;
      const destinationCode =
        cityToIataCode[fare.destination] || fare.destination;

      // Create airport objects with structure matching SearchWidget expectations
      const fromAirport = {
        code: originCode,
        iataCode: originCode,
        city: fare.origin,
        name: `${fare.origin} Airport`,
        country: 'Australia', // Add country for validation
        displayName: `${fare.origin} (${originCode})`,
      };

      const toAirport = {
        code: destinationCode,
        iataCode: destinationCode,
        city: destinationCode === 'KTM' ? 'Kathmandu' : fare.destination,
        name: `${
          destinationCode === 'KTM' ? 'Kathmandu' : fare.destination
        } Airport`,
        country: 'Nepal', // Add country for validation
        displayName: `${
          destinationCode === 'KTM' ? 'Kathmandu' : fare.destination
        } (${destinationCode})`,
      };

      // Save airport info to localStorage with explicit structure matching SearchWidget expectations
      localStorage.setItem(
        'skytrips_airports',
        JSON.stringify({
          fromAirport,
          toAirport,
        })
      );

      // Create date objects for the dateRange
      const departureDateObj = new Date(departureDate);
      const returnDateObj = hasReturnDate ? new Date(returnDate) : null;

      // Prepare essential search params
      const searchParams: any = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate,
        adults: 1,
        children: 0,
        infants: 0,
        travelClass: 'ECONOMY',
        tripType: tripType,
        currencyCode: selectedCurrency,
        maxResults: 20,

        // Include airport info with structure matching SearchWidget
        fromAirport,
        toAirport,

        // Include price information for sharing
        price: fare.price,
        estimatedPrice: fare.price, // Also include as estimatedPrice for fallback
      };

      // Add return date and related fields only if it exists
      if (hasReturnDate) {
        searchParams.returnDate = returnDate;

        // Include the dateRange object for the date picker component
        searchParams.dateRange = {
          from: departureDateObj.toISOString(),
          to: returnDateObj ? returnDateObj.toISOString() : null,
        };

        // Create origin destinations array for API - both ways
        searchParams.originDestinations = [
          {
            id: 1,
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDateTimeRange: { date: departureDate },
          },
          {
            id: 2,
            originLocationCode: destinationCode,
            destinationLocationCode: originCode,
            departureDateTimeRange: { date: returnDate },
          },
        ];
      } else {
        // For one-way trips
        searchParams.dateRange = {
          from: departureDateObj.toISOString(),
          to: null,
        };

        // Create origin destinations array for API - one way only
        searchParams.originDestinations = [
          {
            id: 1,
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDateTimeRange: { date: departureDate },
          },
        ];
      }

      // Encode the search params and redirect to flights-results
      const encodedParams = encodeData(searchParams);
      return encodedParams;
    } catch (error) {
      console.error('Error generating encoded params:', error);
      return '';
    }
  };

  // Function to generate shareable link parameters for a fare
  const generateShareableShortLink = async (
    fare: FareOffer
  ): Promise<string> => {
    try {
      const params = generateEncodedParams(fare);

      // Generate a short hash from the params
      const shortHash = generateShortHash(params);

      // Store the mapping using the API instead of localStorage
      await axios.post('/api/shortlinks/create', {
        shortHash,
        params,
      });

      // Create short URL
      const shortLink = `${
        typeof window !== 'undefined' ? window.location.origin : ''
      }/s/${shortHash}`;

      return shortLink;
    } catch (error) {
      console.error('Error generating shareable link params:', error);
      return '';
    }
  };

  // Function to get href for fare (synchronous version for JSX attributes)
  const getShareableLink = (fare: FareOffer): string => {
    const params = generateEncodedParams(fare);
    const shortHash = generateShortHash(params);
    return `${
      typeof window !== 'undefined' ? window.location.origin : ''
    }/s/${shortHash}`;
  };

  // Generate a short hash from the params string
  const generateShortHash = (params: string): string => {
    // Take the first 8 characters of the params and add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const paramStart = params.substring(0, 8);

    // Mix the timestamp and params to create a unique hash
    let hash = '';
    for (let i = 0; i < 6; i++) {
      hash += (paramStart[i] || '') + (timestamp[i] || '');
    }

    // Add random characters to make it more unique
    const randomChars = Math.random().toString(36).substring(2, 5);
    return hash + randomChars;
  };

  // Function to handle fare card click
  const handleFareCardClick = (e: React.MouseEvent, fare: FareOffer) => {
    // Prevent the default behavior to avoid navigating to the href directly
    e.preventDefault();
    try {
      // First create the server shortlink
      generateShareableShortLink(fare).then(() => {
        // Then navigate to the flights-results page directly
        const params = generateEncodedParams(fare);

        // Ensure SearchWidget can properly validate the airport data
        // by enhancing the stored airport objects with all required fields
        try {
          const storedData = localStorage.getItem('skytrips_airports');
          if (storedData) {
            const airports = JSON.parse(storedData);

            // Fix the fromAirport object if it exists
            if (airports.fromAirport) {
              const from = airports.fromAirport;

              // Ensure all required fields exist to pass validation
              const updatedFromAirport = {
                ...from,
                code: from.code || from.iataCode, // Ensure code property exists
                country: from.country || 'Australia', // Ensure country property exists
              };

              airports.fromAirport = updatedFromAirport;
            }

            // Fix the toAirport object if it exists
            if (airports.toAirport) {
              const to = airports.toAirport;

              // Ensure all required fields exist to pass validation
              const updatedToAirport = {
                ...to,
                code: to.code || to.iataCode, // Ensure code property exists
                country: to.country || 'Nepal', // Ensure country property exists
              };

              airports.toAirport = updatedToAirport;
            }

            // Store the enhanced airport data back in localStorage
            localStorage.setItem('skytrips_airports', JSON.stringify(airports));
          }
        } catch (storageError) {
          console.error(
            'Error fixing airport data in localStorage:',
            storageError
          );
          // Continue with navigation even if this enhancement fails
        }

        router.push(`/flights-results?q=${params}`);
      });
    } catch (error) {
      console.error('Error navigating to flights-results:', error);
    }
  };

  // Function to show a tooltip near an element
  const showTooltip = (element: HTMLElement | null, message: string) => {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.innerText = message;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none'; // Prevent tooltip from blocking clicks

    // Add tooltip to DOM to get its dimensions
    document.body.appendChild(tooltip);

    // Position the tooltip
    if (element) {
      // Center tooltip above the button
      const buttonRect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      tooltip.style.top = `${
        scrollTop + buttonRect.top - tooltipRect.height - 8
      }px`;
      tooltip.style.left = `${
        scrollLeft +
        buttonRect.left +
        (buttonRect.width - tooltipRect.width) / 2
      }px`;
    } else {
      // If element is null, position in the center of the viewport
      const viewportWidth = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const tooltipRect = tooltip.getBoundingClientRect();

      tooltip.style.top = '20px';
      tooltip.style.left = `${(viewportWidth - tooltipRect.width) / 2}px`;
    }

    tooltip.style.transform = 'translateY(5px)';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s, transform 0.3s';

    // Animate tooltip
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    }, 10);

    // Remove tooltip after delay
    setTimeout(() => {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(-5px)';
      setTimeout(() => {
        if (tooltip.parentNode) {
          document.body.removeChild(tooltip);
        }
      }, 300);
    }, 2000);
  };

  // Function to handle share button click
  const handleShareClick = (e: React.MouseEvent, fare: FareOffer) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the button reference before the async operation
    const button = e.currentTarget as HTMLElement;

    try {
      // Generate link synchronously to maintain user interaction context for iOS
      const params = generateEncodedParams(fare);
      const shortHash = generateShortHash(params);
      const shareableLink = `${
        typeof window !== 'undefined' ? window.location.origin : ''
      }/s/${shortHash}`;

      // Share only the link (OG tags will provide the description)
      const shareText = shareableLink;

      // For iOS, use completely synchronous approach
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        // iOS - Use only synchronous fallback method to maintain user interaction context
        try {
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          textArea.style.position = 'fixed';
          textArea.style.left = '0';
          textArea.style.top = '0';
          textArea.style.width = '2em';
          textArea.style.height = '2em';
          textArea.style.padding = '0';
          textArea.style.border = 'none';
          textArea.style.outline = 'none';
          textArea.style.boxShadow = 'none';
          textArea.style.background = 'transparent';
          textArea.setAttribute('readonly', '');
          textArea.style.color = 'transparent';

          document.body.appendChild(textArea);
          textArea.select();
          textArea.setSelectionRange(0, 99999);

          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (successful) {
            showTooltip(button, 'Link copied!');
            // Store server mapping after successful copy (don't block the copy operation)
            setTimeout(() => {
              axios
                .post('/api/shortlinks/create', {
                  shortHash,
                  params,
                })
                .catch(console.error);
            }, 100);
          } else {
            showTooltip(button, 'Copy failed. Try again.');
          }
        } catch (error) {
          console.error('iOS copy failed:', error);
          showTooltip(button, 'Copy failed. Try again.');
        }
      } else {
        // Non-iOS devices - Use modern clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(shareText)
            .then(() => {
              showTooltip(button, 'Link copied!');
              // Store server mapping after successful copy
              axios
                .post('/api/shortlinks/create', {
                  shortHash,
                  params,
                })
                .catch(console.error);
            })
            .catch(() => {
              // Fallback for non-iOS devices
              try {
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.left = '-9999px';
                textArea.style.top = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                  showTooltip(button, 'Link copied!');
                  // Store server mapping after successful copy
                  axios
                    .post('/api/shortlinks/create', {
                      shortHash,
                      params,
                    })
                    .catch(console.error);
                } else {
                  showTooltip(button, 'Copy failed. Try again.');
                }
              } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                showTooltip(button, 'Copy failed. Try again.');
              }
            });
        } else {
          // Direct fallback for older browsers
          try {
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
              showTooltip(button, 'Link copied!');
              // Store server mapping after successful copy
              axios
                .post('/api/shortlinks/create', {
                  shortHash,
                  params,
                })
                .catch(console.error);
            } else {
              showTooltip(button, 'Copy failed. Try again.');
            }
          } catch (error) {
            console.error('Copy failed:', error);
            showTooltip(button, 'Copy failed. Try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      // Show error tooltip
      showTooltip(button, 'Unable to share link');
    }
  };

  const convertFarePrice = async (fare: FareOffer) => {
    if (!fare || !fare.price || !fare.currencyCode) return;
    const fromCurrency = fare.currencyCode;
    const toCurrency = selectedCurrency;
    const amount = fare.price;
    if (fromCurrency === toCurrency) {
      setConvertedPrices((prev) => ({ ...prev, [fare.id]: amount }));
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REST_API}/currency-converter/convert`,
        {
          fromCurrency,
          toCurrency,
          amount,
        }
      );
      if (response && response.data && response.data.convertedAmount) {
        setConvertedPrices((prev) => ({
          ...prev,
          [fare.id]: response.data.convertedAmount,
        }));
      } else {
        setConvertedPrices((prev) => ({ ...prev, [fare.id]: amount }));
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      setConvertedPrices((prev) => ({ ...prev, [fare.id]: amount }));
    }
  };

  // Add useEffect to convert prices when fares or currency changes
  useEffect(() => {
    // Convert prices for all fares
    Object.values(fares)
      .flat()
      .forEach((fare) => {
        convertFarePrice(fare);
      });
  }, [fares, selectedCurrency]);

  return (
    <>
      {/* Airline Details Section */}

      {hasActiveDeals && (
        <div className="w-full py-0 rounded-sm">
          <div className=" ">
            {/* <h2 className="h3 text-background-on text-left mb-3">Deals</h2> */}

            {/* Render categories */}
            {routeData?.dealCategories?.map((category) => {
              const categoryHasDeals =
                category.deals && category.deals.length > 0;
              const categoryHasSubCategories =
                category.subCategories && category.subCategories.length > 0;
              const hasSubCategoryDeals =
                categoryHasSubCategories &&
                category.subCategories!.some(
                  (subCat) => subCat.deals && subCat.deals.length > 0
                );

              if (!categoryHasDeals && !hasSubCategoryDeals) {
                return null;
              }

              // If category has direct deals, show them without tabs
              if (categoryHasDeals) {
                const tabId = category.title.toLowerCase().replace(/\s+/g, '-');
                const categoryFares = fares[tabId] || [];

                if (categoryFares.length === 0) return null;

                return (
                  <div key={category.id} className="mb-8">
                    <h2 className="h3 text-background-on">{category.title}</h2>
                    <p className="label-l2 mb-3">{category.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryFares.map((fare) => (
                        <a
                          key={fare.id}
                          href={`/flights-results?q=${generateEncodedParams(
                            fare
                          )}`}
                          onClick={(e) => handleFareCardClick(e, fare)}
                          className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                        >
                          <div className="relative w-full h-[200px]">
                            <img
                              src={
                                fare.originalDeal?.ogImageUrl
                                  ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                                      /\/$/,
                                      ''
                                    )}/${fare.originalDeal.ogImageUrl.replace(
                                      /^\//,
                                      ''
                                    )}`
                                  : '/assets/images/bg/home-au-bg.jpg'
                              }
                              alt={`${fare.origin} to ${fare.destination} flight deal`}
                              loading="lazy"
                              width="100%"
                              height="200"
                              className="rounded-t-lg object-cover w-full h-full"
                            />
                          </div>
                          <div className="p-4">
                            <div className="title-t4 text-secondary-bright">
                              {fare.airline && (
                                <div>
                                  <span>{fare.airline.airlineName}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-left mb-1">
                              <div className="flex items-center">
                                <span className="title-t3 text-background-on">
                                  {fare.origin}
                                </span>
                              </div>
                              <div className="flex items-center mx-2">
                                <svg
                                  className="w-4 h-4 text-background-on"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  ></path>
                                </svg>
                              </div>
                              <div className="flex items-center">
                                <span className="title-t3 text-background-on">
                                  {fare.destination}
                                </span>
                              </div>
                            </div>
                            <div className="label-l1 text-background-on mb-3">
                              {fare.departureDate}
                              {fare.returnDate
                                ? ` - ${fare.returnDate}`
                                : ' (One-way)'}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline">
                                <div className="title-t4 text-background-on mr-2">
                                  from{' '}
                                </div>
                                <div className="title-t4 text-secondary-bright">
                                  {selectedCurrency}{' '}
                                  {convertedPrices[fare.id] !== undefined
                                    ? Number(convertedPrices[fare.id]).toFixed(
                                        2
                                      )
                                    : Number(fare.price).toFixed(2)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleShareClick(e, fare)}
                                className="p-2 rounded-full hover:bg-gray-100"
                                title="Share this fare"
                              >
                                <svg
                                  className="w-5 h-5 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              // If category has only subcategories with deals, show tabs
              if (hasSubCategoryDeals) {
                return (
                  <SubCategorySection
                    key={category.id}
                    category={category}
                    fares={fares}
                    generateEncodedParams={generateEncodedParams}
                    handleFareCardClick={handleFareCardClick}
                    handleShareClick={handleShareClick}
                    selectedCurrency={selectedCurrency}
                    convertedPrices={convertedPrices}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default PagesSpecialFare;
