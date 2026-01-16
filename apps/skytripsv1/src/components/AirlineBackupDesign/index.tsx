// import React, { useRef, useEffect, useState } from 'react';
// import { SearchWidget } from '../../components/SearchWidget';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
// import Navbar from '../../components/Navbar';
// import { NextSeo } from 'next-seo';
// import MalaysiaSpecialFare from '../../components/MalaysiaSpecialFare';
// import PagesSpecialFare from '../../components/PagesSpecialFare';
// // import AirlineDetails from '../../components/AirlineDetails';
// import { ImSpoonKnife } from 'react-icons/im';
// import { FaRegHeart } from 'react-icons/fa';
// import { MdOutlineGroup } from 'react-icons/md';
// import { BsGift } from 'react-icons/bs';
// import { MdDone } from 'react-icons/md';
// import { AiOutlineSafety } from 'react-icons/ai';
// import { FaRegClock } from 'react-icons/fa';
// import Footer from '../../components/Footer';
// import { SearchParams } from '../../../types';
// import FAQ from '../../components/FAQ';
// import Breadcrumb from '../../components/Breadcrumb';

// // Route page data interface
// interface RoutePageData {
//   id: string;
//   title: string;
//   description: string;
//   key: string;
//   airline?: {
//     id: string;
//     airlineName: string;
//     airlineCode: string;
//     country?: string;
//     alliance?: string;
//     airlineType?: string;
//     yearOfEstablishment?: string;
//     totalDestination?: string;
//     totalFleet?: string;
//     logoUrl?: string;
//     description?: string;
//   };
//   metaTitle?: string;
//   metaDescription?: string;
//   dealCategories?: any[];
//   originAirport?: any;
//   destinationAirport?: any;
//   pageTemplate?: string;
// }

// // Rest of the file content remains the same, just update the component imports to use ../../ instead of ../
// // The content below is exactly the same as before, just with updated import paths

// // Define airline-specific content type
// interface AirlineContent {
//   code: string;
//   name: string;
//   logo: string;
//   seoTitle: string;
//   seoDescription: string;
//   bannerText: string;
//   nepaliTitle: string;
//   englishTitle: string;
//   description: string;
//   features: string[];
//   festivalBenefits: string[];
//   images: {
//     primary: {
//       src: string;
//       alt: string;
//       caption: string;
//       subCaption: string;
//     };
//     secondary: {
//       src: string;
//       alt: string;
//       caption: string;
//       subCaption: string;
//     };
//   };
//   stats: {
//     title: string;
//     description: string;
//   }[];
// }

// // Airline content mapping
// const airlineContents: { [key: string]: AirlineContent } = {
//   'malaysia-airlines': {
//     code: 'MH',
//     name: 'Malaysia Airlines',
//     logo: '/assets/images/airlines/MH.webp',
//     seoTitle: 'Malaysia Airlines Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book Malaysia Airlines flights from Australia to Kathmandu and save up to AUD 100. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText:
//       'Malaysia Airlines – Save up to AUD 100 on your journey home to Nepal!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save up to AUD 100 on flights from Australia to Kathmandu with Malaysia Airlines.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Malaysian Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Save up to AUD 100 on return flights',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Traditional Nepali momos served on Malaysia Airlines flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on Malaysia Airlines',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Malaysia Airlines crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's Malaysian hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'Malaysia Airlines',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
//   'singapore-airlines': {
//     code: 'SQ',
//     name: 'Singapore Airlines',
//     logo: '/assets/images/airlines/Singapore-Airlines.png',
//     seoTitle:
//       'Singapore Airlines Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book Singapore Airlines flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText:
//       'Singapore Airlines – Fly Home to Nepal with Exclusive Savings!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Singapore Airlines.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Singapore Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Fly Home to Nepal with Exclusive Savings!',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Singapore Airlines flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on Singapore Airlines',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Singapore Airlines crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's Singapore hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'Singapore Airlines',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
//   'cathay-pacific': {
//     code: 'CX',
//     name: 'Cathay Pacific Airways',
//     logo: '/assets/images/airlines/Cathay-Pacific.png',
//     seoTitle:
//       'Cathay Pacific Airways Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book Cathay Pacific Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText:
//       'Cathay Pacific Airways – Fly Home to Nepal with Exclusive Savings!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Cathay Pacific Airways.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Cathay Pacific Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Fly Home to Nepal with Exclusive Savings!',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Cathay Pacific Airways flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on Cathay Pacific Airways',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Cathay Pacific Airways crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's Cathay Pacific Airways hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'Cathay Pacific Airways',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
//   emirates: {
//     code: 'EK',
//     name: 'Emirates',
//     logo: '/assets/images/airlines/emirates-airlines.png',
//     seoTitle: 'Emirates Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book Emirates flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText: 'Emirates – Fly Home to Nepal with Exclusive Savings!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save  on flights from Australia to Kathmandu with Emirates.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Emirates Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Fly Home to Nepal with Exclusive Savings!',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: ' Emirates flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on Emirates',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Emirates crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's Emirates hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'Emirates',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
//   'qatar-airways': {
//     code: 'QR',
//     name: 'Qatar Airways',
//     logo: '/assets/images/airlines/quatar.jpg',
//     seoTitle: 'Qatar Airways Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book Qatar Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText: 'Qatar Airways – Fly Home to Nepal with Exclusive Savings!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with Qatar Airways.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Qatar Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Fly Home to Nepal with Exclusive Savings!',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Traditional Nepali momos served on Qatar Airways flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on Qatar Airways',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Qatar Airways crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's Qatar Airways hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'Qatar Airways',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
//   'all-nippon-airways': {
//     code: 'NH',
//     name: 'ANA All Nippon Airways',
//     logo: '/assets/images/airlines/NH.webp',
//     seoTitle:
//       'ANA All Nippon Airways Flights Australia → Kathmandu | Dashain Deals',
//     seoDescription:
//       'Book ANA All Nippon Airways flights from Australia to Kathmandu. Discover exclusive Dashain & Tihar fares for the Nepalese community in Sydney and Melbourne. Fly home with comfort and trusted service.',
//     bannerText:
//       'ANA All Nippon Airways – Fly Home to Nepal with Exclusive Savings!',
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       'Celebrate Dashain & Tihar with your loved ones. Save on flights from Australia to Kathmandu with ANA All Nippon Airways.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning ANA All Nippon Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: [
//       'Fly Home to Nepal with Exclusive Savings!',
//       'Priority boarding for families with elderly',
//     ],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Traditional Nepali momos served on ANA All Nippon Airways flight',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption:
//           'This Dashain & Tihar, travel with comfort and care on ANA All Nippon Airways',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'ANA All Nippon Airways crew in traditional batik uniforms',
//         caption: "We're Here to Take Care of You",
//         subCaption:
//           "Warm smiles and caring service — that's ANA All Nippon Airways hospitality.",
//       },
//     },
//     stats: [
//       {
//         title: 'Oneworld Alliance',
//         description: "Member of the world's premier airline alliance",
//       },
//       {
//         title: 'Safety Certified',
//         description: 'IOSA certified with highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous 30kg baggage allowance included',
//       },
//       {
//         title: 'ANA All Nippon Airways',
//         description: '5-star airline with 75+ years of excellence',
//       },
//     ],
//   },
// };

// // Get static paths for all airlines
// export async function getStaticPaths() {
//   const paths = Object.keys(airlineContents).map((airline) => ({
//     params: { airline },
//   }));

//   return {
//     paths,
//     fallback: 'blocking', // Generate pages on-demand for airlines not in the static list
//   };
// }

// // Get static props for specific airline
// export async function getStaticProps({
//   params,
// }: {
//   params: { airline: string };
// }) {
//   const airlineContent = airlineContents[params.airline];

//   // Try to fetch route data from API
//   let routeData = null;
//   try {
//     const fullKey = `airlines/${params.airline}`;
//     // URL encode the key to handle forward slashes
//     const encodedKey = encodeURIComponent(fullKey);
//     const apiUrl = `${process.env.NEXT_PUBLIC_REST_API}/route/page/key/${encodedKey}`;

//     const response = await fetch(apiUrl);

//     if (response.ok) {
//       const result = await response.json();
//       console.log('API response data:', JSON.stringify(result, null, 2));
//       const data = result.data || result;

//       // Validate that the key matches and airline data exists
//       if (data.key === fullKey && data.airline) {
//         routeData = data;
//         console.log('✅ Valid route data found');
//       } else {
//       }
//     } else {
//       console.log('API response not OK:', response.status);
//       const errorText = await response.text();
//       console.log('Error response:', errorText);
//     }
//   } catch (error) {
//     console.error('Error fetching route data in getStaticProps:', error);
//   }

//   // If no static content and no API data, return 404
//   if (!airlineContent && !routeData) {
//     console.log('❌ No static content and no API data - returning 404');
//     return {
//       notFound: true,
//     };
//   }

//   console.log('✅ Building page (with or without API data)');

//   // Format airline name from slug
//   const formattedAirlineName = params.airline
//     .split('-')
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');

//   // Use a default content structure if no static content exists
//   const defaultContent = airlineContent || {
//     code: routeData?.airline?.airlineCode || '',
//     name: routeData?.airline?.airlineName || formattedAirlineName,
//     logo: routeData?.airline?.logoUrl || '/assets/images/airlines/default.png',
//     seoTitle:
//       routeData?.metaTitle ||
//       `${formattedAirlineName} Flights - Book with SkyTrips`,
//     seoDescription:
//       routeData?.metaDescription ||
//       `Book ${formattedAirlineName} flights with SkyTrips. Find the best deals and enjoy excellent service.`,
//     bannerText: `Fly with ${
//       routeData?.airline?.airlineName || formattedAirlineName
//     }`,
//     nepaliTitle: 'घर फर्कने बेला आयो',
//     englishTitle: 'Time to Go Home',
//     description:
//       routeData?.description ||
//       'Book your flights today with excellent service and competitive prices.',
//     features: [
//       '1. World-Class Safety & Operational Excellence',
//       '2. Award‑Winning Hospitality',
//       '3. Seamless Connectivity & Global Reach',
//       '4. Comfort & Convenience Onboard',
//     ],
//     festivalBenefits: ['Special fares available', 'Flexible booking options'],
//     images: {
//       primary: {
//         src: '/assets/images/airlines/motherDaughter.webp',
//         alt: 'Flight experience',
//         caption: 'Fly Home to Be with Your Loved Ones',
//         subCaption: 'Travel with comfort and care',
//       },
//       secondary: {
//         src: '/assets/images/airlines/crew.jpg',
//         alt: 'Airline crew',
//         caption: "We're Here to Take Care of You",
//         subCaption: 'Warm smiles and caring service',
//       },
//     },
//     stats: [
//       {
//         title: 'Global Network',
//         description: 'Connecting you worldwide',
//       },
//       {
//         title: 'Safety Certified',
//         description: 'Highest safety standards',
//       },
//       {
//         title: 'Free Baggage',
//         description: 'Generous baggage allowance',
//       },
//       {
//         title: 'Premium Service',
//         description: 'Excellence in aviation',
//       },
//     ],
//   };

//   console.log('=== End getStaticProps Debug ===');

//   return {
//     props: {
//       content: defaultContent,
//       initialRouteData: routeData,
//       // Pass origin and destination airport data from API if available
//       fromAirport: routeData?.originAirport || null,
//       toAirport: routeData?.destinationAirport || null,
//     },
//     revalidate: 60, // Revalidate every minute for faster updates
//   };
// }

// const AirlinePage = ({
//   content,
//   initialRouteData,
//   fromAirport,
//   toAirport,
// }: {
//   content: AirlineContent;
//   initialRouteData?: RoutePageData | null;
//   fromAirport?: any;
//   toAirport?: any;
// }) => {
//   const router = useRouter();
//   const searchWidgetRef = useRef<HTMLDivElement>(null);
//   const specialFareRef = useRef<HTMLDivElement>(null);
//   const [routeData, setRouteData] = useState<RoutePageData | null>(
//     initialRouteData || null
//   );
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const isDev =
//     process.env.NEXT_PUBLIC_BASE_URL === 'https://dev.skytrips.com.au';
//   const isUat =
//     process.env.NEXT_PUBLIC_BASE_URL === 'https://uat.skytrips.com.au';

//   // Log the initial data for debugging
//   useEffect(() => {
//     console.log('=== Airline Page Debug ===');
//     console.log('Router query:', router.query);
//     console.log('Airline param:', router.query.airline);
//     console.log('Initial route data:', initialRouteData);
//     console.log('Current route data:', routeData);
//     console.log('=== End Debug ===');
//   }, [router.query.airline]);

//   const scrollToSearch = () => {
//     searchWidgetRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const scrollToDeals = () => {
//     if (router.query.airline === 'malaysia-airlines') {
//       specialFareRef.current?.scrollIntoView({ behavior: 'smooth' });
//     } else {
//       // If not Malaysia Airlines, scroll to search instead
//       scrollToSearch();
//     }
//   };

//   const handleSearchSubmit = (searchParams: SearchParams) => {
//     // Add airline-specific params
//     const params = {
//       ...searchParams,
//       airlines: [content.code],
//     };

//     // Save airport selections to localStorage if they exist
//     if (params.originLocationCode && params.destinationLocationCode) {
//       try {
//         const searchWidgetData = document.querySelector(
//           'form[data-airport-data]'
//         );
//         if (searchWidgetData) {
//           const airportData = JSON.parse(
//             searchWidgetData.getAttribute('data-airport-data') || '{}'
//           );
//           if (airportData.fromAirport && airportData.toAirport) {
//             params.fromAirport = airportData.fromAirport;
//             params.toAirport = airportData.toAirport;

//             localStorage.setItem(
//               'skytrips_airports',
//               JSON.stringify({
//                 fromAirport: airportData.fromAirport,
//                 toAirport: airportData.toAirport,
//               })
//             );
//           }
//         }
//       } catch (error) {
//         console.error('Error saving airport data:', error);
//       }
//     }

//     // Compress the search parameters to pass via URL
//     const encodedParams = btoa(JSON.stringify(params));
//     router.push(`/flights-results?q=${encodedParams}`);
//   };

//   return (
//     <>
//       <NextSeo
//         title={routeData?.metaTitle || content.seoTitle}
//         description={routeData?.metaDescription || content.seoDescription}
//         noindex={isDev || isUat}
//         nofollow={isDev || isUat}
//         canonical={`https://skytrips.com.au/airlines/${router.query.airline}`}
//         openGraph={{
//           url: `https://skytrips.com.au/airlines/${router.query.airline}`,
//           title: routeData?.metaTitle || content.seoTitle,
//           description: routeData?.metaDescription || content.seoDescription,
//           images: [
//             {
//               url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
//               width: 1200,
//               height: 630,
//               alt: 'SkyTrips',
//             },
//           ],
//           site_name: 'SkyTrips',
//         }}
//       />
//       <div className="flex flex-col">
//         <Navbar />
//         <div className="">
//           <div className="bg-gradient-to-br from-[#0c0073] to-[#5143d9] z-10 mx-auto pb-8">
//             {/* Top Banner */}
//             <div className="bg-primary text-primary-on py-3 px-4 mb-8 flex items-center justify-center">
//               <BsGift color="yellow" />
//               <span className="title-t3 text-primary-on mx-2">
//                 {content.bannerText}
//               </span>
//               <BsGift color="yellow" />
//             </div>

//             {/* Main Content */}
//             <div
//               ref={searchWidgetRef}
//               className="text-center mx-auto text-primary-on mb-3"
//             >
//               {/* Logo */}
//               <div className="flex items-center justify-center p-4 mb-6 gap-2">
//                 <div className="bg-container px-1 py-1 rounded-sm">
//                   <Image
//                     src={content.logo}
//                     alt={content.name}
//                     width={100}
//                     height={30}
//                     className=""
//                   />
//                 </div>
//               </div>

//               {/* Nepali Text */}
//               <h1 className="h2 leading-[0.6]">{content.nepaliTitle}</h1>

//               {/* English Text */}
//               <h2 className="h2 text-[#f9b55d]">
//                 {routeData?.title || content.englishTitle}
//               </h2>

//               {/* Description */}
//               <p className="title-t3 mb-5 px-0 md:px-[25rem] lg:px-[30rem]">
//                 {routeData?.description || content.description}
//               </p>

//               {/* Search Widget */}
//               <div className="mt-8 text-left">
//                 <SearchWidget
//                   onSubmit={handleSearchSubmit}
//                   initialValues={{
//                     fromAirport: fromAirport
//                       ? {
//                           code: fromAirport.iataCode,
//                           name: fromAirport.name,
//                           city: fromAirport.municipality,
//                           country: fromAirport.isoCountry,
//                         }
//                       : undefined,
//                     toAirport: toAirport
//                       ? {
//                           code: toAirport.iataCode,
//                           name: toAirport.name,
//                           city: toAirport.municipality,
//                           country: toAirport.isoCountry,
//                         }
//                       : {
//                           code: 'KTM',
//                           name: 'Tribhuvan International Airport',
//                           city: 'Kathmandu',
//                           country: 'Nepal',
//                         },
//                     dateRange: {
//                       from: null,
//                       to: null,
//                     },
//                     passengerCount: {
//                       adults: 1,
//                       children: 0,
//                       infants: 0,
//                     },
//                     cabinClass: 'ECONOMY',
//                     hasNepaleseCitizenship: false,
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="container py-3">
//             <Breadcrumb
//               items={[
//                 { label: 'Home', href: '/' },
//                 { label: 'airlines', href: '/airlines' },
//                 { label: router.query.airline as string },
//               ]}
//             />
//           </div>

//           {/* Airline Details Section - From API */}
//           {loading && (
//             <div className="container py-10">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading airline details...</p>
//               </div>
//             </div>
//           )}

//           {/* {!loading && routeData?.airline && (
//             <div className="container py-10">
//               <AirlineDetails airline={routeData.airline} />
//             </div>
//           )} */}

//           {/* Deals Section - From API */}
//           {!loading &&
//             routeData?.dealCategories &&
//             routeData.dealCategories.length > 0 && (
//               <div className="container pb-3">
//                 <div ref={specialFareRef}>
//                   <PagesSpecialFare routeData={routeData} />
//                 </div>
//               </div>
//             )}

//           {/* Special Fare Section - Only for Malaysia Airlines (Legacy) */}
//           {router.query.airline === 'malaysia-airlines' && !routeData && (
//             <div className="container pb-3">
//               <div ref={specialFareRef}>
//                 <MalaysiaSpecialFare />
//               </div>
//             </div>
//           )}

//           {/* Features Section */}
//           <div className="bg-gradient-to-br from-[#0c0073] to-[#5143d9] text-white py-10">
//             <div className="container mx-auto px-4">
//               {/* Header */}
//               <div className="text-center mb-12">
//                 <h2 className="h3 mb-4">
//                   Fly Home This Dashain & Tihar with {content.name}
//                 </h2>
//                 <p className="title-t4 mb-2">
//                   दशैं र तिहारको रमाइलो घरमै मनाऔं — Travel with warmth, safety,
//                   and trusted service.
//                 </p>
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//                 {/* Left Column - Features and Benefits */}
//                 <div className="space-y-8">
//                   {/* Features List */}
//                   <div className="space-y-6">
//                     {content.features.map((feature, index) => (
//                       <div key={index} className="flex items-center gap-4">
//                         <div>
//                           <h3 className="title-t2 mb-1">{feature}</h3>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Festival Benefits Section */}
//                   <div className="bg-primary-bright-variant rounded-xl p-6 shadow-2xl backdrop-blur-sm">
//                     <div className="flex items-center title-t2 mb-2">
//                       <BsGift color="yellow" />
//                       <span className="ml-4">Festival Season Benefits</span>
//                     </div>
//                     <div className="space-y-3 text-primary-on">
//                       {content.festivalBenefits.map((benefit, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <MdDone color="#12e848" size="23" />
//                           <span className="label-l2">{benefit}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Images */}
//                 <div className="flex flex-col items-end space-y-6">
//                   {/* Primary Image */}
//                   <div className="relative aspect-[16/9] max-h-[240px] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden w-full lg:w-10/12">
//                     <Image
//                       src={content.images.primary.src}
//                       alt={content.images.primary.alt}
//                       layout="fill"
//                       objectFit="cover"
//                       className="rounded-xl"
//                     />
//                     <div className="absolute bottom-4 left-4 bg-blue-900/80 rounded-lg px-4 py-2">
//                       <span className="label-l2">
//                         {content.images.primary.caption}
//                       </span>
//                       <p className="label-l3 text-white/80">
//                         {content.images.primary.subCaption}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Secondary Image */}
//                   <div className="relative aspect-[16/9] max-h-[240px] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden w-full lg:w-10/12">
//                     <Image
//                       src={content.images.secondary.src}
//                       alt={content.images.secondary.alt}
//                       layout="fill"
//                       objectFit="cover"
//                       className="rounded-xl"
//                     />
//                     <div className="absolute bottom-4 left-4 bg-blue-900/80 rounded-lg px-4 py-2">
//                       <span className="label-l2">
//                         {content.images.secondary.caption}
//                       </span>
//                       <p className="label-l3 text-white/80">
//                         {content.images.secondary.subCaption}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Stats Section */}
//           <div className="py-10 bg-gray-50">
//             <div className="container mx-auto px-4">
//               <div className="max-w-3xl mx-auto text-center mb-12">
//                 <h2 className="h3 text-background-on mb-4">
//                   Trusted by Nepali Families Across Australia
//                 </h2>
//                 <p className="title-t3 text-neutral-dark">
//                   Your safety, comfort, and savings are our priority
//                 </p>
//               </div>

//               <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//                 {content.stats.map((stat, index) => (
//                   <div
//                     key={index}
//                     className="bg-white p-6 rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] transition-shadow duration-300 flex flex-col items-center text-center"
//                   >
//                     <div className="bg-blue-100 p-4 rounded-full mb-6">
//                       <div className="w-8 h-8 text-blue-600">
//                         <svg viewBox="0 0 24 24" fill="currentColor">
//                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
//                         </svg>
//                       </div>
//                     </div>
//                     <h3 className="title-t2 text-background-on mb-2">
//                       {stat.title}
//                     </h3>
//                     <p className="label-l2 text-neutral-dark">
//                       {stat.description}
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               {/* Trust Message */}
//               <div className="mt-16 flex justify-center">
//                 <div className="inline-block bg-white px-8 py-4 rounded-xl shadow-lg hover:shadow-[0_20px_50px_rgba(0,_0,_0,_0.25)] transition-shadow duration-300">
//                   <div className="flex items-center justify-center gap-2">
//                     <FaRegHeart size={28} color="red" />
//                     <span className="title-t3 text-background-on">
//                       Over 50,000 Nepali families choose us annually
//                     </span>
//                     <FaRegHeart size={28} color="red" />
//                   </div>
//                   <p className="mt-2 label-l1 text-neutral-dark text-center">
//                     हाम्रो सेवामा भरोसा गर्नुहोस् - Trust our service and save
//                     on your journey home
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* FAQ Section */}
//           {router.query.airline === 'malaysia-airlines' && <FAQ />}

//           {/* Limited Time Offer Section */}
//           <div className="bg-gradient-to-br from-[#0c0073] to-[#5143d9] py-10">
//             <div className="container mx-auto px-4 text-center">
//               {/* Gift Icon Title */}
//               {router.query.airline === 'malaysia-airlines' && (
//                 <>
//                   <div className="flex items-center justify-center gap-2 mb-6">
//                     <BsGift color="yellow" size="24" />
//                     <h3 className="text-yellow-300 title-t2">
//                       Limited Time Offer
//                     </h3>
//                     <BsGift color="yellow" size="24" />
//                   </div>

//                   {/* Main Title */}
//                   <h2 className="h3 text-primary-on mb-6">
//                     Save up to AUD 100 on Your Journey Home
//                   </h2>
//                 </>
//               )}

//               {/* Description */}
//               {router.query.airline === 'malaysia-airlines' ? (
//                 <p className="body-b1 text-white/90 max-w-3xl mx-auto mb-8">
//                   Don't miss this special discount for Dashain & Tihar travel.
//                   Book now and celebrate the festivals with your loved ones in
//                   Nepal while saving money.
//                 </p>
//               ) : (
//                 <p className="h5 text-white/90 max-w-3xl mx-auto mb-8">
//                   Book now and celebrate the festivals with your loved ones in
//                   Nepal while saving money.
//                 </p>
//               )}

//               {/* CTA Buttons */}
//               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
//                 <button
//                   onClick={scrollToSearch}
//                   className="bg-primary text-primary-on hover:bg-[#5143d9] px-8 py-3 rounded-full label-l1 text-primary-on flex items-center gap-2 transition-colors duration-200"
//                 >
//                   {router.query.airline === 'malaysia-airlines'
//                     ? 'Book Now & Save AUD 100'
//                     : `Book Now with ${content.name}`}
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
//                 {router.query.airline === 'malaysia-airlines' && (
//                   <button
//                     onClick={scrollToDeals}
//                     className="border-2 border-white text-primary-on label-l1 text-primary-on hover:bg-white/10 px-8 py-2 rounded-full title-t3 transition-colors duration-200"
//                   >
//                     View All Deals
//                   </button>
//                 )}
//               </div>

//               {/* Features */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-primary-on">
//                 <div className="flex items-center justify-center gap-3">
//                   <AiOutlineSafety size="16" />
//                   <span className="text-primary-on label-l1">
//                     Safe & Secure Booking
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-center gap-3">
//                   <FaRegClock size="16" />
//                   <span className="text-white label-l1">
//                     24/7 Nepali Support
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-center gap-3">
//                   <BsGift size="16" />
//                   <span className="text-white label-l1">
//                     Best Price Guarantee
//                   </span>
//                 </div>
//               </div>

//               {/* Terms */}
//               {router.query.airline === 'malaysia-airlines' && (
//                 <p className="text-primary-on mt-12 label-l3">
//                   *Offer valid for bookings made before August 27, 2025. Terms
//                   and conditions apply.
//                 </p>
//               )}
//             </div>
//           </div>

//           <Footer />
//         </div>
//       </div>
//     </>
//   );
// };

// export default AirlinePage;
