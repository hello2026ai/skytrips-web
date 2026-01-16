'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { decodeData, encodeData } from '../../utils/urlEncoding';
import { format } from 'date-fns';
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../components/ui/sheet';
import axiosInstance from '../../../lib/axiosConfig';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SearchParams } from '../../../types';
import React from 'react';
import FlightDetailsDrawer from '../../components/FlightDetailsDrawer/FlightDetailsDrawer';
import EditSearch from '../../components/EditSearch';
import { FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL } from '../../constants/flightSearchConstants';
import { LoadingScreen } from '../../components/LoadingScreen';
import EmptyFlightResult from '../../components/FlightResult/EmptyFlightResult';
import FlightFilters from '../../components/flights/FlightFilters';
import MobileFilterModal from '../../components/flights/MobileFilterModal';
import MobileFilterHeader from '../../components/flights/MobileFilterHeader';
import Image from 'next/image';
import { NextSeo } from 'next-seo';

import { IoMdCheckmark } from 'react-icons/io';
import { FaCar } from 'react-icons/fa';

interface FareRule {
  category: 'EXCHANGE' | 'REFUND' | 'REVALIDATION';
  maxPenaltyAmount?: string;
  notApplicable?: boolean;
}

interface FareRules {
  rules: FareRule[];
}

interface FlightOffer {
  id: string;
  type: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  isUpsellOffer: boolean;
  isGroupFare?: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{ amount: string; type: string }>;
    grandTotal: string;
  };
  pricingOptions?: {
    fareType?: string[];
    includedCheckedBagsOnly?: boolean;
    refundableFare?: boolean;
    noRestrictionFare?: boolean;
    noPenaltyFare?: boolean;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string; terminal?: string };
      arrival: { iataCode: string; at: string; terminal?: string };
      carrierCode: string;
      number: string;
      duration?: string;
      aircraft?: { code: string };
      operating?: { carrierCode: string };
      id?: string;
      numberOfStops?: number;
      blacklistedInEU?: boolean;
      transitTime?: string;
    }>;
  }>;
  dictionaries?: {
    carriers?: Record<string, string>;
  };
  customLabel?: string;
  fareRules?: FareRules;
  travelerPricings?: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    associatedAdultId?: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment?: Array<{
      segmentId: string;
      cabin?: string;
      fareBasis?: string;
      class?: string;
      brandedFare?: string;
      brandedFareLabel?: string;
      includedCabinBags?: {
        quantity: number;
        weightUnit?: string;
      };
      includedCheckedBags?: {
        quantity?: number;
        weight?: number;
        weightUnit?: string;
      };
      amenities?: Array<{
        code: string;
        description: string;
        isChargeable: boolean;
        amenityType: string;
      }>;
    }>;
  }>;
  samePriceOffers?: FlightOffer[];
  children?: FlightOffer[];
  numberOfBookableSeats?: number;
  totalSlotAvailable?: number;
}

interface AirlineFilter {
  name: string;
  checked: boolean;
}

interface ApiResponse {
  data: FlightOffer[];
  message: string;
  dictionaries: {
    priceRange: {
      min: number;
      max: number;
    };
    transitOptions: {
      direct: number;
      oneStop: number;
      twoPlusStops: number;
    };
    departureTimes: {
      min: string; // For example: "06:00 AM"
      max: string; // For example: "10:00 PM"
    };
    arrivalTimes: {
      min: string; // For example: "06:00 AM"
      max: string; // For example: "11:59 PM"
    };
    airlines: Array<{
      code: string;
      name: string;
      flightCount: number;
    }>;
    carriers?: Record<string, string>;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

interface Filters {
  transit: {
    direct: boolean;
    oneStop: boolean;
    twoStops: boolean;
  };
  priceRange: number[];
  airlines: Record<string, AirlineFilter>;
  departureTime: number[];
  arrivalTime: number[];
}

// Update these helper functions
const formatPrice = (value: number) => `AUD ${value.toFixed(2)}`;
const formatTime = (value: number) => {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to convert time string to hour number (24-hour format)
const timeStringToHour = (timeStr: string) => {
  if (!timeStr) return 0;
  try {
    // Handle format like "06:00 AM"
    if (timeStr.includes(' ')) {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours + minutes / 60; // Convert minutes to decimal hours
    }
    // Handle format like "06:00" (24-hour format)
    else if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    }
    // Handle numeric format
    else if (!isNaN(Number(timeStr))) {
      return Number(timeStr);
    }

    console.warn('Unrecognized time format:', timeStr);
    return 0;
  } catch (err) {
    console.error('Error parsing time string:', timeStr, err);
    return 0;
  }
};

export default function FlightsResults() {
  const router = useRouter();
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    // Initialize with the currency from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || 'AUD';
    }
    return 'AUD';
  });
  const [error, setError] = useState<string | null>(null);
  const [shortestFlightsData, setShortestFlightsData] =
    useState<ApiResponse | null>(null);
  const [isLoadingShortestInBackground, setIsLoadingShortestInBackground] =
    useState(false);
  const [cachedCheapestData, setCachedCheapestData] =
    useState<ApiResponse | null>(null);
  const [cachedShortestData, setCachedShortestData] =
    useState<ApiResponse | null>(null);
  const [cachedFamilyTreeData, setCachedFamilyTreeData] =
    useState<ApiResponse | null>(null);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);
  const [refreshTimerId, setRefreshTimerId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [cheapestCacheUpdateTracker, setCheapestCacheUpdateTracker] =
    useState<string>('');
  const [shortestCacheUpdateTracker, setShortestCacheUpdateTracker] =
    useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    transit: {
      direct: false,
      oneStop: false,
      twoStops: false,
    },
    priceRange: [0, 0],
    airlines: {},
    departureTime: [0, 24],
    arrivalTime: [0, 24],
  });
  const [sortOption, setSortOption] = useState('recommended');
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(
    null
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [showAllAirlines, setShowAllAirlines] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isDepartureTimeSliding, setIsDepartureTimeSliding] = useState(false);
  const [isArrivalTimeSliding, setIsArrivalTimeSliding] = useState(false);
  const [isClient, setIsClient] = useState(true);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [expandedSamePriceId, setExpandedSamePriceId] = useState<string | null>(
    null
  );
  const [expandedChildrenId, setExpandedChildrenId] = useState<string | null>(
    null
  );
  const [expandedOfferFlightId, setExpandedOfferFlightId] = useState<
    string | null
  >(null);
  const [selectedFlightForDrawer, setSelectedFlightForDrawer] = useState<{
    flight: FlightOffer;
    id: string;
    fareRules?: any;
    isFareRulesLoading?: boolean;
    priceData?: { price: number; originalPrice?: number; fare?: any };
    flightIndex?: number;
  } | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [activeTab, setActiveTab] = useState('cheapest');
  const [isLoadingFareRules, setIsLoadingFareRules] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const directTabChangeRef = useRef(false);
  const isFirstRender = useRef(true);
  const [fareData, setFareData] = useState<any[]>([]);
  const [brandedFaresData, setBrandedFaresData] = useState<FlightOffer[]>([]);
  const [isLoadingBrandedFares, setIsLoadingBrandedFares] = useState(false);
  // Cache for branded fares data to avoid redundant API calls
  const [brandedFaresCache, setBrandedFaresCache] = useState<
    Record<string, FlightOffer[]>
  >({});

  // Track tab changes in UI to avoid duplicate data fetching
  useEffect(() => {
    // This effect will keep activeTab in sync with sortOption
    setActiveTab(sortOption);
  }, [sortOption]);

  // Effect to load data when sortOption changes - needs to avoid race conditions with direct tab switching
  useEffect(() => {
    // Skip if no search params, not client-side, or if tab was directly changed
    if (!searchParams || !isClient || directTabChangeRef.current) {
      // Reset flag if it was set
      if (directTabChangeRef.current) {
        console.log('Skipping API call because tab was directly changed in UI');
        directTabChangeRef.current = false;
      }
      return;
    }

    console.log('sortOption useEffect: Loading data for tab:', sortOption);

    // Only fetch new data when we don't already have it AND we're not already loading
    if (sortOption === 'cheapest' && !cachedCheapestData && !loading) {
      console.log('No cached cheapest data available, fetching fresh data');
      setLoading(true);
      fetchFlights(searchParams, 1, 'cheapest');
    } else if (sortOption === 'shortest' && !cachedShortestData && !loading) {
      console.log('No cached shortest data available, fetching fresh data');
      setLoading(true);
      fetchFlights(searchParams, 1, 'shortest');
    } else if (
      sortOption === 'recommended' &&
      !cachedFamilyTreeData &&
      !loading
    ) {
      console.log('No cached recommended data available, fetching fresh data');
      setLoading(true);
      fetchFlights(searchParams, 1, 'recommended');
    }
  }, [
    sortOption,
    searchParams,
    isClient,
    cachedCheapestData,
    cachedShortestData,
    cachedFamilyTreeData,
    loading,
  ]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Add event listener for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail.currency;
      console.log('Currency changed to:', newCurrency);

      // Invalidate all caches
      setCachedCheapestData(null);
      setCachedShortestData(null);
      setCheapestCacheUpdateTracker('');
      setShortestCacheUpdateTracker('');
      setBrandedFaresCache({}); // Clear branded fares cache on currency change
      setLastFetchTimestamp(0); // Reset the timestamp to force new API calls

      // Update the currency state
      setSelectedCurrency(newCurrency);

      // If we have search params, trigger new searches with updated currency
      if (searchParams) {
        const updatedParams = {
          ...searchParams,
          currencyCode: newCurrency,
        };
        setSearchParams(updatedParams);

        // Force fetch both price and duration sorted flights
        console.log('Fetching flights with new currency:', newCurrency);

        // Reset loading states
        setLoading(true);
        setIsLoadingShortestInBackground(true);

        // Make both API calls with force=true to bypass cache
        fetchFlights(updatedParams, 1, 'cheapest');
        fetchShortestFlightsInBackground(updatedParams, true);
      }
    };

    // Add event listener for currency changes
    window.addEventListener(
      'currencyChange',
      handleCurrencyChange as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        'currencyChange',
        handleCurrencyChange as EventListener
      );
    };
  }, [searchParams]);

  useEffect(() => {
    if (router.query.q) {
      try {
        // Decode the search parameters
        const decodedParams = decodeData(router.query.q as string);

        // Ensure required properties are present
        if (
          !decodedParams.originLocationCode ||
          !decodedParams.destinationLocationCode
        ) {
          console.error('Missing required search parameters');
          router.push('/');
          return;
        }

        // Try to get airport details from localStorage
        try {
          const savedAirports = localStorage.getItem('skytrips_airports');
          if (savedAirports) {
            const airports = JSON.parse(savedAirports);

            // Update the URLs for the AirportSearch components to include city names
            if (airports.fromAirport && airports.toAirport) {
              // We have the airport data, store it in searchParams
              decodedParams.fromAirport = airports.fromAirport;
              decodedParams.toAirport = airports.toAirport;
            }
          }
        } catch (error) {
          console.error('Error loading airport data from localStorage:', error);
        }

        setSearchParams(decodedParams);

        // Clear branded fares cache when search parameters change
        setBrandedFaresCache({});
        console.log('Cleared branded fares cache due to new search parameters');

        // Fetch flight data for default tab
        fetchFlights(decodedParams);

        // Immediately start fetching shortest flights in background
        // This runs in parallel with the main fetch
        fetchShortestFlightsInBackground(decodedParams);
      } catch (error) {
        console.error('Error parsing search parameters:', error);
        router.push('/');
      }
    }
  }, [router.query]);

  // Fetch fare data
  const fetchFareData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('/fare', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        // Filter to only include active fares
        const activeFares = response.data.data.filter(
          (fare: any) => fare.isActive === true
        );
        setFareData(activeFares);
      }
    } catch (error) {
      console.error('Error fetching fare data:', error);
    }
  };

  // Fetch fare data when search params are available
  useEffect(() => {
    if (searchParams) {
      fetchFareData();
    }
  }, [searchParams]);

  // Function to check if a flight matches fare conditions
  const checkFareMatch = (flight: FlightOffer, fare: any): boolean => {
    if (!fare.isActive) return false;

    // Check currency match with localStorage selectedCurrency and fare domainRegionCurrencyCode
    if (
      fare.domainRegionCurrencyCode &&
      fare.domainRegionCurrencyCode !== selectedCurrency
    ) {
      return false;
    }

    // Check trip type
    const flightTripType = searchParams?.tripType?.toUpperCase();
    if (fare.tripType !== flightTripType) return false;

    // Check travel class
    const flightTravelClass = searchParams?.travelClass;
    if (fare.travelClass !== flightTravelClass) return false;

    // Check origin and destination
    const originCode = searchParams?.originLocationCode;
    const destinationCode = searchParams?.destinationLocationCode;

    // Check origin matching
    // If isAllOriginAirportSelected is not explicitly true, then check specific origin
    if (fare.isAllOriginAirportSelected !== true) {
      if (fare.origin?.iataCode !== originCode) {
        return false;
      }
    }

    // Check destination matching
    // If isAllDestinationAirportSelected is not explicitly true, then check specific destination
    if (fare.isAllDestinationAirportSelected !== true) {
      if (fare.destination?.iataCode !== destinationCode) {
        return false;
      }
    }

    // Check if fare is currently valid (within its validity period)
    if (fare.startDate && fare.expiryDate) {
      const currentDate = new Date();
      const startDate = new Date(fare.startDate);
      const expiryDate = new Date(fare.expiryDate);

      if (currentDate < startDate || currentDate > expiryDate) return false;
    }

    // Check airline if not all airlines selected
    if (!fare.isAllAirlineSelected && fare.airlines?.length > 0) {
      const flightAirlines = new Set<string>();
      flight.itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment) => {
          flightAirlines.add(segment.carrierCode);
        });
      });

      const fareAirlineCodes = fare.airlines.map(
        (airline: any) => airline.airlineCode
      );
      const hasMatchingAirline = fareAirlineCodes.some((code: string) =>
        flightAirlines.has(code)
      );
      if (!hasMatchingAirline) return false;
    }

    return true;
  };

  // Function to calculate fare-adjusted price
  const calculateFarePrice = (flight: FlightOffer, fare: any): number => {
    const basePrice = parseFloat(flight.price.base);
    const grandTotal = parseFloat(flight.price.grandTotal);
    const taxAmount = grandTotal - basePrice; // Tax = Grand Total - Base Price
    const totalPassengers = getTotalPassengers();

    let discountedPrice;

    if (fare.fareDeductionValueType === 'PERCENTAGE') {
      // Calculate percentage discount on base price
      const discountAmount = (basePrice * fare.deductionValue) / 100;
      const discountedBasePrice = basePrice - discountAmount;
      discountedPrice = discountedBasePrice + taxAmount;
    } else if (fare.fareDeductionValueType === 'FIXED') {
      // Fixed amount discount from base price
      const discountedBasePrice = basePrice - fare.deductionValue;
      discountedPrice = discountedBasePrice + taxAmount;
    } else if (
      fare.fareDeductionValueType === 'PER_PASSENGER' &&
      fare.farePerPassengers?.length > 0
    ) {
      // Calculate total based on passenger types and counts
      let totalFarePrice = 0;
      const adults = searchParams?.adults || 1;
      const children = searchParams?.children || 0;

      fare.farePerPassengers.forEach((passengerFare: any) => {
        if (passengerFare.passengerType === 'ADULT') {
          totalFarePrice += passengerFare.amount * adults;
        } else if (passengerFare.passengerType === 'CHILD') {
          totalFarePrice += passengerFare.amount * children;
        }
      });

      discountedPrice = totalFarePrice;
    } else {
      discountedPrice = grandTotal;
    }

    // Return the discounted price per passenger
    const finalPrice = discountedPrice;

    return finalPrice;
  };

  const fetchFlights = async (
    params: SearchParams,
    page = 1,
    sortType = sortOption
  ) => {
    console.log('Fetching flights with params:', params);

    // Check if this is a currency change request
    const isCurrencyChange = params.currencyCode !== selectedCurrency;

    // Only check cache if it's not a currency change and it's page 1
    if (!isCurrencyChange && page === 1) {
      const currentTime = Date.now();
      if (
        sortType === 'cheapest' &&
        cachedCheapestData &&
        currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
      ) {
        console.log('Using cached cheapest data');
        setApiData(cachedCheapestData);
        const flightsWithApiData = cachedCheapestData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedCheapestData.data,
          })
        );
        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
        setTotalPages(
          Math.ceil(cachedCheapestData.meta.total / (params.maxResults || 10))
        );
        setCurrentPage(1);
        setLoading(false);
        return;
      }
    }

    try {
      if (flights.length < 1) {
        setLoading(true);
      } else {
        setIsMoreLoading(true);
      }

      setLoading(true);
      setError(null);

      // Check if there are any active filters
      const hasActiveFilters =
        params.manualFilter && Object.keys(params.manualFilter).length > 0;

      // Determine API path based on sort option
      let apiPath = 'price-group';
      let limit = params.maxResults || 10;

      if (sortType === 'recommended') {
        apiPath = 'family-tree/price-group';
        limit = params.maxResults || 10;
      } else if (sortType === 'cheapest') {
        apiPath = 'price-group';
      } else if (sortType === 'shortest') {
        apiPath = 'price-group';
      }

      // Start progress indicator
      let fakeProgress = 0;
      setProgress(5);

      const interval = setInterval(() => {
        const randomIncrement = Math.floor(Math.random() * 6) + 5;
        fakeProgress += randomIncrement;

        if (fakeProgress >= 95) {
          clearInterval(interval);
        } else {
          setProgress((prev) => Math.min(prev + randomIncrement, 99));
        }
      }, 400);

      setProgressInterval(interval);

      // Prepare payload
      const payload = {
        currencyCode: params.currencyCode || selectedCurrency,
        originDestinations: params?.originDestinations,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        ...(hasActiveFilters ? { manualFilter: params.manualFilter } : {}),
        manualSort:
          sortType === 'shortest' ? 'SHORT_DURATION' : 'PRICE_LOW_TO_HIGH',
        travelClass: params.travelClass,
        tripType: params.tripType?.toUpperCase(),
        max: limit,
        groupByPrice: true,
        // Add origin and destination from first originDestination
        origin: params.originDestinations?.[0]?.originLocationCode || '',
        destination:
          params.originDestinations?.[0]?.destinationLocationCode || '',
        // Add departure and return dates
        departureDate:
          params.originDestinations?.[0]?.departureDateTimeRange?.date || '',
        returnDate:
          params.originDestinations?.[1]?.departureDateTimeRange?.date || '',
      };

      console.log('Payload with filters', payload);

      const response = await axiosInstance.post(
        `/flight-search/${apiPath}?limit=${limit}&page=${page}`,
        payload
      );

      // Stop progress indicator
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
      }, 500);

      if (response?.data) {
        // Store the API data first
        setApiData(response.data);

        // Cache the data for first page requests
        if (page === 1) {
          cacheDataAndSetupRefresh(
            response.data,
            sortType as 'cheapest' | 'shortest'
          );
        }

        if (loading || page === 1) {
          // Set flights with API data attached
          const flightsWithApiData = response.data.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: response.data.data,
            })
          );

          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);
        } else {
          // Append data on subsequent pages
          const newFlightsWithApiData = response.data.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: response.data.data,
            })
          );

          setFlights((prevFlights) => [
            ...prevFlights,
            ...newFlightsWithApiData,
          ]);
          setFilteredFlights((prevFlights) => [
            ...prevFlights,
            ...newFlightsWithApiData,
          ]);
        }

        // Update airline checkboxes based on the API response
        if (response.data.dictionaries && response.data.dictionaries.airlines) {
          setFilters((prev) => {
            const updatedAirlines = { ...prev.airlines };

            // Check if there are any airlines in the manualFilter
            if (params.manualFilter && params.manualFilter.airlines) {
              // Mark airlines as checked if they are in the manualFilter
              params.manualFilter.airlines.forEach((code) => {
                if (updatedAirlines[code]) {
                  updatedAirlines[code] = {
                    ...updatedAirlines[code],
                    checked: true,
                  };
                }
              });
            }

            return {
              ...prev,
              airlines: updatedAirlines,
            };
          });
        }

        setTotalPages(Math.ceil(response.data.meta.total / limit));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError('Failed to fetch flights. Please try again.');
    } finally {
      setLoading(false);
      setIsMoreLoading(false);
    }
  };

  // function to fetch shortest flights in the background
  const fetchShortestFlightsInBackground = async (
    params: SearchParams,
    force = false
  ) => {
    if (!params || (isLoadingShortestInBackground && !force)) return;

    try {
      setIsLoadingShortestInBackground(true);

      // Only use cache if not forcing
      if (
        !force &&
        cachedShortestData &&
        Date.now() - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
      ) {
        setShortestFlightsData(cachedShortestData);
        console.log('Using cached shortest flights data');
        return;
      }

      // Determine API path and payload
      const apiPath = 'price-group';
      const limit = params.maxResults || 10;

      // Check if there are any active filters
      const hasActiveFilters =
        params.manualFilter && Object.keys(params.manualFilter).length > 0;

      // Prepare payload - similar to fetchFlights but always for shortest
      const payload = {
        currencyCode: params.currencyCode || selectedCurrency,
        originDestinations: params?.originDestinations,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        ...(hasActiveFilters ? { manualFilter: params.manualFilter } : {}),
        manualSort: 'SHORT_DURATION', // Always set to shortest
        travelClass: params.travelClass,
        tripType: params.tripType?.toUpperCase(),
        max: limit,
        groupByPrice: true,
      };

      console.log('Background fetch for shortest flights initiated');

      // Make API call without showing loading indicators
      const response = await axiosInstance.post(
        `/flight-search/${apiPath}?limit=${limit}&page=1`,
        payload
      );

      if (response?.data) {
        // Store the shortest flights data
        setShortestFlightsData(response.data);

        // Cache the data
        setCachedShortestData(response.data);

        console.log('Shortest flights data loaded in background');
      }
    } catch (err) {
      console.error('Error fetching shortest flights in background:', err);
    } finally {
      setIsLoadingShortestInBackground(false);
    }
  };

  // Add function to cache data and setup auto-refresh
  const cacheDataAndSetupRefresh = (
    data: ApiResponse,
    tabType: 'cheapest' | 'shortest' | 'recommended'
  ) => {
    const currentTime = Date.now();
    console.log(
      `Setting last fetch timestamp to ${new Date(
        currentTime
      ).toLocaleTimeString()}`
    );
    setLastFetchTimestamp(currentTime);

    // Cache the data for appropriate tab
    if (tabType === 'cheapest') {
      console.log('Caching cheapest data');
      setCachedCheapestData(data);
    } else if (tabType === 'shortest') {
      console.log('Caching shortest data');
      setCachedShortestData(data);
    } else if (tabType === 'recommended') {
      console.log('Caching family tree data');
      setCachedFamilyTreeData(data);
    }

    // Clear any existing timer
    if (refreshTimerId) {
      console.log('Clearing existing refresh timer');
      clearTimeout(refreshTimerId);
    }

    // Set up auto-refresh after 2 minutes (FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL ms)
    console.log(
      `Setting up refresh timer to trigger at ${new Date(
        currentTime + FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
      ).toLocaleTimeString()}`
    );

    // Using both setTimeout and setInterval for redundancy
    // setTimeout can be unreliable in background tabs
    const timerId = setTimeout(() => {
      console.log('Auto-refresh timer triggered via setTimeout!');

      if (searchParams) {
        // Force the refresh
        performDataRefresh();
      }
    }, FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL); // 2 minutes

    setRefreshTimerId(timerId);
  };

  // Separate function to handle the actual refresh operations
  const performDataRefresh = () => {
    if (!searchParams) return;

    console.log('Performing data refresh at', new Date().toLocaleTimeString());

    // 1. Always refresh BOTH tabs data with explicit API calls to ensure both get updated

    // Create payload base for API calls
    const apiPath = 'price-group';
    const limit = searchParams.maxResults || 10;
    const hasActiveFilters =
      searchParams.manualFilter &&
      Object.keys(searchParams.manualFilter).length > 0;
    const basePayload = {
      currencyCode: searchParams.currencyCode || selectedCurrency,
      originDestinations: searchParams?.originDestinations,
      adults: searchParams.adults,
      children: searchParams.children || 0,
      infants: searchParams.infants || 0,
      ...(hasActiveFilters ? { manualFilter: searchParams.manualFilter } : {}),
      travelClass: searchParams.travelClass,
      tripType: searchParams.tripType?.toUpperCase(),
      max: limit,
      groupByPrice: true,
    };

    // A. Fetch cheapest data (PRICE_LOW_TO_HIGH)
    console.log('Refreshing cheapest tab data...');
    const cheapestPayload = {
      ...basePayload,
      manualSort: 'PRICE_LOW_TO_HIGH',
    };

    // Use direct API call to ensure network activity is visible
    axiosInstance
      .post(`/flight-search/${apiPath}?limit=${limit}&page=1`, cheapestPayload)
      .then((response) => {
        if (!response?.data) {
          console.error('No data in cheapest response');
          return;
        }

        // Log detailed info about the response to verify it contains valid data
        console.log('Cheapest data refreshed successfully:', {
          totalFlights: response.data.data?.length || 0,
          firstFlight: response.data.data?.[0]?.id || 'none',
          timestamp: new Date().toLocaleTimeString(),
        });

        // Create a cache key to track updates
        const cacheUpdateKey = `cheapest-${Date.now()}`;

        // Update cheapest cache with verification
        console.log(`Updating cheapest cache with key ${cacheUpdateKey}`);
        // Don't modify the API response
        setCachedCheapestData(response.data);
        // Use the separate tracker state instead
        setCheapestCacheUpdateTracker(cacheUpdateKey);

        // If currently on cheapest tab, update the UI
        if (sortOption === 'cheapest') {
          const flightsWithApiData = response.data.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: response.data.data,
            })
          );
          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);
          setTotalPages(Math.ceil(response.data.meta.total / limit));
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        console.error('Error refreshing cheapest data:', err);
      });

    // B. Fetch shortest data (SHORT_DURATION)
    console.log('Refreshing shortest tab data...');
    const shortestPayload = {
      ...basePayload,
      manualSort: 'SHORT_DURATION',
    };

    // Use direct API call to ensure network activity is visible
    axiosInstance
      .post(`/flight-search/${apiPath}?limit=${limit}&page=1`, shortestPayload)
      .then((response) => {
        if (!response?.data) {
          console.error('No data in shortest response');
          return;
        }

        // Log detailed info about the response to verify it contains valid data
        console.log('Shortest data refreshed successfully:', {
          totalFlights: response.data.data?.length || 0,
          firstFlight: response.data.data?.[0]?.id || 'none',
          timestamp: new Date().toLocaleTimeString(),
        });

        // Create a cache key to track updates
        const cacheUpdateKey = `shortest-${Date.now()}`;

        // Update shortest cache with verification
        console.log(`Updating shortest cache with key ${cacheUpdateKey}`);
        // Don't modify the API response
        setCachedShortestData(response.data);
        // Use the separate tracker state instead
        setShortestCacheUpdateTracker(cacheUpdateKey);

        // If currently on shortest tab, update the UI
        if (sortOption === 'shortest') {
          const flightsWithApiData = response.data.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: response.data.data,
            })
          );
          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);
          setTotalPages(Math.ceil(response.data.meta.total / limit));
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        console.error('Error refreshing shortest data:', err);
      });

    // C. Fetch family-tree data (recommended)
    console.log('Refreshing family tree data...');
    const familyTreePayload = {
      ...basePayload,
      manualSort: 'PRICE_LOW_TO_HIGH',
      origin: searchParams.originDestinations?.[0]?.originLocationCode || '',
      destination:
        searchParams.originDestinations?.[0]?.destinationLocationCode || '',
      departureDate:
        searchParams.originDestinations?.[0]?.departureDateTimeRange?.date ||
        '',
      returnDate:
        searchParams.originDestinations?.[1]?.departureDateTimeRange?.date ||
        '',
    };

    axiosInstance
      .post(
        `/flight-search/family-tree/price-group?limit=${limit}&page=1`,
        familyTreePayload
      )
      .then((response) => {
        if (!response?.data) {
          console.error('No data in family tree response');
          return;
        }

        // Log detailed info about the response
        console.log('Family tree data refreshed successfully:', {
          totalFlights: response.data.data?.length || 0,
          firstFlight: response.data.data?.[0]?.id || 'none',
          timestamp: new Date().toLocaleTimeString(),
        });

        // Create a cache key to track updates
        const cacheUpdateKey = `family-tree-${Date.now()}`;

        // Update family tree cache
        console.log(`Updating family tree cache with key ${cacheUpdateKey}`);
        setCachedFamilyTreeData(response.data);

        // If currently on recommended tab, update the UI
        if (sortOption === 'recommended') {
          const flightsWithApiData = response.data.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: response.data.data,
            })
          );
          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);
          setTotalPages(Math.ceil(response.data.meta.total / limit));
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        console.error('Error refreshing family tree data:', err);
      });

    // Update the last fetch timestamp after all API calls are initiated
    setLastFetchTimestamp(Date.now());
  };

  // Add monitoring for cache updates
  useEffect(() => {
    if (cheapestCacheUpdateTracker) {
      console.log(
        `✅ Cheapest cache was updated with key: ${cheapestCacheUpdateTracker}`
      );

      // If we're on the cheapest tab, update the filtered flights from the cache
      if (sortOption === 'cheapest' && cachedCheapestData) {
        const flightsWithApiData = cachedCheapestData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedCheapestData.data,
          })
        );
        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
      }
    }
  }, [cheapestCacheUpdateTracker, sortOption, cachedCheapestData]);

  // Add monitoring for shortest cache updates
  useEffect(() => {
    if (shortestCacheUpdateTracker) {
      console.log(
        `✅ Shortest cache was updated with key: ${shortestCacheUpdateTracker}`
      );

      // If we're on the shortest tab, update the filtered flights from the cache
      if (sortOption === 'shortest' && cachedShortestData) {
        const flightsWithApiData = cachedShortestData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedShortestData.data,
          })
        );
        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
      }
    }
  }, [shortestCacheUpdateTracker, sortOption, cachedShortestData]);

  // Use setInterval as a backup to ensure refreshes happen even if setTimeout fails
  useEffect(() => {
    // Only set up the interval when we have search params
    if (!searchParams) return;

    console.log('Setting up backup refresh interval');

    // Check every 10 seconds if a refresh is due
    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimestamp;

      // If it's been more than 2 minutes since the last fetch, trigger a refresh
      if (timeSinceLastFetch >= FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL) {
        console.log(
          'Backup refresh triggered via interval! Last fetch was',
          Math.floor(timeSinceLastFetch / 1000),
          'seconds ago'
        );
        performDataRefresh();
      }
    }, 10000); // Check every 10 seconds

    // Clean up interval when component unmounts
    return () => {
      console.log('Clearing backup refresh interval');
      clearInterval(intervalId);
    };
  }, [searchParams, lastFetchTimestamp]);

  // Add clean-up for the timer
  useEffect(() => {
    return () => {
      if (refreshTimerId) {
        clearTimeout(refreshTimerId);
      }
    };
  }, [refreshTimerId]);

  console.log('apiData', apiData);
  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add this effect to handle sort option changes
  useEffect(() => {
    if (searchParams && !loading) {
      // Check cache first when switching tabs
      const currentTime = Date.now();

      if (sortOption === 'shortest') {
        if (
          cachedShortestData &&
          currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
        ) {
          // Use cached data if available and not expired
          console.log('Using cached shortest data on tab switch');

          // Set flights with cached data
          const flightsWithApiData = cachedShortestData.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: cachedShortestData.data,
            })
          );

          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);
          setTotalPages(
            Math.ceil(
              cachedShortestData.meta.total / (searchParams.maxResults || 10)
            )
          );
          setCurrentPage(1);

          return;
        } else if (shortestFlightsData) {
          // If we have background-loaded data for shortest, use it
          console.log('Using preloaded shortest flights data');

          // Set flights with preloaded data attached
          const flightsWithApiData = shortestFlightsData.data.map(
            (flight: FlightOffer) => ({
              ...flight,
              __apiData: shortestFlightsData.data,
            })
          );

          setFlights(flightsWithApiData);
          setFilteredFlights(flightsWithApiData);

          // Cache the data
          setCachedShortestData(shortestFlightsData);
          setLastFetchTimestamp(currentTime);

          // Update pages
          setTotalPages(
            Math.ceil(
              shortestFlightsData.meta.total / (searchParams.maxResults || 10)
            )
          );
          setCurrentPage(1);

          // Clear preloaded data to avoid stale data on subsequent switches
          setShortestFlightsData(null);

          // Setup refresh timer
          if (refreshTimerId) {
            clearTimeout(refreshTimerId);
          }

          const timerId = setTimeout(() => {
            if (searchParams) {
              console.log('Cache expired, refreshing data...');
              fetchFlights(searchParams, 1, sortOption);
            }
          }, FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL); // 2 minutes

          setRefreshTimerId(timerId);

          return;
        }
      } else if (
        sortOption === 'cheapest' &&
        cachedCheapestData &&
        currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
      ) {
        // Use cached cheapest data if available and not expired
        console.log('Using cached cheapest data on tab switch');

        // Set flights with cached data
        const flightsWithApiData = cachedCheapestData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedCheapestData.data,
          })
        );

        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
        setTotalPages(
          Math.ceil(
            cachedCheapestData.meta.total / (searchParams.maxResults || 10)
          )
        );
        setCurrentPage(1);

        return;
      } else if (
        sortOption === 'recommended' &&
        cachedFamilyTreeData &&
        currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
      ) {
        // Use cached family tree data if available and not expired
        console.log('Using cached family tree data on tab switch');

        // Set flights with cached data
        const flightsWithApiData = cachedFamilyTreeData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedFamilyTreeData.data,
          })
        );

        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
        setTotalPages(
          Math.ceil(
            cachedFamilyTreeData.meta.total / (searchParams.maxResults || 10)
          )
        );
        setCurrentPage(1);

        return;
      }

      // If no valid cache is available, fetch fresh data
      setLoading(true);
      fetchFlights(searchParams, 1, sortOption);
    }
  }, [sortOption]);

  // Add a load more function
  const loadMore = () => {
    if (currentPage < totalPages && searchParams) {
      fetchFlights(searchParams, currentPage + 1);
    }
  };

  // Helper function to parse duration string (PT15H50M) to minutes
  const parseDuration = (duration: string) => {
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
  };

  // Helper function to format duration
  const formatDuration = (duration: string) => {
    const minutes = parseDuration(duration);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Helper function to calculate total passengers
  const getTotalPassengers = () => {
    if (!searchParams) return 1;
    return (
      (searchParams.adults || 1) +
      (searchParams.children || 0) +
      (searchParams.infants || 0)
    );
  };

  // Helper function to calculate total price
  const calculateTotalPrice = (price: string) => {
    const basePrice = parseFloat(price);
    const totalPassengers = getTotalPassengers();
    return (basePrice * totalPassengers).toFixed(2);
  };

  // Helper function to format baggage details
  const getBestTotalPrice = (flight: FlightOffer) => {
    const displayPrice = getDisplayPrice(flight, 0); // Use index 0 since this is just for price comparison
    // const totalPassengers = getTotalPassengers();
    const totalPrice = displayPrice.price;

    return Math.floor(totalPrice);
  };

  const getAdjustedPrice = (fareOption: {
    type: string;
    offer: FlightOffer;
  }) => {
    const basePrice = parseFloat(fareOption.offer.price.grandTotal);
    if (fareOption.type === 'child' || fareOption.offer.isGroupFare) {
      return basePrice * getTotalPassengers();
    }
    return basePrice;
  };

  // Get the cheapest total price from a flight and all its children (for visual display)
  const getCheapestTotalPrice = (flight: FlightOffer): string => {
    const allFareOptions = [
      { type: 'main', offer: flight },
      ...(flight.children?.map((child) => ({
        type: 'child',
        offer: child,
      })) || []),
    ];

    const sortedPrices = allFareOptions
      .map((fareOption) => getAdjustedPrice(fareOption))
      .sort((a, b) => a - b);

    return sortedPrices.length > 0
      ? sortedPrices[0].toFixed(2)
      : flight.price.grandTotal;
  };

  const formatBaggageDetails = (
    baggage:
      | { quantity?: number; weight?: number; weightUnit?: string }
      | undefined
  ) => {
    if (!baggage) return 'Not included';

    if (baggage.quantity) {
      return `${baggage.quantity} piece${baggage.quantity > 1 ? 's' : ''}`;
    }

    if (baggage.weight) {
      return `${baggage.weight}${baggage.weightUnit || 'KG'}`;
    }

    return 'Not included';
  };

  const handleTransitChange = (
    type: 'direct' | 'oneStop' | 'twoStops',
    checked: boolean
  ) => {
    console.log('Transit filter changed:', type, checked);
    setFilters((prevFilters) => ({
      ...prevFilters,
      transit: {
        ...prevFilters.transit,
        [type]: checked,
      },
    }));
  };

  // Update the handlePriceRangeChange function
  const handlePriceRangeChange = (values: number[]) => {
    console.log('Price range changed:', values);
    setFilters((prevFilters) => ({
      ...prevFilters,
      priceRange: values,
    }));
  };

  const handlePriceRangeChangeComplete = (values: number[]) => {
    console.log('Price range change complete:', values);
    setIsSliding(false);

    // Scroll to top after price range slider is released
    if (typeof window !== 'undefined') {
      scrollToTop();
    }
  };

  const handlePriceRangeChangeStart = () => {
    console.log('Price range change start disabled');
    setIsSliding(true);
  };

  const handleDepartureTimeChange = (values: number[]) => {
    console.log('Departure time changed:', values);
    setFilters((prevFilters) => ({
      ...prevFilters,
      departureTime: values,
    }));
  };

  const handleDepartureTimeChangeComplete = (values: number[]) => {
    console.log('Departure time change complete:', values);
    setIsDepartureTimeSliding(false);

    // Scroll to top after departure time slider is released
    if (typeof window !== 'undefined') {
      scrollToTop();
    }
  };

  const handleDepartureTimeChangeStart = () => {
    console.log('Departure time change start disabled');
    setIsDepartureTimeSliding(true);
  };

  const handleArrivalTimeChange = (values: number[]) => {
    console.log('Arrival time changed:', values);
    setFilters((prevFilters) => ({
      ...prevFilters,
      arrivalTime: values,
    }));
  };

  const handleArrivalTimeChangeComplete = (values: number[]) => {
    console.log('Arrival time change complete:', values);
    setIsArrivalTimeSliding(false);

    // Scroll to top after arrival time slider is released
    if (typeof window !== 'undefined') {
      scrollToTop();
    }
  };

  const handleArrivalTimeChangeStart = () => {
    console.log('Arrival time change start disabled');
    setIsArrivalTimeSliding(true);
  };

  // Fix the handleAirlineChange function to only use segment carrier codes
  const handleAirlineChange = (airlineCode: string, checked: boolean) => {
    console.log('Airline filter changed:', airlineCode, checked);
    setFilters((prevFilters) => ({
      ...prevFilters,
      airlines: {
        ...prevFilters.airlines,
        [airlineCode]: {
          ...prevFilters.airlines[airlineCode],
          checked: checked,
        },
      },
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('Clearing all filters');

    // remove airline from the search params
    delete searchParams?.airline;

    // Get the min/max price from the API data for resetting price range
    let minPrice = 0;
    let maxPrice = 0;

    if (apiData?.dictionaries?.priceRange) {
      minPrice = apiData.dictionaries.priceRange.min;
      maxPrice = apiData.dictionaries.priceRange.max;
    }

    // Get min/max departure time from API data for resetting departure time range
    let minDepartureTime = 0;
    let maxDepartureTime = 24;

    if (apiData?.dictionaries?.departureTimes) {
      minDepartureTime = timeStringToHour(
        apiData.dictionaries.departureTimes.min
      );
      maxDepartureTime = timeStringToHour(
        apiData.dictionaries.departureTimes.max
      );
    }

    // Get min/max arrival time from API data for resetting arrival time range
    let minArrivalTime = 0;
    let maxArrivalTime = 24;

    if (apiData?.dictionaries?.arrivalTimes) {
      minArrivalTime = timeStringToHour(apiData.dictionaries.arrivalTimes.min);
      maxArrivalTime = timeStringToHour(apiData.dictionaries.arrivalTimes.max);
    }

    // Reset all airline filters to unchecked
    const resetAirlines = { ...filters.airlines };
    Object.keys(resetAirlines).forEach((code) => {
      resetAirlines[code] = {
        ...resetAirlines[code],
        checked: false,
      };
    });

    // Reset the filter state
    setFilters((prevFilters) => ({
      ...prevFilters,
      transit: {
        direct: false,
        oneStop: false,
        twoStops: false,
      },
      priceRange: [minPrice, maxPrice],
      airlines: resetAirlines,
      departureTime: [minDepartureTime, maxDepartureTime],
      arrivalTime: [minArrivalTime, maxArrivalTime],
    }));

    // After reset, restore the original flight data from cache IMMEDIATELY
    console.log('Resetting filtered flights to original tab data');

    // Use sortOption to ensure we use the correct tab's data
    if (sortOption === 'cheapest' && cachedCheapestData) {
      console.log(
        'Resetting to cheapest cache data',
        cachedCheapestData.data.length
      );
      // Map the data to include the __apiData property
      const flightsWithApiData = cachedCheapestData.data.map((flight) => ({
        ...flight,
        __apiData: cachedCheapestData.data,
      }));
      setFlights(flightsWithApiData);
      setFilteredFlights(flightsWithApiData);
    } else if (sortOption === 'shortest' && cachedShortestData) {
      console.log(
        'Resetting to shortest cache data',
        cachedShortestData.data.length
      );
      // Map the data to include the __apiData property
      const flightsWithApiData = cachedShortestData.data.map((flight) => ({
        ...flight,
        __apiData: cachedShortestData.data,
      }));
      setFlights(flightsWithApiData);
      setFilteredFlights(flightsWithApiData);
    } else if (flights.length > 0) {
      console.log('Resetting to current flights data', flights.length);
      setFilteredFlights([...flights]);
    }

    // Scroll to top when filters are cleared
    if (typeof window !== 'undefined') {
      scrollToTop();
    }
  };

  const handleSearchModify = (newParams: any) => {
    // Ensure required properties are present
    if (!newParams.originLocationCode || !newParams.destinationLocationCode) {
      console.error('Missing required search parameters');
      return;
    }

    // Add required properties if they don't exist
    const completeParams: SearchParams = {
      ...newParams,
      departureDate: newParams.dateRange?.from
        ? format(new Date(newParams.dateRange.from), 'yyyy-MM-dd')
        : searchParams?.departureDate || '',
      returnDate: newParams.dateRange?.to
        ? format(new Date(newParams.dateRange.to), 'yyyy-MM-dd')
        : searchParams?.returnDate || '',
    };

    // Encode the search parameters using our URL-safe utility
    const encodedParams = encodeData(completeParams);

    // Redirect to the flights results page with the new parameters
    router.push(`/flights-results?q=${encodedParams}`);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!selectedCurrency || !searchParams) return;

    localStorage.setItem('selectedCurrency', selectedCurrency);
    handleSearchModify({
      ...searchParams,
      currencyCode: selectedCurrency,
    });
    // eslint-disable-next-line
  }, [selectedCurrency]);

  const handleOfferFlightBooking = (offer: FlightOffer) => {
    // Clear Best Value data since offers don't have discounts
    localStorage.removeItem('skytrips_best_value_booking');
    handleFlightBooking(offer);
  };

  // Helper function to get Best Value information from localStorage
  const getBestValueFromStorage = () => {
    try {
      const bestValueData = localStorage.getItem('skytrips_best_value_booking');
      if (bestValueData) {
        const parsedData = JSON.parse(bestValueData);
        // Return the data structure: { isManualFareApplied: boolean, appliedManualFareIds: string[] }
        return parsedData;
      }
    } catch (error) {
      console.error('Error reading Best Value data from localStorage:', error);
      localStorage.removeItem('skytrips_best_value_booking');
    }
    return null;
  };

  const handleFlightSelect = (
    flight: FlightOffer,
    isChildFare: boolean = false
  ) => {
    // Calculate the correct total price
    let flightToStore = { ...flight };
    if (isChildFare) {
      const adjustedTotal = (
        parseFloat(flight.price.grandTotal) * getTotalPassengers()
      ).toString();
      flightToStore = {
        ...flight,
        price: {
          ...flight.price,
          total: adjustedTotal,
          grandTotal: adjustedTotal,
        },
      };
    }

    // For non-group fares in recommended tab, check price before booking
    // Only check for best price if not a child fare and in recommended tab
    const bestPrice =
      !isChildFare && activeTab === 'recommended'
        ? getDisplayPrice(flight, -1)
        : null;

    const flightData = {
      originDestinations: searchParams?.originDestinations || [],
      travelers: {
        adults: searchParams?.adults || 1,
        children: searchParams?.children || 0,
        infants: searchParams?.infants || 0,
      },
      currencyCode: searchParams?.currencyCode || selectedCurrency,
      totalPrice: bestPrice?.fare
        ? bestPrice.price.toString()
        : flightToStore.price.grandTotal,
      flight: bestPrice?.fare
        ? {
            ...flight,
            price: {
              ...flight.price,
              grandTotal: bestPrice.price.toString(),
            },
          }
        : flightToStore,
      travelClass: searchParams?.travelClass || 'ECONOMY',
      tripType: searchParams?.tripType?.toLowerCase() || 'one_way',
      dictionaries: flight.dictionaries || {},
    };

    sessionStorage.setItem('skytrips_booking_data', JSON.stringify(flightData));

    // Initialize variables for fare handling
    let bestValueInfo;
    let flightToBook = flightToStore;

    // If it's a group fare, store basic info without any discounts and proceed to booking
    if (flight.isGroupFare) {
      // For group fares, never apply discounts
      bestValueInfo = {
        isManualFareApplied: false,
        appliedManualFareIds: [],
        fareDetails: {
          flightBasePrice: parseFloat(flight.price.base),
          flightGrandTotal: parseFloat(flight.price.grandTotal),
        },
      };

      // Store in localStorage before proceeding
      localStorage.setItem(
        'skytrips_best_value_booking',
        JSON.stringify(bestValueInfo)
      );

      handleFlightBooking(flight, isChildFare);
      return;
    }

    // Check for best price if not a child fare
    if (!isChildFare) {
      // Get best price for non-child fares
      const bestPrice = getDisplayPrice(flight, -1);
      const isBestValue = shouldShowBestValue(flight, -1);
      const bestValueFare = getBestMatchingFare(flight);

      if (isBestValue && bestValueFare) {
        // Check if cabin class matches with search travel class
        const cabinMatches = doesBrandedFareCabinMatch(flight);
        const hasFareDiscount = cabinMatches;

        // Store best value information with fare details
        bestValueInfo = {
          isManualFareApplied: hasFareDiscount,
          appliedManualFareIds: hasFareDiscount ? [bestValueFare.id] : [],
          fareDetails: {
            ...(hasFareDiscount && {
              id: bestValueFare.id,
              title: bestValueFare.title,
              customLabel: bestValueFare.customLabel,
              fareDeductionValueType: bestValueFare.fareDeductionValueType,
              deductionValue: bestValueFare.deductionValue,
              farePerPassengers: bestValueFare.farePerPassengers,
              originalPrice:
                bestPrice?.originalPrice || parseFloat(flight.price.grandTotal),
              discountedPrice:
                bestPrice?.price || calculateFarePrice(flight, bestValueFare),
            }),
            flightBasePrice: parseFloat(flight.price.base),
            flightGrandTotal: parseFloat(flight.price.grandTotal),
          },
        };

        flightToBook = {
          ...flight,
          price: {
            ...flight.price,
            grandTotal: hasFareDiscount
              ? bestPrice?.price.toString() ||
                calculateFarePrice(flight, bestValueFare).toString()
              : flight.price.grandTotal,
          },
        };
      } else if (bestPrice?.fare) {
        // Check if cabin class matches with search travel class
        const cabinMatches = doesBrandedFareCabinMatch(flight);
        const hasFareDiscount = cabinMatches;

        // If there's a manual fare but not best value
        bestValueInfo = {
          isManualFareApplied: hasFareDiscount,
          appliedManualFareIds: hasFareDiscount ? [bestPrice.fare.id] : [],
          fareDetails: {
            ...(hasFareDiscount && {
              id: bestPrice.fare.id,
              title: bestPrice.fare.title,
              customLabel: bestPrice.fare.customLabel,
              fareDeductionValueType: bestPrice.fare.fareDeductionValueType,
              deductionValue: bestPrice.fare.deductionValue,
              farePerPassengers: bestPrice.fare.farePerPassengers,
              originalPrice: bestPrice.originalPrice,
              discountedPrice: bestPrice.price,
            }),
            flightBasePrice: parseFloat(flight.price.base),
            flightGrandTotal: parseFloat(flight.price.grandTotal),
          },
        };

        flightToBook = {
          ...flight,
          price: {
            ...flight.price,
            grandTotal: hasFareDiscount
              ? bestPrice.price.toString()
              : flight.price.grandTotal,
          },
        };
      } else {
        // For non-group fares without any applicable fares, store basic info
        bestValueInfo = {
          isManualFareApplied: false,
          appliedManualFareIds: [],
          fareDetails: {
            flightBasePrice: parseFloat(flight.price.base),
            flightGrandTotal: parseFloat(flight.price.grandTotal),
          },
        };
      }
    } else {
      // For child fares, store basic info
      bestValueInfo = {
        isManualFareApplied: false,
        appliedManualFareIds: [],
        fareDetails: {
          flightBasePrice: parseFloat(flight.price.base),
          flightGrandTotal: parseFloat(flight.price.grandTotal),
        },
      };
    }

    // Store best value info in localStorage
    localStorage.setItem(
      'skytrips_best_value_booking',
      JSON.stringify(bestValueInfo)
    );
    console.log('🏆 Best Value booking stored in localStorage:', bestValueInfo);

    // Proceed with booking
    handleFlightBooking(flightToBook, isChildFare);
  };

  const handleFlightBooking = (
    flight: FlightOffer,
    isChildFare: boolean = false
  ) => {
    try {
      let flightToStore = { ...flight };
      if (isChildFare || flight.isGroupFare) {
        const adjustedTotal = (
          parseFloat(flight.price.grandTotal) * getTotalPassengers()
        ).toString();
        flightToStore = {
          ...flight,
          price: {
            ...flight.price,
            total: adjustedTotal,
            grandTotal: adjustedTotal,
          },
        };
      }
      const flightData = {
        originDestinations: [
          {
            id: 1,
            originLocationCode: searchParams?.originLocationCode,
            destinationLocationCode: searchParams?.destinationLocationCode,
            departureDateTimeRange: { date: searchParams?.departureDate },
          },
        ],
        travelers: {
          adults: searchParams?.adults || 1,
          children: searchParams?.children || 0,
          infants: searchParams?.infants || 0,
        },
        currencyCode: searchParams?.currencyCode || selectedCurrency,
        totalPrice: flightToStore.price.grandTotal,
        flight: flightToStore,
        travelClass: searchParams?.travelClass || 'ECONOMY',
        tripType: searchParams?.tripType?.toLowerCase() || 'one_way',
      };

      console.log('flightData', flightData);

      // Add return flight info if round trip
      const tripTypeUpper =
        searchParams?.tripType?.toString().toUpperCase() || '';
      if (tripTypeUpper === 'ROUND_TRIP' && searchParams?.returnDate) {
        flightData.originDestinations.push({
          id: 2,
          originLocationCode: searchParams?.destinationLocationCode || '',
          destinationLocationCode: searchParams?.originLocationCode || '',
          departureDateTimeRange: { date: searchParams.returnDate },
        });
      }

      // Store flight data in sessionStorage instead of URL
      console.log('Storing flight data in session storage:', {
        flightData,
        apiData,
        dictionaries: apiData?.dictionaries,
        airlines: apiData?.dictionaries?.airlines,
        carriers: apiData?.dictionaries?.carriers,
      });

      // Add dictionaries to the flight data before storing
      if (apiData?.dictionaries) {
        (flightData as any).dictionaries = apiData.dictionaries;
      }

      // Calculate and store the adjusted price for group fares
      const flightOfferData = flight as FlightOffer;
      let finalFlightData = { ...flightData };

      if (flightOfferData.isGroupFare) {
        const totalPassengers = getTotalPassengers();
        const adjustedPrice =
          parseFloat(flightOfferData.price.grandTotal) * totalPassengers;

        // Add the adjusted price to the flight data
        (finalFlightData as any).flight.price = {
          ...flightData.flight.price,
          grandTotal: adjustedPrice.toString(),
          total: adjustedPrice.toString(),
        };

        // Update totalPrice as well
        (finalFlightData as any).totalPrice = adjustedPrice.toString();
      }

      sessionStorage.setItem(
        'skytrips_booking_data',
        JSON.stringify(finalFlightData)
      );

      // Store dictionaries separately for easier access
      if (apiData?.dictionaries) {
        console.log('Storing dictionaries separately:', apiData.dictionaries);

        // Create a processed dictionaries object with all carrier information
        const processedDictionaries = {
          ...apiData.dictionaries,
          // Ensure carriers object exists
          carriers: {
            ...(apiData.dictionaries.carriers || {}),
          },
        };

        // If airlines exist as an array, add to carriers mapping for easier lookup
        if (Array.isArray(apiData.dictionaries.airlines)) {
          apiData.dictionaries.airlines.forEach((airline: any) => {
            if (airline.code && airline.name) {
              processedDictionaries.carriers[airline.code] = airline.name;
            }
          });
        }

        // Store the processed dictionaries
        sessionStorage.setItem(
          'skytrips_dictionaries',
          JSON.stringify(processedDictionaries)
        );
      }

      // Redirect to booking page without large query params
      router.push('/book');
    } catch (error) {
      console.error('Error navigating to booking page:', error);
    }
  };

  // Update the toggleFlightDetails function to open a drawer instead of expanding inline
  const toggleFlightDetails = async (
    flightId: string,
    flight: FlightOffer,
    index: number = 0
  ) => {
    // Calculate priceData for the flight using the same logic as main cards
    const priceData = getDisplayPrice(flight, index);

    setSelectedFlightForDrawer({
      flight,
      id: flightId,
      priceData,
      flightIndex: index,
    });
  };

  const closeFlightDetails = () => {
    setSelectedFlightForDrawer(null);
  };

  // Helper function to check if all segments in a branded fare offer have the same cabin class
  const hasConsistentCabinClass = (fareOffer: FlightOffer): boolean => {
    // Get all fare details by segment for the first traveler (adult)
    const fareDetailsBySegment =
      fareOffer.travelerPricings?.[0]?.fareDetailsBySegment;

    if (!fareDetailsBySegment || fareDetailsBySegment.length === 0) {
      return true; // If no segments, consider it valid
    }

    // Get the cabin class from the first segment
    const firstCabin = fareDetailsBySegment[0]?.cabin;

    if (!firstCabin) {
      return true; // If no cabin info, consider it valid
    }

    // Check if all segments have the same cabin class
    return fareDetailsBySegment.every(
      (segment) => segment.cabin === firstCabin
    );
  };

  // Helper function to determine cabin class priority for sorting branded fares
  const getCabinClassPriority = (fareOffer: FlightOffer): number => {
    const fareDetailsBySegment =
      fareOffer.travelerPricings?.[0]?.fareDetailsBySegment;

    if (!fareDetailsBySegment || fareDetailsBySegment.length === 0) {
      return 999; // Unknown, put at end
    }

    // Get all unique cabin classes in this offer
    const cabinClasses = fareDetailsBySegment
      .map((segment) => segment.cabin)
      .filter((cabin, index, array) => cabin && array.indexOf(cabin) === index);

    // Priority order: 1 = highest priority (shows first)

    // 1. Pure ECONOMY offers (all segments are ECONOMY)
    if (cabinClasses.length === 1 && cabinClasses[0] === 'ECONOMY') {
      return 1;
    }

    // 2. Mixed offers that include ECONOMY (like Economy + Business)
    if (cabinClasses.includes('ECONOMY')) {
      return 2;
    }

    // 3. Pure BUSINESS offers
    if (cabinClasses.length === 1 && cabinClasses[0] === 'BUSINESS') {
      return 3;
    }

    // 4. Pure FIRST class offers
    if (cabinClasses.length === 1 && cabinClasses[0] === 'FIRST') {
      return 4;
    }

    // 5. Other mixed offers (Business + First, etc.)
    if (cabinClasses.includes('BUSINESS')) {
      return 5;
    }

    // 6. Everything else
    return 6;
  };

  // Function to fetch branded fares upsell data with caching
  const fetchBrandedFaresUpsell = async (flight: FlightOffer) => {
    try {
      setIsLoadingBrandedFares(true);

      // Check if we have cached data for this flight
      const cacheKey = flight.id;
      if (brandedFaresCache[cacheKey]) {
        setBrandedFaresData(brandedFaresCache[cacheKey]);
        setIsLoadingBrandedFares(false);
        return;
      }

      // Generate unique client reference ID
      const clientRef = `upsell-${flight.id}-${Date.now()}`;

      const response = await axiosInstance.post(
        '/flight-branded-fares-upsell?page=1&limit=10',
        flight,
        {
          headers: {
            'ama-client-ref': clientRef,
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        // Filter out offers with mixed cabin classes across segments
        const validBrandedFares = response.data.data.filter(
          (fareOffer: FlightOffer) => {
            const isConsistent = hasConsistentCabinClass(fareOffer);
            if (!isConsistent) {
              console.log(
                'Filtering out branded fare offer with mixed cabin classes:',
                fareOffer.id
              );
            }
            return isConsistent;
          }
        );

        // Sort branded fares by cabin class priority
        const sortedBrandedFares = validBrandedFares.sort(
          (a: FlightOffer, b: FlightOffer) => {
            const priorityA = getCabinClassPriority(a);
            const priorityB = getCabinClassPriority(b);

            // Lower number = higher priority (appears first)
            return priorityA - priorityB;
          }
        );

        // Cache the results for future use
        setBrandedFaresCache((prev) => ({
          ...prev,
          [cacheKey]: sortedBrandedFares,
        }));

        setBrandedFaresData(sortedBrandedFares);
      } else {
        // Cache empty results as well to avoid unnecessary API calls
        setBrandedFaresCache((prev) => ({
          ...prev,
          [cacheKey]: [],
        }));
        setBrandedFaresData([]);
      }
    } catch (error) {
      console.error('Error fetching branded fares upsell:', error);
      // Cache empty results on error to avoid repeated failed calls
      const cacheKey = flight.id;
      setBrandedFaresCache((prev) => ({
        ...prev,
        [cacheKey]: [],
      }));
      setBrandedFaresData([]);
    } finally {
      setIsLoadingBrandedFares(false);
    }
  };

  // Helper function to format baggage details (handles both quantity and weight)
  const formatBaggageInfo = (baggageData: any) => {
    if (!baggageData) return 'Not included';

    if (baggageData.quantity !== undefined) {
      return `${baggageData.quantity} piece(s)`;
    }

    if (baggageData.weight !== undefined) {
      const unit = baggageData.weightUnit || 'KG';
      return `${baggageData.weight} ${unit}`;
    }

    return 'Included';
  };

  // Helper function specifically for branded fare cabin baggage formatting
  const formatBrandedFareCabinBaggageInfo = (baggageData: any) => {
    if (!baggageData) return 'Included';

    if (baggageData.quantity !== undefined) {
      return `${baggageData.quantity} piece(s)`;
    }

    if (baggageData.weight !== undefined) {
      const unit = baggageData.weightUnit || 'KG';
      return `${baggageData.weight} ${unit}`;
    }

    return 'Included';
  };

  // Helper function to get refund amenity details for branded fares
  const getRefundAmenityDetails = (fareOffer: any) => {
    const amenities =
      fareOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.amenities;
    if (!amenities || !Array.isArray(amenities)) return null;

    const refundAmenity = amenities.find(
      (amenity: any) =>
        amenity.description &&
        amenity.description.toUpperCase().includes('REFUND') &&
        amenity.amenityType === 'BRANDED_FARES'
    );

    if (refundAmenity) {
      return {
        description: refundAmenity.description,
        isChargeable: refundAmenity.isChargeable,
        code: refundAmenity.code,
        hasRefund: true,
      };
    }

    // Return null if no refund amenity found - don't show anything
    return null;
  };

  // Backward compatibility function - keep existing function for other uses
  const isRefundableFromAmenities = (fareOffer: any) => {
    const refundDetails = getRefundAmenityDetails(fareOffer);
    return refundDetails?.hasRefund || false;
  };

  // Helper function to get change amenity details for branded fares
  const getChangeAmenityDetails = (fareOffer: any) => {
    const amenities =
      fareOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.amenities;
    if (!amenities || !Array.isArray(amenities)) return null;

    const changeAmenity = amenities.find(
      (amenity: any) =>
        amenity.description &&
        amenity.description.toUpperCase().includes('CHANGE BEFORE DEPARTURE') &&
        amenity.amenityType === 'BRANDED_FARES'
    );

    if (changeAmenity) {
      return {
        description: changeAmenity.description,
        isChargeable: changeAmenity.isChargeable,
        code: changeAmenity.code,
        hasChange: true,
      };
    }

    // Return null if no change amenity found - don't show anything
    return null;
  };

  // Modify the toggleOfferFlightDetails function to open a drawer
  const toggleOfferFlightDetails = (offerId: string, flight: FlightOffer) => {
    // Offers use original pricing only (no fare discounts)
    const priceData = {
      price: parseFloat(flight.price.grandTotal),
    };

    setSelectedFlightForDrawer({
      flight,
      id: offerId,
      priceData,
    });
  };

  // Function to toggle children visibility
  const toggleChildren = (flightId: string) => {
    if (expandedChildrenId !== flightId) {
      // Close flight details if open for this flight
      if (expandedFlightId === flightId) {
        setExpandedFlightId(null);
      }
      setExpandedChildrenId(flightId);
      setExpandedSamePriceId(null); // Close same price offers
    } else {
      setExpandedChildrenId(null);
    }
  };

  // Add back the toggleSamePriceOffers function
  const toggleSamePriceOffers = (flightId: string) => {
    // If we're opening this flight's same price offers
    if (expandedSamePriceId !== flightId) {
      // Close flight details if it's open for this flight
      if (expandedFlightId === flightId) {
        setExpandedFlightId(null);
      }
      setExpandedSamePriceId(flightId);
    } else {
      // Just close same price offers if it's already open
      setExpandedSamePriceId(null);
    }
  };

  // Update regular applyFilters function to only use segment carrier codes
  const applyFilters = (flightData: FlightOffer[]) => {
    console.log('Applying filters to', flightData.length, 'flights');

    // Check if any filters are active
    const noTransitFiltersSelected =
      !filters.transit.direct &&
      !filters.transit.oneStop &&
      !filters.transit.twoStops;

    // Get min/max price from API data or use defaults
    const minPrice = apiData?.dictionaries?.priceRange?.min || 0;
    const maxPrice = apiData?.dictionaries?.priceRange?.max || 0;

    // Check if price filter is at default values (inactive)
    const noPriceFiltersSelected =
      (filters.priceRange[0] === minPrice &&
        filters.priceRange[1] === maxPrice) ||
      (filters.priceRange[0] === 0 && filters.priceRange[1] === 0);

    // Check if any airline filters are selected
    const selectedAirlines = Object.entries(filters.airlines)
      .filter(([_, airline]) => airline.checked)
      .map(([code, _]) => code);

    const noAirlineFiltersSelected = selectedAirlines.length === 0;

    // Get departure time range from API data or use defaults
    const minDepartureTime = apiData?.dictionaries?.departureTimes?.min
      ? timeStringToHour(apiData.dictionaries.departureTimes.min)
      : 0;
    const maxDepartureTime = apiData?.dictionaries?.departureTimes?.max
      ? timeStringToHour(apiData.dictionaries.departureTimes.max)
      : 24;

    // Check if departure time filter is at default values (inactive)
    const noDepartureTimeFiltersSelected =
      (filters.departureTime[0] === minDepartureTime &&
        filters.departureTime[1] === maxDepartureTime) ||
      (filters.departureTime[0] === 0 && filters.departureTime[1] === 24);

    // Get arrival time range from API data or use defaults
    const minArrivalTime = apiData?.dictionaries?.arrivalTimes?.min
      ? timeStringToHour(apiData.dictionaries.arrivalTimes.min)
      : 0;
    const maxArrivalTime = apiData?.dictionaries?.arrivalTimes?.max
      ? timeStringToHour(apiData.dictionaries.arrivalTimes.max)
      : 24;

    // Check if arrival time filter is at default values (inactive)
    const noArrivalTimeFiltersSelected =
      (filters.arrivalTime[0] === minArrivalTime &&
        filters.arrivalTime[1] === maxArrivalTime) ||
      (filters.arrivalTime[0] === 0 && filters.arrivalTime[1] === 24);

    // If no filters are selected, return all flights
    if (
      noTransitFiltersSelected &&
      noPriceFiltersSelected &&
      noAirlineFiltersSelected &&
      noDepartureTimeFiltersSelected &&
      noArrivalTimeFiltersSelected
    ) {
      console.log('No filters selected, returning all flights');
      return flightData;
    }

    return flightData.filter((flight) => {
      // Create individual filter results to properly combine them later
      let passesTransitFilter = true;
      let passesPriceFilter = true;
      let passesAirlineFilter = true;
      let passesDepartureTimeFilter = true;
      let passesArrivalTimeFilter = true;

      // Price filter - only apply if active
      if (!noPriceFiltersSelected) {
        const flightPrice = parseFloat(flight.price.grandTotal);
        passesPriceFilter =
          flightPrice >= filters.priceRange[0] &&
          flightPrice <= filters.priceRange[1];
      }

      // Airline filter - only apply if active
      if (!noAirlineFiltersSelected) {
        // Check if any of the selected airlines are in this flight's segments
        const flightAirlines: Set<string> = new Set();
        flight.itineraries.forEach((itinerary) => {
          itinerary.segments.forEach((segment) => {
            flightAirlines.add(segment.carrierCode);
          });
        });

        // Check if any selected airline is in this flight
        passesAirlineFilter = selectedAirlines.some((code) =>
          flightAirlines.has(code)
        );
      }

      // Departure time filter - only apply if active
      if (!noDepartureTimeFiltersSelected) {
        // Check only the first segment of the first itinerary is within the selected range
        passesDepartureTimeFilter = false;
        if (flight.itineraries.length > 0) {
          const firstItinerary = flight.itineraries[0];
          if (firstItinerary.segments.length > 0) {
            // Get departure time of the first segment
            const departureDateTime = new Date(
              firstItinerary.segments[0].departure.at
            );
            const departureHour =
              departureDateTime.getHours() +
              departureDateTime.getMinutes() / 60;

            // Check if departure time is within selected range
            passesDepartureTimeFilter =
              departureHour >= filters.departureTime[0] &&
              departureHour <= filters.departureTime[1];
          }
        }
      }

      // Arrival time filter - only apply if active
      if (!noArrivalTimeFiltersSelected) {
        // Check only the last segment of the last itinerary is within the selected range
        passesArrivalTimeFilter = false;
        if (flight.itineraries.length > 0) {
          const lastItinerary =
            flight.itineraries[flight.itineraries.length - 1];
          if (lastItinerary.segments.length > 0) {
            // Get arrival time of the last segment
            const lastSegment =
              lastItinerary.segments[lastItinerary.segments.length - 1];
            const arrivalDateTime = new Date(lastSegment.arrival.at);
            const arrivalHour =
              arrivalDateTime.getHours() + arrivalDateTime.getMinutes() / 60;

            // Check if arrival time is within selected range
            passesArrivalTimeFilter =
              arrivalHour >= filters.arrivalTime[0] &&
              arrivalHour <= filters.arrivalTime[1];
          }
        }
      }

      // Transit filter - only apply if active
      if (!noTransitFiltersSelected) {
        passesTransitFilter = flight.itineraries.some((itinerary) => {
          const segmentsCount = itinerary.segments.length;

          // Direct flight (no stops)
          if (segmentsCount === 1 && filters.transit.direct) {
            return true;
          }

          // One stop flight
          if (segmentsCount === 2 && filters.transit.oneStop) {
            return true;
          }

          // Two or more stops flight
          if (segmentsCount > 2 && filters.transit.twoStops) {
            return true;
          }

          // If none of the above conditions match, this itinerary doesn't match the transit filter
          return false;
        });
      }

      // A flight must pass ALL active filters to be included in results
      return (
        passesPriceFilter &&
        passesAirlineFilter &&
        passesDepartureTimeFilter &&
        passesArrivalTimeFilter &&
        passesTransitFilter
      );
    });
  };

  const handleApplyFilters = () => {
    console.log('Applying filters now');

    if (!cachedCheapestData && !cachedShortestData && !cachedFamilyTreeData) {
      console.warn('No cached data available yet for applying filters');
      return;
    }

    let sourceData: FlightOffer[] = [];

    if (sortOption === 'cheapest' && cachedCheapestData) {
      sourceData = cachedCheapestData.data;
    } else if (sortOption === 'shortest' && cachedShortestData) {
      sourceData = cachedShortestData.data;
    } else if (sortOption === 'recommended' && cachedFamilyTreeData) {
      sourceData = cachedFamilyTreeData.data;
    }

    if (sourceData.length === 0) {
      console.warn('No flights in source data for filtering');
      return;
    }

    // Apply filters
    const filteredData = applyFilters(sourceData);

    // Attach __apiData to each filtered flight
    const flightsWithApiData = filteredData.map((flight) => ({
      ...flight,
      __apiData: sourceData,
    }));

    setFilteredFlights(flightsWithApiData);

    // Close the mobile filter drawer if it's open
    if (typeof setShowMobileFilter === 'function') {
      setShowMobileFilter(false);
    }

    // Only scroll to top when no sliders are being dragged
    if (
      typeof window !== 'undefined' &&
      !isSliding &&
      !isDepartureTimeSliding &&
      !isArrivalTimeSliding
    ) {
      scrollToTop();
    }
  };

  // 4. Fix useEffect to track filter changes and apply them
  useEffect(() => {
    if (sortOption === 'cheapest' && cachedCheapestData) {
      handleApplyFilters();
    }
    if (sortOption === 'shortest' && cachedShortestData) {
      handleApplyFilters();
    }
    if (sortOption === 'recommended' && cachedFamilyTreeData) {
      handleApplyFilters();
    }
  }, [
    // Transit filters
    filters.transit.direct,
    filters.transit.oneStop,
    filters.transit.twoStops,

    // Track the actual values rather than the array reference
    filters.priceRange[0],
    filters.priceRange[1],

    // Track the actual values for departure time
    filters.departureTime[0],
    filters.departureTime[1],

    // Track the actual values for arrival time
    filters.arrivalTime[0],
    filters.arrivalTime[1],

    // Monitor airline filter changes - need to stringify since it's an object
    JSON.stringify(
      Object.entries(filters.airlines)
        .filter(([_, airline]) => airline.checked)
        .map(([code]) => code)
    ),

    // Sort option
    sortOption,

    // Cached data
    cachedCheapestData,
    cachedShortestData,
    cachedFamilyTreeData,
  ]);

  // Add effect to update arrival time filters when API data changes
  useEffect(() => {
    if (apiData?.dictionaries?.arrivalTimes) {
      // Update arrival time filters based on the latest API data
      const minArrivalHour = timeStringToHour(
        apiData.dictionaries.arrivalTimes.min
      );
      const maxArrivalHour = timeStringToHour(
        apiData.dictionaries.arrivalTimes.max
      );

      console.log('Setting arrival time filters from API:', [
        minArrivalHour,
        maxArrivalHour,
      ]);

      // Only update the arrival time part of filters
      setFilters((prev) => ({
        ...prev,
        arrivalTime: [minArrivalHour, maxArrivalHour],
      }));
    }
  }, [apiData?.dictionaries?.arrivalTimes]);

  // Add an effect to ensure cheapest tab data (default tab) is properly displayed on initial load
  useEffect(() => {
    // This is specifically for the initial load of the cheapest tab (default tab)
    if (
      sortOption === 'cheapest' &&
      cachedCheapestData &&
      filteredFlights.length === 0 &&
      !loading
    ) {
      console.log(
        'Initial load: Setting filtered flights from cached cheapest data'
      );

      // Check if any filters are active
      const hasActiveFilters =
        filters.transit.direct ||
        filters.transit.oneStop ||
        filters.transit.twoStops ||
        Object.values(filters.airlines).some((airline) => airline.checked) ||
        (apiData?.dictionaries?.priceRange &&
          (filters.priceRange[0] !== apiData.dictionaries.priceRange.min ||
            filters.priceRange[1] !== apiData.dictionaries.priceRange.max)) ||
        (apiData?.dictionaries?.departureTimes &&
          (filters.departureTime[0] !==
            timeStringToHour(apiData.dictionaries.departureTimes.min) ||
            filters.departureTime[1] !==
              timeStringToHour(apiData.dictionaries.departureTimes.max))) ||
        (apiData?.dictionaries?.arrivalTimes &&
          (filters.arrivalTime[0] !==
            timeStringToHour(apiData.dictionaries.arrivalTimes.min) ||
            filters.arrivalTime[1] !==
              timeStringToHour(apiData.dictionaries.arrivalTimes.max)));

      // Only auto-fill with all flights if no filters are active
      if (!hasActiveFilters) {
        const flightsWithApiData = cachedCheapestData.data.map(
          (flight: FlightOffer) => ({
            ...flight,
            __apiData: cachedCheapestData.data,
          })
        );
        setFlights(flightsWithApiData);
        setFilteredFlights(flightsWithApiData);
      } else {
        // If filters are active, apply them rather than showing all flights
        handleApplyFilters();
      }
    }
  }, [
    sortOption,
    cachedCheapestData,
    filteredFlights.length,
    loading,
    apiData,
  ]);

  // Add this effect to update filter UI when apiData changes
  useEffect(() => {
    if (apiData && apiData.dictionaries) {
      console.log('Updating filters from API data dictionaries');

      // Get price range from API data
      const minPrice = apiData.dictionaries.priceRange?.min || 0;
      const maxPrice = apiData.dictionaries.priceRange?.max || 1000;

      // Create airline filters from API data
      const airlineFilters: Record<string, AirlineFilter> = {};
      if (apiData.dictionaries.airlines) {
        apiData.dictionaries.airlines.forEach((airline) => {
          // Check if this airline should be pre-selected based on searchParams
          const shouldBeChecked =
            searchParams?.airline?.airlineCode === airline.code;
          airlineFilters[airline.code] = {
            name: airline.name,
            checked: shouldBeChecked || false,
          };
        });
      }

      // Get time ranges from API data
      let departureTimeMin = 0;
      let departureTimeMax = 24;
      let arrivalTimeMin = 0;
      let arrivalTimeMax = 24;

      if (apiData.dictionaries.departureTimes) {
        const depMin = timeStringToHour(
          apiData.dictionaries.departureTimes.min
        );
        const depMax = timeStringToHour(
          apiData.dictionaries.departureTimes.max
        );
        departureTimeMin = depMin;
        departureTimeMax = depMax;
      }

      if (apiData.dictionaries.arrivalTimes) {
        const arrMin = timeStringToHour(apiData.dictionaries.arrivalTimes.min);
        const arrMax = timeStringToHour(apiData.dictionaries.arrivalTimes.max);
        arrivalTimeMin = arrMin;
        arrivalTimeMax = arrMax;
      }

      // Set the filters state
      setFilters({
        transit: {
          direct: false,
          oneStop: false,
          twoStops: false,
        },
        priceRange: [minPrice, maxPrice],
        airlines: airlineFilters,
        departureTime: [departureTimeMin, departureTimeMax],
        arrivalTime: [arrivalTimeMin, arrivalTimeMax],
      });
    }
  }, [apiData]);

  // Helper function to get the adult price per person
  const getAdultPrice = (flight: FlightOffer): number | null => {
    if (flight.travelerPricings && flight.travelerPricings.length > 0) {
      const adultTraveler = flight.travelerPricings.find(
        (tp) => tp.travelerType === 'ADULT'
      );
      if (adultTraveler?.price?.total) {
        return parseFloat(adultTraveler.price.total);
      }
    }
    return null;
  };

  // Function to get original adult price (never apply fare discount to per adult display)
  const getOriginalAdultPrice = (flight: FlightOffer): number | null => {
    // Always return the original adult price from flight data, ignore any fare adjustments
    if (flight.travelerPricings && flight.travelerPricings.length > 0) {
      const adultTraveler = flight.travelerPricings.find(
        (tp) => tp.travelerType === 'ADULT'
      );
      if (adultTraveler?.price?.total) {
        return parseFloat(adultTraveler.price.total);
      }
    }
    return null;
  };

  // Helper function to format price display
  const formatDisplayPrice = (price: number): string => {
    return ` ${Math.floor(price)}`;
  };

  // Define scrollToTop function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Function to get the best matching fare for a flight
  const getBestMatchingFare = (flight: FlightOffer) => {
    if (!fareData.length) return null;

    for (const fare of fareData) {
      if (checkFareMatch(flight, fare)) {
        const farePrice = calculateFarePrice(flight, fare);
        const originalPrice = parseFloat(flight.price.grandTotal);

        if (farePrice < originalPrice) {
          return fare;
        }
      }
    }
    return null;
  };

  // Function to check if a flight should show best value tag
  const shouldShowBestValue = (flight: FlightOffer, index: number): boolean => {
    // Show best value tag for all flights that have matching fare conditions
    const matchingFare = getBestMatchingFare(flight);
    console.log('matchingFare', matchingFare);
    return !!matchingFare;
  };

  // Helper function to check if branded fare cabin class matches with search travel class
  const doesBrandedFareCabinMatch = (fareOffer: FlightOffer): boolean => {
    const searchTravelClass = searchParams?.travelClass || 'ECONOMY';
    const brandedFareCabin =
      fareOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin;

    // If no cabin information available, assume it matches
    if (!brandedFareCabin) {
      return true;
    }

    // Direct match
    if (brandedFareCabin === searchTravelClass) {
      return true;
    }

    // Handle common variations
    const normalizedSearchClass = searchTravelClass.toUpperCase();
    const normalizedBrandedCabin = brandedFareCabin.toUpperCase();

    return normalizedBrandedCabin === normalizedSearchClass;
  };

  // Function to get display price (fare-adjusted for all flights with matching fares)
  const getDisplayPrice = (
    flight: FlightOffer,
    index: number
  ): { price: number; originalPrice?: number; fare?: any } => {
    const totalPassengers = getTotalPassengers();
    const actualPrice = parseFloat(flight.price.grandTotal);

    // For recommended tab - show the lowest price among all options
    if (activeTab === 'recommended') {
      let lowestPrice = actualPrice;
      let originalPrice = lowestPrice;
      let bestFare = null;

      // Check main offer with fare rules - only for non-group fares
      if (!flight.isGroupFare && shouldShowBestValue(flight, index)) {
        const matchingFare = getBestMatchingFare(flight);
        if (matchingFare) {
          const farePrice = calculateFarePrice(flight, matchingFare);
          lowestPrice = farePrice;
          originalPrice = actualPrice;
          bestFare = matchingFare;
        } else {
          // If no matching fare or group fare, use actual price
          lowestPrice = actualPrice;
          bestFare = null;
        }
      } else {
        // For group fares or no fare match, use actual price
        lowestPrice = actualPrice;
        bestFare = null;
      }

      // Check children offers
      if (flight.children?.length) {
        flight.children.forEach((childOffer) => {
          const childPrice = parseFloat(childOffer.price.grandTotal);

          if (childPrice < lowestPrice) {
            lowestPrice = childPrice;
            originalPrice = parseFloat(flight.price.grandTotal);
            bestFare = null; // Reset fare when using child offer
          }
        });
      }

      // If it's a group fare in the main offer, multiply by total passengers
      if (flight.isGroupFare) {
        lowestPrice = lowestPrice * totalPassengers;
        originalPrice = originalPrice * totalPassengers;
      }

      // console.log('Final price decision:', {
      //   lowestPrice,
      //   originalPrice,
      //   hasFare: !!bestFare,
      //   isGroupFare: flight.isGroupFare,
      // });

      // Always return both prices when there's a fare match
      return bestFare
        ? { price: lowestPrice, originalPrice, fare: bestFare }
        : { price: lowestPrice };
    }

    // For other tabs - keep original price display logic
    if (shouldShowBestValue(flight, index)) {
      const bestFare = getBestMatchingFare(flight);
      if (bestFare) {
        const farePrice = calculateFarePrice(flight, bestFare);
        const originalPrice = parseFloat(flight.price.grandTotal);

        // If it's a group fare, multiply both prices by total passengers
        const adjustedFarePrice = flight.isGroupFare
          ? farePrice * totalPassengers
          : farePrice;
        const adjustedOriginalPrice = flight.isGroupFare
          ? originalPrice * totalPassengers
          : originalPrice;

        if (adjustedFarePrice < adjustedOriginalPrice) {
          return {
            price: adjustedFarePrice,
            originalPrice: adjustedOriginalPrice,
            fare: bestFare,
          };
        }
      }
    }

    // For group fares, multiply the base price by total passengers
    const basePrice = parseFloat(flight.price.grandTotal);
    return {
      price: flight.isGroupFare ? basePrice * totalPassengers : basePrice,
    };
  };

  // Add useEffect for flight search history
  useEffect(() => {
    const saveFlightSearchHistory = async () => {
      try {
        if (!searchParams) {
          console.log('No search params available');
          return;
        }

        console.log('Using search params:', searchParams);

        // Use the existing search parameters
        const tripType = (searchParams.tripType || 'ROUND_TRIP').toUpperCase();
        const payload = {
          tripType,
          travelerCount:
            (parseInt(String(searchParams.adults)) || 1) +
            (parseInt(String(searchParams.children)) || 0) +
            (parseInt(String(searchParams.infants)) || 0),
          travelClass: searchParams.travelClass || 'ECONOMY',
          locations: [
            {
              from: searchParams.originLocationCode || '',
              to: searchParams.destinationLocationCode || '',
              departureDate: searchParams.departureDate || '',
              ...(tripType === 'ROUND_TRIP' && {
                returnDate: searchParams.returnDate || '',
              }),
            },
          ],
          travelers: {
            adults: parseInt(String(searchParams.adults)) || 1,
            children: parseInt(String(searchParams.children)) || 0,
            infants: parseInt(String(searchParams.infants)) || 0,
          },
        };

        console.log('Prepared payload:', payload);

        // Only make the API call if we have valid location data
        if (payload.locations[0].from && payload.locations[0].to) {
          console.log('Making API call with payload:', payload);
          const response = await axiosInstance.post(
            '/flight-search-history',
            payload
          );
          console.log('API call response:', response);
        } else {
          console.log('Skipping API call - missing location data');
        }
      } catch (error) {
        console.error('Error saving flight search history:', error);
      }
    };

    // Call when search params are available
    if (searchParams && Object.keys(searchParams).length > 0) {
      console.log('Search params loaded, calling saveFlightSearchHistory');
      saveFlightSearchHistory();
    }
  }, [searchParams]); // Depend on searchParams

  console.log('selectedFlight', selectedFlight);

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingScreen searchParams={searchParams} progress={progress} />
        <Footer />
      </>
    );
  }

  console.log('filters', filters);

  console.log('New filters state:', filters);

  // Add animation styles inside component
  const animationStyles = `
    @keyframes pulse-slow {
      0%, 100% {
        opacity: 0.7;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s infinite ease-in-out;
    }
  `;

  console.log('flights', flights);

  return (
    <>
      <NextSeo
        title={`Cheap Flights from ${
          searchParams?.fromAirport?.city || 'Origin'
        } to ${searchParams?.toAirport?.city || 'Destination'} | SkyTrips`}
        description={`Find the best airfares from ${
          searchParams?.fromAirport?.city || 'Origin'
        } to ${
          searchParams?.toAirport?.city || 'Destination'
        }. Compare airlines and book cheap flights instantly with SkyTrips.`}
        canonical="https://skytrips.com.au/"
        openGraph={{
          url: 'https://skytrips.com.au/',
          title: `Cheap Flights from ${
            searchParams?.fromAirport?.city || 'Origin'
          } to ${searchParams?.toAirport?.city || 'Destination'} | SkyTrips`,
          description: `Find the best airfares from ${
            searchParams?.fromAirport?.city || 'Origin'
          } to ${
            searchParams?.toAirport?.city || 'Destination'
          }. Compare airlines and book cheap flights instantly with SkyTrips.`,
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
      <Navbar />
      <style jsx global>
        {animationStyles}
      </style>
      <div className="min-h-screen bg-gray-100">
        {/* Header with search summary */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <EditSearch
            searchParams={searchParams}
            setShowSearchForm={setShowSearchForm}
            showSearchForm={showSearchForm}
            handleSearchModify={handleSearchModify}
          />
        </div>

        {apiData?.data?.length === 0 ? (
          <EmptyFlightResult searchParams={searchParams} />
        ) : (
          <>
            {/* Main content */}
            <div className="container mx-auto pb-8 pt-3 px-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Filters sidebar */}
                <div className="hidden md:block w-full md:w-1/4 sticky top-[72px]">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <FlightFilters
                      apiData={apiData}
                      filters={filters}
                      showAllAirlines={showAllAirlines}
                      setShowAllAirlines={setShowAllAirlines}
                      handleTransitChange={handleTransitChange}
                      handlePriceRangeChange={handlePriceRangeChange}
                      handlePriceRangeChangeComplete={
                        handlePriceRangeChangeComplete
                      }
                      handlePriceRangeChangeStart={handlePriceRangeChangeStart}
                      handleDepartureTimeChange={handleDepartureTimeChange}
                      handleDepartureTimeChangeComplete={
                        handleDepartureTimeChangeComplete
                      }
                      handleDepartureTimeChangeStart={
                        handleDepartureTimeChangeStart
                      }
                      handleArrivalTimeChange={handleArrivalTimeChange}
                      handleArrivalTimeChangeComplete={
                        handleArrivalTimeChangeComplete
                      }
                      handleArrivalTimeChangeStart={
                        handleArrivalTimeChangeStart
                      }
                      handleAirlineChange={handleAirlineChange}
                      clearAllFilters={clearAllFilters}
                      timeStringToHour={timeStringToHour}
                      formatTime={formatTime}
                      selectedCurrency={selectedCurrency}
                    />
                  </div>
                </div>

                {/* Flight results */}
                <div className="w-full md:w-3/4">
                  {/* Combined mobile filter button and tabs in one row */}
                  <div className="flex items-center justify-between mb-0 md:block">
                    {/* Tabs container - moved to left */}
                    <div className="rounded-lg mb-1 md:mb-4 tabs-container border-b bg-container inline-block w-fit">
                      <Tabs
                        value={sortOption}
                        className="rounded-md"
                        onValueChange={(value) => {
                          console.log('Tab changed to:', value);

                          // Set the flag to indicate direct tab change by user
                          directTabChangeRef.current = true;

                          // Update sort option first
                          setSortOption(value);

                          // Get cached data for the selected tab
                          if (value === 'cheapest' && cachedCheapestData) {
                            console.log(
                              'DIRECT TAB SWITCH: Using cheapest cache with',
                              cachedCheapestData.data.length,
                              'flights'
                            );

                            // Update the API data reference
                            setApiData(cachedCheapestData);

                            // Check if any filters are active
                            const hasActiveFilters =
                              filters.transit.direct ||
                              filters.transit.oneStop ||
                              filters.transit.twoStops ||
                              Object.values(filters.airlines).some(
                                (airline) => airline.checked
                              ) ||
                              (cachedCheapestData?.dictionaries?.priceRange &&
                                (filters.priceRange[0] !==
                                  cachedCheapestData.dictionaries.priceRange
                                    .min ||
                                  filters.priceRange[1] !==
                                    cachedCheapestData.dictionaries.priceRange
                                      .max)) ||
                              (cachedCheapestData?.dictionaries
                                ?.departureTimes &&
                                (filters.departureTime[0] !==
                                  timeStringToHour(
                                    cachedCheapestData.dictionaries
                                      .departureTimes.min
                                  ) ||
                                  filters.departureTime[1] !==
                                    timeStringToHour(
                                      cachedCheapestData.dictionaries
                                        .departureTimes.max
                                    ))) ||
                              (cachedCheapestData?.dictionaries?.arrivalTimes &&
                                (filters.arrivalTime[0] !==
                                  timeStringToHour(
                                    cachedCheapestData.dictionaries.arrivalTimes
                                      .min
                                  ) ||
                                  filters.arrivalTime[1] !==
                                    timeStringToHour(
                                      cachedCheapestData.dictionaries
                                        .arrivalTimes.max
                                    )));

                            if (hasActiveFilters) {
                              // Apply current filters to the data
                              handleApplyFilters();
                            } else {
                              // If no filters are active, show all flights
                              const flightsWithApiData =
                                cachedCheapestData.data.map((flight) => ({
                                  ...flight,
                                  __apiData: cachedCheapestData.data,
                                }));

                              setFlights(flightsWithApiData);
                              setFilteredFlights(flightsWithApiData);
                            }
                          } else if (
                            value === 'shortest' &&
                            cachedShortestData
                          ) {
                            console.log(
                              'DIRECT TAB SWITCH: Using shortest cache with',
                              cachedShortestData.data.length,
                              'flights'
                            );

                            // Update the API data reference
                            setApiData(cachedShortestData);

                            // Check if any filters are active
                            const hasActiveFilters =
                              filters.transit.direct ||
                              filters.transit.oneStop ||
                              filters.transit.twoStops ||
                              Object.values(filters.airlines).some(
                                (airline) => airline.checked
                              ) ||
                              (cachedShortestData?.dictionaries?.priceRange &&
                                (filters.priceRange[0] !==
                                  cachedShortestData.dictionaries.priceRange
                                    .min ||
                                  filters.priceRange[1] !==
                                    cachedShortestData.dictionaries.priceRange
                                      .max)) ||
                              (cachedShortestData?.dictionaries
                                ?.departureTimes &&
                                (filters.departureTime[0] !==
                                  timeStringToHour(
                                    cachedShortestData.dictionaries
                                      .departureTimes.min
                                  ) ||
                                  filters.departureTime[1] !==
                                    timeStringToHour(
                                      cachedShortestData.dictionaries
                                        .departureTimes.max
                                    ))) ||
                              (cachedShortestData?.dictionaries?.arrivalTimes &&
                                (filters.arrivalTime[0] !==
                                  timeStringToHour(
                                    cachedShortestData.dictionaries.arrivalTimes
                                      .min
                                  ) ||
                                  filters.arrivalTime[1] !==
                                    timeStringToHour(
                                      cachedShortestData.dictionaries
                                        .arrivalTimes.max
                                    )));

                            if (hasActiveFilters) {
                              // Apply current filters to the data
                              handleApplyFilters();
                            } else {
                              // If no filters are active, show all flights
                              const flightsWithApiData =
                                cachedShortestData.data.map((flight) => ({
                                  ...flight,
                                  __apiData: cachedShortestData.data,
                                }));

                              setFlights(flightsWithApiData);
                              setFilteredFlights(flightsWithApiData);
                            }
                          } else {
                            // No cache available
                            console.warn(
                              'No cached data available for tab:',
                              value
                            );
                          }
                        }}
                      >
                        {/* Desktop Tabs */}
                        <div className="hidden md:flex justify-start px-2 py-2">
                          <TabsList className="flex space-x-2 bg-transparent justify-start">
                            <TabsTrigger
                              value="recommended"
                              className="data-[state=active]:bg-[#0c0073] data-[state=active]:text-secondary  label-l2 rounded-sm  border border-[#0C0073] data-[state=active]:border-transparent "
                            >
                              Recommended
                            </TabsTrigger>
                            <div className="w-px h-6 bg-[#E5E5EA] "></div>
                            <TabsTrigger
                              value="cheapest"
                              className="data-[state=active]:bg-[#0c0073] data-[state=active]:text-secondary  label-l2 rounded-sm  border border-[#0C0073] data-[state=active]:border-transparent "
                            >
                              Cheapest
                            </TabsTrigger>
                            <div className="w-px h-6 bg-[#E5E5EA] "></div>
                            <TabsTrigger
                              value="shortest"
                              className="data-[state=active]:bg-[#0c0073] data-[state=active]:text-secondary  border border-[#0C0073] label-l2 rounded-sm  data-[state=active]:border-transparent"
                            >
                              Shortest
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Mobile Dropdown Menu */}
                        <div
                          ref={mobileMenuRef}
                          className="flex md:hidden justify-between items-center px-2 border border-[#0c0073] rounded-sm relative"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="text-primary flex items-center gap-2 w-full justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Menu className="h-5 w-5" />
                              <span className="label-l2">
                                {sortOption.charAt(0).toUpperCase() +
                                  sortOption.slice(1)}
                              </span>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isMobileMenuOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </Button>

                          {/* Dropdown Menu */}
                          {isMobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-container rounded-lg shadow-lg   overflow-hidden z-50">
                              <button
                                onClick={() => {
                                  setSortOption('recommended');
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-1 ${
                                  sortOption === 'recommended'
                                    ? 'bg-primary text-primary-on'
                                    : 'hover:bg-primary-on'
                                }`}
                              >
                                <span className="label-l2">Recommended</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSortOption('cheapest');
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 ${
                                  sortOption === 'cheapest'
                                    ? 'bg-[#0c0073] text-white'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <span className="label-l2">Cheapest</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSortOption('shortest');
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 ${
                                  sortOption === 'shortest'
                                    ? 'bg-[#0c0073] text-white'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <span className="label-l2">Shortest</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </Tabs>
                    </div>

                    {/* Filter button - moved to right */}
                    <div className="block md:hidden mb-1">
                      <MobileFilterHeader
                        onClick={() => setIsMobileFilterOpen(true)}
                        // resultsCount={filteredFlights.length}
                      />
                    </div>
                  </div>
                  <div className="flex align-center p-2 md:p-4 g-2 bg-container rounded-lg border border-[#0c0073] mb-3 overflow-visible md:mt-0 mt-2">
                    <div className="bg-primary flex items-center justify-center rounded-full px-3 py-3">
                      <FaCar color="white" size="24" />
                    </div>
                    <div className="ml-3">
                      <h5 className="label-l2 sm:text-[16px] font-bold text-background-on ">
                        From Airport to Valley, Stress-free
                      </h5>
                      <p className="text-[9px] sm:text-[12px] text-neutral-dark">
                        Reliable pickup & drop services in Kathmandu, Lalitpur,
                        and Bhaktapur. Pre-book your ride today.
                      </p>
                    </div>
                  </div>

                  {filteredFlights.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden">
                      {/* Top gradient accent */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-100 via-blue-900 to-blue-100"></div>

                      <h3 className="text-2xl font-bold mb-3 text-blue-950">
                        Sorry, No matching flights found.
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        We couldn't find any flights that match all your current
                        filter criteria. Try adjusting your filters to see more
                        options.
                      </p>

                      <Button
                        onClick={clearAllFilters}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-300"
                      >
                        Clear all filters
                      </Button>

                      <div className="mt-6 p-3 bg-gradient-to-br from-blue-100 to-white rounded-lg border border-blue-100 max-w-md w-full">
                        <p className="font-medium text-blue-900 mb-2 text-sm">
                          Try broadening your search:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-900 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4"
                              />
                            </svg>
                            <span className="ml-1.5 text-gray-700">
                              Select more airlines
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-900 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4"
                              />
                            </svg>
                            <span className="ml-1.5 text-gray-700">
                              Expand price range
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-900 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4"
                              />
                            </svg>
                            <span className="ml-1.5 text-gray-700">
                              Include more stops
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-900 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4"
                              />
                            </svg>
                            <span className="ml-1.5 text-gray-700">
                              Adjust time filters
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isClient &&
                        filteredFlights.map((flight, index) => {
                          console.log('flight in flights-results', flight);
                          const priceData = getDisplayPrice(flight, index);
                          const price = priceData.price;
                          const showBestValue = shouldShowBestValue(
                            flight,
                            index
                          );
                          console.log('price', price);
                          return (
                            <div
                              key={`${flight.id}-${index}-${activeTab}`}
                              className="bg-container rounded-lg border border-[#EEEEEE] overflow-visible duration-200 relative mb-8"
                            >
                              {/* Best Value Tag */}
                              {/* {showBestValue && (
                                <div className="absolute top-2 right-2 md:left-2 md:right-auto z-10">
                                  <div className="bg-gradient-to-r from-[#5143d9] to-[#0c0073] text-primary-on px-3 py-1 rounded-full label-l3 shadow-lg">
                                    <span className="flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      Best Value
                                    </span>
                                  </div>
                                </div>
                              )} */}
                              <div className="flex flex-col md:flex-row items-stretch min-h-[130px]">
                                {/* Left column for airline info - full width on mobile */}
                                <div className="px-0 pt-3 pb-0 w-full md:px-4 md:w-[150px] md:py-0">
                                  {/* Mobile view - airline display with name and logo */}
                                  <div className="flex flex-col md:mb-2 md:hidden px-1 md:px-0">
                                    <div className="flex items-center px-0">
                                      <img
                                        src={`https://pics.avs.io/200/40/${flight.itineraries[0].segments[0].carrierCode}.png`}
                                        alt={
                                          flight.itineraries[0].segments[0]
                                            .carrierCode
                                        }
                                        className="h-5 object-contain w-16"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            'https://via.placeholder.com/80x20?text=Airline';
                                        }}
                                      />
                                      <div className="ml-2 label-l3 text-background-on ">
                                        {(() => {
                                          const carrierCode =
                                            flight.itineraries[0].segments[0]
                                              .carrierCode;
                                          if (
                                            flight.dictionaries?.carriers &&
                                            flight.dictionaries.carriers[
                                              carrierCode
                                            ]
                                          ) {
                                            return flight.dictionaries.carriers[
                                              carrierCode
                                            ];
                                          } else if (
                                            apiData?.dictionaries?.airlines
                                          ) {
                                            const airline =
                                              apiData.dictionaries.airlines.find(
                                                (a) => a.code === carrierCode
                                              );
                                            return airline
                                              ? airline.name
                                              : carrierCode;
                                          }
                                          return carrierCode;
                                        })()}
                                      </div>
                                    </div>

                                    {flight.itineraries.length > 1 &&
                                      flight.itineraries[0].segments[0]
                                        .carrierCode !==
                                        flight.itineraries[1].segments[0]
                                          .carrierCode && (
                                        <div className="flex items-center mt-2 pt-2 border-t border-dashed px-0">
                                          <img
                                            src={`https://pics.avs.io/200/40/${flight.itineraries[1].segments[0].carrierCode}.png`}
                                            alt={
                                              flight.itineraries[1].segments[0]
                                                .carrierCode
                                            }
                                            className="h-5 object-contain w-16"
                                            onError={(e) => {
                                              e.currentTarget.src =
                                                'https://via.placeholder.com/80x20?text=Airline';
                                            }}
                                          />
                                          <div className="ml-2 label-l3 text-neutral-dark">
                                            {(() => {
                                              const carrierCode =
                                                flight.itineraries[1]
                                                  .segments[0].carrierCode;
                                              if (
                                                flight.dictionaries?.carriers &&
                                                flight.dictionaries.carriers[
                                                  carrierCode
                                                ]
                                              ) {
                                                return flight.dictionaries
                                                  .carriers[carrierCode];
                                              } else if (
                                                apiData?.dictionaries?.airlines
                                              ) {
                                                const airline =
                                                  apiData.dictionaries.airlines.find(
                                                    (a) =>
                                                      a.code === carrierCode
                                                  );
                                                return airline
                                                  ? airline.name
                                                  : carrierCode;
                                              }
                                              return carrierCode;
                                            })()}
                                          </div>
                                        </div>
                                      )}
                                  </div>

                                  {/* Desktop view - original layout */}
                                  <div
                                    className={`hidden md:flex md:flex-col md:items-center md:justify-center h-full py-7`}
                                  >
                                    <div className="flex flex-col items-center justify-center flex-1">
                                      <img
                                        src={`https://pics.avs.io/200/40/${flight.itineraries[0].segments[0].carrierCode}.png`}
                                        alt={
                                          flight.itineraries[0].segments[0]
                                            .carrierCode
                                        }
                                        className="h-6 object-contain w-24 mb-2"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            'https://via.placeholder.com/80x20?text=Airline';
                                        }}
                                      />
                                      <div className="label-l3 text-background-on text-center mb-1">
                                        {/* Full airline name from dictionary */}
                                        {(() => {
                                          const carrierCode =
                                            flight.itineraries[0].segments[0]
                                              .carrierCode;
                                          if (
                                            flight.dictionaries?.carriers &&
                                            flight.dictionaries.carriers[
                                              carrierCode
                                            ]
                                          ) {
                                            return flight.dictionaries.carriers[
                                              carrierCode
                                            ];
                                          } else if (
                                            apiData?.dictionaries?.airlines
                                          ) {
                                            const airline =
                                              apiData.dictionaries.airlines.find(
                                                (a) => a.code === carrierCode
                                              );
                                            return airline
                                              ? airline.name
                                              : carrierCode;
                                          }
                                          return carrierCode;
                                        })()}
                                      </div>
                                    </div>

                                    {/* Return flight airline info */}
                                    {flight.itineraries.length > 1 && (
                                      <>
                                        {/* <div className="border-t w-full my-2 border-dashed"></div> */}
                                        <div className="flex flex-col items-center justify-center flex-1">
                                          <img
                                            src={`https://pics.avs.io/200/40/${flight.itineraries[1].segments[0].carrierCode}.png`}
                                            alt={
                                              flight.itineraries[1].segments[0]
                                                .carrierCode
                                            }
                                            className="h-6 object-contain w-24 mb-2"
                                            onError={(e) => {
                                              e.currentTarget.src =
                                                'https://via.placeholder.com/80x20?text=Airline';
                                            }}
                                          />
                                          <div className="label-l3 text-background-on text-center">
                                            {/* Return airline name */}
                                            {(() => {
                                              const carrierCode =
                                                flight.itineraries[1]
                                                  .segments[0].carrierCode;
                                              if (
                                                flight.dictionaries?.carriers &&
                                                flight.dictionaries.carriers[
                                                  carrierCode
                                                ]
                                              ) {
                                                return flight.dictionaries
                                                  .carriers[carrierCode];
                                              } else if (
                                                apiData?.dictionaries?.airlines
                                              ) {
                                                const airline =
                                                  apiData.dictionaries.airlines.find(
                                                    (a) =>
                                                      a.code === carrierCode
                                                  );
                                                return airline
                                                  ? airline.name
                                                  : carrierCode;
                                              }
                                              return carrierCode;
                                            })()}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Center column with flight itineraries - stacked for round trips */}
                                <div className="w-full md:flex-1 flex flex-col items-center justify-center py-0 md:py-4 md:flex md:items-center md:self-center">
                                  {/* Itinerary 1: Outbound */}
                                  <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-3 md:pr-6 md:mb-1">
                                    {/* Flight details rendered as before */}
                                    {/* ... outbound flight details ... */}
                                    {/* Departure */}
                                    <div className="flex flex-col items-start justify-center">
                                      <div className="label-l3 text-neutral-dark">
                                        {format(
                                          new Date(
                                            flight.itineraries[0].segments[0].departure.at
                                          ),
                                          'dd MMM, EEE'
                                        )}
                                      </div>
                                      <div className="title-t3 text-background-on">
                                        {format(
                                          new Date(
                                            flight.itineraries[0].segments[0].departure.at
                                          ),
                                          'H:mm'
                                        )}
                                      </div>
                                      <div className="label-l3 text-neutral-dark">
                                        {
                                          flight.itineraries[0].segments[0]
                                            .departure.iataCode
                                        }
                                      </div>
                                    </div>

                                    {/* Duration and stops */}
                                    <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
                                      <div className="label-l3  text-neutral-dark mb-1 pl-1">
                                        {formatDuration(
                                          flight.itineraries[0].duration
                                        )}
                                      </div>
                                      <div className="flex items-center">
                                        <img
                                          src="/assets/plane-icon.svg"
                                          alt="Departure"
                                          className="w-6 h-6 label-l3  text-neutral-dark"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
                                          }}
                                        />

                                        {/* Flight path display */}
                                        <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
                                          {/* Horizontal line spanning full width */}
                                          <div className="w-full h-[1px] bg-gray-300 absolute"></div>

                                          {/* Transit points bubble - only if there are stops */}
                                          {flight.itineraries[0].segments
                                            .length > 1 && (
                                            <div className="mx-auto bg-white border border-gray-300 rounded-full px-3 py-1 z-10 label-l3  text-neutral-dark text-center whitespace-nowrap">
                                              {flight.itineraries[0].segments
                                                .slice(0, -1)
                                                .map((segment, idx) => (
                                                  <React.Fragment
                                                    key={`transit-${idx}`}
                                                  >
                                                    {segment.arrival.iataCode}
                                                    {idx <
                                                      flight.itineraries[0]
                                                        .segments.length -
                                                        2 && ', '}
                                                  </React.Fragment>
                                                ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                                      </div>

                                      <div className="flex  items-center mt-1">
                                        {/* Stops text */}
                                        <div className="label-l3  text-secondary-bright">
                                          {flight.itineraries[0].segments
                                            .length === 1
                                            ? 'Direct'
                                            : flight.itineraries[0].segments
                                                .length === 2
                                            ? '1 Stop'
                                            : `${
                                                flight.itineraries[0].segments
                                                  .length - 1
                                              } Stops`}
                                        </div>

                                        {/* Transit times */}
                                        {flight.itineraries[0].segments.length >
                                          1 && (
                                          <div className="label-l3 text-background-on mt-0.5 ml-1">
                                            {' ('}{' '}
                                            {flight.itineraries[0].segments.map(
                                              (segment, idx) => {
                                                if (
                                                  idx <
                                                  flight.itineraries[0].segments
                                                    .length -
                                                    1
                                                ) {
                                                  const nextSegment =
                                                    flight.itineraries[0]
                                                      .segments[idx + 1];
                                                  // Try to use transitTime from next segment first
                                                  if (nextSegment.transitTime) {
                                                    const matches =
                                                      nextSegment.transitTime.match(
                                                        /PT(\d+)H(\d+)M/
                                                      );
                                                    if (matches) {
                                                      const [_, hours, mins] =
                                                        matches;
                                                      return (
                                                        <span
                                                          key={`transit-time-${idx}`}
                                                          className="inline-block "
                                                        >
                                                          {idx > 0 && ', '}
                                                          {hours}h {mins}min
                                                        </span>
                                                      );
                                                    }
                                                  }

                                                  // Fallback to calculation if transitTime is not available or invalid
                                                  const transitTime =
                                                    Math.round(
                                                      (new Date(
                                                        nextSegment.departure.at
                                                      ).getTime() -
                                                        new Date(
                                                          segment.arrival.at
                                                        ).getTime()) /
                                                        (1000 * 60)
                                                    );
                                                  const hours = Math.floor(
                                                    transitTime / 60
                                                  );
                                                  const mins = transitTime % 60;
                                                  return (
                                                    <span
                                                      key={`transit-time-${idx}`}
                                                      className="inline-block "
                                                    >
                                                      {idx > 0 && ', '}
                                                      {hours}h {mins}min
                                                    </span>
                                                  );
                                                }
                                                return null;
                                              }
                                            )}
                                            {' )'}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="flex flex-col items-end justify-center">
                                      <div className="label-l3 text-neutral-dark">
                                        {format(
                                          new Date(
                                            flight.itineraries[0].segments[
                                              flight.itineraries[0].segments
                                                .length - 1
                                            ].arrival.at
                                          ),
                                          'dd MMM, EEE'
                                        )}
                                      </div>
                                      <div className="title-t3 text-background-on">
                                        {format(
                                          new Date(
                                            flight.itineraries[0].segments[
                                              flight.itineraries[0].segments
                                                .length - 1
                                            ].arrival.at
                                          ),
                                          'H:mm'
                                        )}
                                      </div>
                                      <div className="label-l3 text-neutral-dark">
                                        {
                                          flight.itineraries[0].segments[
                                            flight.itineraries[0].segments
                                              .length - 1
                                          ].arrival.iataCode
                                        }
                                      </div>
                                    </div>
                                  </div>

                                  {/* Itinerary 2: Return (only for round trips) */}
                                  {flight.itineraries.length > 1 && (
                                    <>
                                      {/* <div className="w-full flex justify-start px-6 mb-2">
                                        <div className="text-xs font-medium text-blue-950 border-t border-dashed pt-2 w-full">
                                          <span className="bg-blue-50 px-2 py-1 rounded">
                                            Return Flight
                                          </span>
                                        </div>
                                      </div> */}
                                      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-3 md:pr-6">
                                        {/* Remove airline logo section from here since we moved it to the left column */}

                                        {/* Departure */}
                                        <div className="flex flex-col items-start justify-center">
                                          <div className="label-l3 text-neutral-dark">
                                            {format(
                                              new Date(
                                                flight.itineraries[1].segments[0].departure.at
                                              ),
                                              'dd MMM, EEE'
                                            )}
                                          </div>
                                          <div className="title-t3 text-background-on">
                                            {format(
                                              new Date(
                                                flight.itineraries[1].segments[0].departure.at
                                              ),
                                              'H:mm'
                                            )}
                                          </div>
                                          <div className="label-l3 text-neutral-dark">
                                            {
                                              flight.itineraries[1].segments[0]
                                                .departure.iataCode
                                            }
                                          </div>
                                        </div>

                                        {/* Duration and stops */}
                                        <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
                                          <div className="label-l3 text-neutral-dark mb-1 pl-1">
                                            {formatDuration(
                                              flight.itineraries[1].duration
                                            )}
                                          </div>
                                          <div className="flex items-center">
                                            <img
                                              src="/assets/plane-icon.svg"
                                              alt="Departure"
                                              className="w-6 h-6 label-l3 text-neutral-dark"
                                              onError={(e) => {
                                                e.currentTarget.src =
                                                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
                                              }}
                                            />

                                            {/* Flight path display */}
                                            <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
                                              {/* Horizontal line spanning full width */}
                                              <div className="w-full h-[1px] bg-gray-300 absolute"></div>

                                              {/* Transit points bubble - only if there are stops */}
                                              {flight.itineraries[1].segments
                                                .length > 1 && (
                                                <div className="mx-auto bg-white border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
                                                  {flight.itineraries[1].segments
                                                    .slice(0, -1)
                                                    .map((segment, idx) => (
                                                      <React.Fragment
                                                        key={`return-transit-${idx}`}
                                                      >
                                                        {
                                                          segment.arrival
                                                            .iataCode
                                                        }
                                                        {idx <
                                                          flight.itineraries[1]
                                                            .segments.length -
                                                            2 && ', '}
                                                      </React.Fragment>
                                                    ))}
                                                </div>
                                              )}
                                            </div>

                                            <div className="w-4 h-4 rounded-full bg-primary"></div>
                                          </div>

                                          <div className="flex  items-center mt-1 ">
                                            {/* Stops text */}
                                            <div className="label-l3  text-secondary-bright ">
                                              {flight.itineraries[1].segments
                                                .length === 1
                                                ? 'Direct'
                                                : flight.itineraries[1].segments
                                                    .length === 2
                                                ? '1 Stop'
                                                : `${
                                                    flight.itineraries[1]
                                                      .segments.length - 1
                                                  } Stops`}
                                            </div>

                                            {/* Transit times */}
                                            {flight.itineraries[1].segments
                                              .length > 1 && (
                                              <div className="label-l3 text-background-on mt-0.5 ml-1">
                                                {' ('}{' '}
                                                {flight.itineraries[1].segments.map(
                                                  (segment, idx) => {
                                                    if (
                                                      idx <
                                                      flight.itineraries[1]
                                                        .segments.length -
                                                        1
                                                    ) {
                                                      const nextSegment =
                                                        flight.itineraries[1]
                                                          .segments[idx + 1];
                                                      // Try to use transitTime from next segment first
                                                      if (
                                                        nextSegment.transitTime
                                                      ) {
                                                        const matches =
                                                          nextSegment.transitTime.match(
                                                            /PT(\d+)H(\d+)M/
                                                          );
                                                        if (matches) {
                                                          const [
                                                            _,
                                                            hours,
                                                            mins,
                                                          ] = matches;
                                                          return (
                                                            <span
                                                              key={`return-transit-time-${idx}`}
                                                              className="inline-block"
                                                            >
                                                              {idx > 0 && ', '}
                                                              {hours}h {mins}min
                                                            </span>
                                                          );
                                                        }
                                                      }

                                                      // Fallback to calculation if transitTime is not available or invalid
                                                      const transitTime =
                                                        Math.round(
                                                          (new Date(
                                                            nextSegment.departure.at
                                                          ).getTime() -
                                                            new Date(
                                                              segment.arrival.at
                                                            ).getTime()) /
                                                            (1000 * 60)
                                                        );
                                                      const hours = Math.floor(
                                                        transitTime / 60
                                                      );
                                                      const mins =
                                                        transitTime % 60;
                                                      return (
                                                        <span
                                                          key={`return-transit-time-${idx}`}
                                                          className="inline-block"
                                                        >
                                                          {idx > 0 && ', '}
                                                          {hours}h {mins}min
                                                        </span>
                                                      );
                                                    }
                                                    return null;
                                                  }
                                                )}
                                                {' )'}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Arrival */}
                                        <div className="flex flex-col items-end justify-center">
                                          <div className="label-l3 text-neutral-dark">
                                            {format(
                                              new Date(
                                                flight.itineraries[1].segments[
                                                  flight.itineraries[1].segments
                                                    .length - 1
                                                ].arrival.at
                                              ),
                                              'dd MMM, EEE'
                                            )}
                                          </div>
                                          <div className="title-t3 text-background-on ">
                                            {format(
                                              new Date(
                                                flight.itineraries[1].segments[
                                                  flight.itineraries[1].segments
                                                    .length - 1
                                                ].arrival.at
                                              ),
                                              'H:mm'
                                            )}
                                          </div>
                                          <div className="label-l3 text-neutral-dark">
                                            {
                                              flight.itineraries[1].segments[
                                                flight.itineraries[1].segments
                                                  .length - 1
                                              ].arrival.iataCode
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Right column - Price and booking - full width on mobile */}
                                <div className="relative flex flex-col justify-center w-full md:min-w-[220px] md:w-[240px] md:mt-0 md:mt-0 py-3 md:py-0 border-t md:border-t-0">
                                  <div className="hidden md:block absolute top-0 bottom-0 left-0 w-[1px] bg-gray-200"></div>
                                  <div className="px-2 md:px-2  py-0 md:py-4 w-full">
                                    {/* Mobile view price display - price and discount together */}
                                    <div className="flex justify-between items-center mb-2 md:hidden">
                                      <div
                                        className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-left px-3 py-0 rounded-xl flex items-center"
                                        style={{
                                          boxShadow:
                                            '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
                                        }}
                                      >
                                        <Image
                                          src="/assets/icons/seatIcon.svg"
                                          width={12}
                                          height={12}
                                          alt="seatIcon"
                                          className="me-1 flex-shrink-0 my-auto"
                                        />
                                        <span className="inline-flex items-center">
                                          {(() => {
                                            let seatsAvailable;
                                            if (flight.totalSlotAvailable) {
                                              seatsAvailable =
                                                flight.totalSlotAvailable;
                                            } else if (
                                              flight.children &&
                                              flight.children[0]
                                                ?.totalSlotAvailable
                                            ) {
                                              seatsAvailable =
                                                flight.children[0]
                                                  .totalSlotAvailable;
                                            } else {
                                              seatsAvailable =
                                                flight.numberOfBookableSeats;
                                            }

                                            return seatsAvailable
                                              ? `${seatsAvailable} ${
                                                  seatsAvailable > 1
                                                    ? 'seats'
                                                    : 'seat'
                                                } left`
                                              : 'Limited seats available';
                                          })()}
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <div className="title-t3 text-primary text-right">
                                          {(() => {
                                            const displayPrice =
                                              getDisplayPrice(flight, index);
                                            const totalPassengers =
                                              getTotalPassengers();
                                            const totalPrice =
                                              displayPrice.price *
                                              totalPassengers;
                                            const totalOriginalPrice =
                                              displayPrice.originalPrice
                                                ? displayPrice.originalPrice *
                                                  totalPassengers
                                                : null;

                                            return displayPrice.originalPrice &&
                                              !flight.isGroupFare ? (
                                              <div className="flex items-center gap-2 justify-end">
                                                <span className="label-l2 text-primary">
                                                  Total:
                                                </span>
                                                <span className="text-primary">
                                                  {flight.price.currency}{' '}
                                                  {Math.floor(
                                                    displayPrice.price
                                                  )}
                                                </span>
                                                {totalOriginalPrice && (
                                                  <span className="label-l3 text-neutral-dark line-through">
                                                    {flight.price.currency}{' '}
                                                    {Math.floor(
                                                      displayPrice.originalPrice
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            ) : (
                                              <span>
                                                Total: {flight.price.currency}{' '}
                                                {Math.floor(
                                                  activeTab === 'recommended'
                                                    ? parseFloat(
                                                        getCheapestTotalPrice(
                                                          flight
                                                        )
                                                      )
                                                    : flight.isGroupFare
                                                    ? parseFloat(
                                                        flight.price.grandTotal
                                                      ) * totalPassengers
                                                    : shouldShowBestValue(
                                                        flight,
                                                        index
                                                      )
                                                    ? calculateFarePrice(
                                                        flight,
                                                        getBestMatchingFare(
                                                          flight
                                                        )
                                                      )
                                                    : parseFloat(
                                                        flight.price.grandTotal
                                                      )
                                                )}{' '}
                                              </span>
                                            );
                                          })()}
                                          {/* {priceData.originalPrice && (
                                            <div className="text-xs text-green-600 font-medium mt-1">
                                              {priceData.fare?.customLabel ||
                                                'Special Fare'}
                                            </div>
                                          )} */}
                                        </div>
                                        {activeTab !== 'recommended' && (
                                          <div className="flex flex-col items-end">
                                            {/* {getAdultPrice(flight) && (
                                              <div className="label-l2 text-primary ">
                                                {(() => {
                                                  const priceData =
                                                    getDisplayPrice(
                                                      flight,
                                                      index
                                                    );
                                                  return (
                                                    <>
                                                      {flight.price.currency}{' '}
                                                      {flight.isGroupFare
                                                        ? formatDisplayPrice(
                                                            parseFloat(
                                                              flight.price
                                                                .grandTotal
                                                            )
                                                          )
                                                        : activeTab ===
                                                            'recommended' &&
                                                          shouldShowBestValue(
                                                            flight,
                                                            index
                                                          )
                                                        ? formatDisplayPrice(
                                                            calculateFarePrice(
                                                              flight,
                                                              getBestMatchingFare(
                                                                flight
                                                              )
                                                            )
                                                          )
                                                        : priceData.originalPrice && (
                                                            <span className=" ml-1 ">
                                                              {formatDisplayPrice(
                                                                priceData.originalPrice
                                                              )}
                                                            </span>
                                                          )}
                                                      {!flight.isGroupFare &&
                                                        priceData.originalPrice && (
                                                          <span className="line-through ml-1 text-gray-400">
                                                            {formatDisplayPrice(
                                                              priceData.originalPrice
                                                            )}
                                                          </span>
                                                        )}
                                                      {'/'}
                                                      <span className="label-l3 text-primary">
                                                        per adult
                                                      </span>
                                                    </>
                                                  );
                                                })()}
                                              </div>
                                            )} */}
                                            {getAdultPrice(flight) &&
                                              activeTab !== 'recommended' && (
                                                <div className="label-l2 text-primary  mb-1 text-right">
                                                  {flight.price.currency}{' '}
                                                  {formatDisplayPrice(
                                                    getOriginalAdultPrice(
                                                      flight
                                                    )!
                                                  )}
                                                  {'/'}
                                                  <span className="label-l3 text-primary">
                                                    per adult
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Add baggage information for mobile view */}
                                    {activeTab !== 'recommended' && (
                                      <div className="flex flex-col items-start text-left space-y-1 mb-3 md:hidden">
                                        {/* Outbound Baggage */}
                                        <div className="flex items-center">
                                          <Image
                                            src="/assets/icons/baggageIcon.svg"
                                            width={12}
                                            height={12}
                                            alt="baggageIcon"
                                            className="me-1 flex-shrink-0"
                                          />

                                          <span className="label-l3 text-neutral-dark inline-flex items-center">
                                            {(() => {
                                              // Get outbound baggage info
                                              if (
                                                flight.travelerPricings &&
                                                flight.travelerPricings.length >
                                                  0 &&
                                                flight.itineraries.length > 0
                                              ) {
                                                const adultTraveler =
                                                  flight.travelerPricings.find(
                                                    (tp) =>
                                                      tp.travelerType ===
                                                      'ADULT'
                                                  );
                                                if (
                                                  adultTraveler?.fareDetailsBySegment &&
                                                  adultTraveler
                                                    .fareDetailsBySegment
                                                    .length > 0
                                                ) {
                                                  const firstSegment =
                                                    adultTraveler
                                                      .fareDetailsBySegment[0];

                                                  // Handle cabin bags (hand carry)
                                                  let cabinBagsDisplay = 'N/A'; // Default to N/A if no data
                                                  if (
                                                    firstSegment?.includedCabinBags !==
                                                    undefined
                                                  ) {
                                                    // Check if weight is provided directly
                                                    if (
                                                      'weight' in
                                                        firstSegment.includedCabinBags &&
                                                      firstSegment
                                                        .includedCabinBags
                                                        .weight !== undefined
                                                    ) {
                                                      const weight =
                                                        firstSegment
                                                          .includedCabinBags
                                                          .weight;
                                                      const weightUnit =
                                                        firstSegment
                                                          .includedCabinBags
                                                          .weightUnit || 'KG';
                                                      cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                    }
                                                    // Otherwise use quantity if available
                                                    else if (
                                                      'quantity' in
                                                        firstSegment.includedCabinBags &&
                                                      firstSegment
                                                        .includedCabinBags
                                                        .quantity !== undefined
                                                    ) {
                                                      const cabinQuantity =
                                                        firstSegment
                                                          .includedCabinBags
                                                          .quantity;
                                                      if (cabinQuantity === 0) {
                                                        cabinBagsDisplay =
                                                          '0 KG';
                                                      } else if (
                                                        cabinQuantity > 0
                                                      ) {
                                                        // Display as "7+7+..." for hand carry when quantity > 0
                                                        cabinBagsDisplay = `${Array(
                                                          cabinQuantity
                                                        )
                                                          .fill('7')
                                                          .join(' + ')} KG`;
                                                      }
                                                    }
                                                  }

                                                  // Handle checked bags
                                                  let checkedBagsDisplay = '';
                                                  if (
                                                    firstSegment?.includedCheckedBags
                                                  ) {
                                                    // If weight is specified directly
                                                    if (
                                                      'weight' in
                                                        firstSegment.includedCheckedBags &&
                                                      firstSegment
                                                        .includedCheckedBags
                                                        .weight !== undefined
                                                    ) {
                                                      const weight =
                                                        firstSegment
                                                          .includedCheckedBags
                                                          .weight;
                                                      const weightUnit =
                                                        firstSegment
                                                          .includedCheckedBags
                                                          .weightUnit || 'KG';
                                                      checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                    }
                                                    // If quantity is specified, display as 23+23+... KG
                                                    else if (
                                                      'quantity' in
                                                        firstSegment.includedCheckedBags &&
                                                      firstSegment
                                                        .includedCheckedBags
                                                        .quantity !== undefined
                                                    ) {
                                                      const quantity =
                                                        firstSegment
                                                          .includedCheckedBags
                                                          .quantity;
                                                      if (quantity > 0) {
                                                        checkedBagsDisplay = ` + ${Array(
                                                          quantity
                                                        )
                                                          .fill('23')
                                                          .join(' + ')} KG`;
                                                      }
                                                    }
                                                  }

                                                  return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                }
                                              }
                                              return 'Outbound Baggage: N/A';
                                            })()}
                                          </span>
                                        </div>
                                        {/* Return Baggage - only show if there's a return flight */}
                                        {flight.itineraries.length > 1 && (
                                          <div className="flex items-center">
                                            <Image
                                              src="/assets/icons/baggageIcon.svg"
                                              width={12}
                                              height={12}
                                              alt="baggageIcon"
                                              className="me-1 flex-shrink-0"
                                            />
                                            <span className="label-l3 text-neutral-dark inline-flex items-center">
                                              {(() => {
                                                // Get return baggage info if exists
                                                if (
                                                  flight.travelerPricings &&
                                                  flight.travelerPricings
                                                    .length > 0 &&
                                                  flight.itineraries.length > 1
                                                ) {
                                                  const adultTraveler =
                                                    flight.travelerPricings.find(
                                                      (tp) =>
                                                        tp.travelerType ===
                                                        'ADULT'
                                                    );
                                                  if (
                                                    adultTraveler?.fareDetailsBySegment &&
                                                    adultTraveler
                                                      .fareDetailsBySegment
                                                      .length > 1
                                                  ) {
                                                    // Try to find the right segment for the return flight
                                                    let returnSegment;

                                                    // Best approach: First check if segmentId matches number or id property
                                                    if (
                                                      flight.itineraries[1]
                                                        ?.segments[0]?.number
                                                    ) {
                                                      returnSegment =
                                                        adultTraveler.fareDetailsBySegment.find(
                                                          (segment) =>
                                                            segment.segmentId ===
                                                            flight
                                                              .itineraries[1]
                                                              .segments[0]
                                                              .number
                                                        );
                                                    }

                                                    // If no match found, try matching by position
                                                    if (!returnSegment) {
                                                      // Count outbound segments
                                                      const outboundSegmentsCount =
                                                        flight.itineraries[0]
                                                          .segments.length;

                                                      // If we have more fareDetailsBySegment than outbound segments,
                                                      // use the first one after the outbound segments
                                                      if (
                                                        adultTraveler
                                                          .fareDetailsBySegment
                                                          .length >
                                                        outboundSegmentsCount
                                                      ) {
                                                        returnSegment =
                                                          adultTraveler
                                                            .fareDetailsBySegment[
                                                            outboundSegmentsCount
                                                          ];
                                                      }
                                                      // Otherwise fall back to the default behavior (second segment)
                                                      else {
                                                        returnSegment =
                                                          adultTraveler
                                                            .fareDetailsBySegment[1];
                                                      }
                                                    }

                                                    // Handle cabin bags (hand carry)
                                                    let cabinBagsDisplay =
                                                      'N/A'; // Default to N/A if no data
                                                    if (
                                                      returnSegment?.includedCabinBags !==
                                                      undefined
                                                    ) {
                                                      // Check if weight is provided directly
                                                      if (
                                                        'weight' in
                                                          returnSegment.includedCabinBags &&
                                                        returnSegment
                                                          .includedCabinBags
                                                          .weight !== undefined
                                                      ) {
                                                        const weight =
                                                          returnSegment
                                                            .includedCabinBags
                                                            .weight;
                                                        const weightUnit =
                                                          returnSegment
                                                            .includedCabinBags
                                                            .weightUnit || 'KG';
                                                        cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                      }
                                                      // Otherwise use quantity if available
                                                      else if (
                                                        'quantity' in
                                                          returnSegment.includedCabinBags &&
                                                        returnSegment
                                                          .includedCabinBags
                                                          .quantity !==
                                                          undefined
                                                      ) {
                                                        const cabinQuantity =
                                                          returnSegment
                                                            .includedCabinBags
                                                            .quantity;
                                                        if (
                                                          cabinQuantity === 0
                                                        ) {
                                                          cabinBagsDisplay =
                                                            '0 KG';
                                                        } else if (
                                                          cabinQuantity > 0
                                                        ) {
                                                          // Display as "7+7+..." for hand carry
                                                          cabinBagsDisplay = `${Array(
                                                            cabinQuantity
                                                          )
                                                            .fill('7')
                                                            .join(' + ')} KG`;
                                                        }
                                                      }
                                                    }

                                                    // Return checked bags
                                                    let checkedBagsDisplay = '';
                                                    if (
                                                      returnSegment?.includedCheckedBags
                                                    ) {
                                                      // If weight is specified directly
                                                      if (
                                                        'weight' in
                                                          returnSegment.includedCheckedBags &&
                                                        returnSegment
                                                          .includedCheckedBags
                                                          .weight !== undefined
                                                      ) {
                                                        const weight =
                                                          returnSegment
                                                            .includedCheckedBags
                                                            .weight;
                                                        const weightUnit =
                                                          returnSegment
                                                            .includedCheckedBags
                                                            .weightUnit || 'KG';
                                                        checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                      }
                                                      // If quantity is specified, display as 23+23+... KG
                                                      else if (
                                                        'quantity' in
                                                          returnSegment.includedCheckedBags &&
                                                        returnSegment
                                                          .includedCheckedBags
                                                          .quantity !==
                                                          undefined
                                                      ) {
                                                        const quantity =
                                                          returnSegment
                                                            .includedCheckedBags
                                                            .quantity;
                                                        if (quantity > 0) {
                                                          checkedBagsDisplay = ` + ${Array(
                                                            quantity
                                                          )
                                                            .fill('23')
                                                            .join(' + ')} KG`;
                                                        }
                                                      }
                                                    }

                                                    return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                  }
                                                }
                                                return 'Return Baggage: N/A';
                                              })()}
                                            </span>
                                          </div>
                                        )}

                                        {/* Add refundable status for mobile view */}
                                        {/* <div className="flex flex-col items-start text-left space-y-1 mt-2 mb-2 md:hidden">
                                          {(() => {
                                            if (!flight.fareRules?.rules) {
                                              return (
                                                <span className="label-l3 text-error flex items-center gap-1">
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
                                                    <circle
                                                      cx="12"
                                                      cy="12"
                                                      r="10"
                                                    />
                                                    <line
                                                      x1="15"
                                                      y1="9"
                                                      x2="9"
                                                      y2="15"
                                                    />
                                                    <line
                                                      x1="9"
                                                      y1="9"
                                                      x2="15"
                                                      y2="15"
                                                    />
                                                  </svg>
                                                  Non-refundable
                                                </span>
                                              );
                                            }

                                            const refundRule =
                                              flight.fareRules.rules.find(
                                                (rule) =>
                                                  rule.category === 'REFUND'
                                              );

                                            if (
                                              !refundRule ||
                                              refundRule.notApplicable
                                            ) {
                                              return (
                                                <span className="label-l3 text-error flex items-center gap-1">
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
                                                    <circle
                                                      cx="12"
                                                      cy="12"
                                                      r="10"
                                                    />
                                                    <line
                                                      x1="15"
                                                      y1="9"
                                                      x2="9"
                                                      y2="15"
                                                    />
                                                    <line
                                                      x1="9"
                                                      y1="9"
                                                      x2="15"
                                                      y2="15"
                                                    />
                                                  </svg>
                                                  Non-refundable
                                                </span>
                                              );
                                            }

                                            return (
                                              <span className="label-l3 text-green-600 flex items-center gap-1">
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
                                                  <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                  />
                                                  <path d="M8 12l2 2 4-4" />
                                                </svg>
                                                Refundable
                                              </span>
                                            );
                                          })()}
                                        </div> */}
                                      </div>
                                    )}

                                    {/* Desktop view price display - original format */}
                                    <div className="hidden md:flex flex-col w-full">
                                      <div className="flex flex-col items-end w-full">
                                        <div
                                          className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex  justify-end"
                                          style={{
                                            boxShadow:
                                              '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
                                          }}
                                        >
                                          <Image
                                            src="/assets/icons/seatIcon.svg"
                                            width={12}
                                            height={12}
                                            alt="seatIcon"
                                            className="me-1 flex-shrink-0 my-auto"
                                          />
                                          <span className="inline-flex items-center">
                                            {(() => {
                                              let seatsAvailable;
                                              if (flight.totalSlotAvailable) {
                                                seatsAvailable =
                                                  flight.totalSlotAvailable;
                                              } else if (
                                                flight.children &&
                                                flight.children[0]
                                                  ?.totalSlotAvailable
                                              ) {
                                                seatsAvailable =
                                                  flight.children[0]
                                                    .totalSlotAvailable;
                                              } else {
                                                seatsAvailable =
                                                  flight.numberOfBookableSeats;
                                              }

                                              return seatsAvailable
                                                ? `${seatsAvailable} ${
                                                    seatsAvailable > 1
                                                      ? 'seats'
                                                      : 'seat'
                                                  } left`
                                                : 'No seats left';
                                            })()}
                                          </span>
                                        </div>
                                        <div className="mb-1 text-right">
                                          {priceData.originalPrice &&
                                          !flight.isGroupFare ? (
                                            <div className="flex items-center gap-2 justify-end">
                                              <span>Total:</span>
                                              <span>
                                                {flight.price.currency}{' '}
                                                {getBestTotalPrice(flight)}
                                              </span>

                                              <span className="label-l3 text-neutral-dark line-through">
                                                {flight.price.currency}{' '}
                                                {Math.floor(
                                                  priceData.originalPrice
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            // <span>
                                            //   Total: {flight.price.currency}{' '}
                                            //   {Math.floor(price)}
                                            // </span>
                                            <span>
                                              Total: {flight.price.currency}{' '}
                                              {Math.floor(
                                                activeTab === 'recommended'
                                                  ? parseFloat(
                                                      getCheapestTotalPrice(
                                                        flight
                                                      )
                                                    )
                                                  : flight.isGroupFare
                                                  ? parseFloat(
                                                      flight.price.grandTotal
                                                    ) * getTotalPassengers()
                                                  : shouldShowBestValue(
                                                      flight,
                                                      index
                                                    )
                                                  ? calculateFarePrice(
                                                      flight,
                                                      getBestMatchingFare(
                                                        flight
                                                      )
                                                    )
                                                  : parseFloat(
                                                      flight.price.grandTotal
                                                    )
                                              )}{' '}
                                            </span>
                                          )}
                                        </div>
                                        {getAdultPrice(flight) &&
                                          activeTab !== 'recommended' && (
                                            <div className="label-l2 text-primary  mb-1 text-right">
                                              {flight.price.currency}{' '}
                                              {formatDisplayPrice(
                                                getOriginalAdultPrice(flight)!
                                              )}
                                              {'/'}
                                              <span className="label-l3 text-primary">
                                                per adult
                                              </span>
                                            </div>
                                          )}
                                      </div>

                                      <div className="flex flex-col items-start text-left space-y-1 mb-3">
                                        {/* Outbound Baggage */}
                                        {activeTab !== 'recommended' && (
                                          <div className="flex items-start w-full">
                                            <Image
                                              src="/assets/icons/baggageIcon.svg"
                                              width={12}
                                              height={12}
                                              alt="baggageIcon"
                                              className="me-1 flex-shrink-0"
                                            />
                                            <span className="label-l3 text-neutral-dark inline-flex items-start">
                                              {(() => {
                                                // Get outbound baggage info
                                                if (
                                                  flight.travelerPricings &&
                                                  flight.travelerPricings
                                                    .length > 0 &&
                                                  flight.itineraries.length > 0
                                                ) {
                                                  const adultTraveler =
                                                    flight.travelerPricings.find(
                                                      (tp) =>
                                                        tp.travelerType ===
                                                        'ADULT'
                                                    );
                                                  if (
                                                    adultTraveler?.fareDetailsBySegment &&
                                                    adultTraveler
                                                      .fareDetailsBySegment
                                                      .length > 0
                                                  ) {
                                                    const firstSegment =
                                                      adultTraveler
                                                        .fareDetailsBySegment[0];

                                                    // Handle cabin bags (hand carry)
                                                    let cabinBagsDisplay =
                                                      'N/A'; // Default to N/A if no data
                                                    if (
                                                      firstSegment?.includedCabinBags !==
                                                      undefined
                                                    ) {
                                                      // Check if weight is provided directly
                                                      if (
                                                        'weight' in
                                                          firstSegment.includedCabinBags &&
                                                        firstSegment
                                                          .includedCabinBags
                                                          .weight !== undefined
                                                      ) {
                                                        const weight =
                                                          firstSegment
                                                            .includedCabinBags
                                                            .weight;
                                                        const weightUnit =
                                                          firstSegment
                                                            .includedCabinBags
                                                            .weightUnit || 'KG';
                                                        cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                      }
                                                      // Otherwise use quantity if available
                                                      else if (
                                                        'quantity' in
                                                          firstSegment.includedCabinBags &&
                                                        firstSegment
                                                          .includedCabinBags
                                                          .quantity !==
                                                          undefined
                                                      ) {
                                                        const cabinQuantity =
                                                          firstSegment
                                                            .includedCabinBags
                                                            .quantity;
                                                        if (
                                                          cabinQuantity === 0
                                                        ) {
                                                          cabinBagsDisplay =
                                                            '0 KG';
                                                        } else if (
                                                          cabinQuantity > 0
                                                        ) {
                                                          // Display as "7+7+..." for hand carry when quantity > 0
                                                          cabinBagsDisplay = `${Array(
                                                            cabinQuantity
                                                          )
                                                            .fill('7')
                                                            .join(' + ')} KG`;
                                                        }
                                                      }
                                                    }

                                                    // Outbound checked bags
                                                    // Handle checked bags
                                                    let checkedBagsDisplay = '';
                                                    if (
                                                      firstSegment?.includedCheckedBags
                                                    ) {
                                                      // If weight is specified directly
                                                      if (
                                                        'weight' in
                                                          firstSegment.includedCheckedBags &&
                                                        firstSegment
                                                          .includedCheckedBags
                                                          .weight !== undefined
                                                      ) {
                                                        const weight =
                                                          firstSegment
                                                            .includedCheckedBags
                                                            .weight;
                                                        const weightUnit =
                                                          firstSegment
                                                            .includedCheckedBags
                                                            .weightUnit || 'KG';
                                                        checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                      }
                                                      // If quantity is specified, display as 23+23+... KG
                                                      else if (
                                                        'quantity' in
                                                          firstSegment.includedCheckedBags &&
                                                        firstSegment
                                                          .includedCheckedBags
                                                          .quantity !==
                                                          undefined
                                                      ) {
                                                        const quantity =
                                                          firstSegment
                                                            .includedCheckedBags
                                                            .quantity;
                                                        if (quantity > 0) {
                                                          checkedBagsDisplay = ` + ${Array(
                                                            quantity
                                                          )
                                                            .fill('23')
                                                            .join(' + ')} KG`;
                                                        }
                                                      }
                                                    }

                                                    return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                  }
                                                }
                                                return 'Outbound Baggage: N/A';
                                              })()}
                                            </span>
                                          </div>
                                        )}

                                        {/* Return Baggage - only show if there's a return flight */}
                                        {flight.itineraries.length > 1 &&
                                          activeTab !== 'recommended' && (
                                            <div className="flex items-start w-full">
                                              <Image
                                                src="/assets/icons/baggageIcon.svg"
                                                width={12}
                                                height={12}
                                                alt="baggageIcon"
                                                className="me-1 flex-shrink-0"
                                              />
                                              <span className="label-l3 text-neutral-dark inline-flex items-start">
                                                {(() => {
                                                  // Get return baggage info if exists
                                                  if (
                                                    flight.travelerPricings &&
                                                    flight.travelerPricings
                                                      .length > 0 &&
                                                    flight.itineraries.length >
                                                      1
                                                  ) {
                                                    const adultTraveler =
                                                      flight.travelerPricings.find(
                                                        (tp) =>
                                                          tp.travelerType ===
                                                          'ADULT'
                                                      );
                                                    if (
                                                      adultTraveler?.fareDetailsBySegment &&
                                                      adultTraveler
                                                        .fareDetailsBySegment
                                                        .length > 1
                                                    ) {
                                                      // Try to find the right segment for the return flight
                                                      let returnSegment;

                                                      // Best approach: First check if segmentId matches number or id property
                                                      if (
                                                        flight.itineraries[1]
                                                          ?.segments[0]?.number
                                                      ) {
                                                        returnSegment =
                                                          adultTraveler.fareDetailsBySegment.find(
                                                            (segment) =>
                                                              segment.segmentId ===
                                                              flight
                                                                .itineraries[1]
                                                                .segments[0]
                                                                .number
                                                          );
                                                      }

                                                      // If no match found, try matching by position
                                                      if (!returnSegment) {
                                                        // Count outbound segments
                                                        const outboundSegmentsCount =
                                                          flight.itineraries[0]
                                                            .segments.length;

                                                        // If we have more fareDetailsBySegment than outbound segments,
                                                        // use the first one after the outbound segments
                                                        if (
                                                          adultTraveler
                                                            .fareDetailsBySegment
                                                            .length >
                                                          outboundSegmentsCount
                                                        ) {
                                                          returnSegment =
                                                            adultTraveler
                                                              .fareDetailsBySegment[
                                                              outboundSegmentsCount
                                                            ];
                                                        }
                                                        // Otherwise fall back to the default behavior (second segment)
                                                        else {
                                                          returnSegment =
                                                            adultTraveler
                                                              .fareDetailsBySegment[1];
                                                        }
                                                      }

                                                      // Handle cabin bags (hand carry)
                                                      let cabinBagsDisplay =
                                                        'N/A'; // Default to N/A if no data
                                                      if (
                                                        returnSegment?.includedCabinBags !==
                                                        undefined
                                                      ) {
                                                        // Check if weight is provided directly
                                                        if (
                                                          'weight' in
                                                            returnSegment.includedCabinBags &&
                                                          returnSegment
                                                            .includedCabinBags
                                                            .weight !==
                                                            undefined
                                                        ) {
                                                          const weight =
                                                            returnSegment
                                                              .includedCabinBags
                                                              .weight;
                                                          const weightUnit =
                                                            returnSegment
                                                              .includedCabinBags
                                                              .weightUnit ||
                                                            'KG';
                                                          cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                        }
                                                        // Otherwise use quantity if available
                                                        else if (
                                                          'quantity' in
                                                            returnSegment.includedCabinBags &&
                                                          returnSegment
                                                            .includedCabinBags
                                                            .quantity !==
                                                            undefined
                                                        ) {
                                                          const cabinQuantity =
                                                            returnSegment
                                                              .includedCabinBags
                                                              .quantity;
                                                          if (
                                                            cabinQuantity === 0
                                                          ) {
                                                            cabinBagsDisplay =
                                                              '0 KG';
                                                          } else if (
                                                            cabinQuantity > 0
                                                          ) {
                                                            // Display as "7+7+..." for hand carry
                                                            cabinBagsDisplay = `${Array(
                                                              cabinQuantity
                                                            )
                                                              .fill('7')
                                                              .join(' + ')} KG`;
                                                          }
                                                        }
                                                      }

                                                      // Return checked bags
                                                      // Handle checked bags
                                                      let checkedBagsDisplay =
                                                        '';
                                                      if (
                                                        returnSegment?.includedCheckedBags
                                                      ) {
                                                        // If weight is specified directly
                                                        if (
                                                          'weight' in
                                                            returnSegment.includedCheckedBags &&
                                                          returnSegment
                                                            .includedCheckedBags
                                                            .weight !==
                                                            undefined
                                                        ) {
                                                          const weight =
                                                            returnSegment
                                                              .includedCheckedBags
                                                              .weight;
                                                          const weightUnit =
                                                            returnSegment
                                                              .includedCheckedBags
                                                              .weightUnit ||
                                                            'KG';
                                                          checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                        }
                                                        // If quantity is specified, display as 23+23+... KG
                                                        else if (
                                                          'quantity' in
                                                            returnSegment.includedCheckedBags &&
                                                          returnSegment
                                                            .includedCheckedBags
                                                            .quantity !==
                                                            undefined
                                                        ) {
                                                          const quantity =
                                                            returnSegment
                                                              .includedCheckedBags
                                                              .quantity;
                                                          if (quantity > 0) {
                                                            checkedBagsDisplay = ` + ${Array(
                                                              quantity
                                                            )
                                                              .fill('23')
                                                              .join(' + ')} KG`;
                                                          }
                                                        }
                                                      }

                                                      return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                    }
                                                  }
                                                  return 'Return Baggage: N/A';
                                                })()}
                                              </span>
                                            </div>
                                          )}
                                        {/* <div className="flex flex-col gap-2 items-start w-full">
                                          {(() => {
                                            if (!flight.fareRules?.rules) {
                                              return (
                                                <span className="label-l3 text-red-600 flex items-center gap-1">
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
                                                    <circle
                                                      cx="12"
                                                      cy="12"
                                                      r="10"
                                                    />
                                                    <line
                                                      x1="15"
                                                      y1="9"
                                                      x2="9"
                                                      y2="15"
                                                    />
                                                    <line
                                                      x1="9"
                                                      y1="9"
                                                      x2="15"
                                                      y2="15"
                                                    />
                                                  </svg>
                                                  Non-refundable
                                                </span>
                                              );
                                            }

                                            const refundRule =
                                              flight.fareRules.rules.find(
                                                (rule) =>
                                                  rule.category === 'REFUND'
                                              );

                                            if (
                                              !refundRule ||
                                              refundRule.notApplicable
                                            ) {
                                              return (
                                                <span className="label-l3 text-error flex items-center gap-1">
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
                                                    <circle
                                                      cx="12"
                                                      cy="12"
                                                      r="10"
                                                    />
                                                    <line
                                                      x1="15"
                                                      y1="9"
                                                      x2="9"
                                                      y2="15"
                                                    />
                                                    <line
                                                      x1="9"
                                                      y1="9"
                                                      x2="15"
                                                      y2="15"
                                                    />
                                                  </svg>
                                                  Non-refundable
                                                </span>
                                              );
                                            }

                                            return (
                                              <span className="label-l3 text-green-600 flex items-center gap-1">
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
                                                  <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                  />
                                                  <path d="M8 12l2 2 4-4" />
                                                </svg>
                                                Refundable
                                              </span>
                                            );
                                          })()}
                                        </div> */}
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      className="w-full flex-1 bg-primary text-primary-on hover:bg-[#5143d9]"
                                      onClick={async () => {
                                        const newDrawerId =
                                          flight.id === openDrawerId
                                            ? null
                                            : flight.id;
                                        setOpenDrawerId(newDrawerId);
                                        setSelectedFlight(flight);
                                        // Only fetch branded fares when opening drawer (cache will handle duplicates)
                                        if (newDrawerId) {
                                          // Don't clear branded fares data - let cache handle it
                                          await fetchBrandedFaresUpsell(flight);
                                        }
                                      }}
                                    >
                                      <span className="flex items-center text-primary-on">
                                        Select
                                        <ChevronDown
                                          className={`ml-1 h-4 w-4 transition-transform text-primary-on ${
                                            openDrawerId === flight.id
                                              ? 'rotate-180'
                                              : ''
                                          }`}
                                        />
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {/* Desktop View - Show fare options for all tabs */}
                              {openDrawerId === flight.id && (
                                <div className="hidden md:block border-t border-[#EEEEEE] bg-white">
                                  <div className="p-4">
                                    {/* Fare Options */}
                                    <div className="relative">
                                      {/* Left Navigation Button */}
                                      {brandedFaresData &&
                                        brandedFaresData.length > 2 && (
                                          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                                            <button
                                              onClick={() => {
                                                const container =
                                                  document.getElementById(
                                                    'fare-options-container'
                                                  );
                                                if (container) {
                                                  container.scrollLeft -= 320;
                                                }
                                              }}
                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                              aria-label="Previous options"
                                            >
                                              <ChevronLeft className="h-6 w-6 text-gray-600" />
                                            </button>
                                          </div>
                                        )}
                                      {/* Right Navigation Button */}
                                      {brandedFaresData &&
                                        brandedFaresData.length > 2 && (
                                          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                                            <button
                                              onClick={() => {
                                                const container =
                                                  document.getElementById(
                                                    'fare-options-container'
                                                  );
                                                if (container) {
                                                  container.scrollLeft += 320;
                                                }
                                              }}
                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                              aria-label="Next options"
                                            >
                                              <ChevronRight className="h-6 w-6 text-gray-600" />
                                            </button>
                                          </div>
                                        )}
                                      <div
                                        id="fare-options-container"
                                        className="flex space-x-4 overflow-x-auto md:scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden scrollbar-none"
                                      >
                                        <div className="flex space-x-4 min-w-min">
                                          {/* Sort and render fares by price */}
                                          {[
                                            { type: 'main', offer: flight },
                                            ...(flight.children?.map(
                                              (child) => ({
                                                type: 'child',
                                                offer: child,
                                              })
                                            ) || []),
                                          ]
                                            .sort(
                                              (a, b) =>
                                                getAdjustedPrice(a) -
                                                getAdjustedPrice(b)
                                            )
                                            .map((fareOption, index) => (
                                              <div
                                                key={
                                                  fareOption.type === 'main'
                                                    ? 'main-fare'
                                                    : `child-fare-${index}`
                                                }
                                                className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full"
                                              >
                                                {/* Header */}
                                                <div className="mb-4">
                                                  <div className="flex items-center justify-between gap-2 mb-1">
                                                    {' '}
                                                    <h3 className="label-l2 text-neutral-dark mb-1">
                                                      {
                                                        searchParams?.travelClass
                                                      }{' '}
                                                      Class
                                                    </h3>
                                                    {fareOption.offer
                                                      .customLabel && (
                                                      <span className="px-2 py-0.5 bg-gradient-to-r from-[#0c0073] to-[#5143d9] text-primary-on  rounded-full text-[11px] ">
                                                        {
                                                          fareOption.offer
                                                            .customLabel
                                                        }
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="title-t2 font-bold text-[#14104B]">
                                                    AUD{' '}
                                                    {fareOption.type ===
                                                      'child' ||
                                                    fareOption.offer.isGroupFare
                                                      ? getAdjustedPrice(
                                                          fareOption
                                                        ).toFixed(2)
                                                      : activeTab ===
                                                          'recommended' &&
                                                        shouldShowBestValue(
                                                          fareOption.offer,
                                                          index
                                                        )
                                                      ? calculateFarePrice(
                                                          fareOption.offer,
                                                          getBestMatchingFare(
                                                            fareOption.offer
                                                          )
                                                        ).toFixed(2)
                                                      : fareOption.offer.price
                                                          .grandTotal}
                                                  </p>
                                                </div>

                                                {/* Features List */}
                                                <div className="space-y-3 label-l2 text-background-on">
                                                  {/* Cabin Baggage */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span>
                                                        {fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span>
                                                      Cabin baggage:{' '}
                                                      {formatBaggageInfo(
                                                        fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags
                                                      )}
                                                    </span>
                                                  </div>

                                                  {/* Checked Baggage */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span className="label-l3">
                                                        {fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span>
                                                      Checked baggage:{' '}
                                                      {formatBaggageInfo(
                                                        fareOption.offer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags
                                                      )}
                                                    </span>
                                                  </div>

                                                  {/* Flight Changes */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        !fareOption.offer.fareRules?.rules?.find(
                                                          (rule) =>
                                                            rule.category ===
                                                            'EXCHANGE'
                                                        )?.notApplicable
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span>
                                                        {!fareOption.offer.fareRules?.rules?.find(
                                                          (rule) =>
                                                            rule.category ===
                                                            'EXCHANGE'
                                                        )?.notApplicable ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span>
                                                      Flight changes allowed{' '}
                                                      {!fareOption.offer.fareRules?.rules?.find(
                                                        (rule) =>
                                                          rule.category ===
                                                          'EXCHANGE'
                                                      )?.notApplicable &&
                                                      fareOption.offer.fareRules?.rules?.find(
                                                        (rule) =>
                                                          rule.category ===
                                                          'EXCHANGE'
                                                      )?.maxPenaltyAmount
                                                        ? `(Fee: AUD ${
                                                            fareOption.offer.fareRules?.rules?.find(
                                                              (rule) =>
                                                                rule.category ===
                                                                'EXCHANGE'
                                                            )?.maxPenaltyAmount
                                                          })`
                                                        : ''}
                                                    </span>
                                                  </div>

                                                  {/* Refund Status */}
                                                  <div className="flex items-center gap-2">
                                                    {(() => {
                                                      // Use consistent logic with main card
                                                      const hasRefundRules =
                                                        fareOption.offer
                                                          .fareRules?.rules;
                                                      let isRefundable = false;

                                                      if (hasRefundRules) {
                                                        const refundRule =
                                                          hasRefundRules.find(
                                                            (rule) =>
                                                              rule.category ===
                                                              'REFUND'
                                                          );
                                                        isRefundable = !!(
                                                          refundRule &&
                                                          !refundRule.notApplicable
                                                        );
                                                      }

                                                      // For main card flight, add indicator
                                                      const isMainCard =
                                                        fareOption.type ===
                                                        'main';

                                                      return (
                                                        <>
                                                          <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                              isRefundable
                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                : 'bg-[#EF4444] text-primary-on'
                                                            }`}
                                                          >
                                                            <span>
                                                              {isRefundable ? (
                                                                <IoMdCheckmark />
                                                              ) : (
                                                                '×'
                                                              )}
                                                            </span>
                                                          </div>
                                                          <span>
                                                            {isRefundable
                                                              ? 'Refundable'
                                                              : 'Non-refundable'}
                                                            {/* {isMainCard &&
                                                              ' (Main)'} */}
                                                          </span>
                                                        </>
                                                      );
                                                    })()}
                                                  </div>
                                                </div>

                                                {/* Select Button */}
                                                <div className="mt-auto pt-4">
                                                  <button
                                                    onClick={() => {
                                                      handleFlightSelect(
                                                        fareOption.offer,
                                                        fareOption.type ===
                                                          'child'
                                                      );
                                                      setOpenDrawerId(null);
                                                    }}
                                                    className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                  >
                                                    Book Now{' '}
                                                  </button>
                                                </div>
                                              </div>
                                            ))}

                                          {/* Add Branded Fares at the end */}
                                          {isLoadingBrandedFares ? (
                                            <div className="flex justify-center items-center py-12 w-[300px]">
                                              <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                                                <span className="text-sm text-gray-600">
                                                  Loading more options...
                                                </span>
                                              </div>
                                            </div>
                                          ) : (
                                            brandedFaresData.map(
                                              (fareOffer, fareIdx) => {
                                                // Apply standard fare deduction only if cabin class matches
                                                const matchingFare =
                                                  getBestMatchingFare(
                                                    fareOffer
                                                  );
                                                const cabinMatches =
                                                  doesBrandedFareCabinMatch(
                                                    fareOffer
                                                  );
                                                const farePrice =
                                                  matchingFare && cabinMatches
                                                    ? calculateFarePrice(
                                                        fareOffer,
                                                        matchingFare
                                                      )
                                                    : parseFloat(
                                                        fareOffer.price
                                                          .grandTotal
                                                      );
                                                return (
                                                  <div
                                                    key={`branded-fare-${fareIdx}`}
                                                    className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full"
                                                  >
                                                    {/* Header */}
                                                    <div className="mb-4">
                                                      <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h3 className="label-l2 text-neutral-dark mb-1">
                                                          {fareOffer
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.cabin ||
                                                            'ECONOMY'}{' '}
                                                          Class
                                                        </h3>
                                                      </div>
                                                      <div className="title-t2 font-bold text-[#14104B]">
                                                        {
                                                          fareOffer.price
                                                            .currency
                                                        }{' '}
                                                        {Math.floor(farePrice)}
                                                      </div>
                                                    </div>

                                                    {/* Features List */}
                                                    <div className="space-y-3 label-l2 text-background-on mb-4">
                                                      {/* Cabin Baggage */}
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full flex items-center justify-center px-1 bg-[#22C55E] text-primary-on">
                                                          <span className="text-xs">
                                                            <IoMdCheckmark />
                                                          </span>
                                                        </div>
                                                        <span className="text-sm">
                                                          Cabin baggage:{' '}
                                                          {formatBrandedFareCabinBaggageInfo(
                                                            fareOffer
                                                              .travelerPricings?.[0]
                                                              ?.fareDetailsBySegment?.[0]
                                                              ?.includedCabinBags
                                                          )}
                                                        </span>
                                                      </div>

                                                      {/* Checked Baggage */}
                                                      <div className="flex items-center gap-2">
                                                        <div
                                                          className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                            fareOffer
                                                              .travelerPricings?.[0]
                                                              ?.fareDetailsBySegment?.[0]
                                                              ?.includedCheckedBags
                                                              ? 'bg-[#22C55E] text-primary-on'
                                                              : 'bg-[#EF4444] text-primary-on'
                                                          }`}
                                                        >
                                                          <span className="text-xs">
                                                            {fareOffer
                                                              .travelerPricings?.[0]
                                                              ?.fareDetailsBySegment?.[0]
                                                              ?.includedCheckedBags ? (
                                                              <IoMdCheckmark />
                                                            ) : (
                                                              '×'
                                                            )}
                                                          </span>
                                                        </div>
                                                        <span className="text-sm">
                                                          Checked baggage:{' '}
                                                          {formatBaggageInfo(
                                                            fareOffer
                                                              .travelerPricings?.[0]
                                                              ?.fareDetailsBySegment?.[0]
                                                              ?.includedCheckedBags
                                                          )}
                                                        </span>
                                                      </div>

                                                      {/* Refundable Status - Only show if refund amenity exists */}
                                                      {getRefundAmenityDetails(
                                                        fareOffer
                                                      ) && (
                                                        <div className="flex items-center gap-2">
                                                          <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                              getRefundAmenityDetails(
                                                                fareOffer
                                                              )!.hasRefund
                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                : 'bg-[#EF4444] text-primary-on'
                                                            }`}
                                                          >
                                                            <span className="label-l2">
                                                              {getRefundAmenityDetails(
                                                                fareOffer
                                                              )!.hasRefund ? (
                                                                <IoMdCheckmark />
                                                              ) : (
                                                                '×'
                                                              )}
                                                            </span>
                                                          </div>
                                                          <span className="label-l2 text-background-on">
                                                            {
                                                              getRefundAmenityDetails(
                                                                fareOffer
                                                              )!.description
                                                            }
                                                            {getRefundAmenityDetails(
                                                              fareOffer
                                                            )!.hasRefund &&
                                                              getRefundAmenityDetails(
                                                                fareOffer
                                                              )!
                                                                .isChargeable && (
                                                                <span className="label-l3 text-secondary-bright ml-1">
                                                                  (Chargeable)
                                                                </span>
                                                              )}
                                                          </span>
                                                        </div>
                                                      )}

                                                      {/* Change Status - Only show if change amenity exists */}
                                                      {getChangeAmenityDetails(
                                                        fareOffer
                                                      ) && (
                                                        <div className="flex items-center gap-2">
                                                          <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                              getChangeAmenityDetails(
                                                                fareOffer
                                                              )!.hasChange
                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                : 'bg-[#EF4444] text-primary-on'
                                                            }`}
                                                          >
                                                            <span className="label-l2">
                                                              {getChangeAmenityDetails(
                                                                fareOffer
                                                              )!.hasChange ? (
                                                                <IoMdCheckmark />
                                                              ) : (
                                                                '×'
                                                              )}
                                                            </span>
                                                          </div>
                                                          <span className="label-l2 text-background-on">
                                                            {
                                                              getChangeAmenityDetails(
                                                                fareOffer
                                                              )!.description
                                                            }
                                                            {getChangeAmenityDetails(
                                                              fareOffer
                                                            )!.hasChange &&
                                                              getChangeAmenityDetails(
                                                                fareOffer
                                                              )!
                                                                .isChargeable && (
                                                                <span className="label-l3 text-secondary-bright ml-1">
                                                                  (Chargeable)
                                                                </span>
                                                              )}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Book Now Button */}
                                                    <div className="mt-auto pt-4">
                                                      <button
                                                        onClick={() => {
                                                          // Check if this is a branded fare with discount applied
                                                          const matchingFare =
                                                            getBestMatchingFare(
                                                              fareOffer
                                                            );
                                                          const cabinMatches =
                                                            doesBrandedFareCabinMatch(
                                                              fareOffer
                                                            );
                                                          const hasFareDiscount =
                                                            matchingFare &&
                                                            cabinMatches;

                                                          // Store appropriate localStorage value
                                                          const bestValueInfo =
                                                            {
                                                              isManualFareApplied:
                                                                hasFareDiscount,
                                                              isStandardFareApplied:
                                                                hasFareDiscount,
                                                              appliedManualFareIds:
                                                                hasFareDiscount &&
                                                                matchingFare
                                                                  ? [
                                                                      matchingFare.id,
                                                                    ]
                                                                  : [],
                                                              fareDetails: {
                                                                ...(hasFareDiscount &&
                                                                  matchingFare && {
                                                                    id: matchingFare.id,
                                                                    title:
                                                                      matchingFare.title,
                                                                    customLabel:
                                                                      matchingFare.customLabel,
                                                                    fareDeductionValueType:
                                                                      matchingFare.fareDeductionValueType,
                                                                    deductionValue:
                                                                      matchingFare.deductionValue,
                                                                    farePerPassengers:
                                                                      matchingFare.farePerPassengers,
                                                                    originalPrice:
                                                                      parseFloat(
                                                                        fareOffer
                                                                          .price
                                                                          .grandTotal
                                                                      ),
                                                                    discountedPrice:
                                                                      calculateFarePrice(
                                                                        fareOffer,
                                                                        matchingFare
                                                                      ),
                                                                  }),
                                                                flightBasePrice:
                                                                  parseFloat(
                                                                    fareOffer
                                                                      .price
                                                                      .base
                                                                  ),
                                                                flightGrandTotal:
                                                                  parseFloat(
                                                                    fareOffer
                                                                      .price
                                                                      .grandTotal
                                                                  ),
                                                              },
                                                            };

                                                          localStorage.setItem(
                                                            'skytrips_best_value_booking',
                                                            JSON.stringify(
                                                              bestValueInfo
                                                            )
                                                          );

                                                          handleFlightSelect(
                                                            fareOffer,
                                                            false
                                                          );
                                                          setOpenDrawerId(null);
                                                        }}
                                                        className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                      >
                                                        Book Now
                                                      </button>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Mobile Bottom Sheet - Show fare options for all tabs */}
                              {openDrawerId === flight.id && (
                                <div className="block md:hidden fixed inset-x-0 bottom-0 z-50">
                                  <div
                                    className="bg-black bg-opacity-50 fixed inset-0"
                                    onClick={() => setOpenDrawerId(null)}
                                  />
                                  <div className="bg-white rounded-t-2xl p-4 relative z-10 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-center mb-2">
                                      <div className="w-12 h-1 bg-gray-300 rounded-full" />
                                    </div>
                                    <div className="relative">
                                      <div className="flex flex-col space-y-4">
                                        {/* Sort and render fares by price */}
                                        {[
                                          { type: 'main', offer: flight },
                                          ...(flight.children?.map((child) => ({
                                            type: 'child',
                                            offer: child,
                                          })) || []),
                                        ]
                                          .sort(
                                            (a, b) =>
                                              getAdjustedPrice(a) -
                                              getAdjustedPrice(b)
                                          )
                                          .map((fareOption, index) => (
                                            <div
                                              key={
                                                fareOption.type === 'main'
                                                  ? 'main-fare'
                                                  : `child-fare-${index}`
                                              }
                                              className="p-4 border rounded-lg w-full hover:shadow-md hover:border-[#5143d9] transition-shadow"
                                            >
                                              {/* Header */}
                                              <div className="mb-4">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                  {' '}
                                                  <h3 className="label-l2 text-neutral-dark mb-1">
                                                    {searchParams?.travelClass}{' '}
                                                    Class
                                                  </h3>
                                                  {fareOption.offer
                                                    .customLabel && (
                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-[#0c0073] to-[#5143d9] text-primary-on text-[11px] rounded-full  ">
                                                      {
                                                        fareOption.offer
                                                          .customLabel
                                                      }
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="title-t2 font-bold text-[#14104B]">
                                                  AUD{' '}
                                                  {fareOption.type ===
                                                    'child' ||
                                                  fareOption.offer.isGroupFare
                                                    ? getAdjustedPrice(
                                                        fareOption
                                                      ).toFixed(2)
                                                    : activeTab ===
                                                        'recommended' &&
                                                      shouldShowBestValue(
                                                        fareOption.offer,
                                                        index
                                                      ) &&
                                                      getBestMatchingFare(
                                                        fareOption.offer
                                                      )
                                                    ? calculateFarePrice(
                                                        fareOption.offer,
                                                        getBestMatchingFare(
                                                          fareOption.offer
                                                        )
                                                      ).toFixed(2)
                                                    : fareOption.offer.price
                                                        .grandTotal}
                                                </p>
                                              </div>

                                              {/* Features List */}
                                              <div className="space-y-3 label-l2 text-background-on">
                                                {/* Cabin Baggage */}
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                      fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCabinBags
                                                        ? 'bg-[#22C55E] text-primary-on'
                                                        : 'bg-[#EF4444] text-primary-on'
                                                    }`}
                                                  >
                                                    <span>
                                                      {' '}
                                                      {fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCabinBags ? (
                                                        <IoMdCheckmark />
                                                      ) : (
                                                        '×'
                                                      )}
                                                    </span>
                                                  </div>
                                                  <span>
                                                    Cabin baggage:{' '}
                                                    {formatBaggageInfo(
                                                      fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCabinBags
                                                    )}
                                                  </span>
                                                </div>

                                                {/* Checked Baggage */}
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                      fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCheckedBags
                                                        ? 'bg-[#22C55E] text-primary-on'
                                                        : 'bg-[#EF4444] text-primary-on'
                                                    }`}
                                                  >
                                                    <span>
                                                      {' '}
                                                      {fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCheckedBags ? (
                                                        <IoMdCheckmark />
                                                      ) : (
                                                        '×'
                                                      )}
                                                    </span>
                                                  </div>
                                                  <span>
                                                    Checked baggage:{' '}
                                                    {formatBaggageInfo(
                                                      fareOption.offer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.includedCheckedBags
                                                    )}
                                                  </span>
                                                </div>

                                                {/* Flight Changes */}
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                      !fareOption.offer.fareRules?.rules?.find(
                                                        (rule) =>
                                                          rule.category ===
                                                          'EXCHANGE'
                                                      )?.notApplicable
                                                        ? 'bg-[#22C55E] text-primary-on'
                                                        : 'bg-[#EF4444] text-primary-on'
                                                    }`}
                                                  >
                                                    <span>
                                                      {' '}
                                                      {!fareOption.offer.fareRules?.rules?.find(
                                                        (rule) =>
                                                          rule.category ===
                                                          'EXCHANGE'
                                                      )?.notApplicable ? (
                                                        <IoMdCheckmark />
                                                      ) : (
                                                        '×'
                                                      )}
                                                    </span>
                                                  </div>
                                                  <span>
                                                    Flight changes allowed{' '}
                                                    {!fareOption.offer.fareRules?.rules?.find(
                                                      (rule) =>
                                                        rule.category ===
                                                        'EXCHANGE'
                                                    )?.notApplicable &&
                                                    fareOption.offer.fareRules?.rules?.find(
                                                      (rule) =>
                                                        rule.category ===
                                                        'EXCHANGE'
                                                    )?.maxPenaltyAmount
                                                      ? `(Fee: AUD ${
                                                          fareOption.offer.fareRules?.rules?.find(
                                                            (rule) =>
                                                              rule.category ===
                                                              'EXCHANGE'
                                                          )?.maxPenaltyAmount
                                                        })`
                                                      : ''}
                                                  </span>
                                                </div>

                                                {/* Refund Status */}
                                                <div className="flex items-center gap-2">
                                                  {(() => {
                                                    // Use consistent logic with main card
                                                    const hasRefundRules =
                                                      fareOption.offer.fareRules
                                                        ?.rules;
                                                    let isRefundable = false;

                                                    if (hasRefundRules) {
                                                      const refundRule =
                                                        hasRefundRules.find(
                                                          (rule) =>
                                                            rule.category ===
                                                            'REFUND'
                                                        );
                                                      isRefundable = !!(
                                                        refundRule &&
                                                        !refundRule.notApplicable
                                                      );
                                                    }

                                                    // For main card flight, add indicator
                                                    const isMainCard =
                                                      fareOption.type ===
                                                      'main';

                                                    return (
                                                      <>
                                                        <div
                                                          className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                            isRefundable
                                                              ? 'bg-[#22C55E] text-primary-on'
                                                              : 'bg-[#EF4444] text-primary-on'
                                                          }`}
                                                        >
                                                          <span>
                                                            {isRefundable ? (
                                                              <IoMdCheckmark />
                                                            ) : (
                                                              '×'
                                                            )}
                                                          </span>
                                                        </div>
                                                        <span>
                                                          {isRefundable
                                                            ? 'Refundable'
                                                            : 'Non-refundable'}
                                                          {/* {isMainCard &&
                                                            ' (Main)'} */}
                                                        </span>
                                                      </>
                                                    );
                                                  })()}
                                                </div>
                                              </div>

                                              {/* Select Button */}
                                              <button
                                                onClick={() => {
                                                  handleFlightSelect(
                                                    fareOption.offer,
                                                    fareOption.type === 'child'
                                                  );
                                                  setOpenDrawerId(null);
                                                }}
                                                className="w-full mt-4 bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                              >
                                                Book Now{' '}
                                              </button>
                                            </div>
                                          ))}

                                        {/* Add Branded Fares at the end for mobile */}
                                        {isLoadingBrandedFares ? (
                                          <div className="flex justify-center items-center py-8">
                                            <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                                            <span>Loading more options...</span>
                                          </div>
                                        ) : (
                                          brandedFaresData.map(
                                            (fareOffer, fareIdx) => {
                                              // Apply standard fare deduction only if cabin class matches
                                              const matchingFare =
                                                getBestMatchingFare(fareOffer);
                                              const cabinMatches =
                                                doesBrandedFareCabinMatch(
                                                  fareOffer
                                                );
                                              const farePrice =
                                                matchingFare && cabinMatches
                                                  ? calculateFarePrice(
                                                      fareOffer,
                                                      matchingFare
                                                    )
                                                  : parseFloat(
                                                      fareOffer.price.grandTotal
                                                    );
                                              return (
                                                <div
                                                  key={`mobile-branded-fare-${fareIdx}`}
                                                  className="p-4 border rounded-lg w-full hover:shadow-md hover:border-[#5143d9] transition-shadow"
                                                >
                                                  {/* Header */}
                                                  <div className="mb-4">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                      <h3 className="label-l2 text-neutral-dark mb-1">
                                                        {fareOffer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.cabin ||
                                                          'ECONOMY'}{' '}
                                                        Class
                                                      </h3>
                                                      {/* {fareOffer
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.brandedFare && (
                                                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#0c0073] to-[#5143d9] text-primary-on text-[11px] rounded-full">
                                                          {
                                                            fareOffer
                                                              .travelerPricings[0]
                                                              .fareDetailsBySegment[0]
                                                              .brandedFare
                                                          }
                                                        </span>
                                                      )} */}
                                                    </div>
                                                    <p className="title-t2 font-bold text-[#14104B]">
                                                      {fareOffer.price.currency}{' '}
                                                      {Math.floor(farePrice)}
                                                    </p>
                                                  </div>

                                                  {/* Features List */}
                                                  <div className="space-y-3 mb-4">
                                                    {/* Cabin Baggage */}
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[#22C55E] text-primary-on">
                                                        <span className="text-xs">
                                                          <IoMdCheckmark />
                                                        </span>
                                                      </div>
                                                      <span className="label-l2 text-background-on">
                                                        Cabin baggage:{' '}
                                                        {formatBrandedFareCabinBaggageInfo(
                                                          fareOffer
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCabinBags
                                                        )}
                                                      </span>
                                                    </div>

                                                    {/* Checked Baggage */}
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                          fareOffer
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCheckedBags
                                                            ? 'bg-[#22C55E] text-primary-on'
                                                            : 'bg-[#EF4444] text-primary-on'
                                                        }`}
                                                      >
                                                        <span className="text-xs">
                                                          {fareOffer
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCheckedBags ? (
                                                            <IoMdCheckmark />
                                                          ) : (
                                                            '×'
                                                          )}
                                                        </span>
                                                      </div>
                                                      <span className="label-l2 text-background-on">
                                                        {fareOffer
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags
                                                          ?.quantity || 0}{' '}
                                                        checked bag(s)
                                                      </span>
                                                    </div>

                                                    {/* Refund Status - Only show if refund amenity exists */}
                                                    {getRefundAmenityDetails(
                                                      fareOffer
                                                    ) && (
                                                      <div className="flex items-center gap-2">
                                                        <div
                                                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                            getRefundAmenityDetails(
                                                              fareOffer
                                                            )!.hasRefund
                                                              ? 'bg-[#22C55E] text-primary-on'
                                                              : 'bg-[#EF4444] text-primary-on'
                                                          }`}
                                                        >
                                                          <span className="text-xs">
                                                            {getRefundAmenityDetails(
                                                              fareOffer
                                                            )!.hasRefund ? (
                                                              <IoMdCheckmark />
                                                            ) : (
                                                              '×'
                                                            )}
                                                          </span>
                                                        </div>
                                                        <span className="label-l2 text-background-on">
                                                          {
                                                            getRefundAmenityDetails(
                                                              fareOffer
                                                            )!.description
                                                          }
                                                          {getRefundAmenityDetails(
                                                            fareOffer
                                                          )!.hasRefund &&
                                                            getRefundAmenityDetails(
                                                              fareOffer
                                                            )!.isChargeable && (
                                                              <span className="text-xs text-orange-600 ml-1">
                                                                (Chargeable)
                                                              </span>
                                                            )}
                                                        </span>
                                                      </div>
                                                    )}

                                                    {/* Change Status - Only show if change amenity exists */}
                                                    {getChangeAmenityDetails(
                                                      fareOffer
                                                    ) && (
                                                      <div className="flex items-center gap-2">
                                                        <div
                                                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                            getChangeAmenityDetails(
                                                              fareOffer
                                                            )!.hasChange
                                                              ? 'bg-[#22C55E] text-primary-on'
                                                              : 'bg-[#EF4444] text-primary-on'
                                                          }`}
                                                        >
                                                          <span className="text-xs">
                                                            {getChangeAmenityDetails(
                                                              fareOffer
                                                            )!.hasChange ? (
                                                              <IoMdCheckmark />
                                                            ) : (
                                                              '×'
                                                            )}
                                                          </span>
                                                        </div>
                                                        <span className="label-l2 text-background-on">
                                                          {
                                                            getChangeAmenityDetails(
                                                              fareOffer
                                                            )!.description
                                                          }
                                                          {getChangeAmenityDetails(
                                                            fareOffer
                                                          )!.hasChange &&
                                                            getChangeAmenityDetails(
                                                              fareOffer
                                                            )!.isChargeable && (
                                                              <span className="text-xs text-orange-600 ml-1">
                                                                (Chargeable)
                                                              </span>
                                                            )}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Book Now Button */}
                                                  <button
                                                    onClick={() => {
                                                      // Check if this is a branded fare with discount applied
                                                      const matchingFare =
                                                        getBestMatchingFare(
                                                          fareOffer
                                                        );
                                                      const cabinMatches =
                                                        doesBrandedFareCabinMatch(
                                                          fareOffer
                                                        );
                                                      const hasFareDiscount =
                                                        matchingFare &&
                                                        cabinMatches;

                                                      // Store appropriate localStorage value
                                                      const bestValueInfo = {
                                                        isManualFareApplied:
                                                          hasFareDiscount,
                                                        isStandardFareApplied:
                                                          hasFareDiscount,
                                                        appliedManualFareIds:
                                                          hasFareDiscount &&
                                                          matchingFare
                                                            ? [matchingFare.id]
                                                            : [],
                                                        fareDetails: {
                                                          ...(hasFareDiscount &&
                                                            matchingFare && {
                                                              id: matchingFare.id,
                                                              title:
                                                                matchingFare.title,
                                                              customLabel:
                                                                matchingFare.customLabel,
                                                              fareDeductionValueType:
                                                                matchingFare.fareDeductionValueType,
                                                              deductionValue:
                                                                matchingFare.deductionValue,
                                                              farePerPassengers:
                                                                matchingFare.farePerPassengers,
                                                              originalPrice:
                                                                parseFloat(
                                                                  fareOffer
                                                                    .price
                                                                    .grandTotal
                                                                ),
                                                              discountedPrice:
                                                                calculateFarePrice(
                                                                  fareOffer,
                                                                  matchingFare
                                                                ),
                                                            }),
                                                          flightBasePrice:
                                                            parseFloat(
                                                              fareOffer.price
                                                                .base
                                                            ),
                                                          flightGrandTotal:
                                                            parseFloat(
                                                              fareOffer.price
                                                                .grandTotal
                                                            ),
                                                        },
                                                      };

                                                      localStorage.setItem(
                                                        'skytrips_best_value_booking',
                                                        JSON.stringify(
                                                          bestValueInfo
                                                        )
                                                      );

                                                      handleFlightSelect(
                                                        fareOffer,
                                                        false
                                                      );
                                                      setOpenDrawerId(null);
                                                    }}
                                                    className="w-full mt-4 bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                  >
                                                    Book Now
                                                  </button>
                                                </div>
                                              );
                                            }
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Flight Details Button Bar */}
                              <div className="px-0 md:px-6 py-1 md:py-0 bg-container border-t">
                                <div className="flex justify-between items-center">
                                  {/* <div className="flex space-x-2">
                                    {sortOption !== 'recommended' && (
                                      <div className="flex space-x-2">
                                       
                                      </div>
                                    )}
                                  </div> */}
                                  {/* Price Group Drawer */}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="label-l3 text-neutral-dark hover:text-blue-950 flex justify-between items-center"
                                    onClick={() =>
                                      toggleFlightDetails(
                                        `${flight.id}-${index}`,
                                        flight,
                                        index
                                      )
                                    }
                                  >
                                    <span className="label-l3 text-primary">
                                      Flight Details
                                    </span>
                                    <ChevronRight className="h-4 w-4 ml-1 text-primary" />
                                  </Button>
                                </div>
                              </div>

                              {/* Branded Fares Drawer for Cheapest/Shortest main flight - DISABLED */}
                              {false &&
                                openDrawerId === flight.id &&
                                sortOption !== 'recommended' && (
                                  <>
                                    {/* Desktop View */}
                                    <div className="hidden md:block border-t border-[#EEEEEE] bg-white">
                                      <div className="p-4">
                                        {isLoadingBrandedFares ? (
                                          <div className="flex justify-center items-center py-8">
                                            <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                                            <span>Loading fare options...</span>
                                          </div>
                                        ) : brandedFaresData.length > 0 ? (
                                          <div className="relative">
                                            {/* Left Navigation Button */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                                              <button
                                                onClick={() => {
                                                  const container =
                                                    document.getElementById(
                                                      'main-fare-options-container'
                                                    );
                                                  if (container) {
                                                    container.scrollLeft -= 320;
                                                  }
                                                }}
                                                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                aria-label="Previous options"
                                              >
                                                <ChevronLeft className="h-6 w-6 text-gray-600" />
                                              </button>
                                            </div>
                                            {/* Right Navigation Button */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                                              <button
                                                onClick={() => {
                                                  const container =
                                                    document.getElementById(
                                                      'main-fare-options-container'
                                                    );
                                                  if (container) {
                                                    container.scrollLeft += 320;
                                                  }
                                                }}
                                                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                aria-label="Next options"
                                              >
                                                <ChevronRight className="h-6 w-6 text-gray-600" />
                                              </button>
                                            </div>
                                            <div
                                              id="main-fare-options-container"
                                              className="flex space-x-4 overflow-x-auto md:scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden scrollbar-none"
                                            >
                                              <div className="flex space-x-4 min-w-min">
                                                {brandedFaresData.map(
                                                  (fareOffer, fareIdx) => {
                                                    const farePrice =
                                                      parseFloat(
                                                        fareOffer.price
                                                          .grandTotal
                                                      );
                                                    return (
                                                      <div
                                                        key={`main-fare-${fareIdx}`}
                                                        className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full"
                                                      >
                                                        {/* Header */}
                                                        <div className="mb-4">
                                                          <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h3 className="label-l2 text-neutral-dark mb-1">
                                                              {fareOffer
                                                                .travelerPricings?.[0]
                                                                ?.fareDetailsBySegment?.[0]
                                                                ?.cabin ||
                                                                'ECONOMY'}{' '}
                                                              Class
                                                            </h3>
                                                          </div>
                                                          <div className="title-t2 font-bold text-[#14104B]">
                                                            {
                                                              fareOffer.price
                                                                .currency
                                                            }{' '}
                                                            {Math.floor(
                                                              farePrice
                                                            )}
                                                          </div>
                                                        </div>

                                                        {/* Features List */}
                                                        <div className="flex-1 space-y-3 mb-4">
                                                          {/* Cabin Baggage */}
                                                          <div className="flex items-center gap-2">
                                                            <div
                                                              className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                fareOffer
                                                                  .travelerPricings?.[0]
                                                                  ?.fareDetailsBySegment?.[0]
                                                                  ?.includedCabinBags
                                                                  ? 'bg-[#22C55E] text-primary-on'
                                                                  : 'bg-[#EF4444] text-primary-on'
                                                              }`}
                                                            >
                                                              <span className="text-xs">
                                                                {fareOffer
                                                                  .travelerPricings?.[0]
                                                                  ?.fareDetailsBySegment?.[0]
                                                                  ?.includedCabinBags ? (
                                                                  <IoMdCheckmark />
                                                                ) : (
                                                                  '×'
                                                                )}
                                                              </span>
                                                            </div>
                                                            <span className="label-l2 text-background-on">
                                                              Cabin baggage
                                                              included
                                                            </span>
                                                          </div>

                                                          {/* Checked Baggage */}
                                                          <div className="flex items-center gap-2">
                                                            <div
                                                              className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                fareOffer
                                                                  .travelerPricings?.[0]
                                                                  ?.fareDetailsBySegment?.[0]
                                                                  ?.includedCheckedBags
                                                                  ? 'bg-[#22C55E] text-primary-on'
                                                                  : 'bg-[#EF4444] text-primary-on'
                                                              }`}
                                                            >
                                                              <span className="text-xs">
                                                                {fareOffer
                                                                  .travelerPricings?.[0]
                                                                  ?.fareDetailsBySegment?.[0]
                                                                  ?.includedCheckedBags ? (
                                                                  <IoMdCheckmark />
                                                                ) : (
                                                                  '×'
                                                                )}
                                                              </span>
                                                            </div>
                                                            <span className="label-l2 text-background-on">
                                                              Checked baggage:{' '}
                                                              {formatBaggageInfo(
                                                                fareOffer
                                                                  .travelerPricings?.[0]
                                                                  ?.fareDetailsBySegment?.[0]
                                                                  ?.includedCheckedBags
                                                              )}
                                                            </span>
                                                          </div>

                                                          {/* Refund Status */}
                                                          <div className="flex items-center gap-2">
                                                            <div
                                                              className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                fareOffer
                                                                  .pricingOptions
                                                                  ?.refundableFare
                                                                  ? 'bg-[#22C55E] text-primary-on'
                                                                  : 'bg-[#EF4444] text-primary-on'
                                                              }`}
                                                            >
                                                              <span className="text-xs">
                                                                {fareOffer
                                                                  .pricingOptions
                                                                  ?.refundableFare ? (
                                                                  <IoMdCheckmark />
                                                                ) : (
                                                                  '×'
                                                                )}
                                                              </span>
                                                            </div>
                                                            <span className="label-l2 text-background-on">
                                                              {fareOffer
                                                                .pricingOptions
                                                                ?.refundableFare
                                                                ? 'Refundable'
                                                                : 'Non-refundable'}
                                                            </span>
                                                          </div>
                                                        </div>

                                                        {/* Book Now Button */}
                                                        <div className="mt-auto pt-4">
                                                          <button
                                                            onClick={() => {
                                                              handleFlightBooking(
                                                                fareOffer
                                                              );
                                                              setOpenDrawerId(
                                                                null
                                                              );
                                                            }}
                                                            className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                          >
                                                            Book Now
                                                          </button>
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            {/* Left Navigation Button */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                                              <button
                                                onClick={() => {
                                                  const container =
                                                    document.getElementById(
                                                      'main-fare-options-container'
                                                    );
                                                  if (container) {
                                                    container.scrollLeft -= 320;
                                                  }
                                                }}
                                                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                aria-label="Previous options"
                                              >
                                                <ChevronLeft className="h-6 w-6 text-gray-600" />
                                              </button>
                                            </div>
                                            {/* Right Navigation Button */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                                              <button
                                                onClick={() => {
                                                  const container =
                                                    document.getElementById(
                                                      'main-fare-options-container'
                                                    );
                                                  if (container) {
                                                    container.scrollLeft += 320;
                                                  }
                                                }}
                                                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                aria-label="Next options"
                                              >
                                                <ChevronRight className="h-6 w-6 text-gray-600" />
                                              </button>
                                            </div>
                                            <div
                                              id="main-fare-options-container"
                                              className="flex space-x-4 overflow-x-auto md:scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden scrollbar-none"
                                            >
                                              <div className="flex space-x-4 min-w-min">
                                                <div className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full">
                                                  {/* Header */}
                                                  <div className="mb-4">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                      <h3 className="label-l2 text-neutral-dark mb-1">
                                                        {flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.cabin ||
                                                          'ECONOMY'}{' '}
                                                        Class
                                                      </h3>
                                                    </div>
                                                    <div className="title-t2 font-bold text-[#14104B]">
                                                      {flight.price.currency}{' '}
                                                      {Math.floor(
                                                        parseFloat(
                                                          flight.price
                                                            .grandTotal
                                                        )
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Features List */}
                                                  <div className="flex-1 space-y-3 mb-4">
                                                    {/* Cabin Baggage */}
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                          flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCabinBags
                                                            ? 'bg-[#22C55E] text-primary-on'
                                                            : 'bg-[#EF4444] text-primary-on'
                                                        }`}
                                                      >
                                                        <span className="text-xs">
                                                          {flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCabinBags ? (
                                                            <IoMdCheckmark />
                                                          ) : (
                                                            '×'
                                                          )}
                                                        </span>
                                                      </div>
                                                      <span className="label-l2 text-background-on">
                                                        Cabin baggage:{' '}
                                                        {formatBaggageInfo(
                                                          flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCabinBags
                                                        )}
                                                      </span>
                                                    </div>

                                                    {/* Checked Baggage */}
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                          flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCheckedBags
                                                            ? 'bg-[#22C55E] text-primary-on'
                                                            : 'bg-[#EF4444] text-primary-on'
                                                        }`}
                                                      >
                                                        <span className="text-xs">
                                                          {flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCheckedBags ? (
                                                            <IoMdCheckmark />
                                                          ) : (
                                                            '×'
                                                          )}
                                                        </span>
                                                      </div>
                                                      <span className="label-l2 text-background-on">
                                                        Checked baggage:{' '}
                                                        {formatBaggageInfo(
                                                          flight
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.includedCheckedBags
                                                        )}
                                                      </span>
                                                    </div>

                                                    {/* Refund Status */}
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                          flight.pricingOptions
                                                            ?.refundableFare
                                                            ? 'bg-[#22C55E] text-primary-on'
                                                            : 'bg-[#EF4444] text-primary-on'
                                                        }`}
                                                      >
                                                        <span className="text-xs">
                                                          {flight.pricingOptions
                                                            ?.refundableFare ? (
                                                            <IoMdCheckmark />
                                                          ) : (
                                                            '×'
                                                          )}
                                                        </span>
                                                      </div>
                                                      <span className="label-l2 text-background-on">
                                                        {flight.pricingOptions
                                                          ?.refundableFare
                                                          ? 'Refundable'
                                                          : 'Non-refundable'}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Book Now Button */}
                                                  <div className="mt-auto pt-4">
                                                    <button
                                                      onClick={() => {
                                                        handleFlightBooking(
                                                          flight
                                                        );
                                                        setOpenDrawerId(null);
                                                      }}
                                                      className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                    >
                                                      Book Now
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Mobile Bottom Sheet */}
                                    <div className="block md:hidden fixed inset-x-0 bottom-0 z-50">
                                      <div
                                        className="bg-black bg-opacity-50 fixed inset-0"
                                        onClick={() => setOpenDrawerId(null)}
                                      />
                                      <div className="bg-white rounded-t-2xl p-4 relative z-10 max-h-[90vh] overflow-y-auto">
                                        <div className="flex justify-center mb-2">
                                          <div className="w-12 h-1 bg-gray-300 rounded-full" />
                                        </div>
                                        <div className="relative">
                                          {isLoadingBrandedFares ? (
                                            <div className="flex justify-center items-center py-8">
                                              <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                                              <span>
                                                Loading fare options...
                                              </span>
                                            </div>
                                          ) : brandedFaresData.length > 0 ? (
                                            <div className="flex flex-col space-y-4">
                                              {brandedFaresData.map(
                                                (fareOffer, fareIdx) => {
                                                  const farePrice = parseFloat(
                                                    fareOffer.price.grandTotal
                                                  );
                                                  return (
                                                    <div
                                                      key={`mobile-main-fare-${fareIdx}`}
                                                      className="p-4 border rounded-lg w-full hover:shadow-md hover:border-[#5143d9] transition-shadow"
                                                    >
                                                      {/* Header */}
                                                      <div className="mb-4">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                          <h3 className="label-l2 text-neutral-dark mb-1">
                                                            {fareOffer
                                                              .travelerPricings?.[0]
                                                              ?.fareDetailsBySegment?.[0]
                                                              ?.cabin ||
                                                              'ECONOMY'}{' '}
                                                            Class
                                                          </h3>
                                                          {fareOffer
                                                            .travelerPricings?.[0]
                                                            ?.fareDetailsBySegment?.[0]
                                                            ?.brandedFare && (
                                                            <span className="px-2 py-0.5 bg-gradient-to-r from-[#0c0073] to-[#5143d9] text-primary-on text-[11px] rounded-full">
                                                              {
                                                                fareOffer
                                                                  .travelerPricings[0]
                                                                  .fareDetailsBySegment[0]
                                                                  .brandedFare
                                                              }
                                                            </span>
                                                          )}
                                                        </div>
                                                        <p className="title-t2 font-bold text-[#14104B]">
                                                          {
                                                            fareOffer.price
                                                              .currency
                                                          }{' '}
                                                          {Math.floor(
                                                            farePrice
                                                          )}
                                                        </p>
                                                      </div>

                                                      {/* Features List */}
                                                      <div className="space-y-3 mb-4">
                                                        {/* Cabin Baggage */}
                                                        <div className="flex items-center gap-2">
                                                          <div className="w-4 h-4 rounded-full flex items-center justify-center px-1 bg-[#22C55E] text-primary-on">
                                                            <span className="text-xs">
                                                              <IoMdCheckmark />
                                                            </span>
                                                          </div>
                                                          <span className="label-l2 text-background-on">
                                                            Cabin baggage:{' '}
                                                            {formatBrandedFareCabinBaggageInfo(
                                                              fareOffer
                                                                .travelerPricings?.[0]
                                                                ?.fareDetailsBySegment?.[0]
                                                                ?.includedCabinBags
                                                            )}
                                                          </span>
                                                        </div>

                                                        {/* Checked Baggage */}
                                                        <div className="flex items-center gap-2">
                                                          <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                              fareOffer
                                                                .travelerPricings?.[0]
                                                                ?.fareDetailsBySegment?.[0]
                                                                ?.includedCheckedBags
                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                : 'bg-[#EF4444] text-primary-on'
                                                            }`}
                                                          >
                                                            <span className="text-xs">
                                                              {fareOffer
                                                                .travelerPricings?.[0]
                                                                ?.fareDetailsBySegment?.[0]
                                                                ?.includedCheckedBags ? (
                                                                <IoMdCheckmark />
                                                              ) : (
                                                                '×'
                                                              )}
                                                            </span>
                                                          </div>
                                                          <span className="label-l2 text-background-on">
                                                            Checked baggage:{' '}
                                                            {formatBaggageInfo(
                                                              fareOffer
                                                                .travelerPricings?.[0]
                                                                ?.fareDetailsBySegment?.[0]
                                                                ?.includedCheckedBags
                                                            )}
                                                          </span>
                                                        </div>

                                                        {/* Refund Status */}
                                                        <div className="flex items-center gap-2">
                                                          <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                              fareOffer
                                                                .pricingOptions
                                                                ?.refundableFare
                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                : 'bg-[#EF4444] text-primary-on'
                                                            }`}
                                                          >
                                                            <span className="text-xs">
                                                              {fareOffer
                                                                .pricingOptions
                                                                ?.refundableFare ? (
                                                                <IoMdCheckmark />
                                                              ) : (
                                                                '×'
                                                              )}
                                                            </span>
                                                          </div>
                                                          <span className="label-l2 text-background-on">
                                                            {fareOffer
                                                              .pricingOptions
                                                              ?.refundableFare
                                                              ? 'Refundable'
                                                              : 'Non-refundable'}
                                                          </span>
                                                        </div>
                                                      </div>

                                                      {/* Book Now Button */}
                                                      <button
                                                        onClick={() => {
                                                          handleFlightBooking(
                                                            fareOffer
                                                          );
                                                          setOpenDrawerId(null);
                                                        }}
                                                        className="w-full mt-4 bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                      >
                                                        Book Now
                                                      </button>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          ) : (
                                            <div className="flex flex-col space-y-4">
                                              <div className="p-4 border rounded-lg w-full hover:shadow-md hover:border-[#5143d9] transition-shadow">
                                                {/* Header */}
                                                <div className="mb-4">
                                                  <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="label-l2 text-neutral-dark mb-1">
                                                      {flight
                                                        .travelerPricings?.[0]
                                                        ?.fareDetailsBySegment?.[0]
                                                        ?.cabin ||
                                                        'ECONOMY'}{' '}
                                                      Class
                                                    </h3>
                                                  </div>
                                                  <p className="title-t2 font-bold text-[#14104B]">
                                                    {flight.price.currency}{' '}
                                                    {Math.floor(
                                                      parseFloat(
                                                        flight.price.grandTotal
                                                      )
                                                    )}
                                                  </p>
                                                </div>

                                                {/* Features List */}
                                                <div className="space-y-3 mb-4">
                                                  {/* Cabin Baggage */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span className="text-xs">
                                                        {flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span className="label-l2 text-background-on">
                                                      Cabin baggage:{' '}
                                                      {formatBaggageInfo(
                                                        flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCabinBags
                                                      )}
                                                    </span>
                                                  </div>

                                                  {/* Checked Baggage */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span className="text-xs">
                                                        {flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span className="label-l2 text-background-on">
                                                      Checked baggage:
                                                      {formatBaggageInfo(
                                                        flight
                                                          .travelerPricings?.[0]
                                                          ?.fareDetailsBySegment?.[0]
                                                          ?.includedCheckedBags
                                                      )}
                                                    </span>
                                                  </div>

                                                  {/* Refund Status */}
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                        flight.pricingOptions
                                                          ?.refundableFare
                                                          ? 'bg-[#22C55E] text-primary-on'
                                                          : 'bg-[#EF4444] text-primary-on'
                                                      }`}
                                                    >
                                                      <span className="text-xs">
                                                        {flight.pricingOptions
                                                          ?.refundableFare ? (
                                                          <IoMdCheckmark />
                                                        ) : (
                                                          '×'
                                                        )}
                                                      </span>
                                                    </div>
                                                    <span className="label-l2 text-background-on">
                                                      {flight.pricingOptions
                                                        ?.refundableFare
                                                        ? 'Refundable'
                                                        : 'Non-refundable'}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Book Now Button */}
                                                <button
                                                  onClick={() => {
                                                    handleFlightBooking(flight);
                                                    setOpenDrawerId(null);
                                                  }}
                                                  className="w-full mt-4 bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                >
                                                  Book Now
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}

                              {/* Children Offers Section */}
                              {expandedChildrenId === `${flight.id}-${index}` &&
                                flight.children &&
                                flight.children.length > 0 && (
                                  <div className="border-[2px] border-[#0c0073] rounded-lg bg-container">
                                    <div className="px-4 pt-4">
                                      <div className="font-medium text-blue-950 mb-4">
                                        {flight.children.length} more options
                                        available
                                      </div>
                                      {flight.children.map(
                                        (childOffer, childIdx) => (
                                          <div
                                            key={`child-${childIdx}`}
                                            className="mb-4 border border-[#EEEEEE] rounded-lg overflow-hidden hover:shadow-sm"
                                          >
                                            <div className="flex flex-col md:flex-row items-stretch min-h-[130px]">
                                              {/* Left column for airline info */}
                                              <div className="md:w-[150px] py-2 px-1 md:px-4 flex items-center justify-center">
                                                <div className="flex flex-col items-center w-full">
                                                  {/* Airline info */}
                                                  <div className="flex flex-col md:flex-col md:items-center w-full">
                                                    <div className="flex md:flex-col items-center mb-1">
                                                      <img
                                                        src={`https://pics.avs.io/200/40/${childOffer.itineraries[0].segments[0].carrierCode}.png`}
                                                        alt={
                                                          childOffer
                                                            .itineraries[0]
                                                            .segments[0]
                                                            .carrierCode
                                                        }
                                                        className="h-6 object-contain w-24"
                                                        onError={(e) => {
                                                          e.currentTarget.src =
                                                            'https://via.placeholder.com/80x20?text=Airline';
                                                        }}
                                                      />
                                                      <div className="label-l3 text-background-on ml-2 md:ml-0 md:mt-1 text-center">
                                                        {(() => {
                                                          const carrierCode =
                                                            childOffer
                                                              .itineraries[0]
                                                              .segments[0]
                                                              .carrierCode;
                                                          if (
                                                            childOffer
                                                              .dictionaries
                                                              ?.carriers &&
                                                            childOffer
                                                              .dictionaries
                                                              .carriers[
                                                              carrierCode
                                                            ]
                                                          ) {
                                                            return childOffer
                                                              .dictionaries
                                                              .carriers[
                                                              carrierCode
                                                            ];
                                                          } else if (
                                                            apiData
                                                              ?.dictionaries
                                                              ?.airlines
                                                          ) {
                                                            const airline =
                                                              apiData.dictionaries.airlines.find(
                                                                (a) =>
                                                                  a.code ===
                                                                  carrierCode
                                                              );
                                                            return airline
                                                              ? airline.name
                                                              : carrierCode;
                                                          }
                                                          return carrierCode;
                                                        })()}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Center column with flight details */}
                                              <div className="md:flex-1 flex flex-col items-center justify-center px-3 py-0 md:py-3 md:pr-6">
                                                {/* Flight details */}
                                                <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between">
                                                  {/* Departure */}
                                                  <div className="flex flex-col items-start justify-center">
                                                    <div className="label-l3 text-neutral-dark">
                                                      {format(
                                                        new Date(
                                                          childOffer.itineraries[0].segments[0].departure.at
                                                        ),
                                                        'dd MMM, EEE'
                                                      )}
                                                    </div>
                                                    <div className="title-t3 text-background-on">
                                                      {format(
                                                        new Date(
                                                          childOffer.itineraries[0].segments[0].departure.at
                                                        ),
                                                        'H:mm'
                                                      )}
                                                    </div>
                                                    <div className="label-l3 text-neutral-dark">
                                                      {
                                                        childOffer
                                                          .itineraries[0]
                                                          .segments[0].departure
                                                          .iataCode
                                                      }
                                                    </div>
                                                  </div>

                                                  {/* Duration and stops */}
                                                  <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
                                                    <div className="label-l3 text-neutral-dark mb-1 pl-1">
                                                      {formatDuration(
                                                        childOffer
                                                          .itineraries[0]
                                                          .duration
                                                      )}
                                                    </div>
                                                    <div className="flex items-center">
                                                      <img
                                                        src="/assets/plane-icon.svg"
                                                        alt="Departure"
                                                        className="w-6 h-6 label-l3 text-neutral-dark"
                                                        onError={(e) => {
                                                          e.currentTarget.src =
                                                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
                                                        }}
                                                      />
                                                      {/* Flight path display */}
                                                      <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
                                                        <div className="w-full h-[1px] bg-gray-300 absolute"></div>
                                                        {childOffer
                                                          .itineraries[0]
                                                          .segments.length >
                                                          1 && (
                                                          <div className="mx-auto bg-container border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
                                                            {childOffer.itineraries[0].segments
                                                              .slice(0, -1)
                                                              .map(
                                                                (
                                                                  segment,
                                                                  idx
                                                                ) => (
                                                                  <React.Fragment
                                                                    key={`transit-${idx}`}
                                                                  >
                                                                    {
                                                                      segment
                                                                        .arrival
                                                                        .iataCode
                                                                    }
                                                                    {idx <
                                                                      childOffer
                                                                        .itineraries[0]
                                                                        .segments
                                                                        .length -
                                                                        2 &&
                                                                      ', '}
                                                                  </React.Fragment>
                                                                )
                                                              )}
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                                                    </div>
                                                  </div>

                                                  {/* Arrival */}
                                                  <div className="flex flex-col items-end justify-center">
                                                    <div className="label-l3 text-neutral-dark">
                                                      {format(
                                                        new Date(
                                                          childOffer.itineraries[0].segments[
                                                            childOffer
                                                              .itineraries[0]
                                                              .segments.length -
                                                              1
                                                          ].arrival.at
                                                        ),
                                                        'dd MMM, EEE'
                                                      )}
                                                    </div>
                                                    <div className="title-t3 text-background-on">
                                                      {format(
                                                        new Date(
                                                          childOffer.itineraries[0].segments[
                                                            childOffer
                                                              .itineraries[0]
                                                              .segments.length -
                                                              1
                                                          ].arrival.at
                                                        ),
                                                        'H:mm'
                                                      )}
                                                    </div>
                                                    <div className="label-l3 text-neutral-dark">
                                                      {
                                                        childOffer
                                                          .itineraries[0]
                                                          .segments[
                                                          childOffer
                                                            .itineraries[0]
                                                            .segments.length - 1
                                                        ].arrival.iataCode
                                                      }
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Right column - Price and booking */}
                                              <div className="w-full md:w-[240px] px-4 py-3 border-t md:border-t-0 md:border-l">
                                                <div className="flex flex-col items-end">
                                                  <div className="text-xl font-semibold text-primary">
                                                    {childOffer.price.currency}{' '}
                                                    {Math.floor(
                                                      parseFloat(
                                                        childOffer.price
                                                          .grandTotal
                                                      )
                                                    )}
                                                  </div>
                                                  <Button
                                                    className="w-full hover:bg-[#5143d9] title-t4 text-primary-on bg-primary mt-2"
                                                    onClick={() =>
                                                      handleFlightBooking(
                                                        childOffer
                                                      )
                                                    }
                                                  >
                                                    Book Now
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Flight Details Button Bar */}
                                            <div className="px-0 md:px-6 py-1 md:py-0 bg-container border-t">
                                              <div className="flex justify-between items-center">
                                                <div className="flex space-x-2">
                                                  {childOffer.children &&
                                                    childOffer.children.length >
                                                      0 && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          toggleChildren(
                                                            `${childOffer.id}-${childIdx}`
                                                          );
                                                        }}
                                                      >
                                                        <span className="label-l3 text-primary">
                                                          More Options (
                                                          {
                                                            childOffer.children
                                                              .length
                                                          }
                                                          )
                                                        </span>
                                                        {expandedChildrenId ===
                                                        `${childOffer.id}-${childIdx}` ? (
                                                          <ChevronUp className="h-4 w-4 ml-1" />
                                                        ) : (
                                                          <ChevronDown className="h-4 w-4 ml-1" />
                                                        )}
                                                      </Button>
                                                    )}
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="label-l3 text-neutral-dark hover:text-blue-950 flex justify-between items-center"
                                                  onClick={() =>
                                                    toggleFlightDetails(
                                                      `child-${childOffer.id}-${childIdx}`,
                                                      childOffer
                                                    )
                                                  }
                                                >
                                                  <span className="label-l3 text-primary">
                                                    Flight Details
                                                  </span>
                                                  <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Recursively render nested children */}
                                            {expandedChildrenId ===
                                              `${childOffer.id}-${childIdx}` &&
                                              childOffer.children &&
                                              childOffer.children.length >
                                                0 && (
                                                <div className="border-t border-gray-200 mt-2">
                                                  <div className="px-4 pt-4">
                                                    <div className="font-medium text-blue-950 mb-4">
                                                      {
                                                        childOffer.children
                                                          .length
                                                      }{' '}
                                                      more options available
                                                    </div>
                                                    {/* Recursively render child offers */}
                                                    {childOffer.children.map(
                                                      (
                                                        nestedChild,
                                                        nestedIdx
                                                      ) => (
                                                        // Render nested child offers with the same structure
                                                        <div
                                                          key={`nested-child-${nestedIdx}`}
                                                          className="ml-4"
                                                        >
                                                          {/* Same structure as parent child offer */}
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Same Price Offers Section */}
                              {expandedSamePriceId ===
                                `${flight.id}-${index}` && (
                                <div className="border-[2px] border-[#0c0073] rounded-lg bg-container ">
                                  <div className="px-4 pt-4">
                                    {/* <div className="font-medium text-blue-950 mb-4">
                                      {flight.samePriceOffers?.length} more
                                      flights at same price
                                        </div> */}

                                    {flight.samePriceOffers?.map(
                                      (offer, offerIdx) => {
                                        const offerPriceData = {
                                          price: parseFloat(
                                            offer.price.grandTotal
                                          ),
                                        };
                                        const offerPrice = offerPriceData.price;

                                        return (
                                          <div
                                            key={`offer-${offerIdx}`}
                                            className="mb-4 border border-[#EEEEEE] rounded-lg overflow-hidden hover:shadow-sm"
                                          >
                                            <div className="flex flex-col md:flex-row items-stretch min-h-[130px]">
                                              {/* Left column for airline info */}
                                              <div className="md:w-[150px] py-2 px-1 md:px-4 flex items-center justify-center">
                                                <div className="flex flex-col items-center w-full">
                                                  {/* Check if both flights use same airline */}
                                                  {(() => {
                                                    const hasSameAirline =
                                                      offer.itineraries.length >
                                                        1 &&
                                                      offer.itineraries[0]
                                                        .segments[0]
                                                        .carrierCode ===
                                                        offer.itineraries[1]
                                                          .segments[0]
                                                          .carrierCode;

                                                    return (
                                                      <>
                                                        {/* Outbound flight airline - always visible */}
                                                        <div className="flex flex-col md:flex-col md:items-center w-full">
                                                          <div className="flex md:flex-col items-center mb-1">
                                                            <img
                                                              src={`https://pics.avs.io/200/40/${offer.itineraries[0].segments[0].carrierCode}.png`}
                                                              alt={
                                                                offer
                                                                  .itineraries[0]
                                                                  .segments[0]
                                                                  .carrierCode
                                                              }
                                                              className="h-6 object-contain w-24"
                                                              onError={(e) => {
                                                                e.currentTarget.src =
                                                                  'https://via.placeholder.com/80x20?text=Airline';
                                                              }}
                                                            />
                                                            <div className="label-l3 text-background-on ml-2 md:ml-0 md:mt-1 text-center">
                                                              {(() => {
                                                                const carrierCode =
                                                                  offer
                                                                    .itineraries[0]
                                                                    .segments[0]
                                                                    .carrierCode;
                                                                let airlineName =
                                                                  '';

                                                                if (
                                                                  offer
                                                                    .dictionaries
                                                                    ?.carriers &&
                                                                  offer
                                                                    .dictionaries
                                                                    .carriers[
                                                                    carrierCode
                                                                  ]
                                                                ) {
                                                                  airlineName =
                                                                    offer
                                                                      .dictionaries
                                                                      .carriers[
                                                                      carrierCode
                                                                    ];
                                                                } else if (
                                                                  apiData
                                                                    ?.dictionaries
                                                                    ?.airlines
                                                                ) {
                                                                  const airline =
                                                                    apiData.dictionaries.airlines.find(
                                                                      (a) =>
                                                                        a.code ===
                                                                        carrierCode
                                                                    );
                                                                  airlineName =
                                                                    airline
                                                                      ? airline.name
                                                                      : carrierCode;
                                                                } else {
                                                                  airlineName =
                                                                    carrierCode;
                                                                }

                                                                // Add "Both flights" label for mobile view when same airline
                                                                return (
                                                                  <>
                                                                    <span className="md:inline">
                                                                      {
                                                                        airlineName
                                                                      }
                                                                    </span>
                                                                    {/* {hasSameAirline && (
                                                                    <span className="md:hidden">
                                                                      {' '}
                                                                      (Both
                                                                      flights)
                                                                    </span>
                                                                  )} */}
                                                                  </>
                                                                );
                                                              })()}
                                                            </div>
                                                          </div>
                                                        </div>

                                                        {/* Return flight airline - hide on mobile if same airline, always show on desktop */}
                                                        {offer.itineraries
                                                          .length > 1 && (
                                                          <div
                                                            className={`flex flex-col md:flex-col md:items-center w-full md:mt-2 md:mt-3 pt-2 md:pt-3 ${
                                                              hasSameAirline
                                                                ? 'hidden md:flex'
                                                                : ''
                                                            }`}
                                                          >
                                                            <div className="flex md:flex-col items-center md:mb-1">
                                                              <img
                                                                src={`https://pics.avs.io/200/40/${offer.itineraries[1].segments[0].carrierCode}.png`}
                                                                alt={
                                                                  offer
                                                                    .itineraries[1]
                                                                    .segments[0]
                                                                    .carrierCode
                                                                }
                                                                className="h-6 object-contain w-24"
                                                                onError={(
                                                                  e
                                                                ) => {
                                                                  e.currentTarget.src =
                                                                    'https://via.placeholder.com/80x20?text=Airline';
                                                                }}
                                                              />
                                                              <div className="label-l3 text-background-on ml-2 md:ml-0 md:mt-2 text-center">
                                                                {(() => {
                                                                  const carrierCode =
                                                                    offer
                                                                      .itineraries[1]
                                                                      .segments[0]
                                                                      .carrierCode;
                                                                  if (
                                                                    offer
                                                                      .dictionaries
                                                                      ?.carriers &&
                                                                    offer
                                                                      .dictionaries
                                                                      .carriers[
                                                                      carrierCode
                                                                    ]
                                                                  ) {
                                                                    return offer
                                                                      .dictionaries
                                                                      .carriers[
                                                                      carrierCode
                                                                    ];
                                                                  } else if (
                                                                    apiData
                                                                      ?.dictionaries
                                                                      ?.airlines
                                                                  ) {
                                                                    const airline =
                                                                      apiData.dictionaries.airlines.find(
                                                                        (a) =>
                                                                          a.code ===
                                                                          carrierCode
                                                                      );
                                                                    return airline
                                                                      ? airline.name
                                                                      : carrierCode;
                                                                  }
                                                                  return carrierCode;
                                                                })()}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </>
                                                    );
                                                  })()}
                                                </div>
                                              </div>

                                              {/* Center column with flight itineraries */}
                                              <div className="md:flex-1 flex flex-col items-center justify-center px-3 py-0 md:py-3 md:pr-6 md:flex md:items-center md:self-center">
                                                {/* Outbound flight */}
                                                <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between md:mb-1">
                                                  {/* Departure */}
                                                  <div className="flex flex-col items-start justify-center">
                                                    <div className="label-l3 text-neutral-dark">
                                                      {format(
                                                        new Date(
                                                          offer.itineraries[0].segments[0].departure.at
                                                        ),
                                                        'dd MMM, EEE'
                                                      )}
                                                    </div>
                                                    <div className="title-t3 text-background-on">
                                                      {format(
                                                        new Date(
                                                          offer.itineraries[0].segments[0].departure.at
                                                        ),
                                                        'H:mm'
                                                      )}
                                                    </div>
                                                    <div className="label-l3 text-neutral-dark">
                                                      {
                                                        offer.itineraries[0]
                                                          .segments[0].departure
                                                          .iataCode
                                                      }
                                                    </div>
                                                  </div>

                                                  {/* Duration and stops */}
                                                  <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
                                                    <div className="label-l3 text-neutral-dark mb-1 pl-1">
                                                      {(() => {
                                                        const departureTime =
                                                          new Date(
                                                            offer.itineraries[0].segments[0].departure.at
                                                          );
                                                        const arrivalTime =
                                                          new Date(
                                                            offer.itineraries[0].segments[
                                                              offer
                                                                .itineraries[0]
                                                                .segments
                                                                .length - 1
                                                            ].arrival.at
                                                          );
                                                        const durationMs =
                                                          arrivalTime.getTime() -
                                                          departureTime.getTime();
                                                        const durationMin =
                                                          Math.floor(
                                                            durationMs /
                                                              (1000 * 60)
                                                          );
                                                        const hours =
                                                          Math.floor(
                                                            durationMin / 60
                                                          );
                                                        const mins =
                                                          durationMin % 60;
                                                        return `${hours}h ${mins}min`;
                                                      })()}
                                                    </div>
                                                    <div className="flex items-center">
                                                      <img
                                                        src="/assets/plane-icon.svg"
                                                        alt="Departure"
                                                        className="w-6 h-6 label-l3 text-neutral-dark"
                                                        onError={(e) => {
                                                          e.currentTarget.src =
                                                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
                                                        }}
                                                      />

                                                      {/* Flight path display */}
                                                      <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
                                                        {/* Horizontal line spanning full width */}
                                                        <div className="w-full h-[1px] bg-gray-300 absolute"></div>

                                                        {/* Transit points bubble - only if there are stops */}
                                                        {offer.itineraries[0]
                                                          .segments.length >
                                                          1 && (
                                                          <div className="mx-auto bg-container border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
                                                            {offer.itineraries[0].segments
                                                              .slice(0, -1)
                                                              .map(
                                                                (
                                                                  segment,
                                                                  idx
                                                                ) => (
                                                                  <React.Fragment
                                                                    key={`transit-${idx}`}
                                                                  >
                                                                    {
                                                                      segment
                                                                        .arrival
                                                                        .iataCode
                                                                    }
                                                                    {idx <
                                                                      offer
                                                                        .itineraries[0]
                                                                        .segments
                                                                        .length -
                                                                        2 &&
                                                                      ', '}
                                                                  </React.Fragment>
                                                                )
                                                              )}
                                                          </div>
                                                        )}
                                                      </div>

                                                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                                                    </div>

                                                    <div className="flex  items-center mt-1 ">
                                                      {/* Stops text */}
                                                      <div className="label-l3 text-secondary-bright mr-1">
                                                        {offer.itineraries[0]
                                                          .segments.length === 1
                                                          ? 'Direct'
                                                          : offer.itineraries[0]
                                                              .segments
                                                              .length === 2
                                                          ? '1 Stop'
                                                          : `${
                                                              offer
                                                                .itineraries[0]
                                                                .segments
                                                                .length - 1
                                                            } Stops`}
                                                      </div>
                                                      {/* Transit times */}

                                                      {offer.itineraries[0]
                                                        .segments.length >
                                                        1 && (
                                                        <div className="label-l3 text-background-on mt-0.5">
                                                          {' ('}{' '}
                                                          {offer.itineraries[0].segments.map(
                                                            (segment, idx) => {
                                                              if (
                                                                idx <
                                                                offer
                                                                  .itineraries[0]
                                                                  .segments
                                                                  .length -
                                                                  1
                                                              ) {
                                                                const nextSegment =
                                                                  offer
                                                                    .itineraries[0]
                                                                    .segments[
                                                                    idx + 1
                                                                  ];
                                                                const transitTime =
                                                                  Math.round(
                                                                    (new Date(
                                                                      nextSegment.departure.at
                                                                    ).getTime() -
                                                                      new Date(
                                                                        segment.arrival.at
                                                                      ).getTime()) /
                                                                      (1000 *
                                                                        60)
                                                                  );
                                                                const hours =
                                                                  Math.floor(
                                                                    transitTime /
                                                                      60
                                                                  );
                                                                const mins =
                                                                  transitTime %
                                                                  60;
                                                                return (
                                                                  <span
                                                                    key={`transit-time-${idx}`}
                                                                    className="inline-block "
                                                                  >
                                                                    {idx > 0 &&
                                                                      ', '}
                                                                    {hours}h{' '}
                                                                    {mins}min
                                                                  </span>
                                                                );
                                                              }
                                                              return null;
                                                            }
                                                          )}
                                                          {')'}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Arrival */}
                                                  <div className="flex flex-col items-end justify-center">
                                                    <div className="label-l3 text-neutral-dark">
                                                      {format(
                                                        new Date(
                                                          offer.itineraries[0].segments[
                                                            offer.itineraries[0]
                                                              .segments.length -
                                                              1
                                                          ].arrival.at
                                                        ),
                                                        'dd MMM, EEE'
                                                      )}
                                                    </div>
                                                    <div className="title-t3 text-background-on">
                                                      {format(
                                                        new Date(
                                                          offer.itineraries[0].segments[
                                                            offer.itineraries[0]
                                                              .segments.length -
                                                              1
                                                          ].arrival.at
                                                        ),
                                                        'H:mm'
                                                      )}
                                                    </div>
                                                    <div className="label-l3 text-neutral-dark">
                                                      {
                                                        offer.itineraries[0]
                                                          .segments[
                                                          offer.itineraries[0]
                                                            .segments.length - 1
                                                        ].arrival.iataCode
                                                      }
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Return flight if exists */}
                                                {offer.itineraries.length >
                                                  1 && (
                                                  <div className="w-full md:pt-0 md:mt-0  flex flex-wrap md:flex-nowrap items-center justify-between">
                                                    {/* Departure */}
                                                    <div className="flex flex-col items-start justify-center">
                                                      <div className="label-l3 text-neutral-dark">
                                                        {format(
                                                          new Date(
                                                            offer.itineraries[1].segments[0].departure.at
                                                          ),
                                                          'dd MMM, EEE'
                                                        )}
                                                      </div>
                                                      <div className="title-t3 text-background-on">
                                                        {format(
                                                          new Date(
                                                            offer.itineraries[1].segments[0].departure.at
                                                          ),
                                                          'H:mm'
                                                        )}
                                                      </div>
                                                      <div className="label-l3 text-neutral-dark">
                                                        {
                                                          offer.itineraries[1]
                                                            .segments[0]
                                                            .departure.iataCode
                                                        }
                                                      </div>
                                                    </div>

                                                    {/* Duration and stops */}
                                                    <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
                                                      <div className="label-l3 text-neutral-dark mb-1 pl-1">
                                                        {(() => {
                                                          const departureTime =
                                                            new Date(
                                                              offer.itineraries[1].segments[0].departure.at
                                                            );
                                                          const arrivalTime =
                                                            new Date(
                                                              offer.itineraries[1].segments[
                                                                offer
                                                                  .itineraries[1]
                                                                  .segments
                                                                  .length - 1
                                                              ].arrival.at
                                                            );
                                                          const durationMs =
                                                            arrivalTime.getTime() -
                                                            departureTime.getTime();
                                                          const durationMin =
                                                            Math.floor(
                                                              durationMs /
                                                                (1000 * 60)
                                                            );
                                                          const hours =
                                                            Math.floor(
                                                              durationMin / 60
                                                            );
                                                          const mins =
                                                            durationMin % 60;
                                                          return `${hours}h ${mins}min`;
                                                        })()}
                                                      </div>
                                                      <div className="flex items-center">
                                                        <img
                                                          src="/assets/plane-icon.svg"
                                                          alt="Departure"
                                                          className="w-6 h-6 text-gray-400"
                                                          onError={(e) => {
                                                            e.currentTarget.src =
                                                              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
                                                          }}
                                                        />

                                                        {/* Flight path display */}
                                                        <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
                                                          {/* Horizontal line spanning full width */}
                                                          <div className="w-full h-[1px] bg-gray-300 absolute"></div>

                                                          {/* Transit points bubble - only if there are stops */}
                                                          {offer.itineraries[1]
                                                            .segments.length >
                                                            1 && (
                                                            <div className="mx-auto bg-container border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
                                                              {offer.itineraries[1].segments
                                                                .slice(0, -1)
                                                                .map(
                                                                  (
                                                                    segment,
                                                                    idx
                                                                  ) => (
                                                                    <React.Fragment
                                                                      key={`transit-return-${idx}`}
                                                                    >
                                                                      {
                                                                        segment
                                                                          .arrival
                                                                          .iataCode
                                                                      }
                                                                      {idx <
                                                                        offer
                                                                          .itineraries[1]
                                                                          .segments
                                                                          .length -
                                                                          2 &&
                                                                        ', '}
                                                                    </React.Fragment>
                                                                  )
                                                                )}
                                                            </div>
                                                          )}
                                                        </div>

                                                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                                                      </div>

                                                      <div className="flex  items-center mt-1 ">
                                                        {/* Stops text */}
                                                        <div className="label-l3 text-secondary-bright mr-1">
                                                          {offer.itineraries[1]
                                                            .segments.length ===
                                                          1
                                                            ? 'Direct'
                                                            : offer
                                                                .itineraries[1]
                                                                .segments
                                                                .length === 2
                                                            ? '1 Stop'
                                                            : `${
                                                                offer
                                                                  .itineraries[1]
                                                                  .segments
                                                                  .length - 1
                                                              } Stops`}
                                                        </div>
                                                        {/* Transit times */}

                                                        {offer.itineraries[1]
                                                          .segments.length >
                                                          1 && (
                                                          <div className="label-l3 text-background-on mt-0.5">
                                                            {' ('}{' '}
                                                            {offer.itineraries[1].segments.map(
                                                              (
                                                                segment,
                                                                idx
                                                              ) => {
                                                                if (
                                                                  idx <
                                                                  offer
                                                                    .itineraries[1]
                                                                    .segments
                                                                    .length -
                                                                    1
                                                                ) {
                                                                  const nextSegment =
                                                                    offer
                                                                      .itineraries[1]
                                                                      .segments[
                                                                      idx + 1
                                                                    ];
                                                                  const transitTime =
                                                                    Math.round(
                                                                      (new Date(
                                                                        nextSegment.departure.at
                                                                      ).getTime() -
                                                                        new Date(
                                                                          segment.arrival.at
                                                                        ).getTime()) /
                                                                        (1000 *
                                                                          60)
                                                                    );
                                                                  const hours =
                                                                    Math.floor(
                                                                      transitTime /
                                                                        60
                                                                    );
                                                                  const mins =
                                                                    transitTime %
                                                                    60;
                                                                  return (
                                                                    <span
                                                                      key={`transit-time-return-${idx}`}
                                                                      className="inline-block "
                                                                    >
                                                                      {idx >
                                                                        0 &&
                                                                        ', '}
                                                                      {hours}h{' '}
                                                                      {mins}
                                                                      min
                                                                    </span>
                                                                  );
                                                                }
                                                                return null;
                                                              }
                                                            )}{' '}
                                                            {')'}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Arrival */}
                                                    <div className="flex flex-col items-end justify-center">
                                                      <div className="label-l3 text-neutral-dark">
                                                        {format(
                                                          new Date(
                                                            offer.itineraries[1].segments[
                                                              offer
                                                                .itineraries[1]
                                                                .segments
                                                                .length - 1
                                                            ].arrival.at
                                                          ),
                                                          'dd MMM, EEE'
                                                        )}
                                                      </div>
                                                      <div className="title-t3 text-background-on">
                                                        {format(
                                                          new Date(
                                                            offer.itineraries[1].segments[
                                                              offer
                                                                .itineraries[1]
                                                                .segments
                                                                .length - 1
                                                            ].arrival.at
                                                          ),
                                                          'H:mm'
                                                        )}
                                                      </div>
                                                      <div className="label-l3 text-neutral-dark">
                                                        {
                                                          offer.itineraries[1]
                                                            .segments[
                                                            offer.itineraries[1]
                                                              .segments.length -
                                                              1
                                                          ].arrival.iataCode
                                                        }
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Right column - Price and Book button */}
                                              <div className="w-full md:w-[230px] px-2 md:px-2 py-2 md:py-4 flex flex-col md:items-end justify-center border-t md:border-t-0 border-l">
                                                {/* Desktop view (hidden on mobile) */}
                                                <div className="hidden md:flex md:flex-col md:items-end md:w-full ">
                                                  <div
                                                    className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex items-center justify-end"
                                                    style={{
                                                      boxShadow:
                                                        '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
                                                    }}
                                                  >
                                                    <Image
                                                      src="/assets/icons/seatIcon.svg"
                                                      width={12}
                                                      height={12}
                                                      alt="seatIcon"
                                                      className="me-1 flex-shrink-0 my-auto"
                                                    />
                                                    {(() => {
                                                      let seatsAvailable;
                                                      if (
                                                        offer.totalSlotAvailable
                                                      ) {
                                                        seatsAvailable =
                                                          offer.totalSlotAvailable;
                                                      } else if (
                                                        offer.children &&
                                                        offer.children[0]
                                                          ?.totalSlotAvailable
                                                      ) {
                                                        seatsAvailable =
                                                          offer.children[0]
                                                            .totalSlotAvailable;
                                                      } else {
                                                        seatsAvailable =
                                                          offer.numberOfBookableSeats;
                                                      }

                                                      return seatsAvailable
                                                        ? `${seatsAvailable} ${
                                                            seatsAvailable > 1
                                                              ? 'seats'
                                                              : 'seat'
                                                          } left`
                                                        : 'Limited seats available';
                                                    })()}
                                                  </div>

                                                  {getAdultPrice(offer) && (
                                                    <div className="title-t3 text-primary  mt-1 text-right">
                                                      {flight.price.currency}{' '}
                                                      {formatDisplayPrice(
                                                        getAdultPrice(offer)!
                                                      )}
                                                      {'/'}
                                                      <span className="label-l3 text-primary">
                                                        per adult
                                                      </span>
                                                    </div>
                                                  )}
                                                  <div className="label-l3 text-neutral-dark mb-2 text-right">
                                                    Total:{' '}
                                                    {flight.price.currency}{' '}
                                                    {Math.floor(
                                                      parseFloat(
                                                        getCheapestTotalPrice(
                                                          offer
                                                        )
                                                      )
                                                    )}
                                                  </div>

                                                  {/* Baggage Information */}
                                                  <div className="flex flex-col items-start text-left space-y-1 mb-3 w-full">
                                                    {/* Outbound Baggage */}
                                                    <div className="flex items-start w-full">
                                                      <Image
                                                        src="/assets/icons/baggageIcon.svg"
                                                        width={12}
                                                        height={12}
                                                        alt="baggageIcon"
                                                        className="me-1 flex-shrink-0"
                                                      />
                                                      <span className="label-l3 text-neutral-dark inline-flex items-start">
                                                        {(() => {
                                                          // Get outbound baggage info
                                                          if (
                                                            offer.travelerPricings &&
                                                            offer
                                                              .travelerPricings
                                                              .length > 0 &&
                                                            offer.itineraries
                                                              .length > 0
                                                          ) {
                                                            const adultTraveler =
                                                              offer.travelerPricings.find(
                                                                (tp) =>
                                                                  tp.travelerType ===
                                                                  'ADULT'
                                                              );
                                                            if (
                                                              adultTraveler?.fareDetailsBySegment &&
                                                              adultTraveler
                                                                .fareDetailsBySegment
                                                                .length > 0
                                                            ) {
                                                              const firstSegment =
                                                                adultTraveler
                                                                  .fareDetailsBySegment[0];

                                                              // Handle cabin bags (hand carry)
                                                              let cabinBagsDisplay =
                                                                'N/A'; // Default to N/A if no data
                                                              if (
                                                                firstSegment?.includedCabinBags !==
                                                                undefined
                                                              ) {
                                                                // Check if weight is provided directly
                                                                if (
                                                                  'weight' in
                                                                    firstSegment.includedCabinBags &&
                                                                  firstSegment
                                                                    .includedCabinBags
                                                                    .weight !==
                                                                    undefined
                                                                ) {
                                                                  const weight =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .weight;
                                                                  const weightUnit =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .weightUnit ||
                                                                    'KG';
                                                                  cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                                }
                                                                // Otherwise use quantity if available
                                                                else if (
                                                                  'quantity' in
                                                                    firstSegment.includedCabinBags &&
                                                                  firstSegment
                                                                    .includedCabinBags
                                                                    .quantity !==
                                                                    undefined
                                                                ) {
                                                                  const cabinQuantity =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .quantity;
                                                                  if (
                                                                    cabinQuantity ===
                                                                    0
                                                                  ) {
                                                                    cabinBagsDisplay =
                                                                      '0 KG';
                                                                  } else if (
                                                                    cabinQuantity >
                                                                    0
                                                                  ) {
                                                                    // Display as "7+7+..." for hand carry when quantity > 0
                                                                    cabinBagsDisplay = `${Array(
                                                                      cabinQuantity
                                                                    )
                                                                      .fill('7')
                                                                      .join(
                                                                        '+'
                                                                      )} KG`;
                                                                  }
                                                                }
                                                              }

                                                              // Handle checked bags
                                                              let checkedBagsDisplay =
                                                                '';
                                                              if (
                                                                firstSegment?.includedCheckedBags
                                                              ) {
                                                                // If weight is specified directly
                                                                if (
                                                                  'weight' in
                                                                    firstSegment.includedCheckedBags &&
                                                                  firstSegment
                                                                    .includedCheckedBags
                                                                    .weight !==
                                                                    undefined
                                                                ) {
                                                                  const weight =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .weight;
                                                                  const weightUnit =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .weightUnit ||
                                                                    'KG';
                                                                  checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                                }
                                                                // If quantity is specified, display as 23+23+... KG
                                                                else if (
                                                                  'quantity' in
                                                                    firstSegment.includedCheckedBags &&
                                                                  firstSegment
                                                                    .includedCheckedBags
                                                                    .quantity !==
                                                                    undefined
                                                                ) {
                                                                  const quantity =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .quantity;
                                                                  if (
                                                                    quantity > 0
                                                                  ) {
                                                                    checkedBagsDisplay = ` + ${Array(
                                                                      quantity
                                                                    )
                                                                      .fill(
                                                                        '23'
                                                                      )
                                                                      .join(
                                                                        '+'
                                                                      )} KG`;
                                                                  }
                                                                }
                                                              }

                                                              return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                            }
                                                          }
                                                          return 'Outbound Baggage: N/A';
                                                        })()}
                                                      </span>
                                                    </div>

                                                    {/* Return Baggage - only show if there's a return flight */}
                                                    {offer.itineraries.length >
                                                      1 && (
                                                      <div className="flex items-start w-full">
                                                        <Image
                                                          src="/assets/icons/baggageIcon.svg"
                                                          width={12}
                                                          height={12}
                                                          alt="baggageIcon"
                                                          className="me-1 flex-shrink-0"
                                                        />
                                                        <span className="label-l3 text-neutral-dark inline-flex items-start">
                                                          {(() => {
                                                            // Get return baggage info if exists
                                                            if (
                                                              offer.travelerPricings &&
                                                              offer
                                                                .travelerPricings
                                                                .length > 0 &&
                                                              offer.itineraries
                                                                .length > 1
                                                            ) {
                                                              const adultTraveler =
                                                                offer.travelerPricings.find(
                                                                  (tp) =>
                                                                    tp.travelerType ===
                                                                    'ADULT'
                                                                );
                                                              if (
                                                                adultTraveler?.fareDetailsBySegment &&
                                                                adultTraveler
                                                                  .fareDetailsBySegment
                                                                  .length > 1
                                                              ) {
                                                                // Try to find the right segment for the return flight
                                                                let returnSegment;

                                                                // Best approach: First check if segmentId matches number or id property
                                                                if (
                                                                  offer
                                                                    .itineraries[1]
                                                                    ?.segments[0]
                                                                    ?.number
                                                                ) {
                                                                  returnSegment =
                                                                    adultTraveler.fareDetailsBySegment.find(
                                                                      (
                                                                        segment
                                                                      ) =>
                                                                        segment.segmentId ===
                                                                        offer
                                                                          .itineraries[1]
                                                                          .segments[0]
                                                                          .number
                                                                    );
                                                                }

                                                                // If no match found, try matching by position
                                                                if (
                                                                  !returnSegment
                                                                ) {
                                                                  // Count outbound segments
                                                                  const outboundSegmentsCount =
                                                                    offer
                                                                      .itineraries[0]
                                                                      .segments
                                                                      .length;

                                                                  // If we have more fareDetailsBySegment than outbound segments,
                                                                  // use the first one after the outbound segments
                                                                  if (
                                                                    adultTraveler
                                                                      .fareDetailsBySegment
                                                                      .length >
                                                                    outboundSegmentsCount
                                                                  ) {
                                                                    returnSegment =
                                                                      adultTraveler
                                                                        .fareDetailsBySegment[
                                                                        outboundSegmentsCount
                                                                      ];
                                                                  }
                                                                  // Otherwise fall back to the default behavior (second segment)
                                                                  else {
                                                                    returnSegment =
                                                                      adultTraveler
                                                                        .fareDetailsBySegment[1];
                                                                  }
                                                                }

                                                                // Handle cabin bags (hand carry)
                                                                let cabinBagsDisplay =
                                                                  'N/A'; // Default to N/A if no data
                                                                if (
                                                                  returnSegment?.includedCabinBags !==
                                                                  undefined
                                                                ) {
                                                                  // Check if weight is provided directly
                                                                  if (
                                                                    'weight' in
                                                                      returnSegment.includedCabinBags &&
                                                                    returnSegment
                                                                      .includedCabinBags
                                                                      .weight !==
                                                                      undefined
                                                                  ) {
                                                                    const weight =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .weight;
                                                                    const weightUnit =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .weightUnit ||
                                                                      'KG';
                                                                    cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                                  }
                                                                  // Otherwise use quantity if available
                                                                  else if (
                                                                    'quantity' in
                                                                      returnSegment.includedCabinBags &&
                                                                    returnSegment
                                                                      .includedCabinBags
                                                                      .quantity !==
                                                                      undefined
                                                                  ) {
                                                                    const cabinQuantity =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .quantity;
                                                                    if (
                                                                      cabinQuantity ===
                                                                      0
                                                                    ) {
                                                                      cabinBagsDisplay =
                                                                        '0 KG';
                                                                    } else if (
                                                                      cabinQuantity >
                                                                      0
                                                                    ) {
                                                                      // Display as "7+7+..." for hand carry
                                                                      cabinBagsDisplay = `${Array(
                                                                        cabinQuantity
                                                                      )
                                                                        .fill(
                                                                          '7'
                                                                        )
                                                                        .join(
                                                                          '+'
                                                                        )} KG`;
                                                                    }
                                                                  }
                                                                }

                                                                // Handle checked bags
                                                                let checkedBagsDisplay =
                                                                  '';
                                                                if (
                                                                  returnSegment?.includedCheckedBags
                                                                ) {
                                                                  // If weight is specified directly
                                                                  if (
                                                                    'weight' in
                                                                      returnSegment.includedCheckedBags &&
                                                                    returnSegment
                                                                      .includedCheckedBags
                                                                      .weight !==
                                                                      undefined
                                                                  ) {
                                                                    const weight =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .weight;
                                                                    const weightUnit =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .weightUnit ||
                                                                      'KG';
                                                                    checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                                  }
                                                                  // If quantity is specified, display as 23+23+... KG
                                                                  else if (
                                                                    'quantity' in
                                                                      returnSegment.includedCheckedBags &&
                                                                    returnSegment
                                                                      .includedCheckedBags
                                                                      .quantity !==
                                                                      undefined
                                                                  ) {
                                                                    const quantity =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .quantity;
                                                                    if (
                                                                      quantity >
                                                                      0
                                                                    ) {
                                                                      checkedBagsDisplay = ` + ${Array(
                                                                        quantity
                                                                      )
                                                                        .fill(
                                                                          '23'
                                                                        )
                                                                        .join(
                                                                          '+'
                                                                        )} KG`;
                                                                    }
                                                                  }
                                                                }

                                                                return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                              }
                                                            }
                                                            return 'Return Baggage: N/A';
                                                          })()}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {/* Refundable Status */}
                                                    <div className="flex flex-col items-start text-left space-y-1 mb-2 w-full">
                                                      {(() => {
                                                        if (
                                                          !offer.fareRules
                                                            ?.rules
                                                        ) {
                                                          return (
                                                            <span className="label-l3 text-error flex items-center gap-1">
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
                                                                <circle
                                                                  cx="12"
                                                                  cy="12"
                                                                  r="10"
                                                                />
                                                                <line
                                                                  x1="15"
                                                                  y1="9"
                                                                  x2="9"
                                                                  y2="15"
                                                                />
                                                                <line
                                                                  x1="9"
                                                                  y1="9"
                                                                  x2="15"
                                                                  y2="15"
                                                                />
                                                              </svg>
                                                              Non-refundable
                                                            </span>
                                                          );
                                                        }

                                                        const refundRule =
                                                          offer.fareRules.rules.find(
                                                            (rule) =>
                                                              rule.category ===
                                                              'REFUND'
                                                          );

                                                        if (
                                                          !refundRule ||
                                                          refundRule.notApplicable
                                                        ) {
                                                          return (
                                                            <span className="label-l3 text-error flex items-center gap-1">
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
                                                                <circle
                                                                  cx="12"
                                                                  cy="12"
                                                                  r="10"
                                                                />
                                                                <line
                                                                  x1="15"
                                                                  y1="9"
                                                                  x2="9"
                                                                  y2="15"
                                                                />
                                                                <line
                                                                  x1="9"
                                                                  y1="9"
                                                                  x2="15"
                                                                  y2="15"
                                                                />
                                                              </svg>
                                                              Non-refundable
                                                            </span>
                                                          );
                                                        }

                                                        return (
                                                          <span className="label-l3 text-green-600 flex items-center gap-1">
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
                                                              <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                              />
                                                              <path d="M8 12l2 2 4-4" />
                                                            </svg>
                                                            Refundable
                                                          </span>
                                                        );
                                                      })()}
                                                    </div>
                                                  </div>

                                                  <Button
                                                    variant="outline"
                                                    className="w-full flex-1 bg-primary text-primary-on hover:bg-[#5143d9]"
                                                    onClick={async () => {
                                                      setSelectedFlight(flight);
                                                      const drawerId = `offer-${flight.id}-${index}-${offerIdx}`;
                                                      const newDrawerId =
                                                        drawerId ===
                                                        openDrawerId
                                                          ? null
                                                          : drawerId;
                                                      setOpenDrawerId(
                                                        newDrawerId
                                                      );
                                                      // Clear previous branded fares and fetch new ones when opening drawer
                                                      if (newDrawerId) {
                                                        setBrandedFaresData([]);
                                                        await fetchBrandedFaresUpsell(
                                                          offer
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <span className="flex items-center text-primary-on">
                                                      Select
                                                      <ChevronDown
                                                        className={`ml-1 h-4 w-4 transition-transform text-primary-on ${
                                                          openDrawerId ===
                                                          `offer-${flight.id}-${index}-${offerIdx}`
                                                            ? 'rotate-180'
                                                            : ''
                                                        }`}
                                                      />
                                                    </span>
                                                  </Button>
                                                </div>

                                                {/* Mobile view (hidden on desktop) */}
                                                <div className="flex flex-col w-full md:hidden">
                                                  <div className="flex justify-between items-center mb-3">
                                                    <div
                                                      className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex items-center justify-end"
                                                      style={{
                                                        boxShadow:
                                                          '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
                                                      }}
                                                    >
                                                      <Image
                                                        src="/assets/icons/seatIcon.svg"
                                                        width={12}
                                                        height={12}
                                                        alt="seatIcon"
                                                        className="me-1 flex-shrink-0 my-auto"
                                                      />
                                                      {offer.numberOfBookableSeats
                                                        ? `${offer.numberOfBookableSeats} seats left`
                                                        : 'Limited seats available'}
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                      {getAdultPrice(offer) && (
                                                        <div className=" title-t3 text-primary  mt-1 text-right">
                                                          {
                                                            flight.price
                                                              .currency
                                                          }{' '}
                                                          {formatDisplayPrice(
                                                            getAdultPrice(
                                                              offer
                                                            )!
                                                          )}
                                                          {'/'}
                                                          <span className="label-l3 text-primary">
                                                            per adult
                                                          </span>
                                                        </div>
                                                      )}
                                                      <span className="label-l3 text-neutral-dark font-medium">
                                                        Total:{' '}
                                                        {flight.price.currency}{' '}
                                                        {Math.floor(
                                                          parseFloat(
                                                            getCheapestTotalPrice(
                                                              offer
                                                            )
                                                          )
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  <div className="flex flex-col items-start text-left space-y-1 mb-3">
                                                    {/* Outbound Baggage */}
                                                    <div className="flex items-start w-full">
                                                      <Image
                                                        src="/assets/icons/baggageIcon.svg"
                                                        width={12}
                                                        height={12}
                                                        alt="baggageIcon"
                                                        className="me-1 flex-shrink-0"
                                                      />
                                                      <span className="label-l3 text-neutral-dark inline-flex items-start">
                                                        {(() => {
                                                          // Get outbound baggage info
                                                          if (
                                                            offer.travelerPricings &&
                                                            offer
                                                              .travelerPricings
                                                              .length > 0 &&
                                                            offer.itineraries
                                                              .length > 0
                                                          ) {
                                                            const adultTraveler =
                                                              offer.travelerPricings.find(
                                                                (tp) =>
                                                                  tp.travelerType ===
                                                                  'ADULT'
                                                              );
                                                            if (
                                                              adultTraveler?.fareDetailsBySegment &&
                                                              adultTraveler
                                                                .fareDetailsBySegment
                                                                .length > 0
                                                            ) {
                                                              const firstSegment =
                                                                adultTraveler
                                                                  .fareDetailsBySegment[0];

                                                              // Handle cabin bags (hand carry)
                                                              let cabinBagsDisplay =
                                                                'N/A'; // Default to N/A if no data
                                                              if (
                                                                firstSegment?.includedCabinBags !==
                                                                undefined
                                                              ) {
                                                                // Check if weight is provided directly
                                                                if (
                                                                  'weight' in
                                                                    firstSegment.includedCabinBags &&
                                                                  firstSegment
                                                                    .includedCabinBags
                                                                    .weight !==
                                                                    undefined
                                                                ) {
                                                                  const weight =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .weight;
                                                                  const weightUnit =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .weightUnit ||
                                                                    'KG';
                                                                  cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                                }
                                                                // Otherwise use quantity if available
                                                                else if (
                                                                  'quantity' in
                                                                    firstSegment.includedCabinBags &&
                                                                  firstSegment
                                                                    .includedCabinBags
                                                                    .quantity !==
                                                                    undefined
                                                                ) {
                                                                  const cabinQuantity =
                                                                    firstSegment
                                                                      .includedCabinBags
                                                                      .quantity;
                                                                  if (
                                                                    cabinQuantity ===
                                                                    0
                                                                  ) {
                                                                    cabinBagsDisplay =
                                                                      '0 KG';
                                                                  } else if (
                                                                    cabinQuantity >
                                                                    0
                                                                  ) {
                                                                    // Display as "7+7+..." for hand carry when quantity > 0
                                                                    cabinBagsDisplay = `${Array(
                                                                      cabinQuantity
                                                                    )
                                                                      .fill('7')
                                                                      .join(
                                                                        '+'
                                                                      )} KG`;
                                                                  }
                                                                }
                                                              }

                                                              // Handle checked bags
                                                              let checkedBagsDisplay =
                                                                '';
                                                              if (
                                                                firstSegment?.includedCheckedBags
                                                              ) {
                                                                // If weight is specified directly
                                                                if (
                                                                  'weight' in
                                                                    firstSegment.includedCheckedBags &&
                                                                  firstSegment
                                                                    .includedCheckedBags
                                                                    .weight !==
                                                                    undefined
                                                                ) {
                                                                  const weight =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .weight;
                                                                  const weightUnit =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .weightUnit ||
                                                                    'KG';
                                                                  checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                                }
                                                                // If quantity is specified, display as 23+23+... KG
                                                                else if (
                                                                  'quantity' in
                                                                    firstSegment.includedCheckedBags &&
                                                                  firstSegment
                                                                    .includedCheckedBags
                                                                    .quantity !==
                                                                    undefined
                                                                ) {
                                                                  const quantity =
                                                                    firstSegment
                                                                      .includedCheckedBags
                                                                      .quantity;
                                                                  if (
                                                                    quantity > 0
                                                                  ) {
                                                                    checkedBagsDisplay = ` + ${Array(
                                                                      quantity
                                                                    )
                                                                      .fill(
                                                                        '23'
                                                                      )
                                                                      .join(
                                                                        '+'
                                                                      )} KG`;
                                                                  }
                                                                }
                                                              }

                                                              return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                            }
                                                          }
                                                          return 'Outbound Baggage: N/A';
                                                        })()}
                                                      </span>
                                                    </div>

                                                    {/* Return Baggage - only show if there's a return flight */}
                                                    {offer.itineraries.length >
                                                      1 && (
                                                      <div className="flex items-start w-full">
                                                        <Image
                                                          src="/assets/icons/baggageIcon.svg"
                                                          width={12}
                                                          height={12}
                                                          alt="baggageIcon"
                                                          className="me-1 flex-shrink-0"
                                                        />
                                                        <span className="label-l3 text-neutral-dark inline-flex items-start">
                                                          {(() => {
                                                            // Get return baggage info if exists
                                                            if (
                                                              offer.travelerPricings &&
                                                              offer
                                                                .travelerPricings
                                                                .length > 0 &&
                                                              offer.itineraries
                                                                .length > 1
                                                            ) {
                                                              const adultTraveler =
                                                                offer.travelerPricings.find(
                                                                  (tp) =>
                                                                    tp.travelerType ===
                                                                    'ADULT'
                                                                );
                                                              if (
                                                                adultTraveler?.fareDetailsBySegment &&
                                                                adultTraveler
                                                                  .fareDetailsBySegment
                                                                  .length > 1
                                                              ) {
                                                                // Try to find the right segment for the return flight
                                                                let returnSegment;

                                                                // Best approach: First check if segmentId matches number or id property
                                                                if (
                                                                  offer
                                                                    .itineraries[1]
                                                                    ?.segments[0]
                                                                    ?.number
                                                                ) {
                                                                  returnSegment =
                                                                    adultTraveler.fareDetailsBySegment.find(
                                                                      (
                                                                        segment
                                                                      ) =>
                                                                        segment.segmentId ===
                                                                        offer
                                                                          .itineraries[1]
                                                                          .segments[0]
                                                                          .number
                                                                    );
                                                                }

                                                                // If no match found, try matching by position
                                                                if (
                                                                  !returnSegment
                                                                ) {
                                                                  // Count outbound segments
                                                                  const outboundSegmentsCount =
                                                                    offer
                                                                      .itineraries[0]
                                                                      .segments
                                                                      .length;

                                                                  // If we have more fareDetailsBySegment than outbound segments,
                                                                  // use the first one after the outbound segments
                                                                  if (
                                                                    adultTraveler
                                                                      .fareDetailsBySegment
                                                                      .length >
                                                                    outboundSegmentsCount
                                                                  ) {
                                                                    returnSegment =
                                                                      adultTraveler
                                                                        .fareDetailsBySegment[
                                                                        outboundSegmentsCount
                                                                      ];
                                                                  }
                                                                  // Otherwise fall back to the default behavior (second segment)
                                                                  else {
                                                                    returnSegment =
                                                                      adultTraveler
                                                                        .fareDetailsBySegment[1];
                                                                  }
                                                                }

                                                                // Handle cabin bags (hand carry)
                                                                let cabinBagsDisplay =
                                                                  'N/A'; // Default to N/A if no data
                                                                if (
                                                                  returnSegment?.includedCabinBags !==
                                                                  undefined
                                                                ) {
                                                                  // Check if weight is provided directly
                                                                  if (
                                                                    'weight' in
                                                                      returnSegment.includedCabinBags &&
                                                                    returnSegment
                                                                      .includedCabinBags
                                                                      .weight !==
                                                                      undefined
                                                                  ) {
                                                                    const weight =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .weight;
                                                                    const weightUnit =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .weightUnit ||
                                                                      'KG';
                                                                    cabinBagsDisplay = `${weight} ${weightUnit}`;
                                                                  }
                                                                  // Otherwise use quantity if available
                                                                  else if (
                                                                    'quantity' in
                                                                      returnSegment.includedCabinBags &&
                                                                    returnSegment
                                                                      .includedCabinBags
                                                                      .quantity !==
                                                                      undefined
                                                                  ) {
                                                                    const cabinQuantity =
                                                                      returnSegment
                                                                        .includedCabinBags
                                                                        .quantity;
                                                                    if (
                                                                      cabinQuantity ===
                                                                      0
                                                                    ) {
                                                                      cabinBagsDisplay =
                                                                        '0 KG';
                                                                    } else if (
                                                                      cabinQuantity >
                                                                      0
                                                                    ) {
                                                                      // Display as "7+7+..." for hand carry
                                                                      cabinBagsDisplay = `${Array(
                                                                        cabinQuantity
                                                                      )
                                                                        .fill(
                                                                          '7'
                                                                        )
                                                                        .join(
                                                                          '+'
                                                                        )} KG`;
                                                                    }
                                                                  }
                                                                }

                                                                // Handle checked bags
                                                                let checkedBagsDisplay =
                                                                  '';
                                                                if (
                                                                  returnSegment?.includedCheckedBags
                                                                ) {
                                                                  // If weight is specified directly
                                                                  if (
                                                                    'weight' in
                                                                      returnSegment.includedCheckedBags &&
                                                                    returnSegment
                                                                      .includedCheckedBags
                                                                      .weight !==
                                                                      undefined
                                                                  ) {
                                                                    const weight =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .weight;
                                                                    const weightUnit =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .weightUnit ||
                                                                      'KG';
                                                                    checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
                                                                  }
                                                                  // If quantity is specified, display as 23+23+... KG
                                                                  else if (
                                                                    'quantity' in
                                                                      returnSegment.includedCheckedBags &&
                                                                    returnSegment
                                                                      .includedCheckedBags
                                                                      .quantity !==
                                                                      undefined
                                                                  ) {
                                                                    const quantity =
                                                                      returnSegment
                                                                        .includedCheckedBags
                                                                        .quantity;
                                                                    if (
                                                                      quantity >
                                                                      0
                                                                    ) {
                                                                      checkedBagsDisplay = ` + ${Array(
                                                                        quantity
                                                                      )
                                                                        .fill(
                                                                          '23'
                                                                        )
                                                                        .join(
                                                                          '+'
                                                                        )} KG`;
                                                                    }
                                                                  }
                                                                }

                                                                return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
                                                              }
                                                            }
                                                            return 'Return Baggage: N/A';
                                                          })()}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {/* Refundable Status for Mobile */}
                                                    <div className="flex flex-col items-start text-left space-y-1 mb-2">
                                                      {(() => {
                                                        if (
                                                          !offer.fareRules
                                                            ?.rules
                                                        ) {
                                                          return (
                                                            <span className="label-l3 text-error flex items-center gap-1">
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
                                                                <circle
                                                                  cx="12"
                                                                  cy="12"
                                                                  r="10"
                                                                />
                                                                <line
                                                                  x1="15"
                                                                  y1="9"
                                                                  x2="9"
                                                                  y2="15"
                                                                />
                                                                <line
                                                                  x1="9"
                                                                  y1="9"
                                                                  x2="15"
                                                                  y2="15"
                                                                />
                                                              </svg>
                                                              Non-refundable
                                                            </span>
                                                          );
                                                        }

                                                        const refundRule =
                                                          offer.fareRules.rules.find(
                                                            (rule) =>
                                                              rule.category ===
                                                              'REFUND'
                                                          );

                                                        if (
                                                          !refundRule ||
                                                          refundRule.notApplicable
                                                        ) {
                                                          return (
                                                            <span className="label-l3 text-error flex items-center gap-1">
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
                                                                <circle
                                                                  cx="12"
                                                                  cy="12"
                                                                  r="10"
                                                                />
                                                                <line
                                                                  x1="15"
                                                                  y1="9"
                                                                  x2="9"
                                                                  y2="15"
                                                                />
                                                                <line
                                                                  x1="9"
                                                                  y1="9"
                                                                  x2="15"
                                                                  y2="15"
                                                                />
                                                              </svg>
                                                              Non-refundable
                                                            </span>
                                                          );
                                                        }

                                                        return (
                                                          <span className="label-l3 text-green-600 flex items-center gap-1">
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
                                                              <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                              />
                                                              <path d="M8 12l2 2 4-4" />
                                                            </svg>
                                                            Refundable
                                                          </span>
                                                        );
                                                      })()}
                                                    </div>
                                                  </div>

                                                  <Button
                                                    variant="outline"
                                                    className="w-full flex-1 bg-primary text-primary-on hover:bg-[#5143d9]"
                                                    onClick={async () => {
                                                      setSelectedFlight(flight);
                                                      const drawerId = `offer-${flight.id}-${index}-${offerIdx}`;
                                                      const newDrawerId =
                                                        drawerId ===
                                                        openDrawerId
                                                          ? null
                                                          : drawerId;
                                                      setOpenDrawerId(
                                                        newDrawerId
                                                      );
                                                      // Clear previous branded fares and fetch new ones when opening drawer
                                                      if (newDrawerId) {
                                                        setBrandedFaresData([]);
                                                        await fetchBrandedFaresUpsell(
                                                          offer
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <span className="flex items-center text-primary-on">
                                                      Select
                                                      <ChevronDown
                                                        className={`ml-1 h-4 w-4 transition-transform text-primary-on ${
                                                          openDrawerId ===
                                                          `offer-${flight.id}-${index}-${offerIdx}`
                                                            ? 'rotate-180'
                                                            : ''
                                                        }`}
                                                      />
                                                    </span>
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Flight Details Button Bar */}
                                            <div className="px-0 md:px-6 py-1 md:py-0 bg-container border-t">
                                              <div className="flex justify-end items-center">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="text-gray-500 hover:text-blue-950 flex justify-between items-center"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleOfferFlightDetails(
                                                      `offer-${flight.id}-${index}-${offerIdx}`,
                                                      offer
                                                    );
                                                  }}
                                                >
                                                  <span className="label-l3 text-primary">
                                                    Flight Details
                                                  </span>
                                                  <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Offer Flight Details Section */}
                                            {selectedFlightForDrawer?.id ===
                                              `offer-${flight.id}-${index}-${offerIdx}` && (
                                              <FlightDetailsDrawer
                                                flight={offer}
                                                flightId={`offer-${flight.id}-${index}-${offerIdx}`}
                                                searchParams={searchParams}
                                                onClose={closeFlightDetails}
                                                formatDuration={formatDuration}
                                                apiData={apiData}
                                                onBookNow={handleFlightBooking}
                                                activeTab={sortOption}
                                              />
                                            )}

                                            {/* Branded Fares Drawer for Cheapest/Shortest tabs - DISABLED */}
                                            {false &&
                                              openDrawerId ===
                                                `offer-${flight.id}-${index}-${offerIdx}` && (
                                                <>
                                                  {/* Desktop View */}
                                                  <div className="hidden md:block border-t border-[#EEEEEE] bg-white">
                                                    <div className="p-4">
                                                      {isLoadingBrandedFares ? (
                                                        <div className="flex justify-center items-center py-8">
                                                          <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                                                          <span>
                                                            Loading fare
                                                            options...
                                                          </span>
                                                        </div>
                                                      ) : brandedFaresData.length >
                                                        0 ? (
                                                        <div className="relative">
                                                          {/* Left Navigation Button */}
                                                          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                                                            <button
                                                              onClick={() => {
                                                                const container =
                                                                  document.getElementById(
                                                                    'fare-options-container-cheapest'
                                                                  );
                                                                if (container) {
                                                                  container.scrollLeft -= 320;
                                                                }
                                                              }}
                                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                              aria-label="Previous options"
                                                            >
                                                              <ChevronLeft className="h-6 w-6 text-gray-600" />
                                                            </button>
                                                          </div>
                                                          {/* Right Navigation Button */}
                                                          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                                                            <button
                                                              onClick={() => {
                                                                const container =
                                                                  document.getElementById(
                                                                    'fare-options-container-cheapest'
                                                                  );
                                                                if (container) {
                                                                  container.scrollLeft += 320;
                                                                }
                                                              }}
                                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                              aria-label="Next options"
                                                            >
                                                              <ChevronRight className="h-6 w-6 text-gray-600" />
                                                            </button>
                                                          </div>
                                                          <div
                                                            id="fare-options-container-cheapest"
                                                            className="flex space-x-4 overflow-x-auto md:scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden scrollbar-none"
                                                          >
                                                            <div className="flex space-x-4 min-w-min">
                                                              {brandedFaresData.map(
                                                                (
                                                                  fareOffer,
                                                                  fareIdx
                                                                ) => {
                                                                  const farePrice =
                                                                    parseFloat(
                                                                      fareOffer
                                                                        .price
                                                                        .grandTotal
                                                                    );
                                                                  return (
                                                                    <div
                                                                      key={`fare-${fareIdx}`}
                                                                      className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full"
                                                                    >
                                                                      {/* Header */}
                                                                      <div className="mb-4">
                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                          <h3 className="label-l2 text-neutral-dark mb-1">
                                                                            {fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.cabin ||
                                                                              'ECONOMY'}{' '}
                                                                            Class
                                                                          </h3>
                                                                        </div>
                                                                        <div className="title-t2 font-bold text-[#14104B]">
                                                                          {
                                                                            fareOffer
                                                                              .price
                                                                              .currency
                                                                          }{' '}
                                                                          {Math.floor(
                                                                            farePrice
                                                                          )}
                                                                        </div>
                                                                      </div>

                                                                      {/* Features List */}
                                                                      <div className="flex-1 space-y-3 mb-4">
                                                                        {/* Cabin Baggage */}
                                                                        <div className="flex items-center gap-2">
                                                                          <div
                                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                              fareOffer
                                                                                .travelerPricings?.[0]
                                                                                ?.fareDetailsBySegment?.[0]
                                                                                ?.includedCabinBags
                                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                                : 'bg-[#EF4444] text-primary-on'
                                                                            }`}
                                                                          >
                                                                            <span className="text-xs">
                                                                              {fareOffer
                                                                                .travelerPricings?.[0]
                                                                                ?.fareDetailsBySegment?.[0]
                                                                                ?.includedCabinBags ? (
                                                                                <IoMdCheckmark />
                                                                              ) : (
                                                                                '×'
                                                                              )}
                                                                            </span>
                                                                          </div>
                                                                          <span className="label-l2 text-background-on">
                                                                            Cabin
                                                                            baggage
                                                                            included
                                                                          </span>
                                                                        </div>

                                                                        {/* Checked Baggage */}
                                                                        <div className="flex items-center gap-2">
                                                                          <div
                                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                              fareOffer
                                                                                .travelerPricings?.[0]
                                                                                ?.fareDetailsBySegment?.[0]
                                                                                ?.includedCheckedBags
                                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                                : 'bg-[#EF4444] text-primary-on'
                                                                            }`}
                                                                          >
                                                                            <span className="text-xs">
                                                                              {fareOffer
                                                                                .travelerPricings?.[0]
                                                                                ?.fareDetailsBySegment?.[0]
                                                                                ?.includedCheckedBags ? (
                                                                                <IoMdCheckmark />
                                                                              ) : (
                                                                                '×'
                                                                              )}
                                                                            </span>
                                                                          </div>
                                                                          <span className="label-l2 text-background-on">
                                                                            Checked
                                                                            baggage:{' '}
                                                                            {fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.includedCheckedBags
                                                                              ?.quantity ||
                                                                              0}{' '}
                                                                          </span>
                                                                        </div>

                                                                        {/* Refund Status */}
                                                                        <div className="flex items-center gap-2">
                                                                          <div
                                                                            className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                              fareOffer
                                                                                .pricingOptions
                                                                                ?.refundableFare
                                                                                ? 'bg-[#22C55E] text-primary-on'
                                                                                : 'bg-[#EF4444] text-primary-on'
                                                                            }`}
                                                                          >
                                                                            <span className="text-xs">
                                                                              {fareOffer
                                                                                .pricingOptions
                                                                                ?.refundableFare ? (
                                                                                <IoMdCheckmark />
                                                                              ) : (
                                                                                '×'
                                                                              )}
                                                                            </span>
                                                                          </div>
                                                                          <span className="label-l2 text-background-on">
                                                                            {fareOffer
                                                                              .pricingOptions
                                                                              ?.refundableFare
                                                                              ? 'Refundable'
                                                                              : 'Non-refundable'}
                                                                          </span>
                                                                        </div>
                                                                      </div>

                                                                      {/* Book Now Button */}
                                                                      <div className="mt-auto pt-4">
                                                                        <button
                                                                          onClick={() => {
                                                                            handleOfferFlightBooking(
                                                                              fareOffer
                                                                            );
                                                                            setOpenDrawerId(
                                                                              null
                                                                            );
                                                                          }}
                                                                          className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                                        >
                                                                          Book
                                                                          Now
                                                                        </button>
                                                                      </div>
                                                                    </div>
                                                                  );
                                                                }
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <div className="relative">
                                                          {/* Left Navigation Button */}
                                                          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                                                            <button
                                                              onClick={() => {
                                                                const container =
                                                                  document.getElementById(
                                                                    'fare-options-container-cheapest'
                                                                  );
                                                                if (container) {
                                                                  container.scrollLeft -= 320;
                                                                }
                                                              }}
                                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                              aria-label="Previous options"
                                                            >
                                                              <ChevronLeft className="h-6 w-6 text-gray-600" />
                                                            </button>
                                                          </div>
                                                          {/* Right Navigation Button */}
                                                          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                                                            <button
                                                              onClick={() => {
                                                                const container =
                                                                  document.getElementById(
                                                                    'fare-options-container-cheapest'
                                                                  );
                                                                if (container) {
                                                                  container.scrollLeft += 320;
                                                                }
                                                              }}
                                                              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                                              aria-label="Next options"
                                                            >
                                                              <ChevronRight className="h-6 w-6 text-gray-600" />
                                                            </button>
                                                          </div>
                                                          <div
                                                            id="fare-options-container-cheapest"
                                                            className="flex space-x-4 overflow-x-auto md:scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden scrollbar-none"
                                                          >
                                                            <div className="flex space-x-4 min-w-min">
                                                              <div className="p-4 border rounded-lg flex-shrink-0 w-[300px] hover:shadow-md hover:border-[#5143d9] transition-shadow label-l2 text-background-on flex flex-col h-full">
                                                                {/* Header */}
                                                                <div className="mb-4">
                                                                  <div className="flex items-center justify-between gap-2 mb-1">
                                                                    <h3 className="label-l2 text-neutral-dark mb-1">
                                                                      {offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.cabin ||
                                                                        'ECONOMY'}{' '}
                                                                      Class
                                                                    </h3>
                                                                  </div>
                                                                  <div className="text-2xl font-bold text-primary mb-2">
                                                                    {
                                                                      offer
                                                                        .price
                                                                        .currency
                                                                    }{' '}
                                                                    {Math.floor(
                                                                      parseFloat(
                                                                        offer
                                                                          .price
                                                                          .grandTotal
                                                                      )
                                                                    )}
                                                                  </div>
                                                                </div>

                                                                {/* Features List */}
                                                                <div className="flex-1 space-y-3 mb-4">
                                                                  {/* Cabin Baggage */}
                                                                  <div className="flex items-center gap-2">
                                                                    <div
                                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1${
                                                                        offer
                                                                          .travelerPricings?.[0]
                                                                          ?.fareDetailsBySegment?.[0]
                                                                          ?.includedCabinBags
                                                                          ? 'bg-[#22C55E] text-primary-on'
                                                                          : 'bg-[#EF4444] text-primary-on'
                                                                      }`}
                                                                    >
                                                                      <span className="text-xs">
                                                                        {offer
                                                                          .travelerPricings?.[0]
                                                                          ?.fareDetailsBySegment?.[0]
                                                                          ?.includedCabinBags ? (
                                                                          <IoMdCheckmark />
                                                                        ) : (
                                                                          '×'
                                                                        )}
                                                                      </span>
                                                                    </div>
                                                                    <span className="text-sm text-neutral-dark">
                                                                      Cabin
                                                                      baggage
                                                                      included
                                                                    </span>
                                                                  </div>

                                                                  {/* Checked Baggage */}
                                                                  <div className="flex items-center gap-2">
                                                                    <div
                                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                        offer
                                                                          .travelerPricings?.[0]
                                                                          ?.fareDetailsBySegment?.[0]
                                                                          ?.includedCheckedBags
                                                                          ? 'bg-[#22C55E] text-primary-on'
                                                                          : 'bg-[#EF4444] text-primary-on'
                                                                      }`}
                                                                    >
                                                                      <span className="text-xs">
                                                                        {offer
                                                                          .travelerPricings?.[0]
                                                                          ?.fareDetailsBySegment?.[0]
                                                                          ?.includedCheckedBags ? (
                                                                          <IoMdCheckmark />
                                                                        ) : (
                                                                          '×'
                                                                        )}
                                                                      </span>
                                                                    </div>
                                                                    <span className="text-sm text-neutral-dark">
                                                                      {offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCheckedBags
                                                                        ?.quantity ||
                                                                        0}{' '}
                                                                      checked
                                                                      bag(s)
                                                                    </span>
                                                                  </div>

                                                                  {/* Refund Status */}
                                                                  <div className="flex items-center gap-2">
                                                                    <div
                                                                      className={`w-4 h-4 rounded-full flex items-center justify-center px-1${
                                                                        offer
                                                                          .pricingOptions
                                                                          ?.refundableFare
                                                                          ? 'bg-[#22C55E] text-primary-on'
                                                                          : 'bg-[#EF4444] text-primary-on'
                                                                      }`}
                                                                    >
                                                                      <span className="text-xs">
                                                                        {offer
                                                                          .pricingOptions
                                                                          ?.refundableFare ? (
                                                                          <IoMdCheckmark />
                                                                        ) : (
                                                                          '×'
                                                                        )}
                                                                      </span>
                                                                    </div>
                                                                    <span className="text-sm text-neutral-dark">
                                                                      {offer
                                                                        .pricingOptions
                                                                        ?.refundableFare
                                                                        ? 'Refundable'
                                                                        : 'Non-refundable'}
                                                                    </span>
                                                                  </div>
                                                                </div>

                                                                {/* Book Now Button */}
                                                                <div className="mt-auto pt-4">
                                                                  <button
                                                                    onClick={() => {
                                                                      handleOfferFlightBooking(
                                                                        offer
                                                                      );
                                                                      setOpenDrawerId(
                                                                        null
                                                                      );
                                                                    }}
                                                                    className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                                  >
                                                                    Book Now
                                                                  </button>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Mobile Bottom Sheet */}
                                                  <div className="block md:hidden fixed inset-x-0 bottom-0 z-50">
                                                    <div
                                                      className="bg-black bg-opacity-50 fixed inset-0"
                                                      onClick={() =>
                                                        setOpenDrawerId(null)
                                                      }
                                                    />
                                                    <div className="bg-white rounded-t-2xl p-4 relative z-10 max-h-[90vh] overflow-y-auto">
                                                      <div className="flex justify-center mb-2">
                                                        <div className="w-12 h-1 bg-gray-300 rounded-full" />
                                                      </div>
                                                      <div className="relative">
                                                        {isLoadingBrandedFares ? (
                                                          <div className="flex justify-center items-center py-8">
                                                            <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                                                            <span>
                                                              Loading fare
                                                              options...
                                                            </span>
                                                          </div>
                                                        ) : brandedFaresData.length >
                                                          0 ? (
                                                          <div className="flex flex-col space-y-4">
                                                            {brandedFaresData.map(
                                                              (
                                                                fareOffer,
                                                                fareIdx
                                                              ) => {
                                                                const farePrice =
                                                                  parseFloat(
                                                                    fareOffer
                                                                      .price
                                                                      .grandTotal
                                                                  );
                                                                return (
                                                                  <div
                                                                    key={`mobile-fare-${fareIdx}`}
                                                                    className="border border-gray-200 rounded-lg p-4 flex flex-col"
                                                                  >
                                                                    <div className="mb-3">
                                                                      <div className="text-lg font-semibold text-primary mb-1">
                                                                        {
                                                                          fareOffer
                                                                            .price
                                                                            .currency
                                                                        }{' '}
                                                                        {Math.floor(
                                                                          farePrice
                                                                        )}
                                                                      </div>
                                                                      {fareOffer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.brandedFare && (
                                                                        <div className="text-sm text-gray-600">
                                                                          {
                                                                            fareOffer
                                                                              .travelerPricings[0]
                                                                              .fareDetailsBySegment[0]
                                                                              .brandedFare
                                                                          }
                                                                        </div>
                                                                      )}
                                                                    </div>

                                                                    {/* Features List */}
                                                                    <div className="flex-1 space-y-3 mb-4">
                                                                      {/* Cabin Baggage */}
                                                                      <div className="flex items-center gap-2">
                                                                        <div
                                                                          className={`w-4 h-4 rounded-full flex items-center justify-center px1  ${
                                                                            fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.includedCabinBags
                                                                              ? 'bg-[#22C55E] text-primary-on'
                                                                              : 'bg-[#EF4444] text-primary-on'
                                                                          }`}
                                                                        >
                                                                          <span className="text-xs">
                                                                            {fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.includedCabinBags ? (
                                                                              <IoMdCheckmark />
                                                                            ) : (
                                                                              '×'
                                                                            )}
                                                                          </span>
                                                                        </div>
                                                                        <span className="label-l2 text-background-on">
                                                                          Cabin
                                                                          baggage
                                                                          included
                                                                        </span>
                                                                      </div>

                                                                      {/* Checked Baggage */}
                                                                      <div className="flex items-center gap-2">
                                                                        <div
                                                                          className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                            fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.includedCheckedBags
                                                                              ? 'bg-[#22C55E] text-primary-on'
                                                                              : 'bg-[#EF4444] text-primary-on'
                                                                          }`}
                                                                        >
                                                                          <span className="text-xs">
                                                                            {fareOffer
                                                                              .travelerPricings?.[0]
                                                                              ?.fareDetailsBySegment?.[0]
                                                                              ?.includedCheckedBags ? (
                                                                              <IoMdCheckmark />
                                                                            ) : (
                                                                              '×'
                                                                            )}
                                                                          </span>
                                                                        </div>
                                                                        <span className="label-l2 text-background-on">
                                                                          Checked
                                                                          baggage:{' '}
                                                                          {fareOffer
                                                                            .travelerPricings?.[0]
                                                                            ?.fareDetailsBySegment?.[0]
                                                                            ?.includedCheckedBags
                                                                            ?.quantity ||
                                                                            0}{' '}
                                                                        </span>
                                                                      </div>

                                                                      {/* Refund Status */}
                                                                      <div className="flex items-center gap-2">
                                                                        <div
                                                                          className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                            fareOffer
                                                                              .pricingOptions
                                                                              ?.refundableFare
                                                                              ? 'bg-[#22C55E] text-primary-on'
                                                                              : 'bg-[#EF4444] text-primary-on'
                                                                          }`}
                                                                        >
                                                                          <span className="text-xs">
                                                                            {fareOffer
                                                                              .pricingOptions
                                                                              ?.refundableFare ? (
                                                                              <IoMdCheckmark />
                                                                            ) : (
                                                                              '×'
                                                                            )}
                                                                          </span>
                                                                        </div>
                                                                        <span className="label-l2 text-background-on">
                                                                          {fareOffer
                                                                            .pricingOptions
                                                                            ?.refundableFare
                                                                            ? 'Refundable'
                                                                            : 'Non-refundable'}
                                                                        </span>
                                                                      </div>
                                                                    </div>

                                                                    {/* Book Now Button */}
                                                                    <div className="mt-auto pt-4">
                                                                      <button
                                                                        onClick={() => {
                                                                          handleOfferFlightBooking(
                                                                            fareOffer
                                                                          );
                                                                          setOpenDrawerId(
                                                                            null
                                                                          );
                                                                        }}
                                                                        className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                                      >
                                                                        Book Now
                                                                      </button>
                                                                    </div>
                                                                  </div>
                                                                );
                                                              }
                                                            )}
                                                          </div>
                                                        ) : (
                                                          <div className="flex flex-col space-y-4">
                                                            <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
                                                              <div className="mb-3">
                                                                <div className="text-lg font-semibold text-primary mb-1">
                                                                  {
                                                                    offer.price
                                                                      .currency
                                                                  }{' '}
                                                                  {Math.floor(
                                                                    parseFloat(
                                                                      offer
                                                                        .price
                                                                        .grandTotal
                                                                    )
                                                                  )}
                                                                </div>
                                                                <h3 className="label-l2 text-neutral-dark">
                                                                  {offer
                                                                    .travelerPricings?.[0]
                                                                    ?.fareDetailsBySegment?.[0]
                                                                    ?.cabin ||
                                                                    'ECONOMY'}{' '}
                                                                  Class
                                                                </h3>
                                                              </div>

                                                              {/* Features List */}
                                                              <div className="flex-1 space-y-3 mb-4">
                                                                {/* Cabin Baggage */}
                                                                <div className="flex items-center gap-2">
                                                                  <div
                                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                      offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCabinBags
                                                                        ? 'bg-[#22C55E] text-primary-on'
                                                                        : 'bg-[#EF4444] text-primary-on'
                                                                    }`}
                                                                  >
                                                                    <span className="text-xs">
                                                                      {offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCabinBags ? (
                                                                        <IoMdCheckmark />
                                                                      ) : (
                                                                        '×'
                                                                      )}
                                                                    </span>
                                                                  </div>
                                                                  <span className="text-sm text-neutral-dark">
                                                                    Cabin
                                                                    baggage
                                                                    included
                                                                  </span>
                                                                </div>

                                                                {/* Checked Baggage */}
                                                                <div className="flex items-center gap-2">
                                                                  <div
                                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                      offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCheckedBags
                                                                        ? 'bg-[#22C55E] text-primary-on'
                                                                        : 'bg-[#EF4444] text-primary-on'
                                                                    }`}
                                                                  >
                                                                    <span className="text-xs">
                                                                      {offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCheckedBags ? (
                                                                        <IoMdCheckmark />
                                                                      ) : (
                                                                        '×'
                                                                      )}
                                                                    </span>
                                                                  </div>
                                                                  <span className="text-sm text-neutral-dark">
                                                                    Checked
                                                                    baggage:{' '}
                                                                    {formatBaggageInfo(
                                                                      offer
                                                                        .travelerPricings?.[0]
                                                                        ?.fareDetailsBySegment?.[0]
                                                                        ?.includedCheckedBags
                                                                    )}
                                                                  </span>
                                                                </div>

                                                                {/* Refund Status */}
                                                                <div className="flex items-center gap-2">
                                                                  <div
                                                                    className={`w-4 h-4 rounded-full flex items-center justify-center px-1 ${
                                                                      offer
                                                                        .pricingOptions
                                                                        ?.refundableFare
                                                                        ? 'bg-[#22C55E] text-primary-on'
                                                                        : 'bg-[#EF4444] text-primary-on'
                                                                    }`}
                                                                  >
                                                                    <span className="text-xs">
                                                                      {offer
                                                                        .pricingOptions
                                                                        ?.refundableFare ? (
                                                                        <IoMdCheckmark />
                                                                      ) : (
                                                                        '×'
                                                                      )}
                                                                    </span>
                                                                  </div>
                                                                  <span className="text-sm text-neutral-dark">
                                                                    {offer
                                                                      .pricingOptions
                                                                      ?.refundableFare
                                                                      ? 'Refundable'
                                                                      : 'Non-refundable'}
                                                                  </span>
                                                                </div>
                                                              </div>

                                                              {/* Book Now Button */}
                                                              <div className="mt-auto pt-4">
                                                                <button
                                                                  onClick={() => {
                                                                    handleOfferFlightBooking(
                                                                      offer
                                                                    );
                                                                    setOpenDrawerId(
                                                                      null
                                                                    );
                                                                  }}
                                                                  className="w-full bg-primary text-primary-on py-3 rounded-lg hover:bg-[#5143d9] transition-colors"
                                                                >
                                                                  Book Now
                                                                </button>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
      {isClient && currentPage < totalPages && (
        <div className="flex justify-center mt-6 mb-8">
          <Button
            onClick={loadMore}
            variant="outline"
            className="border-blue-950 text-blue-950"
            disabled={isMoreLoading}
          >
            {isMoreLoading ? (
              <>
                <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                Loading more flights...
              </>
            ) : (
              'Load more flights'
            )}
          </Button>
        </div>
      )}

      {selectedFlightForDrawer && (
        <FlightDetailsDrawer
          flight={selectedFlightForDrawer.flight}
          flightId={selectedFlightForDrawer.id}
          searchParams={searchParams}
          onClose={closeFlightDetails}
          formatDuration={formatDuration}
          apiData={apiData}
          onBookNow={handleFlightBooking}
          priceData={selectedFlightForDrawer.priceData}
          flightIndex={selectedFlightForDrawer.flightIndex}
          activeTab={sortOption}
        />
      )}

      {/* Mobile Filter Button */}
      {/* <MobileFilterButton onClick={() => setIsMobileFilterOpen(true)} /> */}

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        apiData={apiData}
        filters={filters}
        showAllAirlines={showAllAirlines}
        setShowAllAirlines={setShowAllAirlines}
        handleTransitChange={handleTransitChange}
        handlePriceRangeChange={handlePriceRangeChange}
        handlePriceRangeChangeComplete={handlePriceRangeChangeComplete}
        handlePriceRangeChangeStart={handlePriceRangeChangeStart}
        handleDepartureTimeChange={handleDepartureTimeChange}
        handleDepartureTimeChangeComplete={handleDepartureTimeChangeComplete}
        handleDepartureTimeChangeStart={handleDepartureTimeChangeStart}
        handleArrivalTimeChange={handleArrivalTimeChange}
        handleArrivalTimeChangeComplete={handleArrivalTimeChangeComplete}
        handleArrivalTimeChangeStart={handleArrivalTimeChangeStart}
        handleAirlineChange={handleAirlineChange}
        clearAllFilters={clearAllFilters}
        timeStringToHour={timeStringToHour}
        formatTime={formatTime}
        applyFilters={handleApplyFilters}
        selectedCurrency={selectedCurrency}
      />
    </>
  );
}
