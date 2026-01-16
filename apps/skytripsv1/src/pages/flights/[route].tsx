import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SearchWidget } from '../../components/SearchWidget';
import { SearchParams, Airport } from '../../../types';
import axiosInstance from '../../../lib/axiosConfig';
import PopularAirlines from '../../components/PopularAirlines';
import Breadcrumb from '../../components/Breadcrumb';
import { encodeData } from '../../utils/urlEncoding';
import PagesSpecialFare from '../../components/PagesSpecialFare';
import FAQ from '../../components/FAQ';

interface AirportData {
  id: string;
  name: string;
  iataCode: string;
  municipality: string;
  isoCountry: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface RoutePageData {
  id: string;
  key: string;
  title: string;
  description: string;
  additionalDescription?: string;
  metaTitle: string;
  metaDescription: string;
  originAirport?: AirportData;
  destinationAirport?: AirportData;
  createdAt?: string;
  updatedAt?: string;
  dealCategoryIds?: string[];
  pageTemplate?: string;
  isHomePage?: boolean;
  faqs?: FaqItem[];
  // SEO fields
  isIndex?: boolean;
  isFollow?: boolean;
  isArchived?: boolean;
  isImageIndexed?: boolean;
  isSnippetEnabled?: boolean;
  canonicalUrl?: string;
  schema?: string;
  dealCategories?: Array<{
    id: string;
    title: string;
    description: string;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
    deals?: any[];
    subCategories?: Array<{
      id: string;
      title: string;
      description: string;
      deals?: any[];
    }>;
  }>;
}

interface RoutePageProps {
  route: string;
  pageTitle: string;
  metaDescription: string;
  headline: string;
  shortDescription: string;
  airportCodes: string;
  fromCity: string;
  toCity: string;
  fromCityFormatted: string;
  toCityFormatted: string;
  routeData: RoutePageData | null;
}

// SEO data for each route
const ROUTE_SEO_DATA = {
  // 'flights/sydney-to-kathmandu': {
  //   airportCodes: 'SYD - KTM',
  //   headline: 'Sydney to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Cheap Sydney to Kathmandu Flights - SkyTrips',
  //   metaDescription:
  //     'Find the best Sydney to Kathmandu flights with SkyTrips. Book flight to Kathmandu today and save big on affordable fares with fast, secure booking!',
  // },
  // 'flights/melbourne-to-kathmandu': {
  //   airportCodes: 'MEL - KTM',
  //   headline: 'Melbourne to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Melbourne to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Melbourne to Kathmandu flights with SkyTrips. Find cheap flights from Melbourne to Nepal and secure your Melbourne to Kathmandu cheap flight today!',
  // },
  // 'flights/brisbane-to-kathmandu': {
  //   airportCodes: 'BNE - KTM',
  //   headline: 'Brisbane to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Fly Brisbane to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Brisbane to Kathmandu with SkyTrips. Book cheap flights from Brisbane to Kathmandu and enjoy fast, secure booking for your next trip to Nepal!',
  // },
  // 'flights/perth-to-kathmandu': {
  //   airportCodes: 'PER - KTM',
  //   headline: 'Perth to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Perth to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Perth to Kathmandu flights with SkyTrips. Find cheap flights from Perth to Kathmandu, compare prices, and enjoy fast, secure booking today!',
  // },
  // 'flights/adelaide-to-kathmandu': {
  //   airportCodes: 'ADL - KTM',
  //   headline: 'Adelaide to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Adelaide to Kathmandu Flights - Cheap Deals | SkyTrips',
  //   metaDescription:
  //     'Book Adelaide to Kathmandu flights with SkyTrips. Find cheap fares and explore the best deals for Adelaide Kathmandu. Secure your booking now!',
  // },
  // 'flights/canberra-to-kathmandu': {
  //   airportCodes: 'CBR - KTM',
  //   headline: 'Canberra to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Canberra to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Canberra to Kathmandu flights with SkyTrips. Find cheap Canberra Kathmandu fares and enjoy secure, fast booking for your next trip to Nepal!',
  // },
  // 'flights/hobart-to-kathmandu': {
  //   airportCodes: 'HBA - KTM',
  //   headline: 'Hobart to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Hobart to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Hobart to Kathmandu flights with SkyTrips. Find cheap Hobart Kathmandu fares, compare prices, and secure your booking today!',
  // },
  // 'flights/gold-coast-to-kathmandu': {
  //   airportCodes: 'OOL - KTM',
  //   headline: 'Gold Coast to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Gold Coast to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Gold Coast to Kathmandu flights with SkyTrips. Find cheap Gold Coast Kathmandu fares and enjoy secure, fast booking for your next trip!',
  // },
  // 'flights/darwin-to-kathmandu': {
  //   airportCodes: 'DRW - KTM',
  //   headline: 'Darwin to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Darwin to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Darwin to Kathmandu with SkyTrips. Discover cheap Darwin Kathmandu fares and book your secure, affordable flight today!',
  // },
  // 'flights/cairns-to-kathmandu': {
  //   airportCodes: 'CNS - KTM',
  //   headline: 'Cairns to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Cairns to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Cairns to Kathmandu flights with SkyTrips. Find affordable Cairns Kathmandu fares and secure your next adventure today!',
  // },
  // 'flights/newcastle-to-kathmandu': {
  //   airportCodes: 'NTL - KTM',
  //   headline: 'Newcastle to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Newcastle to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Newcastle to Kathmandu at unbeatable prices with SkyTrips. Compare Newcastle Kathmandu fares and enjoy secure booking today!',
  // },
  // 'flights/townsville-to-kathmandu': {
  //   airportCodes: 'TSV - KTM',
  //   headline: 'Townsville to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Townsville to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Townsville to Kathmandu flights with SkyTrips. Explore cheap Townsville Kathmandu fares and enjoy fast booking options today!',
  // },
  // 'flights/sunshine-coast-to-kathmandu': {
  //   airportCodes: 'MCY - KTM',
  //   headline: 'Sunshine Coast to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Sunshine Coast to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Discover Sunshine Coast to Kathmandu flights with SkyTrips. Book your Sunshine Coast Kathmandu trip at affordable prices today!',
  // },
  // 'flights/alice-springs-to-kathmandu': {
  //   airportCodes: 'ASP - KTM',
  //   headline: 'Alice Springs to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Alice Springs to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Alice Springs to Kathmandu with SkyTrips. Book Alice Springs Kathmandu flights with secure and affordable booking options today!',
  // },
  // 'flights/launceston-to-kathmandu': {
  //   airportCodes: 'LST - KTM',
  //   headline: 'Launceston to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Launceston to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Launceston to Kathmandu flights with SkyTrips. Discover Launceston Kathmandu fares and secure your affordable flight today!',
  // },
  // 'flights/mackay-to-kathmandu': {
  //   airportCodes: 'MKY - KTM',
  //   headline: 'Mackay to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Mackay to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Mackay to Kathmandu with SkyTrips. Find Mackay Kathmandu fares and secure your next adventure today with fast booking!',
  // },
  // 'flights/rockhampton-to-kathmandu': {
  //   airportCodes: 'ROK - KTM',
  //   headline: 'Rockhampton to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Rockhampton to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Rockhampton to Kathmandu flights with SkyTrips. Find Rockhampton Kathmandu deals and secure your journey today!',
  // },
  // 'flights/geelong-to-kathmandu': {
  //   airportCodes: 'GEX - KTM',
  //   headline: 'Geelong to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Geelong to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Fly Geelong to Kathmandu with SkyTrips. Discover cheap Geelong Kathmandu fares and enjoy secure booking today!',
  // },
  // 'flights/ballina-to-kathmandu': {
  //   airportCodes: 'BNK - KTM',
  //   headline: 'Ballina to Kathmandu: Fly Back Home Today!',
  //   shortDescription: 'Book your tickets in 6 minutes or less.',
  //   pageTitle: 'Ballina to Kathmandu - Cheap Flights | SkyTrips',
  //   metaDescription:
  //     'Book Ballina to Kathmandu flights with SkyTrips. Discover Ballina Kathmandu fares and secure affordable options today!',
  // },
  'flights/albury-to-kathmandu': {
    airportCodes: 'ABX - KTM',
    headline: 'Albury to Kathmandu: Fly Back Home Today!',
    shortDescription: 'Book your tickets in 6 minutes or less.',
    pageTitle: 'Albury to Kathmandu - Cheap Flights | SkyTrips',
    metaDescription:
      'Fly Albury to Kathmandu with SkyTrips. Find cheap Albury Kathmandu fares and enjoy secure booking for your next adventure today!',
  },
};

// Function to fetch route page data from API - PRIMARY DATA SOURCE
const fetchRoutePageData = async (
  routeKey: string
): Promise<RoutePageData | null> => {
  try {
    const response = await axiosInstance.get(`/route/page?page=1&limit=2000`, {
      params: { key: routeKey },
    });

    // API returns an array in data, find the matching route by key
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      const routes = response.data.data;

      // console.log('routes', routes);

      // Split the routeKey to get the part after the last slash
      const routeKeyParts = routeKey.split('/');
      const routeKeyAfterSlash = routeKeyParts[routeKeyParts.length - 1];
      // console.log('routeKeyAfterSlash', routeKeyAfterSlash);

      const matchedRoute = routes.find((r: RoutePageData) => {
        // Split the API key to get the part after the last slash
        const apiKeyParts = r.key.split('/');
        const apiKeyAfterSlash = apiKeyParts[apiKeyParts.length - 1];

        // console.log(
        //   'Comparing - API:',
        //   apiKeyAfterSlash,
        //   'Route:',
        //   routeKeyAfterSlash
        // );

        // Compare the parts after the slash
        return apiKeyAfterSlash === routeKeyAfterSlash;
      });

      if (matchedRoute) {
        // console.log('✅ Match found! Returning data:', matchedRoute, {
        //   key: matchedRoute.key,
        //   metaTitle: matchedRoute.metaTitle,
        //   metaDescription: matchedRoute.metaDescription,
        //   hasAllData: !!(
        //     matchedRoute.key &&
        //     matchedRoute.metaTitle &&
        //     matchedRoute.metaDescription
        //   ),
        // });
        return matchedRoute;
      } else {
        console.log('❌ No match found for routeKey:', routeKey);
      }
    }

    // No log needed - will fallback to ROUTE_SEO_DATA
    return null;
  } catch (error: any) {
    // Silent catch - will fallback to ROUTE_SEO_DATA
    return null;
  }
};

// Function to format city names for display (capitalized with spaces)
const formatCityName = (city: string): string => {
  if (!city) return '';

  return city
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Function to simplify city names for API search
const simplifyForSearch = (city: string): string => {
  if (!city) return '';

  // Remove any special characters except letters and replace spaces
  // For example: "New York" becomes "newyork"
  return city.toLowerCase().replace(/[^a-z]/g, '');
};

const RoutePage: NextPage<RoutePageProps> = ({
  route: initialRoute,
  pageTitle: initialPageTitle,
  metaDescription: initialMetaDescription,
  headline: initialHeadline,
  shortDescription: initialShortDescription,
  airportCodes: initialAirportCodes,
  fromCity: initialFromCity,
  toCity: initialToCity,
  fromCityFormatted: initialFromCityFormatted,
  toCityFormatted: initialToCityFormatted,
  routeData: initialRouteData,
}) => {
  const router = useRouter();
  const [isValidRoute, setIsValidRoute] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RoutePageData | null>(
    initialRouteData || null
  );

  const isDev =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://dev.skytrips.com.au';
  const isUat =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://uat.skytrips.com.au';

  // State for current route data
  const [route, setRoute] = useState(initialRoute);
  const [pageTitle, setPageTitle] = useState(initialPageTitle);
  const [metaDescription, setMetaDescription] = useState(
    initialMetaDescription
  );
  const [headline, setHeadline] = useState(initialHeadline);
  const [shortDescription, setShortDescription] = useState(
    initialShortDescription
  );
  const [airportCodes, setAirportCodes] = useState(initialAirportCodes);
  const [fromCity, setFromCity] = useState(initialFromCity);
  const [toCity, setToCity] = useState(initialToCity);
  const [fromCityFormatted, setFromCityFormatted] = useState(
    initialFromCityFormatted
  );
  const [toCityFormatted, setToCityFormatted] = useState(
    initialToCityFormatted
  );

  // Fetch fresh data on mount to ensure we have the latest updates from admin
  useEffect(() => {
    const fetchFreshData = async () => {
      if (!router.isReady || !router.query.route) {
        return;
      }

      const currentRoute = router.query.route as string;

      // Fetch fresh data from API
      const freshRouteData = await fetchRoutePageData(currentRoute);

      console.log('freshRouteData', freshRouteData);

      // Only update if we got fresh data
      if (freshRouteData) {
        setRouteData(freshRouteData);

        // Update displayed content with fresh API data
        const freshPageTitle = freshRouteData.metaTitle || pageTitle;
        const freshMetaDescription =
          freshRouteData.metaDescription || metaDescription;
        const freshHeadline = freshRouteData.title || headline;
        const freshShortDescription =
          freshRouteData.description || shortDescription;

        const originCode = freshRouteData.originAirport?.iataCode || '';
        const destCode = freshRouteData.destinationAirport?.iataCode || '';
        const freshAirportCodes = `${originCode} - ${destCode}`;

        setPageTitle(freshPageTitle);
        setMetaDescription(freshMetaDescription);
        setHeadline(freshHeadline);
        setShortDescription(freshShortDescription);
        setAirportCodes(freshAirportCodes);

        // Update document title
        if (typeof document !== 'undefined') {
          document.title = freshPageTitle;
        }
      }
    };

    fetchFreshData();
  }, [router.isReady]);

  // Handle route changes when navigating between different route pages
  useEffect(() => {
    const handleRouteChange = async () => {
      const newRoute = router.query.route as string;

      if (!newRoute) {
        return;
      }

      // Always update if the route in URL is different from current state
      if (newRoute === route) {
        return;
      }

      setLoading(true);
      // Parse the new route
      const routeParts = newRoute.includes('-to-')
        ? newRoute.split('-to-')
        : newRoute.split('-'); // <-- accept without 'to'

      // if (routeParts.length !== 2) {
      //   setIsValidRoute(false);
      //   setLoading(false);
      //   return;
      // }

      const newFromCity = routeParts[0];
      const newToCity = routeParts[1];
      const newFromCityFormatted = formatCityName(newFromCity);
      const newToCityFormatted = formatCityName(newToCity);

      // Try to fetch API data for the new route
      const newRouteData = await fetchRoutePageData(newRoute);

      // Get SEO data from ROUTE_SEO_DATA if available
      const seoData = ROUTE_SEO_DATA[newRoute as keyof typeof ROUTE_SEO_DATA];

      // Update all state
      setRoute(newRoute);
      setRouteData(newRouteData);
      setFromCity(newFromCity);
      setToCity(newToCity);
      setFromCityFormatted(newFromCityFormatted);
      setToCityFormatted(newToCityFormatted);

      // Update SEO data
      const newPageTitle =
        newRouteData?.metaTitle ||
        seoData?.pageTitle ||
        `${newFromCityFormatted} to ${newToCityFormatted} Flights | SkyTrips`;
      const newMetaDescription =
        newRouteData?.metaDescription ||
        seoData?.metaDescription ||
        `Find the best deals on flights from ${newFromCityFormatted} to ${newToCityFormatted}. Book your trip with SkyTrips for excellent service and competitive prices.`;
      const newHeadline =
        newRouteData?.title ||
        seoData?.headline ||
        `${newFromCityFormatted} to ${newToCityFormatted}: Fly Back Home Today!`;
      const newShortDescription =
        newRouteData?.description ||
        seoData?.shortDescription ||
        'Book your tickets in 6 minutes or less.';

      let newAirportCodes = '';
      if (newRouteData) {
        const originCode = newRouteData.originAirport?.iataCode || '';
        const destCode = newRouteData.destinationAirport?.iataCode || '';
        newAirportCodes = `${originCode} - ${destCode}`;
      } else if (seoData?.airportCodes) {
        newAirportCodes = seoData.airportCodes;
      }

      setPageTitle(newPageTitle);
      setMetaDescription(newMetaDescription);
      setHeadline(newHeadline);
      setShortDescription(newShortDescription);
      setAirportCodes(newAirportCodes);
      setIsValidRoute(true);
      setLoading(false);

      // Update document title immediately
      if (typeof document !== 'undefined') {
        document.title = newPageTitle;
      }

      // Scroll to top when route changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (router.isReady) {
      handleRouteChange();
    }
  }, [router.isReady, router.query.route, router.asPath]);

  useEffect(() => {
    if (route && routeData) {
      try {
        // Use API data from routeData (originAirport and destinationAirport)
        const fromCode = routeData.originAirport?.iataCode || '';
        const toCode = routeData.destinationAirport?.iataCode || '';
        const fromCityName =
          routeData.originAirport?.municipality || fromCityFormatted;
        const toCityName =
          routeData.destinationAirport?.municipality || toCityFormatted;
        const fromCountry = routeData.originAirport?.isoCountry || '';
        const toCountry = routeData.destinationAirport?.isoCountry || '';

        // Create complete airport objects from API data
        const fromAirportComplete: Airport = {
          code: fromCode,
          name: routeData.originAirport?.name || `${fromCityName} Airport`,
          city: fromCityName,
          country: fromCountry,
        };

        const toAirportComplete: Airport = {
          code: toCode,
          name: routeData.destinationAirport?.name || `${toCityName} Airport`,
          city: toCityName,
          country: toCountry,
        };

        // Set initial values using API data
        setInitialValues({
          fromAirport: fromAirportComplete,
          toAirport: toAirportComplete,
          dateRange: {
            from: null, // Let users select their own dates
            to: null,
          },
          passengerCount: {
            adults: 1,
            children: 0,
            infants: 0,
          },
          cabinClass: 'ECONOMY',
          hasNepaleseCitizenship: false,
        });
      } catch (error) {
        console.error('Error initializing route data from API:', error);
        setIsValidRoute(false);
      }
    } else if (route && !routeData) {
      // Fallback if API data is not available
      try {
        let fromCode = '';
        let toCode = '';

        if (airportCodes) {
          const codes = airportCodes.split(' - ');
          fromCode = codes[0] || '';
          toCode = codes[1] || '';
        }

        if (!fromCode) {
          fromCode = fromCity.substring(0, 3).toUpperCase();
        }

        if (!toCode) {
          toCode = toCity.substring(0, 3).toUpperCase();
        }

        const fromAirportComplete: Airport = {
          code: fromCode,
          name: `${fromCityFormatted} Airport`,
          city: fromCityFormatted,
          country:
            fromCity.toLowerCase() === 'kathmandu' ? 'Nepal' : 'Australia',
        };

        const toAirportComplete: Airport = {
          code: toCode,
          name: `${toCityFormatted} Airport`,
          city: toCityFormatted,
          country: toCity.toLowerCase() === 'kathmandu' ? 'Nepal' : 'Australia',
        };

        setInitialValues({
          fromAirport: fromAirportComplete,
          toAirport: toAirportComplete,
          dateRange: {
            from: null,
            to: null,
          },
          passengerCount: {
            adults: 1,
            children: 0,
            infants: 0,
          },
          cabinClass: 'ECONOMY',
          hasNepaleseCitizenship: false,
        });
      } catch (error) {
        console.error('Error initializing route data from fallback:', error);
        setIsValidRoute(false);
      }
    }
  }, [
    route,
    routeData,
    fromCityFormatted,
    toCityFormatted,
    airportCodes,
    fromCity,
    toCity,
  ]);

  // If the route is not yet ready, show a loading indicator
  if (router.isFallback) {
    return (
      <>
        <NextSeo
          title="Loading Flight Information | SkyTrips"
          description="Please wait while we prepare your flight details..."
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 relative mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-primary border-b-primary animate-spin"></div>
              </div>
              <h1 className="h4 text-background-on text-center mb-2">
                Loading Route Information
              </h1>
              <p className="text-center label-l1 text-neutral-dark">
                Please wait while we prepare your flight details...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Handle invalid routes
  if (!isValidRoute) {
    return (
      <>
        <NextSeo
          title="Invalid Route | SkyTrips"
          description="The route format is invalid."
          noindex={true}
        />
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
              <h1 className="h4 text-background-on text-red-600 mb-4">
                Invalid Route Format
              </h1>
              <p className="label-l1 text-neutral-dark mb-6">
                The route format is invalid. Please use a format like
                "sydney-to-kathmandu".
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // While loading data, show a loading indicator
  if (loading) {
    return (
      <>
        <NextSeo title={pageTitle} description={metaDescription} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 relative mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-primary border-b-primary animate-spin"></div>
              </div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                Loading Route Information
              </h2>
              <p className="text-center text-gray-600">
                Please wait while we prepare your flight details...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSearchSubmit = (searchParams: SearchParams) => {
    console.log('Search submitted from route page:', { searchParams });

    // Save airport selections to localStorage if they exist
    if (
      searchParams.originLocationCode &&
      searchParams.destinationLocationCode
    ) {
      try {
        const searchWidgetData = document.querySelector(
          'form[data-airport-data]'
        );
        if (searchWidgetData) {
          const airportData = JSON.parse(
            searchWidgetData.getAttribute('data-airport-data') || '{}'
          );
          if (airportData.fromAirport && airportData.toAirport) {
            searchParams.fromAirport = airportData.fromAirport;
            searchParams.toAirport = airportData.toAirport;

            localStorage.setItem(
              'skytrips_airports',
              JSON.stringify({
                fromAirport: airportData.fromAirport,
                toAirport: airportData.toAirport,
              })
            );
          }
        }
      } catch (error) {
        console.error('Error saving airport data:', error);
      }
    }

    // Use encodeData utility instead of encodeURIComponent
    const encodedParams = encodeData(searchParams);
    console.log('Redirecting to flights-results with:', encodedParams);

    router.push(`/flights-results?q=${encodedParams}`);
  };

  // PRIORITIZE API DATA - When NOT homepage, use fresh routeData; when IS homepage, use props
  // A page is considered a homepage ONLY if we're on the root path ("/") AND it's set as homepage
  // If we're on the direct route (e.g., "/flights/sydney-to-kathmandu"), it should behave as a regular page
  const isActuallyHomepage = router.asPath === '/';
  const isHomePage = isActuallyHomepage && routeData?.isHomePage;

  const displayTitle =
    !isHomePage && routeData?.metaTitle ? routeData.metaTitle : pageTitle;
  const displayDescription =
    !isHomePage && routeData?.metaDescription
      ? routeData.metaDescription
      : metaDescription;
  const displayHeadline =
    !isHomePage && routeData?.title ? routeData.title : headline;
  const displayShortDescription =
    !isHomePage && routeData?.description
      ? routeData.description
      : shortDescription;
  const displayAirportCodes =
    !isHomePage && routeData
      ? `${routeData.originAirport?.iataCode || ''} - ${
          routeData.destinationAirport?.iataCode || ''
        }`
      : airportCodes;

  return (
    <>
      <NextSeo
        key={route}
        title={displayTitle}
        description={displayDescription}
        canonical={
          routeData?.canonicalUrl || `https://skytrips.com.au/${route}`
        }
        nofollow={isDev || isUat ? true : !(routeData?.isFollow ?? false)}
        noindex={isDev || isUat ? true : !(routeData?.isIndex ?? false)}
        openGraph={{
          url: `https://skytrips.com.au/${route}`,
          title: displayTitle,
          description: displayDescription,
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: `${fromCityFormatted} to ${toCityFormatted} flights`,
            },
          ],
          site_name: 'SkyTrips',
        }}
      />

      <Head>
        {/* Schema markup from API or default WebPage structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: (() => {
              try {
                if (routeData?.schema && routeData.schema !== '{}') {
                  let finalSchema;
                  if (typeof routeData.schema === 'object') {
                    finalSchema = JSON.stringify(routeData.schema);
                  } else if (typeof routeData.schema === 'string') {
                    // Validate if it's already valid JSON
                    try {
                      JSON.parse(routeData.schema);
                      finalSchema = routeData.schema;
                    } catch {
                      // If not valid JSON, stringify it
                      finalSchema = JSON.stringify({
                        error: 'Invalid schema format',
                      });
                    }
                  } else {
                    finalSchema = JSON.stringify({
                      error: 'Unsupported schema type',
                    });
                  }

                  return finalSchema;
                }

                const defaultSchema = JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebPage',
                  name: displayTitle,
                  description: displayDescription,
                  offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: 'AUD',
                    offerCount: '20+',
                    highPrice: '2000',
                    lowPrice: '800',
                    offers: {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Flight',
                        departureAirport: {
                          '@type': 'Airport',
                          name: `${fromCityFormatted} Airport`,
                        },
                        arrivalAirport: {
                          '@type': 'Airport',
                          name: `${toCityFormatted} Airport`,
                        },
                      },
                    },
                  },
                  provider: {
                    '@type': 'Organization',
                    name: 'SkyTrips',
                    url: 'https://skytrips.com.au',
                  },
                });

                return defaultSchema;
              } catch (error) {
                console.error(
                  '🚨 [SCHEMA ERROR] Schema generation failed:',
                  error
                );
                // Return a minimal valid schema as fallback
                return JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebPage',
                  name: displayTitle || 'SkyTrips Flight Page',
                  description: displayDescription || 'Flight booking page',
                });
              }
            })(),
          }}
        />
      </Head>

      <div key={route} className="flex flex-col">
        <Navbar />

        <main className="container flex-1">
          <section className="relative mb-3">
            <div className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <Image
                src="/assets/banner/bg-min.webp"
                alt="Kathmandu landscape"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="px-4 md:px-10 md:py-10 py-1 relative z-20 pb-10">
              <div className="mb-[2rem] sm:mb-[2rem]">
                <h1 className="h1 text-secondary-on text-left md:mb-2">
                  {displayHeadline}
                </h1>
                <div
                  className="label-l1 text-secondary-on"
                  dangerouslySetInnerHTML={{ __html: displayShortDescription }}
                  style={{
                    display: 'inline-block',
                  }}
                />
              </div>

              {initialValues && (
                <SearchWidget
                  onSubmit={handleSearchSubmit}
                  initialValues={initialValues}
                />
              )}
            </div>
          </section>

          <div className="mb-10">
            {!isHomePage && (
              <div className="pt-3 mb-6">
                <Breadcrumb
                  items={
                    isHomePage
                      ? [
                          { label: 'Home', href: '/' },
                          { label: 'Flights', href: '/flights' },
                          {
                            label: route.split('/').pop() || route,
                          },
                        ]
                      : [
                          { label: 'Home', href: '/' },
                          { label: 'Flights', href: '/flights' },
                          { label: route },
                        ]
                  }
                />
              </div>
            )}
            {routeData?.additionalDescription && (
              <div className="bg-container to-white rounded-lg shadow-sm mb-8">
                <div className="p-6 ">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: routeData.additionalDescription,
                    }}
                  />
                </div>
              </div>
            )}
            <PagesSpecialFare routeData={routeData} />
            {!isHomePage && <PopularAirlines />}
            {routeData?.faqs && routeData.faqs.length > 0 && (
              <FAQ faqData={routeData?.faqs} />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths from ROUTE_SEO_DATA
  const paths = Object.keys(ROUTE_SEO_DATA).map((route) => ({
    params: { route },
  }));

  return {
    paths,
    fallback: 'blocking', // Generate pages on-demand for routes not in ROUTE_SEO_DATA
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const route = params?.route as string;

  // Validate route format (must be in format 'fromCity-to-toCity')
  if (!route) {
    return { notFound: true };
  }

  const routeParts = route.includes('-to-')
    ? route.split('-to-')
    : route.split('-'); // <-- added to accept format without 'to'

  // Check for proper format and non-empty city names
  // if (routeParts.length !== 2 || !routeParts[0] || !routeParts[1]) {
  //   console.error(`Invalid route format: ${route}`);
  //   return { notFound: true };
  // }

  // Get from and to cities
  const fromCity = routeParts[0];
  const toCity = routeParts[1];
  const fromCityFormatted = formatCityName(fromCity);
  const toCityFormatted = formatCityName(toCity);

  // Check if route exists in ROUTE_SEO_DATA
  const seoData = ROUTE_SEO_DATA[route as keyof typeof ROUTE_SEO_DATA];

  // Try to fetch from API for additional/updated data
  let routeData: RoutePageData | null = null;
  try {
    routeData = await fetchRoutePageData(route);
  } catch (error) {
    // Silent - will use ROUTE_SEO_DATA or dynamic generation as fallback
  }

  // If we have data from either ROUTE_SEO_DATA or API, generate the page
  if (seoData || routeData) {
    // Prioritize API data, fallback to ROUTE_SEO_DATA
    const pageTitle =
      routeData?.metaTitle ||
      seoData?.pageTitle ||
      `${fromCityFormatted} to ${toCityFormatted} Flights | SkyTrips`;
    const metaDescription =
      routeData?.metaDescription ||
      seoData?.metaDescription ||
      `Find the best deals on flights from ${fromCityFormatted} to ${toCityFormatted}. Book your trip with SkyTrips for excellent service and competitive prices.`;
    const headline =
      routeData?.title ||
      seoData?.headline ||
      `${fromCityFormatted} to ${toCityFormatted}: Fly Back Home Today!`;
    const shortDescription =
      routeData?.description ||
      seoData?.shortDescription ||
      'Book your tickets in 6 minutes or less.';

    // Get airport codes from API or ROUTE_SEO_DATA
    let airportCodes = '';
    if (routeData) {
      const originCode = routeData.originAirport?.iataCode || '';
      const destCode = routeData.destinationAirport?.iataCode || '';
      airportCodes = `${originCode} - ${destCode}`;
    } else if (seoData?.airportCodes) {
      airportCodes = seoData.airportCodes;
    }

    return {
      props: {
        route: String(routeData?.key || route),
        pageTitle: String(pageTitle),
        metaDescription: String(metaDescription),
        headline: String(headline),
        shortDescription: String(shortDescription),
        airportCodes: String(airportCodes),
        fromCity: String(fromCity),
        toCity: String(toCity),
        fromCityFormatted: String(fromCityFormatted),
        toCityFormatted: String(toCityFormatted),
        routeData: routeData,
      },
      // Revalidate every 30sec to ensure admin updates are reflected quickly
      revalidate: 30,
    };
  }

  // If neither ROUTE_SEO_DATA nor API has data, return 404
  // return {
  //   notFound: true,
  // };

  return {
    props: {
      route,
      pageTitle: `Explore ${route.replace(/-/g, ' ')} | SkyTrips`,
      metaDescription: `Discover flights, deals, and travel guides for ${route.replace(
        /-/g,
        ' '
      )}.`,
      headline: route
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      shortDescription:
        'Explore great travel offers and destinations with SkyTrips.',
      airportCodes: '',
      fromCity: '',
      toCity: '',
      fromCityFormatted: '',
      toCityFormatted: '',
      routeData: '',
    },
  };
};

export default RoutePage;
