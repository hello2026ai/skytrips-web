'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SearchWidget } from '../../components/SearchWidget';
import { SearchParams } from '../../../types';
import { encodeData } from '../../utils/urlEncoding';
import axiosInstance from '../../../lib/axiosConfig';
import Breadcrumb from '../../components/Breadcrumb';
import AllAirlinesList from '../../components/AllAirlinesList';
import PopularAirlines from '../../components/PopularAirlines';
import FAQ from '../../components/FAQ';

interface FaqItem {
  question: string;
  answer: string;
}

interface PageData {
  id: string;
  title: string;
  description: string;
  additionalDescription?: string;
  key: string;
  metaTitle: string;
  metaDescription: string;
  deals?: any[];
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

interface CachedPagesData {
  flightPages: PageData[];
  timestamp: number;
}

const CACHE_KEY_FLIGHT_PAGES = 'flight_pages_list';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const Flights: React.FC = () => {
  const router = useRouter();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [flightPages, setFlightPages] = useState<PageData[]>([]);

  const isDev =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://dev.skytrips.com.au';
  const isUat =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://uat.skytrips.com.au';

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // Check if cached flight pages data exists and is still valid
        const cachedItem = localStorage.getItem(CACHE_KEY_FLIGHT_PAGES);
        let flightPagesList: PageData[] = [];

        if (cachedItem) {
          const cachedData: CachedPagesData = JSON.parse(cachedItem);
          const now = Date.now();

          // If cache is still valid (less than 1 day old)
          if (now - cachedData.timestamp < CACHE_DURATION) {
            flightPagesList = cachedData.flightPages;
            setFlightPages(flightPagesList);
          }
        }

        // Fetch fresh data if no cache or cache expired
        const response = await axiosInstance.get(
          '/route/page?limit=3000&page=1'
        );
        const dataArr = response.data?.data || [];
        const data =
          dataArr.find(
            (item: any) => item.key === 'flights/' || item.key === 'flights/#'
          ) || null;
        setPageData(data);

        // Only update flight pages if cache was not used
        if (flightPagesList.length === 0) {
          // Filter pages with pageTemplate "Flights"
          flightPagesList = dataArr.filter(
            (item: any) => item.pageTemplate === 'Flights'
          );
          setFlightPages(flightPagesList);

          // Store in cache with timestamp
          const cacheData: CachedPagesData = {
            flightPages: flightPagesList,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            CACHE_KEY_FLIGHT_PAGES,
            JSON.stringify(cacheData)
          );
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      }
    };

    fetchPageData();
  }, []);

  const handleSearchSubmit = (searchParams: SearchParams) => {
    console.log('Search submitted from flights page:', { searchParams });

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

    const encodedParams = encodeData(searchParams);
    console.log('Redirecting to flights-results with:', encodedParams);

    router.push(`/flights-results?q=${encodedParams}`);
  };

  // A page is considered a homepage ONLY if we're on the root path ("/") AND it's set as homepage
  // If we're on the direct route (e.g., "/flights"), it should behave as a regular page
  const isActuallyHomepage = router.asPath === '/';
  const isHomePage = isActuallyHomepage && pageData?.isHomePage;

  console.log('page faq', pageData);
  return (
    <>
      <NextSeo
        title={pageData?.metaTitle || 'Flights | SkyTrips'}
        description={
          pageData?.metaDescription || 'Search and book your flights with ease.'
        }
        canonical={pageData?.canonicalUrl || 'https://skytrips.com.au/flights'}
        nofollow={isDev || isUat ? true : !(pageData?.isFollow ?? false)}
        noindex={isDev || isUat ? true : !(pageData?.isIndex ?? false)}
        openGraph={{
          url: 'https://skytrips.com.au/flights',
          title: pageData?.metaTitle || 'Flights | SkyTrips',
          description:
            pageData?.metaDescription ||
            'Search and book your flights with ease.',
          images: [
            {
              url:
                pageData?.deals?.[0]?.ogImageUrl ||
                'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: pageData?.title || 'Flights',
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
                if (pageData?.schema && pageData.schema !== '{}') {
                  let finalSchema;
                  if (typeof pageData.schema === 'object') {
                    finalSchema = JSON.stringify(pageData.schema);
                  } else if (typeof pageData.schema === 'string') {
                    // Validate if it's already valid JSON
                    try {
                      JSON.parse(pageData.schema);
                      finalSchema = pageData.schema;
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
                  name: pageData?.metaTitle || 'Flights | SkyTrips',
                  description:
                    pageData?.metaDescription ||
                    'Search and book your flights with ease.',
                  url: 'https://skytrips.com.au/flights',
                  mainEntity: {
                    '@type': 'TravelAgency',
                    name: 'SkyTrips',
                    url: 'https://skytrips.com.au',
                    description:
                      'Search and book flights with competitive prices and excellent service.',
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
                  name: 'SkyTrips Flights',
                  description: 'Flight booking page',
                });
              }
            })(),
          }}
        />
      </Head>

      <div className="flex flex-col min-h-screen">
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
                  {pageData?.title || 'Flights'}
                </h1>
                <div
                  className="label-l1 text-secondary-on"
                  dangerouslySetInnerHTML={{
                    __html:
                      pageData?.description ||
                      'Search and book your flights with ease. Choose your destination, dates, and preferred airline.',
                  }}
                  style={{
                    display: 'inline-block',
                  }}
                />
              </div>

              <SearchWidget onSubmit={handleSearchSubmit} />
            </div>
          </section>
          <div className="mb-10">
            {!isHomePage && (
              <div className="pt-3 mb-6">
                <Breadcrumb
                  items={[{ label: 'Home', href: '/' }, { label: 'Flights' }]}
                />
              </div>
            )}

            {pageData?.additionalDescription && (
              <div className=" bg-container to-white mt-6 rounded-lg shadow-sm mb-4">
                <div className="mx-auto p-4">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: pageData.additionalDescription,
                    }}
                  />
                </div>
              </div>
            )}

            {!isHomePage && <AllAirlinesList />}

            {!isHomePage && (
              <div className="mt-10">
                <PopularAirlines />
              </div>
            )}

            {pageData?.faqs && pageData.faqs.length > 0 && (
              <FAQ faqData={pageData?.faqs} />
            )}
            {/* Flight Pages List */}
            {flightPages.length > 0 && (
              <div>
                <h2 className="h3 font-semibold mb-4 mt-7">
                  Popular Flight Routes
                </h2>
                <div
                  className={
                    flightPages.length < 7
                      ? 'flex flex-col gap-2'
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'
                  }
                >
                  {flightPages.slice(0, 10).map((page) => (
                    <a
                      key={page.id}
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/${page.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h3 className="text-[12px] text-background-on hover:text-[#5143d9]">
                        {page.metaTitle ? page.metaTitle : page.title}
                      </h3>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Flights;
