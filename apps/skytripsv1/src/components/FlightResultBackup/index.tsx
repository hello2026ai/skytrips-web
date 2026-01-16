// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import { format } from 'date-fns';
// import { RefreshCw, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
// import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
// import { Button } from '../../components/ui/button';
// import axiosInstance from '../../../lib/axiosConfig';
// import Navbar from '../../components/Navbar';
// import Footer from '../../components/Footer';
// import { SearchParams } from '../../../types';
// import React from 'react';
// import FlightDetailsDrawer from '../../components/FlightDetailsDrawer/FlightDetailsDrawer';
// import EditSearch from '../../components/EditSearch';
// import { FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL } from '../../constants/flightSearchConstants';
// import { LoadingScreen } from '../../components/LoadingScreen';
// import EmptyFlightResult from '../../components/FlightResult/EmptyFlightResult';
// import FlightFilters from '../../components/flights/FlightFilters';
// import MobileFilterModal from '../../components/flights/MobileFilterModal';
// import MobileFilterHeader from '../../components/flights/MobileFilterHeader';
// import Image from 'next/image';

// interface FlightOffer {
//   id: string;
//   type: string;
//   source: string;
//   price: {
//     currency: string;
//     total: string;
//     base: string;
//     fees: Array<{ amount: string; type: string }>;
//     grandTotal: string;
//   };
//   itineraries: Array<{
//     duration: string;
//     segments: Array<{
//       departure: { iataCode: string; at: string };
//       arrival: { iataCode: string; at: string };
//       carrierCode: string;
//       number: string;
//       duration?: string; // Add this optional property
//     }>;
//   }>;
//   // validatingAirlineCodes: string[];
//   dictionaries?: {
//     carriers?: Record<string, string>;
//   };
//   travelerPricings?: Array<{
//     travelerId: string;
//     fareOption: string;
//     travelerType: string;
//     associatedAdultId?: string;
//     price: {
//       currency: string;
//       total: string;
//       base: string;
//     };
//     fareDetailsBySegment?: Array<{
//       segmentId: string;
//       includedCabinBags?: {
//         quantity: number;
//         weightUnit?: string;
//       };
//       includedCheckedBags?: {
//         quantity?: number;
//         weight?: number;
//         weightUnit?: string;
//       };
//     }>;
//   }>;
//   samePriceOffers?: FlightOffer[];
//   numberOfBookableSeats?: number;
// }

// interface AirlineFilter {
//   name: string;
//   checked: boolean;
// }

// interface ApiResponse {
//   data: FlightOffer[];
//   dictionaries: {
//     priceRange: {
//       min: number;
//       max: number;
//     };
//     transitOptions: {
//       direct: number;
//       oneStop: number;
//       twoPlusStops: number;
//     };
//     departureTimes: {
//       min: string; // For example: "06:00 AM"
//       max: string; // For example: "10:00 PM"
//     };
//     arrivalTimes: {
//       min: string; // For example: "06:00 AM"
//       max: string; // For example: "11:59 PM"
//     };
//     airlines: Array<{
//       code: string;
//       name: string;
//       flightCount: number;
//     }>;
//     carriers?: Record<string, string>; // Add optional carriers dictionary
//   };
//   meta: {
//     total: number;
//   };
// }

// interface Filters {
//   transit: {
//     direct: boolean;
//     oneStop: boolean;
//     twoStops: boolean;
//   };
//   priceRange: number[];
//   airlines: Record<string, AirlineFilter>;
//   departureTime: number[];
//   arrivalTime: number[];
// }

// // Update these helper functions
// const formatPrice = (value: number) => `AUD ${value.toFixed(2)}`;
// const formatTime = (value: number) => {
//   const hours = Math.floor(value);
//   const minutes = Math.round((value - hours) * 60);
//   const period = hours < 12 ? 'AM' : 'PM';
//   const displayHours = hours % 12 || 12;
//   return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
// };

// // Helper function to convert time string to hour number (24-hour format)
// const timeStringToHour = (timeStr: string) => {
//   if (!timeStr) return 0;
//   try {
//     // Handle format like "06:00 AM"
//     if (timeStr.includes(' ')) {
//       const [time, period] = timeStr.split(' ');
//       let [hours, minutes] = time.split(':').map(Number);
//       if (period === 'PM' && hours !== 12) hours += 12;
//       if (period === 'AM' && hours === 12) hours = 0;
//       return hours + minutes / 60; // Convert minutes to decimal hours
//     }
//     // Handle format like "06:00" (24-hour format)
//     else if (timeStr.includes(':')) {
//       const [hours, minutes] = timeStr.split(':').map(Number);
//       return hours + minutes / 60;
//     }
//     // Handle numeric format
//     else if (!isNaN(Number(timeStr))) {
//       return Number(timeStr);
//     }

//     console.warn('Unrecognized time format:', timeStr);
//     return 0;
//   } catch (err) {
//     console.error('Error parsing time string:', timeStr, err);
//     return 0;
//   }
// };

// export default function FlightsResults() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [flights, setFlights] = useState<FlightOffer[]>([]);
//   const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([]);
//   const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
//   const [apiData, setApiData] = useState<ApiResponse | null>(null);
//   const [shortestFlightsData, setShortestFlightsData] =
//     useState<ApiResponse | null>(null); // For shortest flights data
//   const [isLoadingShortestInBackground, setIsLoadingShortestInBackground] =
//     useState(false); // Track background loading

//   // Cache states for both tabs
//   const [cachedCheapestData, setCachedCheapestData] =
//     useState<ApiResponse | null>(null);
//   const [cachedShortestData, setCachedShortestData] =
//     useState<ApiResponse | null>(null);
//   const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);
//   const [refreshTimerId, setRefreshTimerId] = useState<NodeJS.Timeout | null>(
//     null
//   );

//   // Additional state for tracking cache updates (instead of modifying API response)
//   const [cheapestCacheUpdateTracker, setCheapestCacheUpdateTracker] =
//     useState<string>('');
//   const [shortestCacheUpdateTracker, setShortestCacheUpdateTracker] =
//     useState<string>('');

//   const [filters, setFilters] = useState<Filters>({
//     transit: {
//       direct: false,
//       oneStop: false,
//       twoStops: false,
//     },
//     priceRange: [0, 0],
//     airlines: {},
//     departureTime: [0, 24],
//     arrivalTime: [0, 24],
//   });
//   const [sortOption, setSortOption] = useState('cheapest');
//   const [progress, setProgress] = useState(0);
//   const [isMoreLoading, setIsMoreLoading] = useState(false);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showSearchForm, setShowSearchForm] = useState(false);
//   const [showAllAirlines, setShowAllAirlines] = useState(false);
//   const [isSliding, setIsSliding] = useState(false);
//   const [isDepartureTimeSliding, setIsDepartureTimeSliding] = useState(false);
//   const [isArrivalTimeSliding, setIsArrivalTimeSliding] = useState(false);
//   // Add a state to track if we're on the client side
//   const [isClient, setIsClient] = useState(true);
//   const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
//   const [expandedSamePriceId, setExpandedSamePriceId] = useState<string | null>(
//     null
//   );
//   const [expandedOfferFlightId, setExpandedOfferFlightId] = useState<
//     string | null
//   >(null);
//   const [selectedFlightForDrawer, setSelectedFlightForDrawer] = useState<{
//     flight: FlightOffer;
//     id: string;
//     fareRules?: any;
//     isFareRulesLoading?: boolean;
//   } | null>(null);
//   // Add missing state variables
//   const [isFiltering, setIsFiltering] = useState(false);
//   const [showMobileFilter, setShowMobileFilter] = useState(false);
//   const [activeTab, setActiveTab] = useState('cheapest');
//   const [isLoadingFareRules, setIsLoadingFareRules] = useState(false);

//   // Add state for mobile filter modal
//   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

//   // Add a ref to track if tab was directly changed by user
//   const directTabChangeRef = useRef(false);

//   // Track tab changes in UI to avoid duplicate data fetching
//   useEffect(() => {
//     // This effect will keep activeTab in sync with sortOption
//     setActiveTab(sortOption);
//   }, [sortOption]);

//   // Effect to load data when sortOption changes - needs to avoid race conditions with direct tab switching
//   useEffect(() => {
//     // Skip if no search params, not client-side, or if tab was directly changed
//     if (!searchParams || !isClient || directTabChangeRef.current) {
//       // Reset flag if it was set
//       if (directTabChangeRef.current) {
//         console.log('Skipping API call because tab was directly changed in UI');
//         directTabChangeRef.current = false;
//       }
//       return;
//     }

//     console.log('sortOption useEffect: Loading data for tab:', sortOption);

//     // Only fetch new data when we don't already have it AND we're not already loading
//     if (sortOption === 'cheapest' && !cachedCheapestData && !loading) {
//       console.log('No cached cheapest data available, fetching fresh data');
//       setLoading(true);
//       fetchFlights(searchParams, 1, 'cheapest');
//     } else if (sortOption === 'shortest' && !cachedShortestData && !loading) {
//       console.log('No cached shortest data available, fetching fresh data');
//       setLoading(true);
//       fetchFlights(searchParams, 1, 'shortest');
//     }
//   }, [
//     sortOption,
//     searchParams,
//     isClient,
//     cachedCheapestData,
//     cachedShortestData,
//     loading,
//   ]);

//   useEffect(() => {
//     if (router.query.q) {
//       try {
//         // Decode the search parameters
//         const decodedParams = JSON.parse(atob(router.query.q as string));

//         // Ensure required properties are present
//         if (
//           !decodedParams.originLocationCode ||
//           !decodedParams.destinationLocationCode
//         ) {
//           console.error('Missing required search parameters');
//           router.push('/');
//           return;
//         }

//         // Try to get airport details from localStorage
//         try {
//           const savedAirports = localStorage.getItem('skytrips_airports');
//           if (savedAirports) {
//             const airports = JSON.parse(savedAirports);

//             // Update the URLs for the AirportSearch components to include city names
//             if (airports.fromAirport && airports.toAirport) {
//               // We have the airport data, store it in searchParams
//               decodedParams.fromAirport = airports.fromAirport;
//               decodedParams.toAirport = airports.toAirport;
//             }
//           }
//         } catch (error) {
//           console.error('Error loading airport data from localStorage:', error);
//         }

//         setSearchParams(decodedParams);

//         // Fetch flight data for default tab
//         fetchFlights(decodedParams);

//         // Immediately start fetching shortest flights in background
//         // This runs in parallel with the main fetch
//         fetchShortestFlightsInBackground(decodedParams);
//       } catch (error) {
//         console.error('Error parsing search parameters:', error);
//         router.push('/');
//       }
//     }
//   }, [router.query]);

//   // Fix the initializeFilters function to extract airlines from segments
//   const initializeFilters = (apiData: FlightOffer[]) => {
//     console.log('apiData inside', apiData);

//     // Check if apiData already has dictionaries (it's an ApiResponse object, not just flights array)
//     if (apiData && Array.isArray(apiData)) {
//       // If it's just an array of FlightOffer (legacy behavior)
//       // Create filters from flight data
//       const airlineFilters: Record<string, AirlineFilter> = {};

//       // Extract airline codes from flight segments
//       apiData.forEach((flight) => {
//         flight.itineraries.forEach((itinerary) => {
//           itinerary.segments.forEach((segment) => {
//             const code = segment.carrierCode;
//             // Get carrier name from flight dictionaries or use code as fallback
//             const carrierName = flight.dictionaries?.carriers?.[code] || code;

//             if (!airlineFilters[code]) {
//               airlineFilters[code] = {
//                 name: typeof carrierName === 'string' ? carrierName : code,
//                 checked: false,
//               };
//             }
//           });
//         });
//       });

//       // Get price range from flights
//       const prices = apiData.map((flight) =>
//         parseFloat(flight.price.grandTotal)
//       );
//       const minPrice = Math.min(...prices);
//       const maxPrice = Math.max(...prices);

//       // Initialize time ranges from flight data if not provided by API
//       let departureTimeMin = 24;
//       let departureTimeMax = 0;
//       let arrivalTimeMin = 24;
//       let arrivalTimeMax = 0;

//       // Extract time ranges from flights
//       apiData.forEach((flight) => {
//         flight.itineraries.forEach((itinerary) => {
//           if (itinerary.segments && itinerary.segments.length > 0) {
//             // Departure time
//             const departureDateTime = new Date(
//               itinerary.segments[0].departure.at
//             );
//             const departureHour =
//               departureDateTime.getHours() +
//               departureDateTime.getMinutes() / 60;
//             departureTimeMin = Math.min(departureTimeMin, departureHour);
//             departureTimeMax = Math.max(departureTimeMax, departureHour);

//             // Arrival time
//             const lastSegment =
//               itinerary.segments[itinerary.segments.length - 1];
//             const arrivalDateTime = new Date(lastSegment.arrival.at);
//             const arrivalHour =
//               arrivalDateTime.getHours() + arrivalDateTime.getMinutes() / 60;
//             arrivalTimeMin = Math.min(arrivalTimeMin, arrivalHour);
//             arrivalTimeMax = Math.max(arrivalTimeMax, arrivalHour);
//           }
//         });
//       });

//       setFilters({
//         transit: {
//           direct: false,
//           oneStop: false,
//           twoStops: false,
//         },
//         priceRange: [minPrice, maxPrice],
//         airlines: airlineFilters,
//         departureTime: [departureTimeMin, departureTimeMax],
//         arrivalTime: [arrivalTimeMin, arrivalTimeMax],
//       });
//     }
//   };

//   const fetchFlights = async (
//     params: SearchParams,
//     page = 1,
//     sortType = sortOption
//   ) => {
//     console.log('params for api call and sort option', params, sortOption);

//     // Check cache first for page 1 requests
//     if (page === 1) {
//       const currentTime = Date.now();
//       if (
//         sortType === 'cheapest' &&
//         cachedCheapestData &&
//         currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ) {
//         console.log('Using cached cheapest data');
//         setApiData(cachedCheapestData);

//         // Initialize filters from cached data
//         initializeFilters(cachedCheapestData.data);

//         // Set flights with API data attached
//         const flightsWithApiData = cachedCheapestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedCheapestData.data,
//           })
//         );

//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//         setTotalPages(
//           Math.ceil(cachedCheapestData.meta.total / (params.maxResults || 10))
//         );
//         setCurrentPage(1);

//         setLoading(false);
//         return;
//       } else if (
//         sortType === 'shortest' &&
//         cachedShortestData &&
//         currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ) {
//         console.log('Using cached shortest data');
//         setApiData(cachedShortestData);

//         // Initialize filters from cached data
//         initializeFilters(cachedShortestData.data);

//         // Set flights with API data attached
//         const flightsWithApiData = cachedShortestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedShortestData.data,
//           })
//         );

//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//         setTotalPages(
//           Math.ceil(cachedShortestData.meta.total / (params.maxResults || 10))
//         );
//         setCurrentPage(1);

//         setLoading(false);
//         return;
//       }
//     }

//     try {
//       if (flights.length < 1) {
//         setLoading(true);
//       } else {
//         setIsMoreLoading(true);
//       }

//       // Start progress indicator
//       let fakeProgress = 0;
//       setProgress(5);

//       const interval = setInterval(() => {
//         const randomIncrement = Math.floor(Math.random() * 6) + 5; // Random number between 5 and 10
//         fakeProgress += randomIncrement;

//         if (fakeProgress >= 95) {
//           clearInterval(interval);
//         } else {
//           setProgress((prev) => Math.min(prev + randomIncrement, 99));
//         }
//       }, 400);

//       // Determine API path based on sort option
//       let apiPath = 'price-group';
//       let limit = params.maxResults || 10;

//       if (sortType === 'recommended') {
//         apiPath = 'recommended';
//         limit = 5;
//       } else if (sortType === 'cheapest') {
//         apiPath = 'price-group';
//         // Add any specific params for cheapest sorting
//       } else if (sortType === 'shortest') {
//         apiPath = 'price-group';
//       }

//       // Check if there are any active filters
//       const hasActiveFilters =
//         params.manualFilter && Object.keys(params.manualFilter).length > 0;

//       // Prepare payload
//       const payload = {
//         currencyCode: params.currencyCode || 'AUD',
//         originDestinations: params?.originDestinations,
//         adults: params.adults,
//         children: params.children || 0,
//         infants: params.infants || 0,
//         ...(hasActiveFilters ? { manualFilter: params.manualFilter } : {}),
//         ...(sortType === 'shortest' ? { manualSort: 'SHORT_DURATION' } : {}),
//         ...(sortType === 'cheapest' ? { manualSort: 'PRICE_LOW_TO_HIGH' } : {}),
//         travelClass: params.travelClass,
//         tripType: params.tripType?.toUpperCase(),
//         max: limit,
//         groupByPrice: true,
//       };

//       console.log('Payload with filters:', payload);

//       // Make API call
//       const response = await axiosInstance.post(
//         `/flight-search/${apiPath}?limit=${limit}&page=${page}`,
//         payload
//       );

//       // Stop progress indicator
//       clearInterval(interval);
//       setProgress(100);
//       setTimeout(() => {
//         setProgress(0);
//       }, 800);

//       if (response?.data) {
//         // Store the API data first
//         setApiData(response.data);

//         // Cache the data for first page requests
//         if (page === 1) {
//           cacheDataAndSetupRefresh(
//             response.data,
//             sortType as 'cheapest' | 'shortest'
//           );
//         }

//         if (loading || page === 1) {
//           // Initialize filters with the complete API response data
//           // Pass the entire API response not just the flights array
//           initializeFilters(response.data.data);

//           // Set flights with API data attached
//           const flightsWithApiData = response.data.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: response.data.data,
//             })
//           );

//           setFlights(flightsWithApiData);
//           setFilteredFlights(flightsWithApiData);
//         } else {
//           // Append data on subsequent pages
//           const newFlightsWithApiData = response.data.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: response.data.data,
//             })
//           );

//           setFlights((prevFlights) => [
//             ...prevFlights,
//             ...newFlightsWithApiData,
//           ]);
//           setFilteredFlights((prevFlights) => [
//             ...prevFlights,
//             ...newFlightsWithApiData,
//           ]);
//         }

//         // Update airline checkboxes based on the API response
//         if (response.data.dictionaries && response.data.dictionaries.airlines) {
//           setFilters((prev) => {
//             const updatedAirlines = { ...prev.airlines };

//             // Check if there are any airlines in the manualFilter
//             if (params.manualFilter && params.manualFilter.airlines) {
//               // Mark airlines as checked if they are in the manualFilter
//               params.manualFilter.airlines.forEach((code) => {
//                 if (updatedAirlines[code]) {
//                   updatedAirlines[code] = {
//                     ...updatedAirlines[code],
//                     checked: true,
//                   };
//                 }
//               });
//             }

//             return {
//               ...prev,
//               airlines: updatedAirlines,
//             };
//           });
//         }

//         setTotalPages(Math.ceil(response.data.meta.total / limit));
//         setCurrentPage(page);
//       }
//     } catch (err) {
//       console.error('Error fetching flights:', err);
//     } finally {
//       setLoading(false);
//       setIsMoreLoading(false);
//     }
//   };

//   // function to fetch shortest flights in the background
//   const fetchShortestFlightsInBackground = async (params: SearchParams) => {
//     if (!params || isLoadingShortestInBackground) return;

//     try {
//       setIsLoadingShortestInBackground(true);

//       // Check if we have valid cached data
//       if (
//         cachedShortestData &&
//         Date.now() - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ) {
//         // 2 minutes
//         setShortestFlightsData(cachedShortestData);
//         console.log('Using cached shortest flights data');
//         return;
//       }

//       // Determine API path and payload
//       const apiPath = 'price-group';
//       const limit = params.maxResults || 10;

//       // Check if there are any active filters
//       const hasActiveFilters =
//         params.manualFilter && Object.keys(params.manualFilter).length > 0;

//       // Prepare payload - similar to fetchFlights but always for shortest
//       const payload = {
//         currencyCode: params.currencyCode || 'AUD',
//         originDestinations: params?.originDestinations,
//         adults: params.adults,
//         children: params.children || 0,
//         infants: params.infants || 0,
//         ...(hasActiveFilters ? { manualFilter: params.manualFilter } : {}),
//         manualSort: 'SHORT_DURATION', // Always set to shortest
//         travelClass: params.travelClass,
//         tripType: params.tripType?.toUpperCase(),
//         max: limit,
//         groupByPrice: true,
//       };

//       console.log('Background fetch for shortest flights initiated');

//       // Make API call without showing loading indicators
//       const response = await axiosInstance.post(
//         `/flight-search/${apiPath}?limit=${limit}&page=1`,
//         payload
//       );

//       if (response?.data) {
//         // Store the shortest flights data
//         setShortestFlightsData(response.data);

//         // Cache the data
//         setCachedShortestData(response.data);

//         console.log('Shortest flights data loaded in background');
//       }
//     } catch (err) {
//       console.error('Error fetching shortest flights in background:', err);
//     } finally {
//       setIsLoadingShortestInBackground(false);
//     }
//   };

//   // Add function to cache data and setup auto-refresh
//   const cacheDataAndSetupRefresh = (
//     data: ApiResponse,
//     tabType: 'cheapest' | 'shortest'
//   ) => {
//     const currentTime = Date.now();
//     console.log(
//       `Setting last fetch timestamp to ${new Date(
//         currentTime
//       ).toLocaleTimeString()}`
//     );
//     setLastFetchTimestamp(currentTime);

//     // Cache the data for appropriate tab
//     if (tabType === 'cheapest') {
//       console.log('Caching cheapest data');
//       setCachedCheapestData(data);
//     } else {
//       console.log('Caching shortest data');
//       setCachedShortestData(data);
//     }

//     // Clear any existing timer
//     if (refreshTimerId) {
//       console.log('Clearing existing refresh timer');
//       clearTimeout(refreshTimerId);
//     }

//     // Set up auto-refresh after 2 minutes (FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL ms)
//     console.log(
//       `Setting up refresh timer to trigger at ${new Date(
//         currentTime + FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ).toLocaleTimeString()}`
//     );

//     // Using both setTimeout and setInterval for redundancy
//     // setTimeout can be unreliable in background tabs
//     const timerId = setTimeout(() => {
//       console.log('Auto-refresh timer triggered via setTimeout!');

//       if (searchParams) {
//         // Force the refresh
//         performDataRefresh();
//       }
//     }, FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL); // 2 minutes

//     setRefreshTimerId(timerId);
//   };

//   // Separate function to handle the actual refresh operations
//   const performDataRefresh = () => {
//     if (!searchParams) return;

//     console.log('Performing data refresh at', new Date().toLocaleTimeString());

//     // 1. Always refresh BOTH tabs data with explicit API calls to ensure both get updated

//     // Create payload base for API calls
//     const apiPath = 'price-group';
//     const limit = searchParams.maxResults || 10;
//     const hasActiveFilters =
//       searchParams.manualFilter &&
//       Object.keys(searchParams.manualFilter).length > 0;
//     const basePayload = {
//       currencyCode: searchParams.currencyCode || 'AUD',
//       originDestinations: searchParams?.originDestinations,
//       adults: searchParams.adults,
//       children: searchParams.children || 0,
//       infants: searchParams.infants || 0,
//       ...(hasActiveFilters ? { manualFilter: searchParams.manualFilter } : {}),
//       travelClass: searchParams.travelClass,
//       tripType: searchParams.tripType?.toUpperCase(),
//       max: limit,
//       groupByPrice: true,
//     };

//     // A. Fetch cheapest data (PRICE_LOW_TO_HIGH)
//     console.log('Refreshing cheapest tab data...');
//     const cheapestPayload = {
//       ...basePayload,
//       manualSort: 'PRICE_LOW_TO_HIGH',
//     };

//     // Use direct API call to ensure network activity is visible
//     axiosInstance
//       .post(`/flight-search/${apiPath}?limit=${limit}&page=1`, cheapestPayload)
//       .then((response) => {
//         if (!response?.data) {
//           console.error('No data in cheapest response');
//           return;
//         }

//         // Log detailed info about the response to verify it contains valid data
//         console.log('Cheapest data refreshed successfully:', {
//           totalFlights: response.data.data?.length || 0,
//           firstFlight: response.data.data?.[0]?.id || 'none',
//           timestamp: new Date().toLocaleTimeString(),
//         });

//         // Create a cache key to track updates
//         const cacheUpdateKey = `cheapest-${Date.now()}`;

//         // Update cheapest cache with verification
//         console.log(`Updating cheapest cache with key ${cacheUpdateKey}`);
//         // Don't modify the API response
//         setCachedCheapestData(response.data);
//         // Use the separate tracker state instead
//         setCheapestCacheUpdateTracker(cacheUpdateKey);

//         // If currently on cheapest tab, update the UI
//         if (sortOption === 'cheapest') {
//           initializeFilters(response.data.data);
//           const flightsWithApiData = response.data.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: response.data.data,
//             })
//           );
//           setFlights(flightsWithApiData);
//           setFilteredFlights(flightsWithApiData);
//           setTotalPages(Math.ceil(response.data.meta.total / limit));
//           setCurrentPage(1);
//         }
//       })
//       .catch((err) => {
//         console.error('Error refreshing cheapest data:', err);
//       });

//     // B. Fetch shortest data (SHORT_DURATION)
//     console.log('Refreshing shortest tab data...');
//     const shortestPayload = {
//       ...basePayload,
//       manualSort: 'SHORT_DURATION',
//     };

//     // Use direct API call to ensure network activity is visible
//     axiosInstance
//       .post(`/flight-search/${apiPath}?limit=${limit}&page=1`, shortestPayload)
//       .then((response) => {
//         if (!response?.data) {
//           console.error('No data in shortest response');
//           return;
//         }

//         // Log detailed info about the response to verify it contains valid data
//         console.log('Shortest data refreshed successfully:', {
//           totalFlights: response.data.data?.length || 0,
//           firstFlight: response.data.data?.[0]?.id || 'none',
//           timestamp: new Date().toLocaleTimeString(),
//         });

//         // Create a cache key to track updates
//         const cacheUpdateKey = `shortest-${Date.now()}`;

//         // Update shortest cache with verification
//         console.log(`Updating shortest cache with key ${cacheUpdateKey}`);
//         // Don't modify the API response
//         setCachedShortestData(response.data);
//         // Use the separate tracker state instead
//         setShortestCacheUpdateTracker(cacheUpdateKey);

//         // If currently on shortest tab, update the UI
//         if (sortOption === 'shortest') {
//           initializeFilters(response.data.data);
//           const flightsWithApiData = response.data.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: response.data.data,
//             })
//           );
//           setFlights(flightsWithApiData);
//           setFilteredFlights(flightsWithApiData);
//           setTotalPages(Math.ceil(response.data.meta.total / limit));
//           setCurrentPage(1);
//         }
//       })
//       .catch((err) => {
//         console.error('Error refreshing shortest data:', err);
//       });

//     // Update the last fetch timestamp after both API calls are initiated
//     setLastFetchTimestamp(Date.now());
//   };

//   // Add monitoring for cache updates
//   useEffect(() => {
//     if (cheapestCacheUpdateTracker) {
//       console.log(
//         `✅ Cheapest cache was updated with key: ${cheapestCacheUpdateTracker}`
//       );

//       // If we're on the cheapest tab, update the filtered flights from the cache
//       if (sortOption === 'cheapest' && cachedCheapestData) {
//         const flightsWithApiData = cachedCheapestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedCheapestData.data,
//           })
//         );
//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//       }
//     }
//   }, [cheapestCacheUpdateTracker, sortOption, cachedCheapestData]);

//   // Add monitoring for shortest cache updates
//   useEffect(() => {
//     if (shortestCacheUpdateTracker) {
//       console.log(
//         `✅ Shortest cache was updated with key: ${shortestCacheUpdateTracker}`
//       );

//       // If we're on the shortest tab, update the filtered flights from the cache
//       if (sortOption === 'shortest' && cachedShortestData) {
//         const flightsWithApiData = cachedShortestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedShortestData.data,
//           })
//         );
//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//       }
//     }
//   }, [shortestCacheUpdateTracker, sortOption, cachedShortestData]);

//   // Use setInterval as a backup to ensure refreshes happen even if setTimeout fails
//   useEffect(() => {
//     // Only set up the interval when we have search params
//     if (!searchParams) return;

//     console.log('Setting up backup refresh interval');

//     // Check every 10 seconds if a refresh is due
//     const intervalId = setInterval(() => {
//       const now = Date.now();
//       const timeSinceLastFetch = now - lastFetchTimestamp;

//       // If it's been more than 2 minutes since the last fetch, trigger a refresh
//       if (timeSinceLastFetch >= FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL) {
//         console.log(
//           'Backup refresh triggered via interval! Last fetch was',
//           Math.floor(timeSinceLastFetch / 1000),
//           'seconds ago'
//         );
//         performDataRefresh();
//       }
//     }, 10000); // Check every 10 seconds

//     // Clean up interval when component unmounts
//     return () => {
//       console.log('Clearing backup refresh interval');
//       clearInterval(intervalId);
//     };
//   }, [searchParams, lastFetchTimestamp]);

//   // Function to fetch cheapest flights in background
//   const fetchCheapestFlightsInBackground = async (params: SearchParams) => {
//     if (!params) return;

//     try {
//       // Check if we have valid cached data
//       if (
//         cachedCheapestData &&
//         Date.now() - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ) {
//         // 2 minutes
//         console.log('Using cached cheapest flights data');
//         return;
//       }

//       // Determine API path and payload
//       const apiPath = 'price-group';
//       const limit = params.maxResults || 10;

//       // Check if there are any active filters
//       const hasActiveFilters =
//         params.manualFilter && Object.keys(params.manualFilter).length > 0;

//       // Prepare payload for cheapest
//       const payload = {
//         currencyCode: params.currencyCode || 'AUD',
//         originDestinations: params?.originDestinations,
//         adults: params.adults,
//         children: params.children || 0,
//         infants: params.infants || 0,
//         ...(hasActiveFilters ? { manualFilter: params.manualFilter } : {}),
//         manualSort: 'PRICE_LOW_TO_HIGH', // Set to cheapest
//         travelClass: params.travelClass,
//         tripType: params.tripType?.toUpperCase(),
//         max: limit,
//         groupByPrice: true,
//       };

//       console.log('Background fetch for cheapest flights initiated');

//       // Make API call without showing loading indicators
//       const response = await axiosInstance.post(
//         `/flight-search/${apiPath}?limit=${limit}&page=1`,
//         payload
//       );

//       if (response?.data) {
//         // Cache the data
//         setCachedCheapestData(response.data);
//         console.log('Cheapest flights data cached in background');
//       }
//     } catch (err) {
//       console.error('Error fetching cheapest flights in background:', err);
//     }
//   };

//   // Add clean-up for the timer
//   useEffect(() => {
//     return () => {
//       if (refreshTimerId) {
//         clearTimeout(refreshTimerId);
//       }
//     };
//   }, [refreshTimerId]);

//   console.log('apiData', apiData);
//   // Add this effect to handle sort option changes
//   useEffect(() => {
//     if (searchParams && !loading) {
//       // Check cache first when switching tabs
//       const currentTime = Date.now();

//       if (sortOption === 'shortest') {
//         if (
//           cachedShortestData &&
//           currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//         ) {
//           // Use cached data if available and not expired
//           console.log('Using cached shortest data on tab switch');

//           // Initialize filters from cached data
//           initializeFilters(cachedShortestData.data);

//           // Set flights with cached data
//           const flightsWithApiData = cachedShortestData.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: cachedShortestData.data,
//             })
//           );

//           setFlights(flightsWithApiData);
//           setFilteredFlights(flightsWithApiData);
//           setTotalPages(
//             Math.ceil(
//               cachedShortestData.meta.total / (searchParams.maxResults || 10)
//             )
//           );
//           setCurrentPage(1);

//           return;
//         } else if (shortestFlightsData) {
//           // If we have background-loaded data for shortest, use it
//           console.log('Using preloaded shortest flights data');

//           // Initialize filters from preloaded data
//           initializeFilters(shortestFlightsData.data);

//           // Set flights with preloaded data attached
//           const flightsWithApiData = shortestFlightsData.data.map(
//             (flight: FlightOffer) => ({
//               ...flight,
//               __apiData: shortestFlightsData.data,
//             })
//           );

//           setFlights(flightsWithApiData);
//           setFilteredFlights(flightsWithApiData);

//           // Cache the data
//           setCachedShortestData(shortestFlightsData);
//           setLastFetchTimestamp(currentTime);

//           // Update pages
//           setTotalPages(
//             Math.ceil(
//               shortestFlightsData.meta.total / (searchParams.maxResults || 10)
//             )
//           );
//           setCurrentPage(1);

//           // Clear preloaded data to avoid stale data on subsequent switches
//           setShortestFlightsData(null);

//           // Setup refresh timer
//           if (refreshTimerId) {
//             clearTimeout(refreshTimerId);
//           }

//           const timerId = setTimeout(() => {
//             if (searchParams) {
//               console.log('Cache expired, refreshing data...');
//               fetchFlights(searchParams, 1, sortOption);
//             }
//           }, FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL); // 2 minutes

//           setRefreshTimerId(timerId);

//           return;
//         }
//       } else if (
//         sortOption === 'cheapest' &&
//         cachedCheapestData &&
//         currentTime - lastFetchTimestamp < FLIGHT_SEARCH_AUTO_REFRESH_INTERVAL
//       ) {
//         // Use cached cheapest data if available and not expired
//         console.log('Using cached cheapest data on tab switch');

//         // Initialize filters from cached data
//         initializeFilters(cachedCheapestData.data);

//         // Set flights with cached data
//         const flightsWithApiData = cachedCheapestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedCheapestData.data,
//           })
//         );

//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//         setTotalPages(
//           Math.ceil(
//             cachedCheapestData.meta.total / (searchParams.maxResults || 10)
//           )
//         );
//         setCurrentPage(1);

//         return;
//       }

//       // If no valid cache is available, fetch fresh data
//       setLoading(true);
//       fetchFlights(searchParams, 1, sortOption);
//     }
//   }, [sortOption]);

//   // Add a load more function
//   const loadMore = () => {
//     if (currentPage < totalPages && searchParams) {
//       fetchFlights(searchParams, currentPage + 1);
//     }
//   };

//   // Helper function to parse duration string (PT15H50M) to minutes
//   const parseDuration = (duration: string) => {
//     const hoursMatch = duration.match(/(\d+)H/);
//     const minutesMatch = duration.match(/(\d+)M/);

//     const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
//     const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

//     return hours * 60 + minutes;
//   };

//   // Helper function to format duration
//   const formatDuration = (duration: string) => {
//     const minutes = parseDuration(duration);
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}min`;
//   };

//   const handleTransitChange = (
//     type: 'direct' | 'oneStop' | 'twoStops',
//     checked: boolean
//   ) => {
//     console.log('Transit filter changed:', type, checked);
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       transit: {
//         ...prevFilters.transit,
//         [type]: checked,
//       },
//     }));
//   };

//   // Update the handlePriceRangeChange function
//   const handlePriceRangeChange = (values: number[]) => {
//     console.log('Price range changed:', values);
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       priceRange: values,
//     }));
//   };

//   const handlePriceRangeChangeComplete = (values: number[]) => {
//     console.log('Price range change complete:', values);
//     setIsSliding(false);

//     // Scroll to top after price range slider is released
//     if (typeof window !== 'undefined') {
//       scrollToTop();
//     }
//   };

//   const handlePriceRangeChangeStart = () => {
//     console.log('Price range change start disabled');
//     setIsSliding(true);
//   };

//   const handleDepartureTimeChange = (values: number[]) => {
//     console.log('Departure time changed:', values);
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       departureTime: values,
//     }));
//   };

//   const handleDepartureTimeChangeComplete = (values: number[]) => {
//     console.log('Departure time change complete:', values);
//     setIsDepartureTimeSliding(false);

//     // Scroll to top after departure time slider is released
//     if (typeof window !== 'undefined') {
//       scrollToTop();
//     }
//   };

//   const handleDepartureTimeChangeStart = () => {
//     console.log('Departure time change start disabled');
//     setIsDepartureTimeSliding(true);
//   };

//   const handleArrivalTimeChange = (values: number[]) => {
//     console.log('Arrival time changed:', values);
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       arrivalTime: values,
//     }));
//   };

//   const handleArrivalTimeChangeComplete = (values: number[]) => {
//     console.log('Arrival time change complete:', values);
//     setIsArrivalTimeSliding(false);

//     // Scroll to top after arrival time slider is released
//     if (typeof window !== 'undefined') {
//       scrollToTop();
//     }
//   };

//   const handleArrivalTimeChangeStart = () => {
//     console.log('Arrival time change start disabled');
//     setIsArrivalTimeSliding(true);
//   };

//   // Fix the handleAirlineChange function to only use segment carrier codes
//   const handleAirlineChange = (airlineCode: string, checked: boolean) => {
//     console.log('Airline filter changed:', airlineCode, checked);
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       airlines: {
//         ...prevFilters.airlines,
//         [airlineCode]: {
//           ...prevFilters.airlines[airlineCode],
//           checked: checked,
//         },
//       },
//     }));
//   };

//   // Clear all filters
//   const clearAllFilters = () => {
//     console.log('Clearing all filters');

//     // Get the min/max price from the API data for resetting price range
//     let minPrice = 0;
//     let maxPrice = 0;

//     if (apiData?.dictionaries?.priceRange) {
//       minPrice = apiData.dictionaries.priceRange.min;
//       maxPrice = apiData.dictionaries.priceRange.max;
//     }

//     // Get min/max departure time from API data for resetting departure time range
//     let minDepartureTime = 0;
//     let maxDepartureTime = 24;

//     if (apiData?.dictionaries?.departureTimes) {
//       minDepartureTime = timeStringToHour(
//         apiData.dictionaries.departureTimes.min
//       );
//       maxDepartureTime = timeStringToHour(
//         apiData.dictionaries.departureTimes.max
//       );
//     }

//     // Get min/max arrival time from API data for resetting arrival time range
//     let minArrivalTime = 0;
//     let maxArrivalTime = 24;

//     if (apiData?.dictionaries?.arrivalTimes) {
//       minArrivalTime = timeStringToHour(apiData.dictionaries.arrivalTimes.min);
//       maxArrivalTime = timeStringToHour(apiData.dictionaries.arrivalTimes.max);
//     }

//     // Reset all airline filters to unchecked
//     const resetAirlines = { ...filters.airlines };
//     Object.keys(resetAirlines).forEach((code) => {
//       resetAirlines[code] = {
//         ...resetAirlines[code],
//         checked: false,
//       };
//     });

//     // Reset the filter state
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       transit: {
//         direct: false,
//         oneStop: false,
//         twoStops: false,
//       },
//       priceRange: [minPrice, maxPrice],
//       airlines: resetAirlines,
//       departureTime: [minDepartureTime, maxDepartureTime],
//       arrivalTime: [minArrivalTime, maxArrivalTime],
//     }));

//     // After reset, restore the original flight data from cache IMMEDIATELY
//     console.log('Resetting filtered flights to original tab data');

//     // Use sortOption to ensure we use the correct tab's data
//     if (sortOption === 'cheapest' && cachedCheapestData) {
//       console.log(
//         'Resetting to cheapest cache data',
//         cachedCheapestData.data.length
//       );
//       // Map the data to include the __apiData property
//       const flightsWithApiData = cachedCheapestData.data.map((flight) => ({
//         ...flight,
//         __apiData: cachedCheapestData.data,
//       }));
//       setFlights(flightsWithApiData);
//       setFilteredFlights(flightsWithApiData);
//     } else if (sortOption === 'shortest' && cachedShortestData) {
//       console.log(
//         'Resetting to shortest cache data',
//         cachedShortestData.data.length
//       );
//       // Map the data to include the __apiData property
//       const flightsWithApiData = cachedShortestData.data.map((flight) => ({
//         ...flight,
//         __apiData: cachedShortestData.data,
//       }));
//       setFlights(flightsWithApiData);
//       setFilteredFlights(flightsWithApiData);
//     } else if (flights.length > 0) {
//       console.log('Resetting to current flights data', flights.length);
//       setFilteredFlights([...flights]);
//     }

//     // Scroll to top when filters are cleared
//     if (typeof window !== 'undefined') {
//       scrollToTop();
//     }
//   };

//   const handleEditSearch = () => {
//     router.push('/');
//   };

//   const handleSearchModify = (newParams: any) => {
//     // Ensure required properties are present
//     if (!newParams.originLocationCode || !newParams.destinationLocationCode) {
//       console.error('Missing required search parameters');
//       return;
//     }

//     // Add required properties if they don't exist
//     const completeParams: SearchParams = {
//       ...newParams,
//       departureDate: newParams.dateRange?.from
//         ? format(new Date(newParams.dateRange.from), 'yyyy-MM-dd')
//         : searchParams?.departureDate || '',
//       returnDate: newParams.dateRange?.to
//         ? format(new Date(newParams.dateRange.to), 'yyyy-MM-dd')
//         : searchParams?.returnDate || '',
//     };

//     // Encode the new search parameters
//     const encodedParams = btoa(JSON.stringify(completeParams));

//     // Redirect to the flights results page with the new parameters
//     router.push(`/flights-results?q=${encodedParams}`);
//   };

//   // Update the time formatter to handle API time format
//   const formatTimeDisplay = (timeStr: string) => {
//     return timeStr; // API already provides formatted time like "6:00 AM"
//   };

//   const handleFlightBooking = (flight: FlightOffer) => {
//     try {
//       const flightData = {
//         originDestinations: [
//           {
//             id: 1,
//             originLocationCode: searchParams?.originLocationCode,
//             destinationLocationCode: searchParams?.destinationLocationCode,
//             departureDateTimeRange: { date: searchParams?.departureDate },
//           },
//         ],
//         travelers: {
//           adults: searchParams?.adults || 1,
//           children: searchParams?.children || 0,
//           infants: searchParams?.infants || 0,
//         },
//         currencyCode: searchParams?.currencyCode || 'AUD',
//         totalPrice: flight.price.grandTotal,
//         flight: flight,
//         travelClass: searchParams?.travelClass || 'ECONOMY',
//         tripType: searchParams?.tripType?.toLowerCase() || 'one_way',
//       };

//       console.log('flightData', flightData);

//       // Add return flight info if round trip
//       const tripTypeUpper =
//         searchParams?.tripType?.toString().toUpperCase() || '';
//       if (tripTypeUpper === 'ROUND_TRIP' && searchParams?.returnDate) {
//         flightData.originDestinations.push({
//           id: 2,
//           originLocationCode: searchParams?.destinationLocationCode || '',
//           destinationLocationCode: searchParams?.originLocationCode || '',
//           departureDateTimeRange: { date: searchParams.returnDate },
//         });
//       }

//       // Store flight data in sessionStorage instead of URL
//       console.log('Storing flight data in session storage:', {
//         flightData,
//         apiData,
//         dictionaries: apiData?.dictionaries,
//         airlines: apiData?.dictionaries?.airlines,
//         carriers: apiData?.dictionaries?.carriers,
//       });

//       // Add dictionaries to the flight data before storing
//       if (apiData?.dictionaries) {
//         (flightData as any).dictionaries = apiData.dictionaries;
//       }

//       sessionStorage.setItem(
//         'skytrips_booking_data',
//         JSON.stringify(flightData)
//       );

//       // Store dictionaries separately for easier access
//       if (apiData?.dictionaries) {
//         console.log('Storing dictionaries separately:', apiData.dictionaries);

//         // Create a processed dictionaries object with all carrier information
//         const processedDictionaries = {
//           ...apiData.dictionaries,
//           // Ensure carriers object exists
//           carriers: {
//             ...(apiData.dictionaries.carriers || {}),
//           },
//         };

//         // If airlines exist as an array, add to carriers mapping for easier lookup
//         if (Array.isArray(apiData.dictionaries.airlines)) {
//           apiData.dictionaries.airlines.forEach((airline: any) => {
//             if (airline.code && airline.name) {
//               processedDictionaries.carriers[airline.code] = airline.name;
//             }
//           });
//         }

//         // Store the processed dictionaries
//         sessionStorage.setItem(
//           'skytrips_dictionaries',
//           JSON.stringify(processedDictionaries)
//         );
//       }

//       // Redirect to booking page without large query params
//       router.push('/book');
//     } catch (error) {
//       console.error('Error navigating to booking page:', error);
//     }
//   };

//   // Update the toggleFlightDetails function to open a drawer instead of expanding inline
//   const toggleFlightDetails = async (flightId: string, flight: FlightOffer) => {
//     setSelectedFlightForDrawer({
//       flight,
//       id: flightId,
//     });
//   };

//   const closeFlightDetails = () => {
//     setSelectedFlightForDrawer(null);
//   };

//   // Modify the toggleOfferFlightDetails function to open a drawer
//   const toggleOfferFlightDetails = (offerId: string, flight: FlightOffer) => {
//     setSelectedFlightForDrawer({
//       flight,
//       id: offerId,
//     });
//   };

//   // Add back the toggleSamePriceOffers function
//   const toggleSamePriceOffers = (flightId: string) => {
//     // If we're opening this flight's same price offers
//     if (expandedSamePriceId !== flightId) {
//       // Close flight details if it's open for this flight
//       if (expandedFlightId === flightId) {
//         setExpandedFlightId(null);
//       }
//       setExpandedSamePriceId(flightId);
//     } else {
//       // Just close same price offers if it's already open
//       setExpandedSamePriceId(null);
//     }
//   };

//   // Update regular applyFilters function to only use segment carrier codes
//   const applyFilters = (flightData: FlightOffer[]) => {
//     console.log('Applying filters to', flightData.length, 'flights');

//     // Check if any filters are active
//     const noTransitFiltersSelected =
//       !filters.transit.direct &&
//       !filters.transit.oneStop &&
//       !filters.transit.twoStops;

//     // Get min/max price from API data or use defaults
//     const minPrice = apiData?.dictionaries?.priceRange?.min || 0;
//     const maxPrice = apiData?.dictionaries?.priceRange?.max || 0;

//     // Check if price filter is at default values (inactive)
//     const noPriceFiltersSelected =
//       (filters.priceRange[0] === minPrice &&
//         filters.priceRange[1] === maxPrice) ||
//       (filters.priceRange[0] === 0 && filters.priceRange[1] === 0);

//     // Check if any airline filters are selected
//     const selectedAirlines = Object.entries(filters.airlines)
//       .filter(([_, airline]) => airline.checked)
//       .map(([code, _]) => code);

//     const noAirlineFiltersSelected = selectedAirlines.length === 0;

//     // Get departure time range from API data or use defaults
//     const minDepartureTime = apiData?.dictionaries?.departureTimes?.min
//       ? timeStringToHour(apiData.dictionaries.departureTimes.min)
//       : 0;
//     const maxDepartureTime = apiData?.dictionaries?.departureTimes?.max
//       ? timeStringToHour(apiData.dictionaries.departureTimes.max)
//       : 24;

//     // Check if departure time filter is at default values (inactive)
//     const noDepartureTimeFiltersSelected =
//       (filters.departureTime[0] === minDepartureTime &&
//         filters.departureTime[1] === maxDepartureTime) ||
//       (filters.departureTime[0] === 0 && filters.departureTime[1] === 24);

//     // Get arrival time range from API data or use defaults
//     const minArrivalTime = apiData?.dictionaries?.arrivalTimes?.min
//       ? timeStringToHour(apiData.dictionaries.arrivalTimes.min)
//       : 0;
//     const maxArrivalTime = apiData?.dictionaries?.arrivalTimes?.max
//       ? timeStringToHour(apiData.dictionaries.arrivalTimes.max)
//       : 24;

//     // Check if arrival time filter is at default values (inactive)
//     const noArrivalTimeFiltersSelected =
//       (filters.arrivalTime[0] === minArrivalTime &&
//         filters.arrivalTime[1] === maxArrivalTime) ||
//       (filters.arrivalTime[0] === 0 && filters.arrivalTime[1] === 24);

//     // If no filters are selected, return all flights
//     if (
//       noTransitFiltersSelected &&
//       noPriceFiltersSelected &&
//       noAirlineFiltersSelected &&
//       noDepartureTimeFiltersSelected &&
//       noArrivalTimeFiltersSelected
//     ) {
//       console.log('No filters selected, returning all flights');
//       return flightData;
//     }

//     return flightData.filter((flight) => {
//       // Create individual filter results to properly combine them later
//       let passesTransitFilter = true;
//       let passesPriceFilter = true;
//       let passesAirlineFilter = true;
//       let passesDepartureTimeFilter = true;
//       let passesArrivalTimeFilter = true;

//       // Price filter - only apply if active
//       if (!noPriceFiltersSelected) {
//         const flightPrice = parseFloat(flight.price.grandTotal);
//         passesPriceFilter =
//           flightPrice >= filters.priceRange[0] &&
//           flightPrice <= filters.priceRange[1];
//       }

//       // Airline filter - only apply if active
//       if (!noAirlineFiltersSelected) {
//         // Check if any of the selected airlines are in this flight's segments
//         const flightAirlines: Set<string> = new Set();
//         flight.itineraries.forEach((itinerary) => {
//           itinerary.segments.forEach((segment) => {
//             flightAirlines.add(segment.carrierCode);
//           });
//         });

//         // Check if any selected airline is in this flight
//         passesAirlineFilter = selectedAirlines.some((code) =>
//           flightAirlines.has(code)
//         );
//       }

//       // Departure time filter - only apply if active
//       if (!noDepartureTimeFiltersSelected) {
//         // Check only the first segment of the first itinerary is within the selected range
//         passesDepartureTimeFilter = false;
//         if (flight.itineraries.length > 0) {
//           const firstItinerary = flight.itineraries[0];
//           if (firstItinerary.segments.length > 0) {
//             // Get departure time of the first segment
//             const departureDateTime = new Date(
//               firstItinerary.segments[0].departure.at
//             );
//             const departureHour =
//               departureDateTime.getHours() +
//               departureDateTime.getMinutes() / 60;

//             // Check if departure time is within selected range
//             passesDepartureTimeFilter =
//               departureHour >= filters.departureTime[0] &&
//               departureHour <= filters.departureTime[1];
//           }
//         }
//       }

//       // Arrival time filter - only apply if active
//       if (!noArrivalTimeFiltersSelected) {
//         // Check only the last segment of the last itinerary is within the selected range
//         passesArrivalTimeFilter = false;
//         if (flight.itineraries.length > 0) {
//           const lastItinerary =
//             flight.itineraries[flight.itineraries.length - 1];
//           if (lastItinerary.segments.length > 0) {
//             // Get arrival time of the last segment
//             const lastSegment =
//               lastItinerary.segments[lastItinerary.segments.length - 1];
//             const arrivalDateTime = new Date(lastSegment.arrival.at);
//             const arrivalHour =
//               arrivalDateTime.getHours() + arrivalDateTime.getMinutes() / 60;

//             // Check if arrival time is within selected range
//             passesArrivalTimeFilter =
//               arrivalHour >= filters.arrivalTime[0] &&
//               arrivalHour <= filters.arrivalTime[1];
//           }
//         }
//       }

//       // Transit filter - only apply if active
//       if (!noTransitFiltersSelected) {
//         passesTransitFilter = flight.itineraries.some((itinerary) => {
//           const segmentsCount = itinerary.segments.length;

//           // Direct flight (no stops)
//           if (segmentsCount === 1 && filters.transit.direct) {
//             return true;
//           }

//           // One stop flight
//           if (segmentsCount === 2 && filters.transit.oneStop) {
//             return true;
//           }

//           // Two or more stops flight
//           if (segmentsCount > 2 && filters.transit.twoStops) {
//             return true;
//           }

//           // If none of the above conditions match, this itinerary doesn't match the transit filter
//           return false;
//         });
//       }

//       // A flight must pass ALL active filters to be included in results
//       return (
//         passesPriceFilter &&
//         passesAirlineFilter &&
//         passesDepartureTimeFilter &&
//         passesArrivalTimeFilter &&
//         passesTransitFilter
//       );
//     });
//   };

//   const handleApplyFilters = () => {
//     console.log('Applying filters now');

//     if (!cachedCheapestData && !cachedShortestData) {
//       console.warn('No cached data available yet for applying filters');
//       return;
//     }

//     let sourceData: FlightOffer[] = [];

//     if (sortOption === 'cheapest' && cachedCheapestData) {
//       sourceData = cachedCheapestData.data;
//     } else if (sortOption === 'shortest' && cachedShortestData) {
//       sourceData = cachedShortestData.data;
//     }

//     if (sourceData.length === 0) {
//       console.warn('No flights in source data for filtering');
//       return;
//     }

//     // Apply filters
//     const filteredData = applyFilters(sourceData);

//     // Attach __apiData to each filtered flight
//     const flightsWithApiData = filteredData.map((flight) => ({
//       ...flight,
//       __apiData: sourceData,
//     }));

//     setFilteredFlights(flightsWithApiData);

//     // Close the mobile filter drawer if it's open
//     if (typeof setShowMobileFilter === 'function') {
//       setShowMobileFilter(false);
//     }

//     // Only scroll to top when no sliders are being dragged
//     if (
//       typeof window !== 'undefined' &&
//       !isSliding &&
//       !isDepartureTimeSliding &&
//       !isArrivalTimeSliding
//     ) {
//       scrollToTop();
//     }
//   };

//   // 4. Fix useEffect to track filter changes and apply them
//   useEffect(() => {
//     if (sortOption === 'cheapest' && cachedCheapestData) {
//       handleApplyFilters();
//     }
//     if (sortOption === 'shortest' && cachedShortestData) {
//       handleApplyFilters();
//     }
//   }, [
//     // Transit filters
//     filters.transit.direct,
//     filters.transit.oneStop,
//     filters.transit.twoStops,

//     // Track the actual values rather than the array reference
//     filters.priceRange[0],
//     filters.priceRange[1],

//     // Track the actual values for departure time
//     filters.departureTime[0],
//     filters.departureTime[1],

//     // Track the actual values for arrival time
//     filters.arrivalTime[0],
//     filters.arrivalTime[1],

//     // Monitor airline filter changes - need to stringify since it's an object
//     JSON.stringify(
//       Object.entries(filters.airlines)
//         .filter(([_, airline]) => airline.checked)
//         .map(([code]) => code)
//     ),

//     // Sort option
//     sortOption,

//     // Cached data
//     cachedCheapestData,
//     cachedShortestData,
//   ]);

//   // Add effect to update arrival time filters when API data changes
//   useEffect(() => {
//     if (apiData?.dictionaries?.arrivalTimes) {
//       // Update arrival time filters based on the latest API data
//       const minArrivalHour = timeStringToHour(
//         apiData.dictionaries.arrivalTimes.min
//       );
//       const maxArrivalHour = timeStringToHour(
//         apiData.dictionaries.arrivalTimes.max
//       );

//       console.log('Setting arrival time filters from API:', [
//         minArrivalHour,
//         maxArrivalHour,
//       ]);

//       // Only update the arrival time part of filters
//       setFilters((prev) => ({
//         ...prev,
//         arrivalTime: [minArrivalHour, maxArrivalHour],
//       }));
//     }
//   }, [apiData?.dictionaries?.arrivalTimes]);

//   // Add an effect to ensure cheapest tab data (default tab) is properly displayed on initial load
//   useEffect(() => {
//     // This is specifically for the initial load of the cheapest tab (default tab)
//     if (
//       sortOption === 'cheapest' &&
//       cachedCheapestData &&
//       filteredFlights.length === 0 &&
//       !loading
//     ) {
//       console.log(
//         'Initial load: Setting filtered flights from cached cheapest data'
//       );

//       // Check if any filters are active
//       const hasActiveFilters =
//         filters.transit.direct ||
//         filters.transit.oneStop ||
//         filters.transit.twoStops ||
//         Object.values(filters.airlines).some((airline) => airline.checked) ||
//         (apiData?.dictionaries?.priceRange &&
//           (filters.priceRange[0] !== apiData.dictionaries.priceRange.min ||
//             filters.priceRange[1] !== apiData.dictionaries.priceRange.max)) ||
//         (apiData?.dictionaries?.departureTimes &&
//           (filters.departureTime[0] !==
//             timeStringToHour(apiData.dictionaries.departureTimes.min) ||
//             filters.departureTime[1] !==
//               timeStringToHour(apiData.dictionaries.departureTimes.max))) ||
//         (apiData?.dictionaries?.arrivalTimes &&
//           (filters.arrivalTime[0] !==
//             timeStringToHour(apiData.dictionaries.arrivalTimes.min) ||
//             filters.arrivalTime[1] !==
//               timeStringToHour(apiData.dictionaries.arrivalTimes.max)));

//       // Only auto-fill with all flights if no filters are active
//       if (!hasActiveFilters) {
//         const flightsWithApiData = cachedCheapestData.data.map(
//           (flight: FlightOffer) => ({
//             ...flight,
//             __apiData: cachedCheapestData.data,
//           })
//         );
//         setFlights(flightsWithApiData);
//         setFilteredFlights(flightsWithApiData);
//       } else {
//         // If filters are active, apply them rather than showing all flights
//         handleApplyFilters();
//       }
//     }
//   }, [
//     sortOption,
//     cachedCheapestData,
//     filteredFlights.length,
//     loading,
//     apiData,
//   ]);

//   // Add this effect to update filter UI when apiData changes
//   useEffect(() => {
//     if (apiData && apiData.dictionaries) {
//       console.log('Updating filters from API data dictionaries');

//       // Get price range from API data
//       const minPrice = apiData.dictionaries.priceRange?.min || 0;
//       const maxPrice = apiData.dictionaries.priceRange?.max || 1000;

//       // Create airline filters from API data
//       const airlineFilters: Record<string, AirlineFilter> = {};
//       if (apiData.dictionaries.airlines) {
//         apiData.dictionaries.airlines.forEach((airline) => {
//           airlineFilters[airline.code] = {
//             name: airline.name,
//             checked: false,
//           };
//         });
//       }

//       // Get time ranges from API data
//       let departureTimeMin = 0;
//       let departureTimeMax = 24;
//       let arrivalTimeMin = 0;
//       let arrivalTimeMax = 24;

//       if (apiData.dictionaries.departureTimes) {
//         const depMin = timeStringToHour(
//           apiData.dictionaries.departureTimes.min
//         );
//         const depMax = timeStringToHour(
//           apiData.dictionaries.departureTimes.max
//         );
//         departureTimeMin = depMin;
//         departureTimeMax = depMax;
//       }

//       if (apiData.dictionaries.arrivalTimes) {
//         const arrMin = timeStringToHour(apiData.dictionaries.arrivalTimes.min);
//         const arrMax = timeStringToHour(apiData.dictionaries.arrivalTimes.max);
//         arrivalTimeMin = arrMin;
//         arrivalTimeMax = arrMax;
//       }

//       // Set the filters state
//       setFilters({
//         transit: {
//           direct: false,
//           oneStop: false,
//           twoStops: false,
//         },
//         priceRange: [minPrice, maxPrice],
//         airlines: airlineFilters,
//         departureTime: [departureTimeMin, departureTimeMax],
//         arrivalTime: [arrivalTimeMin, arrivalTimeMax],
//       });
//     }
//   }, [apiData]);

//   // Helper function to get the adult price per person
//   const getAdultPrice = (flight: FlightOffer): number | null => {
//     if (flight.travelerPricings && flight.travelerPricings.length > 0) {
//       const adultTraveler = flight.travelerPricings.find(
//         (tp) => tp.travelerType === 'ADULT'
//       );
//       if (adultTraveler?.price?.total) {
//         return parseFloat(adultTraveler.price.total);
//       }
//     }
//     return null;
//   };

//   // Helper function to format price display
//   const formatDisplayPrice = (price: number): string => {
//     return `AUD ${Math.floor(price)}`;
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <LoadingScreen searchParams={searchParams} progress={progress} />
//         <Footer />
//       </>
//     );
//   }

//   console.log('filters', filters);

//   console.log('New filters state:', filters);

//   // Function to scroll to top of page with enhanced elegance
//   const scrollToTop = () => {
//     // Add a slight delay to allow for any UI updates to complete
//     setTimeout(() => {
//       // Try to find the results tabs section for better UX
//       const resultsContainer = document.querySelector(
//         '.tabs-container'
//       ) as HTMLElement;

//       if (resultsContainer) {
//         // Get position with a nice offset for better viewing experience
//         const topOffset = window.pageYOffset;
//         const targetPosition =
//           resultsContainer.getBoundingClientRect().top + topOffset - 125;

//         // Get current scroll position
//         const startPosition = window.pageYOffset;
//         // Calculate distance to scroll
//         const distance = targetPosition - startPosition;

//         // If we're already close to the target position, no need for animation
//         if (Math.abs(distance) < 50) return;

//         // Perform the scroll with smooth behavior
//         window.scrollTo({
//           top: targetPosition,
//           behavior: 'smooth',
//         });
//       } else {
//         // Fallback to regular smooth scrolling if section not found
//         window.scrollTo({
//           top: 0,
//           behavior: 'smooth',
//         });
//       }
//     }, 120); // Small delay for better user experience
//   };

//   // Add animation styles inside component
//   const animationStyles = `
//     @keyframes pulse-slow {
//       0%, 100% {
//         opacity: 0.7;
//         transform: scale(1);
//       }
//       50% {
//         opacity: 1;
//         transform: scale(1.05);
//       }
//     }
//     .animate-pulse-slow {
//       animation: pulse-slow 3s infinite ease-in-out;
//     }
//   `;

//   return (
//     <>
//       <Navbar />
//       <style jsx global>
//         {animationStyles}
//       </style>
//       <div className="min-h-screen bg-gray-100">
//         {/* Header with search summary */}
//         <div className="sticky top-0 z-20 bg-white shadow-sm">
//           <EditSearch
//             searchParams={searchParams}
//             setShowSearchForm={setShowSearchForm}
//             showSearchForm={showSearchForm}
//             handleSearchModify={handleSearchModify}
//           />
//         </div>

//         {apiData?.data?.length === 0 ? (
//           <EmptyFlightResult searchParams={searchParams} />
//         ) : (
//           <>
//             {/* Main content */}
//             <div className="container mx-auto pb-8 pt-3 px-4">
//               <div className="flex flex-col md:flex-row gap-6 items-start">
//                 {/* Filters sidebar */}
//                 <div className="hidden md:block w-full md:w-1/4 sticky top-[72px]">
//                   <div className="bg-white rounded-lg shadow-sm p-6">
//                     <FlightFilters
//                       apiData={apiData}
//                       filters={filters}
//                       showAllAirlines={showAllAirlines}
//                       setShowAllAirlines={setShowAllAirlines}
//                       handleTransitChange={handleTransitChange}
//                       handlePriceRangeChange={handlePriceRangeChange}
//                       handlePriceRangeChangeComplete={
//                         handlePriceRangeChangeComplete
//                       }
//                       handlePriceRangeChangeStart={handlePriceRangeChangeStart}
//                       handleDepartureTimeChange={handleDepartureTimeChange}
//                       handleDepartureTimeChangeComplete={
//                         handleDepartureTimeChangeComplete
//                       }
//                       handleDepartureTimeChangeStart={
//                         handleDepartureTimeChangeStart
//                       }
//                       handleArrivalTimeChange={handleArrivalTimeChange}
//                       handleArrivalTimeChangeComplete={
//                         handleArrivalTimeChangeComplete
//                       }
//                       handleArrivalTimeChangeStart={
//                         handleArrivalTimeChangeStart
//                       }
//                       handleAirlineChange={handleAirlineChange}
//                       clearAllFilters={clearAllFilters}
//                       timeStringToHour={timeStringToHour}
//                       formatTime={formatTime}
//                     />
//                   </div>
//                 </div>

//                 {/* Flight results */}
//                 <div className="w-full md:w-3/4">
//                   {/* Combined mobile filter button and tabs in one row */}
//                   <div className="flex items-center justify-between mb-3 md:block">
//                     {/* Tabs container - moved to left */}
//                     <div className="rounded-lg mb-1 md:mb-4 tabs-container border-b bg-container inline-block w-fit">
//                       <Tabs
//                         value={sortOption}
//                         className="rounded-md"
//                         onValueChange={(value) => {
//                           console.log('Tab changed to:', value);

//                           // Set the flag to indicate direct tab change by user
//                           directTabChangeRef.current = true;

//                           // Update sort option first
//                           setSortOption(value);

//                           // Get cached data for the selected tab
//                           if (value === 'cheapest' && cachedCheapestData) {
//                             console.log(
//                               'DIRECT TAB SWITCH: Using cheapest cache with',
//                               cachedCheapestData.data.length,
//                               'flights'
//                             );

//                             // Update the API data reference
//                             setApiData(cachedCheapestData);

//                             // Check if any filters are active
//                             const hasActiveFilters =
//                               filters.transit.direct ||
//                               filters.transit.oneStop ||
//                               filters.transit.twoStops ||
//                               Object.values(filters.airlines).some(
//                                 (airline) => airline.checked
//                               ) ||
//                               (cachedCheapestData?.dictionaries?.priceRange &&
//                                 (filters.priceRange[0] !==
//                                   cachedCheapestData.dictionaries.priceRange
//                                     .min ||
//                                   filters.priceRange[1] !==
//                                     cachedCheapestData.dictionaries.priceRange
//                                       .max)) ||
//                               (cachedCheapestData?.dictionaries
//                                 ?.departureTimes &&
//                                 (filters.departureTime[0] !==
//                                   timeStringToHour(
//                                     cachedCheapestData.dictionaries
//                                       .departureTimes.min
//                                   ) ||
//                                   filters.departureTime[1] !==
//                                     timeStringToHour(
//                                       cachedCheapestData.dictionaries
//                                         .departureTimes.max
//                                     ))) ||
//                               (cachedCheapestData?.dictionaries?.arrivalTimes &&
//                                 (filters.arrivalTime[0] !==
//                                   timeStringToHour(
//                                     cachedCheapestData.dictionaries.arrivalTimes
//                                       .min
//                                   ) ||
//                                   filters.arrivalTime[1] !==
//                                     timeStringToHour(
//                                       cachedCheapestData.dictionaries
//                                         .arrivalTimes.max
//                                     )));

//                             if (hasActiveFilters) {
//                               // Apply current filters to the data
//                               handleApplyFilters();
//                             } else {
//                               // If no filters are active, show all flights
//                               const flightsWithApiData =
//                                 cachedCheapestData.data.map((flight) => ({
//                                   ...flight,
//                                   __apiData: cachedCheapestData.data,
//                                 }));

//                               setFlights(flightsWithApiData);
//                               setFilteredFlights(flightsWithApiData);
//                             }
//                           } else if (
//                             value === 'shortest' &&
//                             cachedShortestData
//                           ) {
//                             console.log(
//                               'DIRECT TAB SWITCH: Using shortest cache with',
//                               cachedShortestData.data.length,
//                               'flights'
//                             );

//                             // Update the API data reference
//                             setApiData(cachedShortestData);

//                             // Check if any filters are active
//                             const hasActiveFilters =
//                               filters.transit.direct ||
//                               filters.transit.oneStop ||
//                               filters.transit.twoStops ||
//                               Object.values(filters.airlines).some(
//                                 (airline) => airline.checked
//                               ) ||
//                               (cachedShortestData?.dictionaries?.priceRange &&
//                                 (filters.priceRange[0] !==
//                                   cachedShortestData.dictionaries.priceRange
//                                     .min ||
//                                   filters.priceRange[1] !==
//                                     cachedShortestData.dictionaries.priceRange
//                                       .max)) ||
//                               (cachedShortestData?.dictionaries
//                                 ?.departureTimes &&
//                                 (filters.departureTime[0] !==
//                                   timeStringToHour(
//                                     cachedShortestData.dictionaries
//                                       .departureTimes.min
//                                   ) ||
//                                   filters.departureTime[1] !==
//                                     timeStringToHour(
//                                       cachedShortestData.dictionaries
//                                         .departureTimes.max
//                                     ))) ||
//                               (cachedShortestData?.dictionaries?.arrivalTimes &&
//                                 (filters.arrivalTime[0] !==
//                                   timeStringToHour(
//                                     cachedShortestData.dictionaries.arrivalTimes
//                                       .min
//                                   ) ||
//                                   filters.arrivalTime[1] !==
//                                     timeStringToHour(
//                                       cachedShortestData.dictionaries
//                                         .arrivalTimes.max
//                                     )));

//                             if (hasActiveFilters) {
//                               // Apply current filters to the data
//                               handleApplyFilters();
//                             } else {
//                               // If no filters are active, show all flights
//                               const flightsWithApiData =
//                                 cachedShortestData.data.map((flight) => ({
//                                   ...flight,
//                                   __apiData: cachedShortestData.data,
//                                 }));

//                               setFlights(flightsWithApiData);
//                               setFilteredFlights(flightsWithApiData);
//                             }
//                           } else {
//                             // No cache available
//                             console.warn(
//                               'No cached data available for tab:',
//                               value
//                             );
//                           }
//                         }}
//                       >
//                         <div className="flex justify-start px-2 py-2">
//                           <TabsList className="flex space-x-2 bg-transparent justify-start">
//                             <TabsTrigger
//                               value="cheapest"
//                               className="data-[state=active]:bg-[#0c0073] data-[state=active]:text-secondary  label-l2 rounded-sm  border border-[#0C0073] data-[state=active]:border-transparent "
//                             >
//                               Cheapest
//                             </TabsTrigger>
//                             <div className="w-px h-6 bg-[#E5E5EA] "></div>
//                             <TabsTrigger
//                               value="shortest"
//                               className="data-[state=active]:bg-[#0c0073] data-[state=active]:text-secondary  border border-[#0C0073] label-l2 rounded-sm  data-[state=active]:border-transparent"
//                             >
//                               Shortest
//                             </TabsTrigger>
//                           </TabsList>
//                         </div>
//                       </Tabs>
//                     </div>

//                     {/* Filter button - moved to right */}
//                     <div className="block md:hidden mb-1">
//                       <MobileFilterHeader
//                         onClick={() => setIsMobileFilterOpen(true)}
//                         // resultsCount={filteredFlights.length}
//                       />
//                     </div>
//                   </div>

//                   {filteredFlights.length === 0 ? (
//                     <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden">
//                       {/* Top gradient accent */}
//                       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-100 via-blue-900 to-blue-100"></div>

//                       <h3 className="text-2xl font-bold mb-3 text-blue-950">
//                         Sorry, No matching flights found.
//                       </h3>
//                       <p className="text-gray-600 mb-8 max-w-md mx-auto">
//                         We couldn't find any flights that match all your current
//                         filter criteria. Try adjusting your filters to see more
//                         options.
//                       </p>

//                       <Button
//                         onClick={clearAllFilters}
//                         className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-300"
//                       >
//                         Clear all filters
//                       </Button>

//                       <div className="mt-6 p-3 bg-gradient-to-br from-blue-100 to-white rounded-lg border border-blue-100 max-w-md w-full">
//                         <p className="font-medium text-blue-900 mb-2 text-sm">
//                           Try broadening your search:
//                         </p>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
//                           <div className="flex items-center">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-3 w-3 text-blue-900 flex-shrink-0"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 12l2 2 4-4"
//                               />
//                             </svg>
//                             <span className="ml-1.5 text-gray-700">
//                               Select more airlines
//                             </span>
//                           </div>
//                           <div className="flex items-center">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-3 w-3 text-blue-900 flex-shrink-0"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 12l2 2 4-4"
//                               />
//                             </svg>
//                             <span className="ml-1.5 text-gray-700">
//                               Expand price range
//                             </span>
//                           </div>
//                           <div className="flex items-center">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-3 w-3 text-blue-900 flex-shrink-0"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 12l2 2 4-4"
//                               />
//                             </svg>
//                             <span className="ml-1.5 text-gray-700">
//                               Include more stops
//                             </span>
//                           </div>
//                           <div className="flex items-center">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-3 w-3 text-blue-900 flex-shrink-0"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 12l2 2 4-4"
//                               />
//                             </svg>
//                             <span className="ml-1.5 text-gray-700">
//                               Adjust time filters
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {isClient &&
//                         filteredFlights.map((flight, index) => {
//                           console.log('flight', flight);
//                           const price = parseFloat(flight.price.grandTotal);
//                           // const discount = Math.round(Math.random() * 15) + 5;
//                           console.log('flight', flight);
//                           return (
//                             <div
//                               key={`${flight.id}-${index}-${activeTab}`}
//                               className="bg-container rounded-lg border border-[#EEEEEE] overflow-hidden duration-200"
//                             >
//                               <div className="flex flex-col md:flex-row items-stretch min-h-[130px]">
//                                 {/* Left column for airline info - full width on mobile */}
//                                 <div className="px-0 pt-3 pb-0 w-full md:px-4 md:w-[150px] md:py-0">
//                                   {/* Mobile view - airline display with name and logo */}
//                                   <div className="flex flex-col md:mb-2 md:hidden px-1 md:px-0">
//                                     <div className="flex items-center px-0">
//                                       <img
//                                         src={`https://pics.avs.io/200/40/${flight.itineraries[0].segments[0].carrierCode}.png`}
//                                         alt={
//                                           flight.itineraries[0].segments[0]
//                                             .carrierCode
//                                         }
//                                         className="h-5 object-contain w-16"
//                                         onError={(e) => {
//                                           e.currentTarget.src =
//                                             'https://via.placeholder.com/80x20?text=Airline';
//                                         }}
//                                       />
//                                       <div className="ml-2 label-l3 text-background-on ">
//                                         {(() => {
//                                           const carrierCode =
//                                             flight.itineraries[0].segments[0]
//                                               .carrierCode;
//                                           if (
//                                             flight.dictionaries?.carriers &&
//                                             flight.dictionaries.carriers[
//                                               carrierCode
//                                             ]
//                                           ) {
//                                             return flight.dictionaries.carriers[
//                                               carrierCode
//                                             ];
//                                           } else if (
//                                             apiData?.dictionaries?.airlines
//                                           ) {
//                                             const airline =
//                                               apiData.dictionaries.airlines.find(
//                                                 (a) => a.code === carrierCode
//                                               );
//                                             return airline
//                                               ? airline.name
//                                               : carrierCode;
//                                           }
//                                           return carrierCode;
//                                         })()}
//                                       </div>
//                                     </div>

//                                     {flight.itineraries.length > 1 &&
//                                       flight.itineraries[0].segments[0]
//                                         .carrierCode !==
//                                         flight.itineraries[1].segments[0]
//                                           .carrierCode && (
//                                         <div className="flex items-center mt-2 pt-2 border-t border-dashed px-0">
//                                           <img
//                                             src={`https://pics.avs.io/200/40/${flight.itineraries[1].segments[0].carrierCode}.png`}
//                                             alt={
//                                               flight.itineraries[1].segments[0]
//                                                 .carrierCode
//                                             }
//                                             className="h-5 object-contain w-16"
//                                             onError={(e) => {
//                                               e.currentTarget.src =
//                                                 'https://via.placeholder.com/80x20?text=Airline';
//                                             }}
//                                           />
//                                           <div className="ml-2 label-l3 text-neutral-dark">
//                                             {(() => {
//                                               const carrierCode =
//                                                 flight.itineraries[1]
//                                                   .segments[0].carrierCode;
//                                               if (
//                                                 flight.dictionaries?.carriers &&
//                                                 flight.dictionaries.carriers[
//                                                   carrierCode
//                                                 ]
//                                               ) {
//                                                 return flight.dictionaries
//                                                   .carriers[carrierCode];
//                                               } else if (
//                                                 apiData?.dictionaries?.airlines
//                                               ) {
//                                                 const airline =
//                                                   apiData.dictionaries.airlines.find(
//                                                     (a) =>
//                                                       a.code === carrierCode
//                                                   );
//                                                 return airline
//                                                   ? airline.name
//                                                   : carrierCode;
//                                               }
//                                               return carrierCode;
//                                             })()}
//                                           </div>
//                                         </div>
//                                       )}
//                                   </div>

//                                   {/* Desktop view - original layout */}
//                                   <div className="hidden md:flex md:flex-col md:items-center md:justify-center h-full">
//                                     <div className="flex flex-col items-center justify-center flex-1">
//                                       <img
//                                         src={`https://pics.avs.io/200/40/${flight.itineraries[0].segments[0].carrierCode}.png`}
//                                         alt={
//                                           flight.itineraries[0].segments[0]
//                                             .carrierCode
//                                         }
//                                         className="h-6 object-contain w-24 mb-2"
//                                         onError={(e) => {
//                                           e.currentTarget.src =
//                                             'https://via.placeholder.com/80x20?text=Airline';
//                                         }}
//                                       />
//                                       <div className="label-l3 text-background-on text-center mb-1">
//                                         {/* Full airline name from dictionary */}
//                                         {(() => {
//                                           const carrierCode =
//                                             flight.itineraries[0].segments[0]
//                                               .carrierCode;
//                                           if (
//                                             flight.dictionaries?.carriers &&
//                                             flight.dictionaries.carriers[
//                                               carrierCode
//                                             ]
//                                           ) {
//                                             return flight.dictionaries.carriers[
//                                               carrierCode
//                                             ];
//                                           } else if (
//                                             apiData?.dictionaries?.airlines
//                                           ) {
//                                             const airline =
//                                               apiData.dictionaries.airlines.find(
//                                                 (a) => a.code === carrierCode
//                                               );
//                                             return airline
//                                               ? airline.name
//                                               : carrierCode;
//                                           }
//                                           return carrierCode;
//                                         })()}
//                                       </div>
//                                     </div>

//                                     {/* Return flight airline info */}
//                                     {flight.itineraries.length > 1 && (
//                                       <>
//                                         {/* <div className="border-t w-full my-2 border-dashed"></div> */}
//                                         <div className="flex flex-col items-center justify-center flex-1">
//                                           <img
//                                             src={`https://pics.avs.io/200/40/${flight.itineraries[1].segments[0].carrierCode}.png`}
//                                             alt={
//                                               flight.itineraries[1].segments[0]
//                                                 .carrierCode
//                                             }
//                                             className="h-6 object-contain w-24 mb-2"
//                                             onError={(e) => {
//                                               e.currentTarget.src =
//                                                 'https://via.placeholder.com/80x20?text=Airline';
//                                             }}
//                                           />
//                                           <div className="label-l3 text-background-on text-center">
//                                             {/* Return airline name */}
//                                             {(() => {
//                                               const carrierCode =
//                                                 flight.itineraries[1]
//                                                   .segments[0].carrierCode;
//                                               if (
//                                                 flight.dictionaries?.carriers &&
//                                                 flight.dictionaries.carriers[
//                                                   carrierCode
//                                                 ]
//                                               ) {
//                                                 return flight.dictionaries
//                                                   .carriers[carrierCode];
//                                               } else if (
//                                                 apiData?.dictionaries?.airlines
//                                               ) {
//                                                 const airline =
//                                                   apiData.dictionaries.airlines.find(
//                                                     (a) =>
//                                                       a.code === carrierCode
//                                                   );
//                                                 return airline
//                                                   ? airline.name
//                                                   : carrierCode;
//                                               }
//                                               return carrierCode;
//                                             })()}
//                                           </div>
//                                         </div>
//                                       </>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Center column with flight itineraries - stacked for round trips */}
//                                 <div className="w-full md:flex-1 flex flex-col items-center justify-center py-0 md:py-4 md:flex md:items-center md:self-center">
//                                   {/* Itinerary 1: Outbound */}
//                                   <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-3 md:pr-6 md:mb-1">
//                                     {/* Flight details rendered as before */}
//                                     {/* ... outbound flight details ... */}
//                                     {/* Departure */}
//                                     <div className="flex flex-col items-start justify-center">
//                                       <div className="label-l3 text-neutral-dark">
//                                         {format(
//                                           new Date(
//                                             flight.itineraries[0].segments[0].departure.at
//                                           ),
//                                           'dd MMM, EEE'
//                                         )}
//                                       </div>
//                                       <div className="title-t3 text-background-on">
//                                         {format(
//                                           new Date(
//                                             flight.itineraries[0].segments[0].departure.at
//                                           ),
//                                           'H:mm'
//                                         )}
//                                       </div>
//                                       <div className="label-l3 text-neutral-dark">
//                                         {
//                                           flight.itineraries[0].segments[0]
//                                             .departure.iataCode
//                                         }
//                                       </div>
//                                     </div>

//                                     {/* Duration and stops */}
//                                     <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
//                                       <div className="label-l3  text-neutral-dark mb-1 pl-1">
//                                         {formatDuration(
//                                           flight.itineraries[0].duration
//                                         )}
//                                       </div>
//                                       <div className="flex items-center">
//                                         <img
//                                           src="/assets/plane-icon.svg"
//                                           alt="Departure"
//                                           className="w-6 h-6 label-l3  text-neutral-dark"
//                                           onError={(e) => {
//                                             e.currentTarget.src =
//                                               'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
//                                           }}
//                                         />

//                                         {/* Flight path display */}
//                                         <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
//                                           {/* Horizontal line spanning full width */}
//                                           <div className="w-full h-[1px] bg-gray-300 absolute"></div>

//                                           {/* Transit points bubble - only if there are stops */}
//                                           {flight.itineraries[0].segments
//                                             .length > 1 && (
//                                             <div className="mx-auto bg-white border border-gray-300 rounded-full px-3 py-1 z-10 label-l3  text-neutral-dark text-center whitespace-nowrap">
//                                               {flight.itineraries[0].segments
//                                                 .slice(0, -1)
//                                                 .map((segment, idx) => (
//                                                   <React.Fragment
//                                                     key={`transit-${idx}`}
//                                                   >
//                                                     {segment.arrival.iataCode}
//                                                     {idx <
//                                                       flight.itineraries[0]
//                                                         .segments.length -
//                                                         2 && ', '}
//                                                   </React.Fragment>
//                                                 ))}
//                                             </div>
//                                           )}
//                                         </div>

//                                         <div className="w-4 h-4 rounded-full bg-primary"></div>
//                                       </div>

//                                       <div className="flex  items-center mt-1">
//                                         {/* Stops text */}
//                                         <div className="label-l3  text-secondary-bright">
//                                           {flight.itineraries[0].segments
//                                             .length === 1
//                                             ? 'Direct'
//                                             : flight.itineraries[0].segments
//                                                 .length === 2
//                                             ? '1 Stop'
//                                             : `${
//                                                 flight.itineraries[0].segments
//                                                   .length - 1
//                                               } Stops`}
//                                         </div>

//                                         {/* Transit times */}
//                                         {flight.itineraries[0].segments.length >
//                                           1 && (
//                                           <div className="label-l3 text-background-on mt-0.5 ml-1">
//                                             {' ('}{' '}
//                                             {flight.itineraries[0].segments.map(
//                                               (segment, idx) => {
//                                                 if (
//                                                   idx <
//                                                   flight.itineraries[0].segments
//                                                     .length -
//                                                     1
//                                                 ) {
//                                                   const nextSegment =
//                                                     flight.itineraries[0]
//                                                       .segments[idx + 1];
//                                                   const transitTime =
//                                                     Math.round(
//                                                       (new Date(
//                                                         nextSegment.departure.at
//                                                       ).getTime() -
//                                                         new Date(
//                                                           segment.arrival.at
//                                                         ).getTime()) /
//                                                         (1000 * 60)
//                                                     );
//                                                   const hours = Math.floor(
//                                                     transitTime / 60
//                                                   );
//                                                   const mins = transitTime % 60;
//                                                   return (
//                                                     <span
//                                                       key={`transit-time-${idx}`}
//                                                       className="inline-block "
//                                                     >
//                                                       {idx > 0 && ', '}
//                                                       {hours}h {mins}min
//                                                     </span>
//                                                   );
//                                                 }
//                                                 return null;
//                                               }
//                                             )}
//                                             {' )'}
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>

//                                     {/* Arrival */}
//                                     <div className="flex flex-col items-end justify-center">
//                                       <div className="label-l3 text-neutral-dark">
//                                         {format(
//                                           new Date(
//                                             flight.itineraries[0].segments[
//                                               flight.itineraries[0].segments
//                                                 .length - 1
//                                             ].arrival.at
//                                           ),
//                                           'dd MMM, EEE'
//                                         )}
//                                       </div>
//                                       <div className="title-t3 text-background-on">
//                                         {format(
//                                           new Date(
//                                             flight.itineraries[0].segments[
//                                               flight.itineraries[0].segments
//                                                 .length - 1
//                                             ].arrival.at
//                                           ),
//                                           'H:mm'
//                                         )}
//                                       </div>
//                                       <div className="label-l3 text-neutral-dark">
//                                         {
//                                           flight.itineraries[0].segments[
//                                             flight.itineraries[0].segments
//                                               .length - 1
//                                           ].arrival.iataCode
//                                         }
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Itinerary 2: Return (only for round trips) */}
//                                   {flight.itineraries.length > 1 && (
//                                     <>
//                                       {/* <div className="w-full flex justify-start px-6 mb-2">
//                                         <div className="text-xs font-medium text-blue-950 border-t border-dashed pt-2 w-full">
//                                           <span className="bg-blue-50 px-2 py-1 rounded">
//                                             Return Flight
//                                           </span>
//                                         </div>
//                                       </div> */}
//                                       <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-3 md:pr-6">
//                                         {/* Remove airline logo section from here since we moved it to the left column */}

//                                         {/* Departure */}
//                                         <div className="flex flex-col items-start justify-center">
//                                           <div className="label-l3 text-neutral-dark">
//                                             {format(
//                                               new Date(
//                                                 flight.itineraries[1].segments[0].departure.at
//                                               ),
//                                               'dd MMM, EEE'
//                                             )}
//                                           </div>
//                                           <div className="title-t3 text-background-on">
//                                             {format(
//                                               new Date(
//                                                 flight.itineraries[1].segments[0].departure.at
//                                               ),
//                                               'H:mm'
//                                             )}
//                                           </div>
//                                           <div className="label-l3 text-neutral-dark">
//                                             {
//                                               flight.itineraries[1].segments[0]
//                                                 .departure.iataCode
//                                             }
//                                           </div>
//                                         </div>

//                                         {/* Duration and stops */}
//                                         <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
//                                           <div className="label-l3 text-neutral-dark mb-1 pl-1">
//                                             {formatDuration(
//                                               flight.itineraries[1].duration
//                                             )}
//                                           </div>
//                                           <div className="flex items-center">
//                                             <img
//                                               src="/assets/plane-icon.svg"
//                                               alt="Departure"
//                                               className="w-6 h-6 label-l3 text-neutral-dark"
//                                               onError={(e) => {
//                                                 e.currentTarget.src =
//                                                   'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
//                                               }}
//                                             />

//                                             {/* Flight path display */}
//                                             <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
//                                               {/* Horizontal line spanning full width */}
//                                               <div className="w-full h-[1px] bg-gray-300 absolute"></div>

//                                               {/* Transit points bubble - only if there are stops */}
//                                               {flight.itineraries[1].segments
//                                                 .length > 1 && (
//                                                 <div className="mx-auto bg-white border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
//                                                   {flight.itineraries[1].segments
//                                                     .slice(0, -1)
//                                                     .map((segment, idx) => (
//                                                       <React.Fragment
//                                                         key={`return-transit-${idx}`}
//                                                       >
//                                                         {
//                                                           segment.arrival
//                                                             .iataCode
//                                                         }
//                                                         {idx <
//                                                           flight.itineraries[1]
//                                                             .segments.length -
//                                                             2 && ', '}
//                                                       </React.Fragment>
//                                                     ))}
//                                                 </div>
//                                               )}
//                                             </div>

//                                             <div className="w-4 h-4 rounded-full bg-primary"></div>
//                                           </div>

//                                           <div className="flex  items-center mt-1 ">
//                                             {/* Stops text */}
//                                             <div className="label-l3  text-secondary-bright ">
//                                               {flight.itineraries[1].segments
//                                                 .length === 1
//                                                 ? 'Direct'
//                                                 : flight.itineraries[1].segments
//                                                     .length === 2
//                                                 ? '1 Stop'
//                                                 : `${
//                                                     flight.itineraries[1]
//                                                       .segments.length - 1
//                                                   } Stops`}
//                                             </div>

//                                             {/* Transit times */}
//                                             {flight.itineraries[1].segments
//                                               .length > 1 && (
//                                               <div className="label-l3 text-background-on mt-0.5 ml-1">
//                                                 {' ('}{' '}
//                                                 {flight.itineraries[1].segments.map(
//                                                   (segment, idx) => {
//                                                     if (
//                                                       idx <
//                                                       flight.itineraries[1]
//                                                         .segments.length -
//                                                         1
//                                                     ) {
//                                                       const nextSegment =
//                                                         flight.itineraries[1]
//                                                           .segments[idx + 1];
//                                                       const transitTime =
//                                                         Math.round(
//                                                           (new Date(
//                                                             nextSegment.departure.at
//                                                           ).getTime() -
//                                                             new Date(
//                                                               segment.arrival.at
//                                                             ).getTime()) /
//                                                             (1000 * 60)
//                                                         );
//                                                       const hours = Math.floor(
//                                                         transitTime / 60
//                                                       );
//                                                       const mins =
//                                                         transitTime % 60;
//                                                       return (
//                                                         <span
//                                                           key={`return-transit-time-${idx}`}
//                                                           className="inline-block"
//                                                         >
//                                                           {idx > 0 && ', '}
//                                                           {hours}h {mins}min
//                                                         </span>
//                                                       );
//                                                     }
//                                                     return null;
//                                                   }
//                                                 )}
//                                                 {' )'}
//                                               </div>
//                                             )}
//                                           </div>
//                                         </div>

//                                         {/* Arrival */}
//                                         <div className="flex flex-col items-end justify-center">
//                                           <div className="label-l3 text-neutral-dark">
//                                             {format(
//                                               new Date(
//                                                 flight.itineraries[1].segments[
//                                                   flight.itineraries[1].segments
//                                                     .length - 1
//                                                 ].arrival.at
//                                               ),
//                                               'dd MMM, EEE'
//                                             )}
//                                           </div>
//                                           <div className="title-t3 text-background-on ">
//                                             {format(
//                                               new Date(
//                                                 flight.itineraries[1].segments[
//                                                   flight.itineraries[1].segments
//                                                     .length - 1
//                                                 ].arrival.at
//                                               ),
//                                               'H:mm'
//                                             )}
//                                           </div>
//                                           <div className="label-l3 text-neutral-dark">
//                                             {
//                                               flight.itineraries[1].segments[
//                                                 flight.itineraries[1].segments
//                                                   .length - 1
//                                               ].arrival.iataCode
//                                             }
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </>
//                                   )}
//                                 </div>

//                                 {/* Right column - Price and booking - full width on mobile */}
//                                 <div className="relative flex flex-col justify-center w-full md:min-w-[220px] md:w-[240px] md:mt-0 md:mt-0 py-3 md:py-0 border-t md:border-t-0">
//                                   <div className="hidden md:block absolute top-0 bottom-0 left-0 w-[1px] bg-gray-200"></div>
//                                   <div className="px-2 md:px-2  py-0 md:py-4 w-full">
//                                     {/* Mobile view price display - price and discount together */}
//                                     <div className="flex justify-between items-center mb-2 md:hidden">
//                                       <div
//                                         className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-left px-3 py-0 rounded-xl flex items-center"
//                                         style={{
//                                           boxShadow:
//                                             '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
//                                         }}
//                                       >
//                                         <Image
//                                           src="/assets/icons/seatIcon.svg"
//                                           width={12}
//                                           height={12}
//                                           alt="seatIcon"
//                                           className="me-1 flex-shrink-0 my-auto"
//                                         />
//                                         <span className="inline-flex items-center">
//                                           {flight.numberOfBookableSeats
//                                             ? `${
//                                                 flight.numberOfBookableSeats
//                                               } ${
//                                                 flight.numberOfBookableSeats > 1
//                                                   ? 'seats'
//                                                   : 'seat'
//                                               } left`
//                                             : 'Limited seats available'}
//                                         </span>
//                                       </div>
//                                       <div className="flex flex-col items-end">
//                                         {getAdultPrice(flight) && (
//                                           <div className="title-t3 text-primary ">
//                                             {formatDisplayPrice(
//                                               getAdultPrice(flight)!
//                                             )}
//                                             {'/'}
//                                             <span className="label-l3 text-primary">
//                                               per adult
//                                             </span>
//                                           </div>
//                                         )}
//                                         <span className="label-l3 text-neutral-dark text-right">
//                                           Total: AUD {Math.floor(price)}
//                                         </span>
//                                       </div>
//                                     </div>

//                                     {/* Add baggage information for mobile view */}
//                                     <div className="flex flex-col items-start text-left space-y-1 mt-2 mb-3 md:hidden">
//                                       {/* Outbound Baggage */}
//                                       <div className="flex items-center">
//                                         <Image
//                                           src="/assets/icons/baggageIcon.svg"
//                                           width={12}
//                                           height={12}
//                                           alt="baggageIcon"
//                                           className="me-1 flex-shrink-0"
//                                         />

//                                         <span className="label-l3 text-neutral-dark inline-flex items-center">
//                                           {(() => {
//                                             // Get outbound baggage info
//                                             if (
//                                               flight.travelerPricings &&
//                                               flight.travelerPricings.length >
//                                                 0 &&
//                                               flight.itineraries.length > 0
//                                             ) {
//                                               const adultTraveler =
//                                                 flight.travelerPricings.find(
//                                                   (tp) =>
//                                                     tp.travelerType === 'ADULT'
//                                                 );
//                                               if (
//                                                 adultTraveler?.fareDetailsBySegment &&
//                                                 adultTraveler
//                                                   .fareDetailsBySegment.length >
//                                                   0
//                                               ) {
//                                                 const firstSegment =
//                                                   adultTraveler
//                                                     .fareDetailsBySegment[0];

//                                                 // Handle cabin bags (hand carry)
//                                                 let cabinBagsDisplay = 'N/A'; // Default to N/A if no data
//                                                 if (
//                                                   firstSegment?.includedCabinBags !==
//                                                   undefined
//                                                 ) {
//                                                   // Check if weight is provided directly
//                                                   if (
//                                                     'weight' in
//                                                       firstSegment.includedCabinBags &&
//                                                     firstSegment
//                                                       .includedCabinBags
//                                                       .weight !== undefined
//                                                   ) {
//                                                     const weight =
//                                                       firstSegment
//                                                         .includedCabinBags
//                                                         .weight;
//                                                     const weightUnit =
//                                                       firstSegment
//                                                         .includedCabinBags
//                                                         .weightUnit || 'KG';
//                                                     cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                   }
//                                                   // Otherwise use quantity if available
//                                                   else if (
//                                                     'quantity' in
//                                                       firstSegment.includedCabinBags &&
//                                                     firstSegment
//                                                       .includedCabinBags
//                                                       .quantity !== undefined
//                                                   ) {
//                                                     const cabinQuantity =
//                                                       firstSegment
//                                                         .includedCabinBags
//                                                         .quantity;
//                                                     if (cabinQuantity === 0) {
//                                                       cabinBagsDisplay = '0 KG';
//                                                     } else if (
//                                                       cabinQuantity > 0
//                                                     ) {
//                                                       // Display as "7+7+..." for hand carry when quantity > 0
//                                                       cabinBagsDisplay = `${Array(
//                                                         cabinQuantity
//                                                       )
//                                                         .fill('7')
//                                                         .join(' + ')} KG`;
//                                                     }
//                                                   }
//                                                 }

//                                                 // Handle checked bags
//                                                 let checkedBagsDisplay = '';
//                                                 if (
//                                                   firstSegment?.includedCheckedBags
//                                                 ) {
//                                                   // If weight is specified directly
//                                                   if (
//                                                     'weight' in
//                                                       firstSegment.includedCheckedBags &&
//                                                     firstSegment
//                                                       .includedCheckedBags
//                                                       .weight !== undefined
//                                                   ) {
//                                                     const weight =
//                                                       firstSegment
//                                                         .includedCheckedBags
//                                                         .weight;
//                                                     const weightUnit =
//                                                       firstSegment
//                                                         .includedCheckedBags
//                                                         .weightUnit || 'KG';
//                                                     checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                   }
//                                                   // If quantity is specified, display as 23+23+... KG
//                                                   else if (
//                                                     'quantity' in
//                                                       firstSegment.includedCheckedBags &&
//                                                     firstSegment
//                                                       .includedCheckedBags
//                                                       .quantity !== undefined
//                                                   ) {
//                                                     const quantity =
//                                                       firstSegment
//                                                         .includedCheckedBags
//                                                         .quantity;
//                                                     if (quantity > 0) {
//                                                       checkedBagsDisplay = ` + ${Array(
//                                                         quantity
//                                                       )
//                                                         .fill('23')
//                                                         .join(' + ')} KG`;
//                                                     }
//                                                   }
//                                                 }

//                                                 return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                               }
//                                             }
//                                             return 'Outbound Baggage: N/A';
//                                           })()}
//                                         </span>
//                                       </div>
//                                       {/* Return Baggage - only show if there's a return flight */}
//                                       {flight.itineraries.length > 1 && (
//                                         <div className="flex items-center">
//                                           <Image
//                                             src="/assets/icons/baggageIcon.svg"
//                                             width={12}
//                                             height={12}
//                                             alt="baggageIcon"
//                                             className="me-1 flex-shrink-0"
//                                           />
//                                           <span className="label-l3 text-neutral-dark inline-flex items-center">
//                                             {(() => {
//                                               // Get return baggage info if exists
//                                               if (
//                                                 flight.travelerPricings &&
//                                                 flight.travelerPricings.length >
//                                                   0 &&
//                                                 flight.itineraries.length > 1
//                                               ) {
//                                                 const adultTraveler =
//                                                   flight.travelerPricings.find(
//                                                     (tp) =>
//                                                       tp.travelerType ===
//                                                       'ADULT'
//                                                   );
//                                                 if (
//                                                   adultTraveler?.fareDetailsBySegment &&
//                                                   adultTraveler
//                                                     .fareDetailsBySegment
//                                                     .length > 1
//                                                 ) {
//                                                   // Try to find the right segment for the return flight
//                                                   let returnSegment;

//                                                   // Best approach: First check if segmentId matches number or id property
//                                                   if (
//                                                     flight.itineraries[1]
//                                                       ?.segments[0]?.number
//                                                   ) {
//                                                     returnSegment =
//                                                       adultTraveler.fareDetailsBySegment.find(
//                                                         (segment) =>
//                                                           segment.segmentId ===
//                                                           flight.itineraries[1]
//                                                             .segments[0].number
//                                                       );
//                                                   }

//                                                   // If no match found, try matching by position
//                                                   if (!returnSegment) {
//                                                     // Count outbound segments
//                                                     const outboundSegmentsCount =
//                                                       flight.itineraries[0]
//                                                         .segments.length;

//                                                     // If we have more fareDetailsBySegment than outbound segments,
//                                                     // use the first one after the outbound segments
//                                                     if (
//                                                       adultTraveler
//                                                         .fareDetailsBySegment
//                                                         .length >
//                                                       outboundSegmentsCount
//                                                     ) {
//                                                       returnSegment =
//                                                         adultTraveler
//                                                           .fareDetailsBySegment[
//                                                           outboundSegmentsCount
//                                                         ];
//                                                     }
//                                                     // Otherwise fall back to the default behavior (second segment)
//                                                     else {
//                                                       returnSegment =
//                                                         adultTraveler
//                                                           .fareDetailsBySegment[1];
//                                                     }
//                                                   }

//                                                   // Handle cabin bags (hand carry)
//                                                   let cabinBagsDisplay = 'N/A'; // Default to N/A if no data
//                                                   if (
//                                                     returnSegment?.includedCabinBags !==
//                                                     undefined
//                                                   ) {
//                                                     // Check if weight is provided directly
//                                                     if (
//                                                       'weight' in
//                                                         returnSegment.includedCabinBags &&
//                                                       returnSegment
//                                                         .includedCabinBags
//                                                         .weight !== undefined
//                                                     ) {
//                                                       const weight =
//                                                         returnSegment
//                                                           .includedCabinBags
//                                                           .weight;
//                                                       const weightUnit =
//                                                         returnSegment
//                                                           .includedCabinBags
//                                                           .weightUnit || 'KG';
//                                                       cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                     }
//                                                     // Otherwise use quantity if available
//                                                     else if (
//                                                       'quantity' in
//                                                         returnSegment.includedCabinBags &&
//                                                       returnSegment
//                                                         .includedCabinBags
//                                                         .quantity !== undefined
//                                                     ) {
//                                                       const cabinQuantity =
//                                                         returnSegment
//                                                           .includedCabinBags
//                                                           .quantity;
//                                                       if (cabinQuantity === 0) {
//                                                         cabinBagsDisplay =
//                                                           '0 KG';
//                                                       } else if (
//                                                         cabinQuantity > 0
//                                                       ) {
//                                                         // Display as "7+7+..." for hand carry
//                                                         cabinBagsDisplay = `${Array(
//                                                           cabinQuantity
//                                                         )
//                                                           .fill('7')
//                                                           .join(' + ')} KG`;
//                                                       }
//                                                     }
//                                                   }

//                                                   // Return checked bags
//                                                   let checkedBagsDisplay = '';
//                                                   if (
//                                                     returnSegment?.includedCheckedBags
//                                                   ) {
//                                                     // If weight is specified directly
//                                                     if (
//                                                       'weight' in
//                                                         returnSegment.includedCheckedBags &&
//                                                       returnSegment
//                                                         .includedCheckedBags
//                                                         .weight !== undefined
//                                                     ) {
//                                                       const weight =
//                                                         returnSegment
//                                                           .includedCheckedBags
//                                                           .weight;
//                                                       const weightUnit =
//                                                         returnSegment
//                                                           .includedCheckedBags
//                                                           .weightUnit || 'KG';
//                                                       checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                     }
//                                                     // If quantity is specified, display as 23+23+... KG
//                                                     else if (
//                                                       'quantity' in
//                                                         returnSegment.includedCheckedBags &&
//                                                       returnSegment
//                                                         .includedCheckedBags
//                                                         .quantity !== undefined
//                                                     ) {
//                                                       const quantity =
//                                                         returnSegment
//                                                           .includedCheckedBags
//                                                           .quantity;
//                                                       if (quantity > 0) {
//                                                         checkedBagsDisplay = ` + ${Array(
//                                                           quantity
//                                                         )
//                                                           .fill('23')
//                                                           .join(' + ')} KG`;
//                                                       }
//                                                     }
//                                                   }

//                                                   return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                 }
//                                               }
//                                               return 'Return Baggage: N/A';
//                                             })()}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     {/* Desktop view price display - original format */}
//                                     <div className="hidden md:flex flex-col w-full">
//                                       <div className="flex flex-col items-end w-full">
//                                         {/* <div className="mb-1 text-center">
//                                           <span className="text-sm text-gray-500 line-through mr-2">
//                                             AUD {Math.round(price)}
//                                           </span>
//                                           <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
//                                             AUD 13 OFF
//                                           </span>
//                                         </div> */}
//                                         <div
//                                           className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex  justify-end"
//                                           style={{
//                                             boxShadow:
//                                               '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
//                                           }}
//                                         >
//                                           <Image
//                                             src="/assets/icons/seatIcon.svg"
//                                             width={12}
//                                             height={12}
//                                             alt="seatIcon"
//                                             className="me-1 flex-shrink-0 my-auto"
//                                           />
//                                           <span className="inline-flex items-center">
//                                             {flight.numberOfBookableSeats
//                                               ? `${
//                                                   flight.numberOfBookableSeats
//                                                 } ${
//                                                   flight.numberOfBookableSeats >
//                                                   1
//                                                     ? 'seats'
//                                                     : 'seat'
//                                                 } left`
//                                               : 'No seats left'}
//                                           </span>
//                                         </div>
//                                         {getAdultPrice(flight) && (
//                                           <div className="title-t3 text-primary  mt-1 text-right">
//                                             {formatDisplayPrice(
//                                               getAdultPrice(flight)!
//                                             )}
//                                             {'/'}
//                                             <span className="label-l3 text-primary">
//                                               per adult
//                                             </span>
//                                           </div>
//                                         )}
//                                         <div className=" label-l3 text-neutral-dark mb-2  text-right">
//                                           Total: AUD {Math.floor(price)}
//                                           {/* <span className="label-l3 text-neutral-dark ml-1">
//                                             /pax
//                                           </span> */}
//                                         </div>
//                                       </div>

//                                       <div className="flex flex-col items-start text-left space-y-1 mb-3">
//                                         {/* Outbound Baggage */}
//                                         <div className="flex items-start w-full">
//                                           <Image
//                                             src="/assets/icons/baggageIcon.svg"
//                                             width={12}
//                                             height={12}
//                                             alt="baggageIcon"
//                                             className="me-1 flex-shrink-0"
//                                           />
//                                           <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                             {(() => {
//                                               // Get outbound baggage info
//                                               if (
//                                                 flight.travelerPricings &&
//                                                 flight.travelerPricings.length >
//                                                   0 &&
//                                                 flight.itineraries.length > 0
//                                               ) {
//                                                 const adultTraveler =
//                                                   flight.travelerPricings.find(
//                                                     (tp) =>
//                                                       tp.travelerType ===
//                                                       'ADULT'
//                                                   );
//                                                 if (
//                                                   adultTraveler?.fareDetailsBySegment &&
//                                                   adultTraveler
//                                                     .fareDetailsBySegment
//                                                     .length > 0
//                                                 ) {
//                                                   const firstSegment =
//                                                     adultTraveler
//                                                       .fareDetailsBySegment[0];

//                                                   // Handle cabin bags (hand carry)
//                                                   let cabinBagsDisplay = 'N/A'; // Default to N/A if no data
//                                                   if (
//                                                     firstSegment?.includedCabinBags !==
//                                                     undefined
//                                                   ) {
//                                                     // Check if weight is provided directly
//                                                     if (
//                                                       'weight' in
//                                                         firstSegment.includedCabinBags &&
//                                                       firstSegment
//                                                         .includedCabinBags
//                                                         .weight !== undefined
//                                                     ) {
//                                                       const weight =
//                                                         firstSegment
//                                                           .includedCabinBags
//                                                           .weight;
//                                                       const weightUnit =
//                                                         firstSegment
//                                                           .includedCabinBags
//                                                           .weightUnit || 'KG';
//                                                       cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                     }
//                                                     // Otherwise use quantity if available
//                                                     else if (
//                                                       'quantity' in
//                                                         firstSegment.includedCabinBags &&
//                                                       firstSegment
//                                                         .includedCabinBags
//                                                         .quantity !== undefined
//                                                     ) {
//                                                       const cabinQuantity =
//                                                         firstSegment
//                                                           .includedCabinBags
//                                                           .quantity;
//                                                       if (cabinQuantity === 0) {
//                                                         cabinBagsDisplay =
//                                                           '0 KG';
//                                                       } else if (
//                                                         cabinQuantity > 0
//                                                       ) {
//                                                         // Display as "7+7+..." for hand carry when quantity > 0
//                                                         cabinBagsDisplay = `${Array(
//                                                           cabinQuantity
//                                                         )
//                                                           .fill('7')
//                                                           .join(' + ')} KG`;
//                                                       }
//                                                     }
//                                                   }

//                                                   // Outbound checked bags
//                                                   // Handle checked bags
//                                                   let checkedBagsDisplay = '';
//                                                   if (
//                                                     firstSegment?.includedCheckedBags
//                                                   ) {
//                                                     // If weight is specified directly
//                                                     if (
//                                                       'weight' in
//                                                         firstSegment.includedCheckedBags &&
//                                                       firstSegment
//                                                         .includedCheckedBags
//                                                         .weight !== undefined
//                                                     ) {
//                                                       const weight =
//                                                         firstSegment
//                                                           .includedCheckedBags
//                                                           .weight;
//                                                       const weightUnit =
//                                                         firstSegment
//                                                           .includedCheckedBags
//                                                           .weightUnit || 'KG';
//                                                       checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                     }
//                                                     // If quantity is specified, display as 23+23+... KG
//                                                     else if (
//                                                       'quantity' in
//                                                         firstSegment.includedCheckedBags &&
//                                                       firstSegment
//                                                         .includedCheckedBags
//                                                         .quantity !== undefined
//                                                     ) {
//                                                       const quantity =
//                                                         firstSegment
//                                                           .includedCheckedBags
//                                                           .quantity;
//                                                       if (quantity > 0) {
//                                                         checkedBagsDisplay = ` + ${Array(
//                                                           quantity
//                                                         )
//                                                           .fill('23')
//                                                           .join(' + ')} KG`;
//                                                       }
//                                                     }
//                                                   }

//                                                   return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                 }
//                                               }
//                                               return 'Outbound Baggage: N/A';
//                                             })()}
//                                           </span>
//                                         </div>

//                                         {/* Return Baggage - only show if there's a return flight */}
//                                         {flight.itineraries.length > 1 && (
//                                           <div className="flex items-start w-full">
//                                             <Image
//                                               src="/assets/icons/baggageIcon.svg"
//                                               width={12}
//                                               height={12}
//                                               alt="baggageIcon"
//                                               className="me-1 flex-shrink-0"
//                                             />
//                                             <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                               {(() => {
//                                                 // Get return baggage info if exists
//                                                 if (
//                                                   flight.travelerPricings &&
//                                                   flight.travelerPricings
//                                                     .length > 0 &&
//                                                   flight.itineraries.length > 1
//                                                 ) {
//                                                   const adultTraveler =
//                                                     flight.travelerPricings.find(
//                                                       (tp) =>
//                                                         tp.travelerType ===
//                                                         'ADULT'
//                                                     );
//                                                   if (
//                                                     adultTraveler?.fareDetailsBySegment &&
//                                                     adultTraveler
//                                                       .fareDetailsBySegment
//                                                       .length > 1
//                                                   ) {
//                                                     // Try to find the right segment for the return flight
//                                                     let returnSegment;

//                                                     // Best approach: First check if segmentId matches number or id property
//                                                     if (
//                                                       flight.itineraries[1]
//                                                         ?.segments[0]?.number
//                                                     ) {
//                                                       returnSegment =
//                                                         adultTraveler.fareDetailsBySegment.find(
//                                                           (segment) =>
//                                                             segment.segmentId ===
//                                                             flight
//                                                               .itineraries[1]
//                                                               .segments[0]
//                                                               .number
//                                                         );
//                                                     }

//                                                     // If no match found, try matching by position
//                                                     if (!returnSegment) {
//                                                       // Count outbound segments
//                                                       const outboundSegmentsCount =
//                                                         flight.itineraries[0]
//                                                           .segments.length;

//                                                       // If we have more fareDetailsBySegment than outbound segments,
//                                                       // use the first one after the outbound segments
//                                                       if (
//                                                         adultTraveler
//                                                           .fareDetailsBySegment
//                                                           .length >
//                                                         outboundSegmentsCount
//                                                       ) {
//                                                         returnSegment =
//                                                           adultTraveler
//                                                             .fareDetailsBySegment[
//                                                             outboundSegmentsCount
//                                                           ];
//                                                       }
//                                                       // Otherwise fall back to the default behavior (second segment)
//                                                       else {
//                                                         returnSegment =
//                                                           adultTraveler
//                                                             .fareDetailsBySegment[1];
//                                                       }
//                                                     }

//                                                     // Handle cabin bags (hand carry)
//                                                     let cabinBagsDisplay =
//                                                       'N/A'; // Default to N/A if no data
//                                                     if (
//                                                       returnSegment?.includedCabinBags !==
//                                                       undefined
//                                                     ) {
//                                                       // Check if weight is provided directly
//                                                       if (
//                                                         'weight' in
//                                                           returnSegment.includedCabinBags &&
//                                                         returnSegment
//                                                           .includedCabinBags
//                                                           .weight !== undefined
//                                                       ) {
//                                                         const weight =
//                                                           returnSegment
//                                                             .includedCabinBags
//                                                             .weight;
//                                                         const weightUnit =
//                                                           returnSegment
//                                                             .includedCabinBags
//                                                             .weightUnit || 'KG';
//                                                         cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                       }
//                                                       // Otherwise use quantity if available
//                                                       else if (
//                                                         'quantity' in
//                                                           returnSegment.includedCabinBags &&
//                                                         returnSegment
//                                                           .includedCabinBags
//                                                           .quantity !==
//                                                           undefined
//                                                       ) {
//                                                         const cabinQuantity =
//                                                           returnSegment
//                                                             .includedCabinBags
//                                                             .quantity;
//                                                         if (
//                                                           cabinQuantity === 0
//                                                         ) {
//                                                           cabinBagsDisplay =
//                                                             '0 KG';
//                                                         } else if (
//                                                           cabinQuantity > 0
//                                                         ) {
//                                                           // Display as "7+7+..." for hand carry
//                                                           cabinBagsDisplay = `${Array(
//                                                             cabinQuantity
//                                                           )
//                                                             .fill('7')
//                                                             .join(' + ')} KG`;
//                                                         }
//                                                       }
//                                                     }

//                                                     // Return checked bags
//                                                     // Handle checked bags
//                                                     let checkedBagsDisplay = '';
//                                                     if (
//                                                       returnSegment?.includedCheckedBags
//                                                     ) {
//                                                       // If weight is specified directly
//                                                       if (
//                                                         'weight' in
//                                                           returnSegment.includedCheckedBags &&
//                                                         returnSegment
//                                                           .includedCheckedBags
//                                                           .weight !== undefined
//                                                       ) {
//                                                         const weight =
//                                                           returnSegment
//                                                             .includedCheckedBags
//                                                             .weight;
//                                                         const weightUnit =
//                                                           returnSegment
//                                                             .includedCheckedBags
//                                                             .weightUnit || 'KG';
//                                                         checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                       }
//                                                       // If quantity is specified, display as 23+23+... KG
//                                                       else if (
//                                                         'quantity' in
//                                                           returnSegment.includedCheckedBags &&
//                                                         returnSegment
//                                                           .includedCheckedBags
//                                                           .quantity !==
//                                                           undefined
//                                                       ) {
//                                                         const quantity =
//                                                           returnSegment
//                                                             .includedCheckedBags
//                                                             .quantity;
//                                                         if (quantity > 0) {
//                                                           checkedBagsDisplay = ` + ${Array(
//                                                             quantity
//                                                           )
//                                                             .fill('23')
//                                                             .join(' + ')} KG`;
//                                                         }
//                                                       }
//                                                     }

//                                                     return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                   }
//                                                 }
//                                                 return 'Return Baggage: N/A';
//                                               })()}
//                                             </span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>
//                                     <Button
//                                       className="w-full  hover:bg-[#5143d9] title-t4  text-primary-on bg-primary "
//                                       onClick={() =>
//                                         handleFlightBooking(flight)
//                                       }
//                                     >
//                                       Book Now
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Flight Details Button Bar */}
//                               <div className="px-0 md:px-6 py-1 md:py-0 bg-container border-t">
//                                 <div className="flex justify-between items-center">
//                                   <div className="flex space-x-2">
//                                     {flight.samePriceOffers &&
//                                       flight.samePriceOffers.length > 0 && (
//                                         <Button
//                                           variant="ghost"
//                                           size="sm"
//                                           className="text-blue-600 hover:text-blue-800 flex items-center"
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             toggleSamePriceOffers(
//                                               `${flight.id}-${index}`
//                                             );
//                                           }}
//                                         >
//                                           <span className="label-l3 text-primary">
//                                             More Fares +
//                                           </span>
//                                           {/* {expandedSamePriceId ===
//                                           `${flight.id}-${index}` ? (
//                                             <ChevronUp className="h-4 w-4 ml-1 " />
//                                           ) : (
//                                             <ChevronDown className="h-4 w-4 ml-1" />
//                                           )} */}
//                                         </Button>
//                                       )}
//                                   </div>
//                                   <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     className="label-l3 text-neutral-dark hover:text-blue-950 flex justify-between items-center"
//                                     onClick={() =>
//                                       toggleFlightDetails(
//                                         `${flight.id}-${index}`,
//                                         flight
//                                       )
//                                     }
//                                   >
//                                     <span className="label-l3 text-primary">
//                                       Flight Details
//                                     </span>
//                                     <ChevronRight className="h-4 w-4 ml-1 text-primary" />
//                                   </Button>
//                                 </div>
//                               </div>

//                               {/* Same Price Offers Section */}
//                               {expandedSamePriceId ===
//                                 `${flight.id}-${index}` && (
//                                 <div className="border-[2px] border-[#0c0073] rounded-lg bg-container ">
//                                   <div className="px-4 pt-4">
//                                     {/* <div className="font-medium text-blue-950 mb-4">
//                                       {flight.samePriceOffers?.length} more
//                                       flights at same price
//                                         </div> */}

//                                     {flight.samePriceOffers?.map(
//                                       (offer, offerIdx) => (
//                                         <div
//                                           key={`offer-${offerIdx}`}
//                                           className="mb-4 border border-[#EEEEEE] rounded-lg overflow-hidden hover:shadow-sm"
//                                         >
//                                           <div className="flex flex-col md:flex-row items-stretch min-h-[130px]">
//                                             {/* Left column for airline info */}
//                                             <div className="md:w-[150px] py-2 px-1 md:px-4 flex items-center justify-center">
//                                               <div className="flex flex-col items-center w-full">
//                                                 {/* Check if both flights use same airline */}
//                                                 {(() => {
//                                                   const hasSameAirline =
//                                                     offer.itineraries.length >
//                                                       1 &&
//                                                     offer.itineraries[0]
//                                                       .segments[0]
//                                                       .carrierCode ===
//                                                       offer.itineraries[1]
//                                                         .segments[0]
//                                                         .carrierCode;

//                                                   return (
//                                                     <>
//                                                       {/* Outbound flight airline - always visible */}
//                                                       <div className="flex flex-col md:flex-col md:items-center w-full">
//                                                         <div className="flex md:flex-col items-center mb-1">
//                                                           <img
//                                                             src={`https://pics.avs.io/200/40/${offer.itineraries[0].segments[0].carrierCode}.png`}
//                                                             alt={
//                                                               offer
//                                                                 .itineraries[0]
//                                                                 .segments[0]
//                                                                 .carrierCode
//                                                             }
//                                                             className="h-6 object-contain w-24"
//                                                             onError={(e) => {
//                                                               e.currentTarget.src =
//                                                                 'https://via.placeholder.com/80x20?text=Airline';
//                                                             }}
//                                                           />
//                                                           <div className="label-l3 text-background-on ml-2 md:ml-0 md:mt-1 text-center">
//                                                             {(() => {
//                                                               const carrierCode =
//                                                                 offer
//                                                                   .itineraries[0]
//                                                                   .segments[0]
//                                                                   .carrierCode;
//                                                               let airlineName =
//                                                                 '';

//                                                               if (
//                                                                 offer
//                                                                   .dictionaries
//                                                                   ?.carriers &&
//                                                                 offer
//                                                                   .dictionaries
//                                                                   .carriers[
//                                                                   carrierCode
//                                                                 ]
//                                                               ) {
//                                                                 airlineName =
//                                                                   offer
//                                                                     .dictionaries
//                                                                     .carriers[
//                                                                     carrierCode
//                                                                   ];
//                                                               } else if (
//                                                                 apiData
//                                                                   ?.dictionaries
//                                                                   ?.airlines
//                                                               ) {
//                                                                 const airline =
//                                                                   apiData.dictionaries.airlines.find(
//                                                                     (a) =>
//                                                                       a.code ===
//                                                                       carrierCode
//                                                                   );
//                                                                 airlineName =
//                                                                   airline
//                                                                     ? airline.name
//                                                                     : carrierCode;
//                                                               } else {
//                                                                 airlineName =
//                                                                   carrierCode;
//                                                               }

//                                                               // Add "Both flights" label for mobile view when same airline
//                                                               return (
//                                                                 <>
//                                                                   <span className="md:inline">
//                                                                     {
//                                                                       airlineName
//                                                                     }
//                                                                   </span>
//                                                                   {/* {hasSameAirline && (
//                                                                     <span className="md:hidden">
//                                                                       {' '}
//                                                                       (Both
//                                                                       flights)
//                                                                     </span>
//                                                                   )} */}
//                                                                 </>
//                                                               );
//                                                             })()}
//                                                           </div>
//                                                         </div>
//                                                       </div>

//                                                       {/* Return flight airline - hide on mobile if same airline, always show on desktop */}
//                                                       {offer.itineraries
//                                                         .length > 1 && (
//                                                         <div
//                                                           className={`flex flex-col md:flex-col md:items-center w-full md:mt-2 md:mt-3 pt-2 md:pt-3 ${
//                                                             hasSameAirline
//                                                               ? 'hidden md:flex'
//                                                               : ''
//                                                           }`}
//                                                         >
//                                                           <div className="flex md:flex-col items-center md:mb-1">
//                                                             <img
//                                                               src={`https://pics.avs.io/200/40/${offer.itineraries[1].segments[0].carrierCode}.png`}
//                                                               alt={
//                                                                 offer
//                                                                   .itineraries[1]
//                                                                   .segments[0]
//                                                                   .carrierCode
//                                                               }
//                                                               className="h-6 object-contain w-24"
//                                                               onError={(e) => {
//                                                                 e.currentTarget.src =
//                                                                   'https://via.placeholder.com/80x20?text=Airline';
//                                                               }}
//                                                             />
//                                                             <div className="label-l3 text-background-on ml-2 md:ml-0 md:mt-2 text-center">
//                                                               {(() => {
//                                                                 const carrierCode =
//                                                                   offer
//                                                                     .itineraries[1]
//                                                                     .segments[0]
//                                                                     .carrierCode;
//                                                                 if (
//                                                                   offer
//                                                                     .dictionaries
//                                                                     ?.carriers &&
//                                                                   offer
//                                                                     .dictionaries
//                                                                     .carriers[
//                                                                     carrierCode
//                                                                   ]
//                                                                 ) {
//                                                                   return offer
//                                                                     .dictionaries
//                                                                     .carriers[
//                                                                     carrierCode
//                                                                   ];
//                                                                 } else if (
//                                                                   apiData
//                                                                     ?.dictionaries
//                                                                     ?.airlines
//                                                                 ) {
//                                                                   const airline =
//                                                                     apiData.dictionaries.airlines.find(
//                                                                       (a) =>
//                                                                         a.code ===
//                                                                         carrierCode
//                                                                     );
//                                                                   return airline
//                                                                     ? airline.name
//                                                                     : carrierCode;
//                                                                 }
//                                                                 return carrierCode;
//                                                               })()}
//                                                             </div>
//                                                           </div>
//                                                         </div>
//                                                       )}
//                                                     </>
//                                                   );
//                                                 })()}
//                                               </div>
//                                             </div>

//                                             {/* Center column with flight itineraries */}
//                                             <div className="md:flex-1 flex flex-col items-center justify-center px-3 py-0 md:py-3 md:pr-6 md:flex md:items-center md:self-center">
//                                               {/* Outbound flight */}
//                                               <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between md:mb-1">
//                                                 {/* Departure */}
//                                                 <div className="flex flex-col items-start justify-center">
//                                                   <div className="label-l3 text-neutral-dark">
//                                                     {format(
//                                                       new Date(
//                                                         offer.itineraries[0].segments[0].departure.at
//                                                       ),
//                                                       'dd MMM, EEE'
//                                                     )}
//                                                   </div>
//                                                   <div className="title-t3 text-background-on">
//                                                     {format(
//                                                       new Date(
//                                                         offer.itineraries[0].segments[0].departure.at
//                                                       ),
//                                                       'H:mm'
//                                                     )}
//                                                   </div>
//                                                   <div className="label-l3 text-neutral-dark">
//                                                     {
//                                                       offer.itineraries[0]
//                                                         .segments[0].departure
//                                                         .iataCode
//                                                     }
//                                                   </div>
//                                                 </div>

//                                                 {/* Duration and stops */}
//                                                 <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
//                                                   <div className="label-l3 text-neutral-dark mb-1 pl-1">
//                                                     {(() => {
//                                                       const departureTime =
//                                                         new Date(
//                                                           offer.itineraries[0].segments[0].departure.at
//                                                         );
//                                                       const arrivalTime =
//                                                         new Date(
//                                                           offer.itineraries[0].segments[
//                                                             offer.itineraries[0]
//                                                               .segments.length -
//                                                               1
//                                                           ].arrival.at
//                                                         );
//                                                       const durationMs =
//                                                         arrivalTime.getTime() -
//                                                         departureTime.getTime();
//                                                       const durationMin =
//                                                         Math.floor(
//                                                           durationMs /
//                                                             (1000 * 60)
//                                                         );
//                                                       const hours = Math.floor(
//                                                         durationMin / 60
//                                                       );
//                                                       const mins =
//                                                         durationMin % 60;
//                                                       return `${hours}h ${mins}min`;
//                                                     })()}
//                                                   </div>
//                                                   <div className="flex items-center">
//                                                     <img
//                                                       src="/assets/plane-icon.svg"
//                                                       alt="Departure"
//                                                       className="w-6 h-6 label-l3 text-neutral-dark"
//                                                       onError={(e) => {
//                                                         e.currentTarget.src =
//                                                           'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
//                                                       }}
//                                                     />

//                                                     {/* Flight path display */}
//                                                     <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
//                                                       {/* Horizontal line spanning full width */}
//                                                       <div className="w-full h-[1px] bg-gray-300 absolute"></div>

//                                                       {/* Transit points bubble - only if there are stops */}
//                                                       {offer.itineraries[0]
//                                                         .segments.length >
//                                                         1 && (
//                                                         <div className="mx-auto bg-container border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
//                                                           {offer.itineraries[0].segments
//                                                             .slice(0, -1)
//                                                             .map(
//                                                               (
//                                                                 segment,
//                                                                 idx
//                                                               ) => (
//                                                                 <React.Fragment
//                                                                   key={`transit-${idx}`}
//                                                                 >
//                                                                   {
//                                                                     segment
//                                                                       .arrival
//                                                                       .iataCode
//                                                                   }
//                                                                   {idx <
//                                                                     offer
//                                                                       .itineraries[0]
//                                                                       .segments
//                                                                       .length -
//                                                                       2 && ', '}
//                                                                 </React.Fragment>
//                                                               )
//                                                             )}
//                                                         </div>
//                                                       )}
//                                                     </div>

//                                                     <div className="w-4 h-4 rounded-full bg-primary"></div>
//                                                   </div>

//                                                   <div className="flex  items-center mt-1 ">
//                                                     {/* Stops text */}
//                                                     <div className="label-l3 text-secondary-bright mr-1">
//                                                       {offer.itineraries[0]
//                                                         .segments.length === 1
//                                                         ? 'Direct'
//                                                         : offer.itineraries[0]
//                                                             .segments.length ===
//                                                           2
//                                                         ? '1 Stop'
//                                                         : `${
//                                                             offer.itineraries[0]
//                                                               .segments.length -
//                                                             1
//                                                           } Stops`}
//                                                     </div>
//                                                     {/* Transit times */}

//                                                     {offer.itineraries[0]
//                                                       .segments.length > 1 && (
//                                                       <div className="label-l3 text-background-on mt-0.5">
//                                                         {' ('}{' '}
//                                                         {offer.itineraries[0].segments.map(
//                                                           (segment, idx) => {
//                                                             if (
//                                                               idx <
//                                                               offer
//                                                                 .itineraries[0]
//                                                                 .segments
//                                                                 .length -
//                                                                 1
//                                                             ) {
//                                                               const nextSegment =
//                                                                 offer
//                                                                   .itineraries[0]
//                                                                   .segments[
//                                                                   idx + 1
//                                                                 ];
//                                                               const transitTime =
//                                                                 Math.round(
//                                                                   (new Date(
//                                                                     nextSegment.departure.at
//                                                                   ).getTime() -
//                                                                     new Date(
//                                                                       segment.arrival.at
//                                                                     ).getTime()) /
//                                                                     (1000 * 60)
//                                                                 );
//                                                               const hours =
//                                                                 Math.floor(
//                                                                   transitTime /
//                                                                     60
//                                                                 );
//                                                               const mins =
//                                                                 transitTime %
//                                                                 60;
//                                                               return (
//                                                                 <span
//                                                                   key={`transit-time-${idx}`}
//                                                                   className="inline-block "
//                                                                 >
//                                                                   {idx > 0 &&
//                                                                     ', '}
//                                                                   {hours}h{' '}
//                                                                   {mins}min
//                                                                 </span>
//                                                               );
//                                                             }
//                                                             return null;
//                                                           }
//                                                         )}
//                                                         {')'}
//                                                       </div>
//                                                     )}
//                                                   </div>
//                                                 </div>

//                                                 {/* Arrival */}
//                                                 <div className="flex flex-col items-end justify-center">
//                                                   <div className="label-l3 text-neutral-dark">
//                                                     {format(
//                                                       new Date(
//                                                         offer.itineraries[0].segments[
//                                                           offer.itineraries[0]
//                                                             .segments.length - 1
//                                                         ].arrival.at
//                                                       ),
//                                                       'dd MMM, EEE'
//                                                     )}
//                                                   </div>
//                                                   <div className="title-t3 text-background-on">
//                                                     {format(
//                                                       new Date(
//                                                         offer.itineraries[0].segments[
//                                                           offer.itineraries[0]
//                                                             .segments.length - 1
//                                                         ].arrival.at
//                                                       ),
//                                                       'H:mm'
//                                                     )}
//                                                   </div>
//                                                   <div className="label-l3 text-neutral-dark">
//                                                     {
//                                                       offer.itineraries[0]
//                                                         .segments[
//                                                         offer.itineraries[0]
//                                                           .segments.length - 1
//                                                       ].arrival.iataCode
//                                                     }
//                                                   </div>
//                                                 </div>
//                                               </div>

//                                               {/* Return flight if exists */}
//                                               {offer.itineraries.length > 1 && (
//                                                 <div className="w-full md:pt-0 md:mt-0  flex flex-wrap md:flex-nowrap items-center justify-between">
//                                                   {/* Departure */}
//                                                   <div className="flex flex-col items-start justify-center">
//                                                     <div className="label-l3 text-neutral-dark">
//                                                       {format(
//                                                         new Date(
//                                                           offer.itineraries[1].segments[0].departure.at
//                                                         ),
//                                                         'dd MMM, EEE'
//                                                       )}
//                                                     </div>
//                                                     <div className="title-t3 text-background-on">
//                                                       {format(
//                                                         new Date(
//                                                           offer.itineraries[1].segments[0].departure.at
//                                                         ),
//                                                         'H:mm'
//                                                       )}
//                                                     </div>
//                                                     <div className="label-l3 text-neutral-dark">
//                                                       {
//                                                         offer.itineraries[1]
//                                                           .segments[0].departure
//                                                           .iataCode
//                                                       }
//                                                     </div>
//                                                   </div>

//                                                   {/* Duration and stops */}
//                                                   <div className="flex flex-col items-center justify-center mx-2 md:mx-4 my-2 md:my-0">
//                                                     <div className="label-l3 text-neutral-dark mb-1 pl-1">
//                                                       {(() => {
//                                                         const departureTime =
//                                                           new Date(
//                                                             offer.itineraries[1].segments[0].departure.at
//                                                           );
//                                                         const arrivalTime =
//                                                           new Date(
//                                                             offer.itineraries[1].segments[
//                                                               offer
//                                                                 .itineraries[1]
//                                                                 .segments
//                                                                 .length - 1
//                                                             ].arrival.at
//                                                           );
//                                                         const durationMs =
//                                                           arrivalTime.getTime() -
//                                                           departureTime.getTime();
//                                                         const durationMin =
//                                                           Math.floor(
//                                                             durationMs /
//                                                               (1000 * 60)
//                                                           );
//                                                         const hours =
//                                                           Math.floor(
//                                                             durationMin / 60
//                                                           );
//                                                         const mins =
//                                                           durationMin % 60;
//                                                         return `${hours}h ${mins}min`;
//                                                       })()}
//                                                     </div>
//                                                     <div className="flex items-center">
//                                                       <img
//                                                         src="/assets/plane-icon.svg"
//                                                         alt="Departure"
//                                                         className="w-6 h-6 text-gray-400"
//                                                         onError={(e) => {
//                                                           e.currentTarget.src =
//                                                             'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBsYW5lIj48cGF0aCBkPSJNMTcuOCA0LjJBMiAyIDAgMCAwIDE2IDNhMiAyIDAgMCAwLTEuOCAxLjJMMTIgMTJsLTYuOC0xLjUgQTIgMiAwIDAgMCAzIDE0bDYuOCAxLjVMNS41IDE5IDkgMjFsNi41LTcgOC41IDJWNGwtOC44IDEuN1oiLz48L3N2Zz4=';
//                                                         }}
//                                                       />

//                                                       {/* Flight path display */}
//                                                       <div className="flex items-center justify-center w-[120px] md:w-[160px] relative">
//                                                         {/* Horizontal line spanning full width */}
//                                                         <div className="w-full h-[1px] bg-gray-300 absolute"></div>

//                                                         {/* Transit points bubble - only if there are stops */}
//                                                         {offer.itineraries[1]
//                                                           .segments.length >
//                                                           1 && (
//                                                           <div className="mx-auto bg-container border border-gray-300 rounded-full px-3 py-1 z-10 label-l3 text-neutral-dark text-center whitespace-nowrap">
//                                                             {offer.itineraries[1].segments
//                                                               .slice(0, -1)
//                                                               .map(
//                                                                 (
//                                                                   segment,
//                                                                   idx
//                                                                 ) => (
//                                                                   <React.Fragment
//                                                                     key={`transit-return-${idx}`}
//                                                                   >
//                                                                     {
//                                                                       segment
//                                                                         .arrival
//                                                                         .iataCode
//                                                                     }
//                                                                     {idx <
//                                                                       offer
//                                                                         .itineraries[1]
//                                                                         .segments
//                                                                         .length -
//                                                                         2 &&
//                                                                       ', '}
//                                                                   </React.Fragment>
//                                                                 )
//                                                               )}
//                                                           </div>
//                                                         )}
//                                                       </div>

//                                                       <div className="w-4 h-4 rounded-full bg-primary"></div>
//                                                     </div>

//                                                     <div className="flex  items-center mt-1 ">
//                                                       {/* Stops text */}
//                                                       <div className="label-l3 text-secondary-bright mr-1">
//                                                         {offer.itineraries[1]
//                                                           .segments.length === 1
//                                                           ? 'Direct'
//                                                           : offer.itineraries[1]
//                                                               .segments
//                                                               .length === 2
//                                                           ? '1 Stop'
//                                                           : `${
//                                                               offer
//                                                                 .itineraries[1]
//                                                                 .segments
//                                                                 .length - 1
//                                                             } Stops`}
//                                                       </div>
//                                                       {/* Transit times */}

//                                                       {offer.itineraries[1]
//                                                         .segments.length >
//                                                         1 && (
//                                                         <div className="label-l3 text-background-on mt-0.5">
//                                                           {' ('}{' '}
//                                                           {offer.itineraries[1].segments.map(
//                                                             (segment, idx) => {
//                                                               if (
//                                                                 idx <
//                                                                 offer
//                                                                   .itineraries[1]
//                                                                   .segments
//                                                                   .length -
//                                                                   1
//                                                               ) {
//                                                                 const nextSegment =
//                                                                   offer
//                                                                     .itineraries[1]
//                                                                     .segments[
//                                                                     idx + 1
//                                                                   ];
//                                                                 const transitTime =
//                                                                   Math.round(
//                                                                     (new Date(
//                                                                       nextSegment.departure.at
//                                                                     ).getTime() -
//                                                                       new Date(
//                                                                         segment.arrival.at
//                                                                       ).getTime()) /
//                                                                       (1000 *
//                                                                         60)
//                                                                   );
//                                                                 const hours =
//                                                                   Math.floor(
//                                                                     transitTime /
//                                                                       60
//                                                                   );
//                                                                 const mins =
//                                                                   transitTime %
//                                                                   60;
//                                                                 return (
//                                                                   <span
//                                                                     key={`transit-time-return-${idx}`}
//                                                                     className="inline-block "
//                                                                   >
//                                                                     {idx > 0 &&
//                                                                       ', '}
//                                                                     {hours}h{' '}
//                                                                     {mins}
//                                                                     min
//                                                                   </span>
//                                                                 );
//                                                               }
//                                                               return null;
//                                                             }
//                                                           )}{' '}
//                                                           {')'}
//                                                         </div>
//                                                       )}
//                                                     </div>
//                                                   </div>

//                                                   {/* Arrival */}
//                                                   <div className="flex flex-col items-end justify-center">
//                                                     <div className="label-l3 text-neutral-dark">
//                                                       {format(
//                                                         new Date(
//                                                           offer.itineraries[1].segments[
//                                                             offer.itineraries[1]
//                                                               .segments.length -
//                                                               1
//                                                           ].arrival.at
//                                                         ),
//                                                         'dd MMM, EEE'
//                                                       )}
//                                                     </div>
//                                                     <div className="title-t3 text-background-on">
//                                                       {format(
//                                                         new Date(
//                                                           offer.itineraries[1].segments[
//                                                             offer.itineraries[1]
//                                                               .segments.length -
//                                                               1
//                                                           ].arrival.at
//                                                         ),
//                                                         'H:mm'
//                                                       )}
//                                                     </div>
//                                                     <div className="label-l3 text-neutral-dark">
//                                                       {
//                                                         offer.itineraries[1]
//                                                           .segments[
//                                                           offer.itineraries[1]
//                                                             .segments.length - 1
//                                                         ].arrival.iataCode
//                                                       }
//                                                     </div>
//                                                   </div>
//                                                 </div>
//                                               )}
//                                             </div>

//                                             {/* Right column - Price and Book button */}
//                                             <div className="w-full md:w-[230px] px-2 md:px-2 py-2 md:py-4 flex flex-col md:items-end justify-center border-t md:border-t-0 border-l">
//                                               {/* Desktop view (hidden on mobile) */}
//                                               <div className="hidden md:flex md:flex-col md:items-end md:w-full ">
//                                                 <div
//                                                   className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex items-center justify-end"
//                                                   style={{
//                                                     boxShadow:
//                                                       '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
//                                                   }}
//                                                 >
//                                                   <Image
//                                                     src="/assets/icons/seatIcon.svg"
//                                                     width={12}
//                                                     height={12}
//                                                     alt="seatIcon"
//                                                     className="me-1 flex-shrink-0 my-auto"
//                                                   />
//                                                   {offer.numberOfBookableSeats
//                                                     ? `${
//                                                         offer.numberOfBookableSeats
//                                                       } ${
//                                                         offer.numberOfBookableSeats >
//                                                         1
//                                                           ? 'seats'
//                                                           : 'seat'
//                                                       } left`
//                                                     : 'Limited seats available'}
//                                                 </div>

//                                                 {getAdultPrice(offer) && (
//                                                   <div className="title-t3 text-primary  mt-1 text-right">
//                                                     {formatDisplayPrice(
//                                                       getAdultPrice(offer)!
//                                                     )}
//                                                     {'/'}
//                                                     <span className="label-l3 text-primary">
//                                                       per adult
//                                                     </span>
//                                                   </div>
//                                                 )}
//                                                 <div className="label-l3 text-neutral-dark mb-2 text-right">
//                                                   Total: AUD{' '}
//                                                   {Math.floor(
//                                                     parseFloat(
//                                                       offer.price.grandTotal
//                                                     )
//                                                   )}
//                                                 </div>

//                                                 {/* Baggage Information */}
//                                                 <div className="flex flex-col items-start text-left space-y-1 mb-3 w-full">
//                                                   {/* Outbound Baggage */}
//                                                   <div className="flex items-start w-full">
//                                                     <Image
//                                                       src="/assets/icons/baggageIcon.svg"
//                                                       width={12}
//                                                       height={12}
//                                                       alt="baggageIcon"
//                                                       className="me-1 flex-shrink-0"
//                                                     />
//                                                     <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                                       {(() => {
//                                                         // Get outbound baggage info
//                                                         if (
//                                                           offer.travelerPricings &&
//                                                           offer.travelerPricings
//                                                             .length > 0 &&
//                                                           offer.itineraries
//                                                             .length > 0
//                                                         ) {
//                                                           const adultTraveler =
//                                                             offer.travelerPricings.find(
//                                                               (tp) =>
//                                                                 tp.travelerType ===
//                                                                 'ADULT'
//                                                             );
//                                                           if (
//                                                             adultTraveler?.fareDetailsBySegment &&
//                                                             adultTraveler
//                                                               .fareDetailsBySegment
//                                                               .length > 0
//                                                           ) {
//                                                             const firstSegment =
//                                                               adultTraveler
//                                                                 .fareDetailsBySegment[0];

//                                                             // Handle cabin bags (hand carry)
//                                                             let cabinBagsDisplay =
//                                                               'N/A'; // Default to N/A if no data
//                                                             if (
//                                                               firstSegment?.includedCabinBags !==
//                                                               undefined
//                                                             ) {
//                                                               // Check if weight is provided directly
//                                                               if (
//                                                                 'weight' in
//                                                                   firstSegment.includedCabinBags &&
//                                                                 firstSegment
//                                                                   .includedCabinBags
//                                                                   .weight !==
//                                                                   undefined
//                                                               ) {
//                                                                 const weight =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .weight;
//                                                                 const weightUnit =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .weightUnit ||
//                                                                   'KG';
//                                                                 cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                               }
//                                                               // Otherwise use quantity if available
//                                                               else if (
//                                                                 'quantity' in
//                                                                   firstSegment.includedCabinBags &&
//                                                                 firstSegment
//                                                                   .includedCabinBags
//                                                                   .quantity !==
//                                                                   undefined
//                                                               ) {
//                                                                 const cabinQuantity =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .quantity;
//                                                                 if (
//                                                                   cabinQuantity ===
//                                                                   0
//                                                                 ) {
//                                                                   cabinBagsDisplay =
//                                                                     '0 KG';
//                                                                 } else if (
//                                                                   cabinQuantity >
//                                                                   0
//                                                                 ) {
//                                                                   // Display as "7+7+..." for hand carry when quantity > 0
//                                                                   cabinBagsDisplay = `${Array(
//                                                                     cabinQuantity
//                                                                   )
//                                                                     .fill('7')
//                                                                     .join(
//                                                                       '+'
//                                                                     )} KG`;
//                                                                 }
//                                                               }
//                                                             }

//                                                             // Handle checked bags
//                                                             let checkedBagsDisplay =
//                                                               '';
//                                                             if (
//                                                               firstSegment?.includedCheckedBags
//                                                             ) {
//                                                               // If weight is specified directly
//                                                               if (
//                                                                 'weight' in
//                                                                   firstSegment.includedCheckedBags &&
//                                                                 firstSegment
//                                                                   .includedCheckedBags
//                                                                   .weight !==
//                                                                   undefined
//                                                               ) {
//                                                                 const weight =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .weight;
//                                                                 const weightUnit =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .weightUnit ||
//                                                                   'KG';
//                                                                 checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                               }
//                                                               // If quantity is specified, display as 23+23+... KG
//                                                               else if (
//                                                                 'quantity' in
//                                                                   firstSegment.includedCheckedBags &&
//                                                                 firstSegment
//                                                                   .includedCheckedBags
//                                                                   .quantity !==
//                                                                   undefined
//                                                               ) {
//                                                                 const quantity =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .quantity;
//                                                                 if (
//                                                                   quantity > 0
//                                                                 ) {
//                                                                   checkedBagsDisplay = ` + ${Array(
//                                                                     quantity
//                                                                   )
//                                                                     .fill('23')
//                                                                     .join(
//                                                                       '+'
//                                                                     )} KG`;
//                                                                 }
//                                                               }
//                                                             }

//                                                             return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                           }
//                                                         }
//                                                         return 'Outbound Baggage: N/A';
//                                                       })()}
//                                                     </span>
//                                                   </div>

//                                                   {/* Return Baggage - only show if there's a return flight */}
//                                                   {offer.itineraries.length >
//                                                     1 && (
//                                                     <div className="flex items-start w-full">
//                                                       <Image
//                                                         src="/assets/icons/baggageIcon.svg"
//                                                         width={12}
//                                                         height={12}
//                                                         alt="baggageIcon"
//                                                         className="me-1 flex-shrink-0"
//                                                       />
//                                                       <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                                         {(() => {
//                                                           // Get return baggage info if exists
//                                                           if (
//                                                             offer.travelerPricings &&
//                                                             offer
//                                                               .travelerPricings
//                                                               .length > 0 &&
//                                                             offer.itineraries
//                                                               .length > 1
//                                                           ) {
//                                                             const adultTraveler =
//                                                               offer.travelerPricings.find(
//                                                                 (tp) =>
//                                                                   tp.travelerType ===
//                                                                   'ADULT'
//                                                               );
//                                                             if (
//                                                               adultTraveler?.fareDetailsBySegment &&
//                                                               adultTraveler
//                                                                 .fareDetailsBySegment
//                                                                 .length > 1
//                                                             ) {
//                                                               // Try to find the right segment for the return flight
//                                                               let returnSegment;

//                                                               // Best approach: First check if segmentId matches number or id property
//                                                               if (
//                                                                 offer
//                                                                   .itineraries[1]
//                                                                   ?.segments[0]
//                                                                   ?.number
//                                                               ) {
//                                                                 returnSegment =
//                                                                   adultTraveler.fareDetailsBySegment.find(
//                                                                     (segment) =>
//                                                                       segment.segmentId ===
//                                                                       offer
//                                                                         .itineraries[1]
//                                                                         .segments[0]
//                                                                         .number
//                                                                   );
//                                                               }

//                                                               // If no match found, try matching by position
//                                                               if (
//                                                                 !returnSegment
//                                                               ) {
//                                                                 // Count outbound segments
//                                                                 const outboundSegmentsCount =
//                                                                   offer
//                                                                     .itineraries[0]
//                                                                     .segments
//                                                                     .length;

//                                                                 // If we have more fareDetailsBySegment than outbound segments,
//                                                                 // use the first one after the outbound segments
//                                                                 if (
//                                                                   adultTraveler
//                                                                     .fareDetailsBySegment
//                                                                     .length >
//                                                                   outboundSegmentsCount
//                                                                 ) {
//                                                                   returnSegment =
//                                                                     adultTraveler
//                                                                       .fareDetailsBySegment[
//                                                                       outboundSegmentsCount
//                                                                     ];
//                                                                 }
//                                                                 // Otherwise fall back to the default behavior (second segment)
//                                                                 else {
//                                                                   returnSegment =
//                                                                     adultTraveler
//                                                                       .fareDetailsBySegment[1];
//                                                                 }
//                                                               }

//                                                               // Handle cabin bags (hand carry)
//                                                               let cabinBagsDisplay =
//                                                                 'N/A'; // Default to N/A if no data
//                                                               if (
//                                                                 returnSegment?.includedCabinBags !==
//                                                                 undefined
//                                                               ) {
//                                                                 // Check if weight is provided directly
//                                                                 if (
//                                                                   'weight' in
//                                                                     returnSegment.includedCabinBags &&
//                                                                   returnSegment
//                                                                     .includedCabinBags
//                                                                     .weight !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const weight =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .weight;
//                                                                   const weightUnit =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .weightUnit ||
//                                                                     'KG';
//                                                                   cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                                 }
//                                                                 // Otherwise use quantity if available
//                                                                 else if (
//                                                                   'quantity' in
//                                                                     returnSegment.includedCabinBags &&
//                                                                   returnSegment
//                                                                     .includedCabinBags
//                                                                     .quantity !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const cabinQuantity =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .quantity;
//                                                                   if (
//                                                                     cabinQuantity ===
//                                                                     0
//                                                                   ) {
//                                                                     cabinBagsDisplay =
//                                                                       '0 KG';
//                                                                   } else if (
//                                                                     cabinQuantity >
//                                                                     0
//                                                                   ) {
//                                                                     // Display as "7+7+..." for hand carry
//                                                                     cabinBagsDisplay = `${Array(
//                                                                       cabinQuantity
//                                                                     )
//                                                                       .fill('7')
//                                                                       .join(
//                                                                         '+'
//                                                                       )} KG`;
//                                                                   }
//                                                                 }
//                                                               }

//                                                               // Handle checked bags
//                                                               let checkedBagsDisplay =
//                                                                 '';
//                                                               if (
//                                                                 returnSegment?.includedCheckedBags
//                                                               ) {
//                                                                 // If weight is specified directly
//                                                                 if (
//                                                                   'weight' in
//                                                                     returnSegment.includedCheckedBags &&
//                                                                   returnSegment
//                                                                     .includedCheckedBags
//                                                                     .weight !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const weight =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .weight;
//                                                                   const weightUnit =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .weightUnit ||
//                                                                     'KG';
//                                                                   checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                                 }
//                                                                 // If quantity is specified, display as 23+23+... KG
//                                                                 else if (
//                                                                   'quantity' in
//                                                                     returnSegment.includedCheckedBags &&
//                                                                   returnSegment
//                                                                     .includedCheckedBags
//                                                                     .quantity !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const quantity =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .quantity;
//                                                                   if (
//                                                                     quantity > 0
//                                                                   ) {
//                                                                     checkedBagsDisplay = ` + ${Array(
//                                                                       quantity
//                                                                     )
//                                                                       .fill(
//                                                                         '23'
//                                                                       )
//                                                                       .join(
//                                                                         '+'
//                                                                       )} KG`;
//                                                                   }
//                                                                 }
//                                                               }

//                                                               return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                             }
//                                                           }
//                                                           return 'Return Baggage: N/A';
//                                                         })()}
//                                                       </span>
//                                                     </div>
//                                                   )}
//                                                 </div>

//                                                 <Button
//                                                   className="w-full hover:bg-[#5143d9] title-t4 text-primary-on bg-primary"
//                                                   onClick={() =>
//                                                     handleFlightBooking(offer)
//                                                   }
//                                                 >
//                                                   Book Now
//                                                 </Button>
//                                               </div>

//                                               {/* Mobile view (hidden on desktop) */}
//                                               <div className="flex flex-col w-full md:hidden">
//                                                 <div className="flex justify-between items-center mb-3">
//                                                   <div
//                                                     className="bg-[#FFF7ED] text-secondary-dark-variant label-l2 text-right mb-2 px-3 py-0 rounded-xl flex items-center justify-end"
//                                                     style={{
//                                                       boxShadow:
//                                                         '0 6px 12px -2px rgba(0, 0, 0, 0.2)',
//                                                     }}
//                                                   >
//                                                     <Image
//                                                       src="/assets/icons/seatIcon.svg"
//                                                       width={12}
//                                                       height={12}
//                                                       alt="seatIcon"
//                                                       className="me-1 flex-shrink-0 my-auto"
//                                                     />
//                                                     {offer.numberOfBookableSeats
//                                                       ? `${offer.numberOfBookableSeats} seats left`
//                                                       : 'Limited seats available'}
//                                                   </div>

//                                                   <div className="flex flex-col items-end">
//                                                     {getAdultPrice(offer) && (
//                                                       <div className=" title-t3 text-primary  mt-1 text-right">
//                                                         {formatDisplayPrice(
//                                                           getAdultPrice(offer)!
//                                                         )}
//                                                         {'/'}
//                                                         <span className="label-l3 text-primary">
//                                                           per adult
//                                                         </span>
//                                                       </div>
//                                                     )}
//                                                     <span className="label-l3 text-neutral-dark font-medium">
//                                                       Total: AUD{' '}
//                                                       {Math.floor(
//                                                         parseFloat(
//                                                           offer.price.grandTotal
//                                                         )
//                                                       )}
//                                                     </span>
//                                                   </div>
//                                                 </div>
//                                                 <div></div>
//                                                 <div className="flex flex-col items-start text-left space-y-1 mb-3">
//                                                   {/* Outbound Baggage */}
//                                                   <div className="flex items-start w-full">
//                                                     <Image
//                                                       src="/assets/icons/baggageIcon.svg"
//                                                       width={12}
//                                                       height={12}
//                                                       alt="baggageIcon"
//                                                       className="me-1 flex-shrink-0"
//                                                     />
//                                                     <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                                       {(() => {
//                                                         // Get outbound baggage info
//                                                         if (
//                                                           offer.travelerPricings &&
//                                                           offer.travelerPricings
//                                                             .length > 0 &&
//                                                           offer.itineraries
//                                                             .length > 0
//                                                         ) {
//                                                           const adultTraveler =
//                                                             offer.travelerPricings.find(
//                                                               (tp) =>
//                                                                 tp.travelerType ===
//                                                                 'ADULT'
//                                                             );
//                                                           if (
//                                                             adultTraveler?.fareDetailsBySegment &&
//                                                             adultTraveler
//                                                               .fareDetailsBySegment
//                                                               .length > 0
//                                                           ) {
//                                                             const firstSegment =
//                                                               adultTraveler
//                                                                 .fareDetailsBySegment[0];

//                                                             // Handle cabin bags (hand carry)
//                                                             let cabinBagsDisplay =
//                                                               'N/A'; // Default to N/A if no data
//                                                             if (
//                                                               firstSegment?.includedCabinBags !==
//                                                               undefined
//                                                             ) {
//                                                               // Check if weight is provided directly
//                                                               if (
//                                                                 'weight' in
//                                                                   firstSegment.includedCabinBags &&
//                                                                 firstSegment
//                                                                   .includedCabinBags
//                                                                   .weight !==
//                                                                   undefined
//                                                               ) {
//                                                                 const weight =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .weight;
//                                                                 const weightUnit =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .weightUnit ||
//                                                                   'KG';
//                                                                 cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                               }
//                                                               // Otherwise use quantity if available
//                                                               else if (
//                                                                 'quantity' in
//                                                                   firstSegment.includedCabinBags &&
//                                                                 firstSegment
//                                                                   .includedCabinBags
//                                                                   .quantity !==
//                                                                   undefined
//                                                               ) {
//                                                                 const cabinQuantity =
//                                                                   firstSegment
//                                                                     .includedCabinBags
//                                                                     .quantity;
//                                                                 if (
//                                                                   cabinQuantity ===
//                                                                   0
//                                                                 ) {
//                                                                   cabinBagsDisplay =
//                                                                     '0 KG';
//                                                                 } else if (
//                                                                   cabinQuantity >
//                                                                   0
//                                                                 ) {
//                                                                   // Display as "7+7+..." for hand carry when quantity > 0
//                                                                   cabinBagsDisplay = `${Array(
//                                                                     cabinQuantity
//                                                                   )
//                                                                     .fill('7')
//                                                                     .join(
//                                                                       '+'
//                                                                     )} KG`;
//                                                                 }
//                                                               }
//                                                             }

//                                                             // Handle checked bags
//                                                             let checkedBagsDisplay =
//                                                               '';
//                                                             if (
//                                                               firstSegment?.includedCheckedBags
//                                                             ) {
//                                                               // If weight is specified directly
//                                                               if (
//                                                                 'weight' in
//                                                                   firstSegment.includedCheckedBags &&
//                                                                 firstSegment
//                                                                   .includedCheckedBags
//                                                                   .weight !==
//                                                                   undefined
//                                                               ) {
//                                                                 const weight =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .weight;
//                                                                 const weightUnit =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .weightUnit ||
//                                                                   'KG';
//                                                                 checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                               }
//                                                               // If quantity is specified, display as 23+23+... KG
//                                                               else if (
//                                                                 'quantity' in
//                                                                   firstSegment.includedCheckedBags &&
//                                                                 firstSegment
//                                                                   .includedCheckedBags
//                                                                   .quantity !==
//                                                                   undefined
//                                                               ) {
//                                                                 const quantity =
//                                                                   firstSegment
//                                                                     .includedCheckedBags
//                                                                     .quantity;
//                                                                 if (
//                                                                   quantity > 0
//                                                                 ) {
//                                                                   checkedBagsDisplay = ` + ${Array(
//                                                                     quantity
//                                                                   )
//                                                                     .fill('23')
//                                                                     .join(
//                                                                       '+'
//                                                                     )} KG`;
//                                                                 }
//                                                               }
//                                                             }

//                                                             return `Outbound Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                           }
//                                                         }
//                                                         return 'Outbound Baggage: N/A';
//                                                       })()}
//                                                     </span>
//                                                   </div>

//                                                   {/* Return Baggage - only show if there's a return flight */}
//                                                   {offer.itineraries.length >
//                                                     1 && (
//                                                     <div className="flex items-start w-full">
//                                                       <Image
//                                                         src="/assets/icons/baggageIcon.svg"
//                                                         width={12}
//                                                         height={12}
//                                                         alt="baggageIcon"
//                                                         className="me-1 flex-shrink-0"
//                                                       />
//                                                       <span className="label-l3 text-neutral-dark inline-flex items-start">
//                                                         {(() => {
//                                                           // Get return baggage info if exists
//                                                           if (
//                                                             offer.travelerPricings &&
//                                                             offer
//                                                               .travelerPricings
//                                                               .length > 0 &&
//                                                             offer.itineraries
//                                                               .length > 1
//                                                           ) {
//                                                             const adultTraveler =
//                                                               offer.travelerPricings.find(
//                                                                 (tp) =>
//                                                                   tp.travelerType ===
//                                                                   'ADULT'
//                                                               );
//                                                             if (
//                                                               adultTraveler?.fareDetailsBySegment &&
//                                                               adultTraveler
//                                                                 .fareDetailsBySegment
//                                                                 .length > 1
//                                                             ) {
//                                                               // Try to find the right segment for the return flight
//                                                               let returnSegment;

//                                                               // Best approach: First check if segmentId matches number or id property
//                                                               if (
//                                                                 offer
//                                                                   .itineraries[1]
//                                                                   ?.segments[0]
//                                                                   ?.number
//                                                               ) {
//                                                                 returnSegment =
//                                                                   adultTraveler.fareDetailsBySegment.find(
//                                                                     (segment) =>
//                                                                       segment.segmentId ===
//                                                                       offer
//                                                                         .itineraries[1]
//                                                                         .segments[0]
//                                                                         .number
//                                                                   );
//                                                               }

//                                                               // If no match found, try matching by position
//                                                               if (
//                                                                 !returnSegment
//                                                               ) {
//                                                                 // Count outbound segments
//                                                                 const outboundSegmentsCount =
//                                                                   offer
//                                                                     .itineraries[0]
//                                                                     .segments
//                                                                     .length;

//                                                                 // If we have more fareDetailsBySegment than outbound segments,
//                                                                 // use the first one after the outbound segments
//                                                                 if (
//                                                                   adultTraveler
//                                                                     .fareDetailsBySegment
//                                                                     .length >
//                                                                   outboundSegmentsCount
//                                                                 ) {
//                                                                   returnSegment =
//                                                                     adultTraveler
//                                                                       .fareDetailsBySegment[
//                                                                       outboundSegmentsCount
//                                                                     ];
//                                                                 }
//                                                                 // Otherwise fall back to the default behavior (second segment)
//                                                                 else {
//                                                                   returnSegment =
//                                                                     adultTraveler
//                                                                       .fareDetailsBySegment[1];
//                                                                 }
//                                                               }

//                                                               // Handle cabin bags (hand carry)
//                                                               let cabinBagsDisplay =
//                                                                 'N/A'; // Default to N/A if no data
//                                                               if (
//                                                                 returnSegment?.includedCabinBags !==
//                                                                 undefined
//                                                               ) {
//                                                                 // Check if weight is provided directly
//                                                                 if (
//                                                                   'weight' in
//                                                                     returnSegment.includedCabinBags &&
//                                                                   returnSegment
//                                                                     .includedCabinBags
//                                                                     .weight !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const weight =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .weight;
//                                                                   const weightUnit =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .weightUnit ||
//                                                                     'KG';
//                                                                   cabinBagsDisplay = `${weight} ${weightUnit}`;
//                                                                 }
//                                                                 // Otherwise use quantity if available
//                                                                 else if (
//                                                                   'quantity' in
//                                                                     returnSegment.includedCabinBags &&
//                                                                   returnSegment
//                                                                     .includedCabinBags
//                                                                     .quantity !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const cabinQuantity =
//                                                                     returnSegment
//                                                                       .includedCabinBags
//                                                                       .quantity;
//                                                                   if (
//                                                                     cabinQuantity ===
//                                                                     0
//                                                                   ) {
//                                                                     cabinBagsDisplay =
//                                                                       '0 KG';
//                                                                   } else if (
//                                                                     cabinQuantity >
//                                                                     0
//                                                                   ) {
//                                                                     // Display as "7+7+..." for hand carry
//                                                                     cabinBagsDisplay = `${Array(
//                                                                       cabinQuantity
//                                                                     )
//                                                                       .fill('7')
//                                                                       .join(
//                                                                         '+'
//                                                                       )} KG`;
//                                                                   }
//                                                                 }
//                                                               }

//                                                               // Handle checked bags
//                                                               let checkedBagsDisplay =
//                                                                 '';
//                                                               if (
//                                                                 returnSegment?.includedCheckedBags
//                                                               ) {
//                                                                 // If weight is specified directly
//                                                                 if (
//                                                                   'weight' in
//                                                                     returnSegment.includedCheckedBags &&
//                                                                   returnSegment
//                                                                     .includedCheckedBags
//                                                                     .weight !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const weight =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .weight;
//                                                                   const weightUnit =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .weightUnit ||
//                                                                     'KG';
//                                                                   checkedBagsDisplay = ` + ${weight} ${weightUnit}`;
//                                                                 }
//                                                                 // If quantity is specified, display as 23+23+... KG
//                                                                 else if (
//                                                                   'quantity' in
//                                                                     returnSegment.includedCheckedBags &&
//                                                                   returnSegment
//                                                                     .includedCheckedBags
//                                                                     .quantity !==
//                                                                     undefined
//                                                                 ) {
//                                                                   const quantity =
//                                                                     returnSegment
//                                                                       .includedCheckedBags
//                                                                       .quantity;
//                                                                   if (
//                                                                     quantity > 0
//                                                                   ) {
//                                                                     checkedBagsDisplay = ` + ${Array(
//                                                                       quantity
//                                                                     )
//                                                                       .fill(
//                                                                         '23'
//                                                                       )
//                                                                       .join(
//                                                                         '+'
//                                                                       )} KG`;
//                                                                   }
//                                                                 }
//                                                               }

//                                                               return `Return Baggage: ${cabinBagsDisplay}${checkedBagsDisplay}`;
//                                                             }
//                                                           }
//                                                           return 'Return Baggage: N/A';
//                                                         })()}
//                                                       </span>
//                                                     </div>
//                                                   )}
//                                                 </div>

//                                                 <Button
//                                                   className="w-full hover:bg-[#5143d9] title-t4 text-primary-on bg-primary"
//                                                   onClick={() =>
//                                                     handleFlightBooking(offer)
//                                                   }
//                                                 >
//                                                   Book Now
//                                                 </Button>
//                                               </div>
//                                             </div>
//                                           </div>

//                                           {/* Flight Details Button Bar */}
//                                           <div className="px-0 md:px-6 py-1 md:py-0 bg-container border-t">
//                                             <div className="flex justify-end items-center">
//                                               <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="text-gray-500 hover:text-blue-950 flex justify-between items-center"
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   toggleOfferFlightDetails(
//                                                     `offer-${flight.id}-${index}-${offerIdx}`,
//                                                     offer
//                                                   );
//                                                 }}
//                                               >
//                                                 <span className="label-l3 text-primary">
//                                                   Flight Details
//                                                 </span>
//                                                 <ChevronRight className="h-4 w-4 ml-1" />
//                                               </Button>
//                                             </div>
//                                           </div>

//                                           {/* Offer Flight Details Section */}
//                                           {selectedFlightForDrawer?.id ===
//                                             `offer-${flight.id}-${index}-${offerIdx}` && (
//                                             <FlightDetailsDrawer
//                                               flight={offer}
//                                               flightId={`offer-${flight.id}-${index}-${offerIdx}`}
//                                               searchParams={searchParams}
//                                               onClose={closeFlightDetails}
//                                               formatDuration={formatDuration}
//                                               apiData={apiData}
//                                               onBookNow={handleFlightBooking}
//                                             />
//                                           )}
//                                         </div>
//                                       )
//                                     )}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//       <Footer />
//       {isClient && currentPage < totalPages && (
//         <div className="flex justify-center mt-6 mb-8">
//           <Button
//             onClick={loadMore}
//             variant="outline"
//             className="border-blue-950 text-blue-950"
//             disabled={isMoreLoading}
//           >
//             {isMoreLoading ? (
//               <>
//                 <RefreshCw className="animate-spin mr-2 h-4 w-4" />
//                 Loading more flights...
//               </>
//             ) : (
//               'Load more flights'
//             )}
//           </Button>
//         </div>
//       )}
//       {isClient && progress > 0 && !loading && (
//         <div className="fixed top-0 left-0 right-0 z-50">
//           <div
//             className="h-1 bg-blue-600 transition-all duration-300 ease-in-out"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       )}
//       {selectedFlightForDrawer && (
//         <FlightDetailsDrawer
//           flight={selectedFlightForDrawer.flight}
//           flightId={selectedFlightForDrawer.id}
//           searchParams={searchParams}
//           onClose={closeFlightDetails}
//           formatDuration={formatDuration}
//           apiData={apiData}
//           onBookNow={handleFlightBooking}
//         />
//       )}

//       {/* Mobile Filter Button */}
//       {/* <MobileFilterButton onClick={() => setIsMobileFilterOpen(true)} /> */}

//       {/* Mobile Filter Modal */}
//       <MobileFilterModal
//         isOpen={isMobileFilterOpen}
//         onClose={() => setIsMobileFilterOpen(false)}
//         apiData={apiData}
//         filters={filters}
//         showAllAirlines={showAllAirlines}
//         setShowAllAirlines={setShowAllAirlines}
//         handleTransitChange={handleTransitChange}
//         handlePriceRangeChange={handlePriceRangeChange}
//         handlePriceRangeChangeComplete={handlePriceRangeChangeComplete}
//         handlePriceRangeChangeStart={handlePriceRangeChangeStart}
//         handleDepartureTimeChange={handleDepartureTimeChange}
//         handleDepartureTimeChangeComplete={handleDepartureTimeChangeComplete}
//         handleDepartureTimeChangeStart={handleDepartureTimeChangeStart}
//         handleArrivalTimeChange={handleArrivalTimeChange}
//         handleArrivalTimeChangeComplete={handleArrivalTimeChangeComplete}
//         handleArrivalTimeChangeStart={handleArrivalTimeChangeStart}
//         handleAirlineChange={handleAirlineChange}
//         clearAllFilters={clearAllFilters}
//         timeStringToHour={timeStringToHour}
//         formatTime={formatTime}
//         applyFilters={handleApplyFilters}
//       />
//     </>
//   );
// }
