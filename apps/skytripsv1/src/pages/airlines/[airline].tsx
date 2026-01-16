import React, { useRef, useEffect, useState } from 'react';
import { SearchWidget } from '../../components/SearchWidget';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { NextSeo } from 'next-seo';
import PagesSpecialFare from '../../components/PagesSpecialFare';
import Footer from '../../components/Footer';
import { SearchParams } from '../../../types';
import FAQ from '../../components/FAQ';
import Breadcrumb from '../../components/Breadcrumb';
import PopularAirlines from '../../components/PopularAirlines';
import AirlineInfo from '../../components/AirlineInfo';

interface FaqItem {
  question: string;
  answer: string;
}

// Route page data interface
interface RoutePageData {
  id: string;
  title: string;
  description: string;
  additionalDescription?: string;
  key: string;
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
  metaTitle?: string;
  metaDescription?: string;
  dealCategories?: any[];
  originAirport?: any;
  destinationAirport?: any;
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
}

// Rest of the file content remains the same, just update the component imports to use ../../ instead of ../
// The content below is exactly the same as before, just with updated import paths

// Define airline-specific content type
interface AirlineContent {
  code: string;
  name: string;
  logo: string;
  seoTitle: string;
  seoDescription: string;
  bannerText: string;
  nepaliTitle: string;
  englishTitle: string;
  description: string;
  features: string[];
  festivalBenefits: string[];
  images: {
    primary: {
      src: string;
      alt: string;
      caption: string;
      subCaption: string;
    };
    secondary: {
      src: string;
      alt: string;
      caption: string;
      subCaption: string;
    };
  };
  stats: {
    title: string;
    description: string;
  }[];
}

// Airline content mapping
const airlineContents: { [key: string]: AirlineContent } = {
  'malaysia-airlines': {
    code: 'MH',
    name: 'Malaysia Airlines',
    logo: '/assets/images/airlines/MH.webp',
    seoTitle: 'Malaysia Airlines Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book Malaysia Airlines flights from Australia to Kathmandu and save up to AUD 100. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText:
      'Malaysia Airlines – Save up to AUD 100 on your journey home to Nepal!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save up to AUD 100 on flights from Australia to Kathmandu with Malaysia Airlines.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Malaysian Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Save up to AUD 100 on return flights',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Traditional Nepali momos served on Malaysia Airlines flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on Malaysia Airlines',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Malaysia Airlines crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's Malaysian hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'Malaysia Airlines',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
  'singapore-airlines': {
    code: 'SQ',
    name: 'Singapore Airlines',
    logo: '/assets/images/airlines/Singapore-Airlines.png',
    seoTitle:
      'Singapore Airlines Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book Singapore Airlines flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText:
      'Singapore Airlines – Fly Home to Nepal with Exclusive Savings!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Singapore Airlines.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Singapore Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Fly Home to Nepal with Exclusive Savings!',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Singapore Airlines flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on Singapore Airlines',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Singapore Airlines crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's Singapore hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'Singapore Airlines',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
  'cathay-pacific': {
    code: 'CX',
    name: 'Cathay Pacific Airways',
    logo: '/assets/images/airlines/Cathay-Pacific.png',
    seoTitle:
      'Cathay Pacific Airways Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book Cathay Pacific Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText:
      'Cathay Pacific Airways – Fly Home to Nepal with Exclusive Savings!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Cathay Pacific Airways.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Cathay Pacific Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Fly Home to Nepal with Exclusive Savings!',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Cathay Pacific Airways flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on Cathay Pacific Airways',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Cathay Pacific Airways crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's Cathay Pacific Airways hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'Cathay Pacific Airways',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
  emirates: {
    code: 'EK',
    name: 'Emirates',
    logo: '/assets/images/airlines/emirates-airlines.png',
    seoTitle: 'Emirates Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book Emirates flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText: 'Emirates – Fly Home to Nepal with Exclusive Savings!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save  on flights from Australia to Kathmandu with Emirates.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Emirates Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Fly Home to Nepal with Exclusive Savings!',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: ' Emirates flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on Emirates',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Emirates crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's Emirates hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'Emirates',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
  'qatar-airways': {
    code: 'QR',
    name: 'Qatar Airways',
    logo: '/assets/images/airlines/quatar.jpg',
    seoTitle: 'Qatar Airways Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book Qatar Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText: 'Qatar Airways – Fly Home to Nepal with Exclusive Savings!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Qatar Airways.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Qatar Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Fly Home to Nepal with Exclusive Savings!',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Traditional Nepali momos served on Qatar Airways flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on Qatar Airways',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Qatar Airways crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's Qatar Airways hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'Qatar Airways',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
  'all-nippon-airways': {
    code: 'NH',
    name: 'ANA All Nippon Airways',
    logo: '/assets/images/airlines/NH.webp',
    seoTitle:
      'ANA All Nippon Airways Flights Australia → Kathmandu | Dashain Deals',
    seoDescription:
      'Book ANA All Nippon Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
    bannerText:
      'ANA All Nippon Airways – Fly Home to Nepal with Exclusive Savings!',
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with ANA All Nippon Airways.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning ANA All Nippon Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: [
      'Fly Home to Nepal with Exclusive Savings!',
      'Priority boarding for families with elderly',
    ],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Traditional Nepali momos served on ANA All Nippon Airways flight',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption:
          'This Dashain & Tihar, travel with comfort and care on ANA All Nippon Airways',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'ANA All Nippon Airways crew in traditional batik uniforms',
        caption: "We're Here to Take Care of You",
        subCaption:
          "Warm smiles and caring service — that's ANA All Nippon Airways hospitality.",
      },
    },
    stats: [
      {
        title: 'Oneworld Alliance',
        description: "Member of the world's premier airline alliance",
      },
      {
        title: 'Safety Certified',
        description: 'IOSA certified with highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous 30kg baggage allowance included',
      },
      {
        title: 'ANA All Nippon Airways',
        description: '5-star airline with 75+ years of excellence',
      },
    ],
  },
};

// Get static paths for all airlines
export async function getStaticPaths() {
  const paths = Object.keys(airlineContents).map((airline) => ({
    params: { airline },
  }));

  return {
    paths,
    fallback: 'blocking', // Generate pages on-demand for airlines not in the static list
  };
}

// Get static props for specific airline
export async function getStaticProps({
  params,
}: {
  params: { airline: string };
}) {
  const airlineContent = airlineContents[params.airline];

  // Try to fetch route data from API
  let routeData = null;
  try {
    const fullKey = `airlines/${params.airline}`;
    const encodedKey = encodeURIComponent(fullKey);
    const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API || 'https://api.skytrips.com.au';
    const apiUrl = `${apiBaseUrl}/route/page/key/${encodedKey}`;

    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.airline) {
        routeData = data.data;
      } else if (data && data.key) {
        // Fallback: accept data with matching key even without airline object
        const dataKeyAfterSlash = data.key.split('/').pop();
        const fullKeyAfterSlash = fullKey.split('/').pop();

        if (dataKeyAfterSlash === fullKeyAfterSlash) {
          routeData = data;
        }
      }
    } else {
      // Log as warning instead of full error log to avoid build noise for 404s
      if (response.status !== 404) {
        console.warn(`API response not OK for ${fullKey}:`, response.status);
      }
    }
  } catch (error) {
    console.warn(`Error fetching route data for ${params.airline}:`, error);
  }

  // Only return 404 if we have neither static content NOR valid API data with airline info
  // This allows backend-created pages to work without needing to be in airlineContents
  if (!airlineContent && !routeData) {
    console.log('❌ No static content and no API data - returning 404');
    return {
      notFound: true,
    };
  }

  console.log('✅ Building page with:', {
    hasStaticContent: !!airlineContent,
    hasAPIData: !!routeData,
    airlineName: routeData?.airline?.airlineName || 'N/A',
  });

  // Format airline name from slug
  const formattedAirlineName = params.airline
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Use a default content structure if no static content exists
  const defaultContent = airlineContent || {
    code: routeData?.airline?.airlineCode || '',
    name: routeData?.airline?.airlineName || formattedAirlineName,
    logo: routeData?.airline?.logoUrl || '/assets/images/airlines/default.png',
    seoTitle:
      routeData?.metaTitle ||
      `${formattedAirlineName} Flights - Book with SkyTrips`,
    seoDescription:
      routeData?.metaDescription ||
      `Book ${formattedAirlineName} flights with SkyTrips. Find the best deals and enjoy excellent service.`,
    bannerText: `Fly with ${
      routeData?.airline?.airlineName || formattedAirlineName
    }`,
    nepaliTitle: 'घर फर्कने बेला आयो',
    englishTitle: 'Time to Go Home',
    description:
      routeData?.description ||
      'Book your flights today with excellent service and competitive prices.',
    features: [
      '1. World-Class Safety & Operational Excellence',
      '2. Award‑Winning Hospitality',
      '3. Seamless Connectivity & Global Reach',
      '4. Comfort & Convenience Onboard',
    ],
    festivalBenefits: ['Special fares available', 'Flexible booking options'],
    images: {
      primary: {
        src: '/assets/images/airlines/motherDaughter.webp',
        alt: 'Flight experience',
        caption: 'Fly Home to Be with Your Loved Ones',
        subCaption: 'Travel with comfort and care',
      },
      secondary: {
        src: '/assets/images/airlines/crew.jpg',
        alt: 'Airline crew',
        caption: "We're Here to Take Care of You",
        subCaption: 'Warm smiles and caring service',
      },
    },
    stats: [
      {
        title: 'Global Network',
        description: 'Connecting you worldwide',
      },
      {
        title: 'Safety Certified',
        description: 'Highest safety standards',
      },
      {
        title: 'Free Baggage',
        description: 'Generous baggage allowance',
      },
      {
        title: 'Premium Service',
        description: 'Excellence in aviation',
      },
    ],
  };

  console.log('=== End getStaticProps Debug ===');

  return {
    props: {
      content: defaultContent,
      initialRouteData: routeData,
      // Pass origin and destination airport data from API if available
      fromAirport: routeData?.originAirport || null,
      toAirport: routeData?.destinationAirport || null,
    },
    revalidate: 60, // Revalidate every minute for faster updates
  };
}

const AirlinePage = ({
  content,
  initialRouteData,
  fromAirport,
  toAirport,
}: {
  content: AirlineContent;
  initialRouteData?: RoutePageData | null;
  fromAirport?: any;
  toAirport?: any;
}) => {
  const router = useRouter();
  const searchWidgetRef = useRef<HTMLDivElement>(null);
  const specialFareRef = useRef<HTMLDivElement>(null);
  const [routeData, setRouteData] = useState<RoutePageData | null>(
    initialRouteData || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDev =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://dev.skytrips.com.au';
  const isUat =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://uat.skytrips.com.au';

  // Log the initial data for debugging

  const scrollToSearch = () => {
    searchWidgetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDeals = () => {
    if (router.query.airline === 'malaysia-airlines') {
      specialFareRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not Malaysia Airlines, scroll to search instead
      scrollToSearch();
    }
  };

  const handleSearchSubmit = (searchParams: SearchParams) => {
    // Add airline-specific params
    const params = {
      ...searchParams,
      airlines: [content.code],
    };

    // Save airport selections to localStorage if they exist
    if (params.originLocationCode && params.destinationLocationCode) {
      try {
        const searchWidgetData = document.querySelector(
          'form[data-airport-data]'
        );
        if (searchWidgetData) {
          const airportData = JSON.parse(
            searchWidgetData.getAttribute('data-airport-data') || '{}'
          );
          if (airportData.fromAirport && airportData.toAirport) {
            params.fromAirport = airportData.fromAirport;
            params.toAirport = airportData.toAirport;

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

    // Compress the search parameters to pass via URL
    const encodedParams = btoa(JSON.stringify(params));
    router.push(`/flights-results?q=${encodedParams}`);
  };

  // When NOT homepage, prioritize API data over static content
  // A page is considered a homepage ONLY if we're on the root path ("/") AND it's set as homepage
  // If we're on the direct route (e.g., "/airlines/some-airline"), it should behave as a regular page
  const hasStaticContent = !!airlineContents[router.query.airline as string];
  const isActuallyHomepage = router.asPath === '/';
  const isHomePage =
    isActuallyHomepage &&
    (routeData?.isHomePage || (!hasStaticContent && routeData));

  const displayTitle =
    !isHomePage && routeData?.metaTitle
      ? routeData.metaTitle
      : content.seoTitle;
  const displayDescription =
    !isHomePage && routeData?.metaDescription
      ? routeData.metaDescription
      : content.seoDescription;

  // console.log('routeData', routeData);

  return (
    <>
      <NextSeo
        title={displayTitle}
        description={displayDescription}
        canonical={
          routeData?.canonicalUrl ||
          `https://skytrips.com.au/${router.query.airline}`
        }
        nofollow={isDev || isUat ? true : !(routeData?.isFollow ?? false)}
        noindex={isDev || isUat ? true : !(routeData?.isIndex ?? false)}
        openGraph={{
          url: `https://skytrips.com.au/${router.query.airline}`,
          title: displayTitle,
          description: displayDescription,
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
                  url: `https://skytrips.com.au/airlines/${router.query.airline}`,
                  mainEntity: {
                    '@type': 'Airline',
                    name: content.name,
                    iataCode: content.code,
                    logo: content.logo,
                  },
                  provider: {
                    '@type': 'Organization',
                    name: 'SkyTrips',
                    url: 'https://skytrips.com.au',
                  },
                });

                return defaultSchema;
              } catch (error) {
                // Return a minimal valid schema as fallback
                return JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebPage',
                  name: displayTitle || 'SkyTrips Airline Page',
                  description: displayDescription || 'Airline booking page',
                });
              }
            })(),
          }}
        />
      </Head>

      <div className="flex flex-col">
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
                  {routeData?.title || content.englishTitle}
                </h1>
                <div
                  className="label-l1 text-secondary-on"
                  dangerouslySetInnerHTML={{
                    __html: routeData?.description || content.description,
                  }}
                  style={{
                    display: 'inline-block',
                  }}
                />
              </div>

              <SearchWidget
                onSubmit={handleSearchSubmit}
                initialValues={{
                  fromAirport: fromAirport
                    ? {
                        code: fromAirport.iataCode,
                        name: fromAirport.name,
                        city: fromAirport.municipality,
                        country: fromAirport.isoCountry,
                      }
                    : undefined,
                  toAirport: toAirport
                    ? {
                        code: toAirport.iataCode,
                        name: toAirport.name,
                        city: toAirport.municipality,
                        country: toAirport.isoCountry,
                      }
                    : {
                        code: 'KTM',
                        name: 'Tribhuvan International Airport',
                        city: 'Kathmandu',
                        country: 'Nepal',
                      },
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
                }}
              />
            </div>
          </section>
        </main>
        <div className="">
          {!isHomePage && (
            <div className="container pb-3">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'airlines', href: '/airlines' },
                  { label: router.query.airline as string },
                ]}
              />
            </div>
          )}

          {routeData?.additionalDescription && (
            <div className=" container  mt-6 ">
              <div className="bg-container rounded-lg shadow-sm mb-4 p-4 to-white mx-auto ">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: routeData.additionalDescription,
                  }}
                />
              </div>
            </div>
          )}

          {/* Airline Details Section - From API */}
          {loading && (
            <div className="container py-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading airline details...</p>
              </div>
            </div>
          )}

          {/* Deals Section - From API */}
          {!loading &&
            routeData?.dealCategories &&
            routeData.dealCategories.length > 0 && (
              <div className="container pb-3">
                <div ref={specialFareRef}>
                  <PagesSpecialFare routeData={routeData} />
                </div>
              </div>
            )}
          {!isHomePage && (
            <div className="container mb-6">
              <AirlineInfo
                airlines={routeData?.airline ? [routeData.airline] : []}
                loading={loading}
              />
            </div>
          )}

          {!isHomePage && (
            <div className="container mb-6">
              <PopularAirlines />
            </div>
          )}
          {routeData?.faqs && routeData.faqs.length > 0 && (
            <div className="container mb-6">
              <FAQ faqData={routeData?.faqs} />
            </div>
          )}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default AirlinePage;
