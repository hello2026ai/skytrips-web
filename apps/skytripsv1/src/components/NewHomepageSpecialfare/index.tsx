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

const SpecialFare: React.FC = () => {
  const router = useRouter();
  const tabs: FareTab[] = [
    { id: 'sydney', label: 'Sydney' },
    { id: 'melbourne', label: 'Melbourne' },
    { id: 'brisbane', label: 'Brisbane' },
    { id: 'adelaide', label: 'Adelaide' },
    { id: 'perth', label: 'Perth' },
  ];

  const [activeTab, setActiveTab] = useState<string>('sydney');
  const [fares, setFares] = useState<Record<string, FareOffer[]>>({
    sydney: [],
    melbourne: [],
    brisbane: [],
    adelaide: [],
    perth: [],
  });
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

  // Fetch deals data when component mounts
  useEffect(() => {
    const CACHE_KEY = 'skytrips_deals_cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const fetchDeals = async () => {
      try {
        // Check if we have cached data
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            const cacheTimestamp = parsedCache.timestamp;
            const currentTime = Date.now();

            // Check if cached data is still valid (less than 24 hours old)
            if (currentTime - cacheTimestamp < CACHE_DURATION) {
              console.log('Using cached deals data');

              // Use cached data
              if (parsedCache.totalDeals) {
                setTotalDeals(parsedCache.totalDeals);
              }

              if (parsedCache.fares) {
                setFares(parsedCache.fares);
              }

              return; // Exit early, no need to fetch from API
            } else {
              console.log('Cached deals data expired, fetching fresh data');
            }
          } catch (parseError) {
            console.error('Error parsing cached deals data:', parseError);
            // Continue to fetch fresh data if parsing fails
          }
        }

        // Fetch fresh data from API
        console.log('Fetching fresh deals data from API');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REST_API}/deals?limit=250`
        );

        if (response.data) {
          let totalDealsCount = 0;

          // Set total deals from meta
          if (
            response.data.meta &&
            typeof response.data.meta.total === 'number'
          ) {
            totalDealsCount = response.data.meta.total;
            setTotalDeals(totalDealsCount);
          }

          if (response.data.data) {
            // Create deal mapping by city
            const dealsByCity: Record<string, FareOffer[]> = {
              sydney: [],
              melbourne: [],
              brisbane: [],
              adelaide: [],
              perth: [],
            };

            // Process each deal from the API
            response.data.data.forEach((deal: any) => {
              // Only process deals with ACTIVE status
              if (deal.publishedStatus !== 'ACTIVE') {
                return; // Skip inactive deals
              }

              // Skip if departure date is in the past
              if (!isDateValid(deal.departureDate)) {
                return; // Skip past dates
              }

              // Get origin and destination
              let originCode =
                typeof deal.origin === 'object'
                  ? deal.origin.iataCode
                  : deal.origin;
              let destinationCode =
                typeof deal.destination === 'object'
                  ? deal.destination.iataCode
                  : deal.destination;

              // Skip if origin or destination airports are not published
              if (
                (typeof deal.origin === 'object' &&
                  !deal.origin.publishedStatus) ||
                (typeof deal.destination === 'object' &&
                  !deal.destination.publishedStatus)
              ) {
                return;
              }

              // Skip if airline is not published
              if (deal.airline && !deal.airline.publishedStatus) {
                return;
              }

              // Convert codes to city names if needed
              let originCity = originCode;
              if (originCode === 'SYD') originCity = 'Sydney';
              if (originCode === 'MEL') originCity = 'Melbourne';
              if (originCode === 'BNE') originCity = 'Brisbane';
              if (originCode === 'ADL') originCity = 'Adelaide';
              if (originCode === 'PER') originCity = 'Perth';

              let destinationCity =
                destinationCode === 'KTM' ? 'KTM' : destinationCode;

              // Format dates for display
              const formatDate = (dateStr: string) => {
                try {
                  if (!dateStr || dateStr === '') return ''; // Return empty string if no date

                  const date = new Date(dateStr);

                  // Check if date is valid before formatting
                  if (isNaN(date.getTime())) {
                    // If invalid date, return a placeholder or today's date
                    const today = new Date();
                    return format(today, 'EEE, MMM d');
                  }

                  return format(date, 'EEE, MMM d'); // e.g., "Tue, Jun 10"
                } catch (error) {
                  console.error('Error formatting date:', dateStr, error);
                  // Return today's date as fallback
                  const today = new Date();
                  return format(today, 'EEE, MMM d');
                }
              };

              const fareOffer: FareOffer = {
                id: deal._id || deal.id || String(Math.random()),
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

              // Add returnDate only if it exists in the deal
              if (deal.returnDate) {
                fareOffer.returnDate = formatDate(deal.returnDate);
              }

              // Add to appropriate city array
              if (originCity === 'Sydney') dealsByCity.sydney.push(fareOffer);
              else if (originCity === 'Melbourne')
                dealsByCity.melbourne.push(fareOffer);
              else if (originCity === 'Brisbane')
                dealsByCity.brisbane.push(fareOffer);
              else if (originCity === 'Adelaide')
                dealsByCity.adelaide.push(fareOffer);
              else if (originCity === 'Perth')
                dealsByCity.perth.push(fareOffer);
            });

            // Update state with the processed deals
            setFares(dealsByCity);

            // Cache the processed data with timestamp
            const cacheData = {
              timestamp: Date.now(),
              totalDeals: totalDealsCount,
              fares: dealsByCity,
            };

            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
              console.log('Deals data cached successfully');
            } catch (cacheError) {
              console.error('Error caching deals data:', cacheError);
              // Continue execution even if caching fails
            }
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);

        // If API call fails, try to use cached data even if expired
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            console.log('API failed, using expired cached data as fallback');

            if (parsedCache.totalDeals) {
              setTotalDeals(parsedCache.totalDeals);
            }

            if (parsedCache.fares) {
              setFares(parsedCache.fares);
            }
          } catch (parseError) {
            console.error('Error parsing fallback cached data:', parseError);
          }
        }
      }
    };

    // Call the function
    fetchDeals();
  }, []);

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

  // Add carousel scroll functionality
  const scrollContainer = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -400,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: 400,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {hasActiveDeals && (
        <div className="w-full py-6 rounded-sm">
          <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-8">
            {/* Header with Title, Controls and Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
              <div className="flex flex-col gap-2 max-w-xl">
                <h2 className="h3 text-background-on ">Top Deals</h2>
                <p className="text-neutral-dark label-l2">
                  Discover exclusive offers on flights to popular destinations.
                  Book now to secure the best rates for your next adventure.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Departing Location Selector */}
                <div className="relative group">
                  <div className="flex h-10 items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 pr-3 text-sm font-medium hover:border-primary/50 transition-colors shadow-sm group-hover:shadow-md">
                    <svg
                      className="w-5 h-5 text-slate-500 dark:text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-200">
                      {/* Departing from:{' '} */}
                      <span className="text-primary body-b2">
                        {tabs.find((tab) => tab.id === activeTab)?.label} (
                        {cityToIataCode[
                          tabs.find((tab) => tab.id === activeTab)?.label || ''
                        ] || 'SYD'}
                        )
                      </span>
                    </span>
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>

                {/* Carousel Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollLeft}
                    aria-label="Previous slide"
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollRight}
                    aria-label="Next slide"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-primary hover:bg-blue-600 transition-colors text-white shadow-lg shadow-blue-500/30"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs - Keep for functionality but style as secondary nav */}
            <div className="flex flex-wrap justify-start gap-2 mb-2 px-2">
              {tabs.map(
                (tab) =>
                  fares[tab.id]?.length > 0 && (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium hover:shadow-md transition-shadow ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
              )}
            </div>

            {/* Fare cards */}
            {fares[activeTab]?.length > 0 && (
              <div
                ref={scrollContainer}
                className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {fares[activeTab]?.map((fare) => {
                  // Get origin and destination codes for display
                  const originCode = cityToIataCode[fare.origin] || fare.origin;
                  const destinationCode =
                    cityToIataCode[fare.destination] || fare.destination;

                  return (
                    <a
                      key={fare.id}
                      href={`/flights-results?q=${generateEncodedParams(fare)}`}
                      onClick={(e) => handleFareCardClick(e, fare)}
                      className="snap-start shrink-0 w-[300px] sm:w-[340px] md:w-[380px] h-[480px] relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url('${
                            fare.originalDeal?.media?.fileKey
                              ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                                  /\/$/,
                                  ''
                                )}/${fare.originalDeal.media.fileKey.replace(
                                  /^\//,
                                  ''
                                )}`
                              : fare.originalDeal?.ogImageUrl
                              ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                                  /\/$/,
                                  ''
                                )}/${fare.originalDeal.ogImageUrl.replace(
                                  /^\//,
                                  ''
                                )}`
                              : '/assets/images/bg/home-au-bg.jpg'
                          }')`,
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Share Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={(e) => handleShareClick(e, fare)}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          title="Share this fare"
                          aria-label="Share deal"
                        >
                          <svg
                            className="w-5 h-5"
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

                      {/* Card Content */}
                      <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 flex flex-col gap-2 shadow-xl transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-neutral-dark text-xs font-semibold tracking-wide uppercase">
                                <span>{originCode}</span>
                                <svg
                                  className="w-[14px] h-[14px]"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                                <span>{destinationCode}</span>
                              </div>
                              <h3 className="text-background-on title-t1">
                                {fare.destination === 'KTM'
                                  ? 'Kathmandu'
                                  : fare.destination}
                              </h3>
                            </div>
                            {fare.airline && (
                              <div
                                className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-slate-600"
                                title={fare.airline.airlineName}
                              >
                                <span className="text-xs text-neutral-dark text-slate-600 dark:text-slate-300">
                                  {fare.airline.airlineCode ||
                                    fare.airline.airlineName
                                      ?.substring(0, 2)
                                      .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="w-full h-px bg-slate-100 dark:bg-slate-700" />

                          <div className="flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                              <span className="text-neutral-dark text-[11px]">
                                {fare.departureDate}
                                {fare.returnDate ? ` - ${fare.returnDate}` : ''}
                              </span>
                            </div>
                            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white pl-3 pr-1 py-1.5 rounded-lg transition-colors group/btn shadow-sm shadow-blue-500/20">
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-secondary-on mb-1">
                                  from
                                </span>
                                <span className="title-t1 text-secondary-on">
                                  {selectedCurrency}
                                  {convertedPrices[fare.id] !== undefined
                                    ? Number(convertedPrices[fare.id]).toFixed(
                                        0
                                      )
                                    : Number(fare.price).toFixed(0)}
                                </span>
                              </div>
                              <div className="h-7 w-7 rounded bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
            {/* )} */}
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialFare;
