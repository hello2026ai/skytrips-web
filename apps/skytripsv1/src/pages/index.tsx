'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import {
  CreditCard,
  HelpCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  RefreshCw,
  Plane,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import Navbar from '../components/Navbar';
import { SearchWidget } from '../components/SearchWidget';
import { SearchParams } from '../../types';
import Footer from '../components/Footer';
import SpecialFare from '../components/SpecialFare';
import { RecentSearches } from '../components/RecentSearches';
import { useEffect, useState } from 'react';
import { encodeData } from '../utils/urlEncoding';
import TopDeals from '../components/TopDeals';
import {
  getHomePageConfig,
  GeneralSettings,
} from '../services/settingsService';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';

const FlightRoutePage = dynamic(() => import('./flights/[route]'), {
  ssr: false,
});
const AirlineRoutePage = dynamic(() => import('./airlines/[airline]'), {
  ssr: false,
});

interface HomeProps {
  initialSettings: GeneralSettings | null;
}

export default function Home({ initialSettings }: HomeProps) {
  const router = useRouter();
  const isDev =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://dev.skytrips.com.au';
  const isUat =
    process.env.NEXT_PUBLIC_BASE_URL === 'https://uat.skytrips.com.au';
  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettings | null>(initialSettings);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Update settings if they change (optional - for future client-side updates)
  useEffect(() => {
    if (initialSettings) {
      setGeneralSettings(initialSettings);
    }
  }, [initialSettings]);

  // Handle referral code in query params and localStorage
  useEffect(() => {
    if (!router.isReady) return;
    const ref = router.query.ref;
    if (typeof ref === 'string' && ref) {
      // If localStorage value is different, update it
      if (localStorage.getItem('referralCode') !== ref) {
        localStorage.setItem('referralCode', ref);
      }
    } else {
      // No ref param, clear localStorage
      localStorage.removeItem('referralCode');
    }
  }, [router.isReady, router.query.ref]);

  const handleSearchSubmit = (searchParams: SearchParams) => {
    console.log({ searchParams });

    // Save airport selections to localStorage if they exist
    if (
      searchParams.originLocationCode &&
      searchParams.destinationLocationCode
    ) {
      try {
        // Look up the active airports from the search widget to get the full airport objects
        const searchWidgetData = document.querySelector(
          'form[data-airport-data]'
        );
        if (searchWidgetData) {
          const airportData = JSON.parse(
            searchWidgetData.getAttribute('data-airport-data') || '{}'
          );
          if (airportData.fromAirport && airportData.toAirport) {
            // Set the full airport objects in the search params
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

    // Compress the search parameters to pass via URL
    // Use encodeURIComponent to safely handle all characters
    const encodedParams = encodeData(searchParams);

    // Redirect to the flights results page with the encoded parameters
    router.push(`/flights-results?q=${encodedParams}`);
  };

  // Show loading state while fetching config
  if (isLoadingConfig) {
    return (
      <>
        <NextSeo
          title="SkyTrips | Book Cheap Flights to Nepal"
          description="Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!"
          canonical="https://skytrips.com.au/"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 relative mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-primary border-b-primary animate-spin"></div>
              </div>
              <h1 className="h4 text-background-on text-center mb-2">
                Loading...
              </h1>
              <p className="text-center label-l1 text-neutral-dark">
                Please wait while we prepare your page...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If homepage config exists and is not empty/null, render the dynamic homepage
  if (
    generalSettings?.homePage &&
    generalSettings.homePage.key &&
    generalSettings.homePage.key.trim() !== ''
  ) {
    const homePageConfig = generalSettings.homePage;
    const siteTitle = generalSettings.siteTitle || '';
    const tagline = generalSettings.tagline || '';

    // Check if it's a flights route or airlines route based on the key
    const isFlightRoute = homePageConfig.key.startsWith('flights/');
    const isAirlineRoute = homePageConfig.key.startsWith('airlines/');

    if (isFlightRoute) {
      // Transform the homepage config to match the RoutePageData structure expected by FlightRoutePage
      const finalPageTitle =
        siteTitle && siteTitle.trim() !== ''
          ? siteTitle
          : homePageConfig.metaTitle || homePageConfig.title || 'SkyTrips';

      const finalMetaDescription =
        tagline && tagline.trim() !== ''
          ? tagline
          : homePageConfig.metaDescription || homePageConfig.description || '';

      const routePageProps = {
        route: homePageConfig.key,
        pageTitle: finalPageTitle,
        metaDescription: finalMetaDescription,
        headline: homePageConfig.title,
        shortDescription: homePageConfig.description,
        airportCodes:
          homePageConfig.originAirport && homePageConfig.destinationAirport
            ? `${homePageConfig.originAirport.iataCode} - ${homePageConfig.destinationAirport.iataCode}`
            : '',
        fromCity:
          homePageConfig.originAirport?.municipality
            .toLowerCase()
            .replace(/\s+/g, '-') || '',
        toCity:
          homePageConfig.destinationAirport?.municipality
            .toLowerCase()
            .replace(/\s+/g, '-') || '',
        fromCityFormatted: homePageConfig.originAirport?.municipality || '',
        toCityFormatted: homePageConfig.destinationAirport?.municipality || '',
        routeData: {
          id: homePageConfig.id,
          key: homePageConfig.key,
          title: homePageConfig.title,
          description: homePageConfig.description,
          metaTitle: finalPageTitle,
          metaDescription: finalMetaDescription,
          isHomePage: true,
          originAirport: homePageConfig.originAirport
            ? {
                id: homePageConfig.originAirport.id,
                name: homePageConfig.originAirport.name,
                iataCode: homePageConfig.originAirport.iataCode,
                municipality: homePageConfig.originAirport.municipality,
                isoCountry: homePageConfig.originAirport.isoCountry,
              }
            : undefined,
          destinationAirport: homePageConfig.destinationAirport
            ? {
                id: homePageConfig.destinationAirport.id,
                name: homePageConfig.destinationAirport.name,
                iataCode: homePageConfig.destinationAirport.iataCode,
                municipality: homePageConfig.destinationAirport.municipality,
                isoCountry: homePageConfig.destinationAirport.isoCountry,
              }
            : undefined,
          dealCategoryIds: homePageConfig.dealCategoryIds,
          pageTemplate: homePageConfig.pageTemplate,
          dealCategories: homePageConfig.dealCategories,
          faqs: (homePageConfig as any).faqs || [],
        },
      };

      return (
        <>
          <NextSeo
            title={finalPageTitle}
            titleTemplate={
              finalPageTitle.includes('SkyTrips') ? '%s' : '%s | SkyTrips'
            }
            description={finalMetaDescription}
            canonical="https://skytrips.com.au/"
            nofollow={isDev || isUat}
            noindex={isDev || isUat}
            openGraph={{
              type: 'website',
              url: 'https://skytrips.com.au/',
              title: finalPageTitle,
              description: finalMetaDescription,
              siteName: 'SkyTrips',
              images: [
                {
                  url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
                  width: 1200,
                  height: 630,
                  alt: 'SkyTrips - Book Cheap Flights',
                  type: 'image/png',
                },
              ],
            }}
          />
          <FlightRoutePage {...routePageProps} />
        </>
      );
    } else if (isAirlineRoute) {
      // Create default content for airline page
      const airlineName = homePageConfig.airline?.airlineName || 'Airline';
      const airlineCode = homePageConfig.airline?.airlineCode || '';

      const finalSeoTitle =
        siteTitle && siteTitle.trim() !== ''
          ? siteTitle
          : homePageConfig.metaTitle || `${airlineName} Flights` || 'SkyTrips';

      const finalSeoDescription =
        tagline && tagline.trim() !== ''
          ? tagline
          : homePageConfig.metaDescription ||
            `Book ${airlineName} flights with SkyTrips.` ||
            '';

      const airlineContent = {
        code: airlineCode,
        name: airlineName,
        logo:
          homePageConfig.airline?.logoUrl ||
          '/assets/images/airlines/default.png',
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        bannerText: `Fly with ${airlineName}`,
        nepaliTitle: 'घर फर्कने बेला आयो',
        englishTitle: 'Time to Go Home',
        description:
          homePageConfig.description ||
          'Book your flights today with excellent service.',
        features: [
          '1. World-Class Safety & Operational Excellence',
          '2. Award‑Winning Hospitality',
          '3. Seamless Connectivity & Global Reach',
          '4. Comfort & Convenience Onboard',
        ],
        festivalBenefits: [
          'Fly Home with Exclusive Savings!',
          'Priority boarding for families',
        ],
        images: {
          primary: {
            src: '/assets/images/airlines/motherDaughter.webp',
            alt: `${airlineName} flight`,
            caption: 'Fly Home to Be with Your Loved Ones',
            subCaption: 'Travel with comfort and care',
          },
          secondary: {
            src: '/assets/images/airlines/crew.jpg',
            alt: `${airlineName} crew`,
            caption: "We're Here to Take Care of You",
            subCaption: 'Warm smiles and caring service',
          },
        },
        stats: [
          {
            title: 'Safety Certified',
            description: 'Highest safety standards',
          },
          {
            title: 'Free Baggage',
            description: 'Generous baggage allowance included',
          },
          {
            title: 'Premium Service',
            description: 'Excellence in aviation',
          },
          {
            title: airlineName,
            description: 'Trusted airline service',
          },
        ],
      };

      // Transform the homepage config to match the props expected by AirlineRoutePage
      const airlinePageProps = {
        content: airlineContent,
        initialRouteData: homePageConfig.airline
          ? {
              id: homePageConfig.id,
              key: homePageConfig.key,
              title: homePageConfig.title,
              description: homePageConfig.description,
              metaTitle: finalSeoTitle,
              metaDescription: finalSeoDescription,
              isHomePage: true,
              airline: {
                ...homePageConfig.airline,
                logoUrl: homePageConfig.airline.logoUrl || undefined,
              },
              dealCategories: homePageConfig.dealCategories,
              originAirport: homePageConfig.originAirport,
              destinationAirport: homePageConfig.destinationAirport,
              pageTemplate: homePageConfig.pageTemplate,
              faqs: (homePageConfig as any).faqs || [],
            }
          : null,
        fromAirport: homePageConfig.originAirport || null,
        toAirport: homePageConfig.destinationAirport || null,
      };

      return (
        <>
          <NextSeo
            title={finalSeoTitle}
            titleTemplate={
              finalSeoTitle.includes('SkyTrips') ? '%s' : '%s | SkyTrips'
            }
            description={finalSeoDescription}
            canonical="https://skytrips.com.au/"
            nofollow={isDev || isUat}
            noindex={isDev || isUat}
            openGraph={{
              type: 'website',
              url: 'https://skytrips.com.au/',
              title: finalSeoTitle,
              description: finalSeoDescription,
              siteName: 'SkyTrips',
              images: [
                {
                  url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
                  width: 1200,
                  height: 630,
                  alt: 'SkyTrips - Book Cheap Flights',
                  type: 'image/png',
                },
              ],
            }}
          />
          <AirlineRoutePage {...airlinePageProps} />
        </>
      );
    }
  }

  // Default homepage when no config is set
  const defaultMetaTitle =
    generalSettings?.siteTitle && generalSettings.siteTitle.trim() !== ''
      ? generalSettings.siteTitle
      : 'SkyTrips | Book Cheap Flights from Australia';

  const defaultMetaDescription =
    generalSettings?.tagline && generalSettings.tagline.trim() !== ''
      ? generalSettings.tagline
      : 'Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!';

  // Structured data for home page
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://skytrips.com.au/#website',
        url: 'https://skytrips.com.au',
        name: 'SkyTrips',
        description: defaultMetaDescription,
        publisher: {
          '@id': 'https://skytrips.com.au/#organization',
        },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate:
                'https://skytrips.com.au/flights?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'TravelAgency',
        '@id': 'https://skytrips.com.au/#organization',
        name: 'SkyTrips',
        alternateName: 'A2link Business House Pty Ltd',
        url: 'https://skytrips.com.au',
        logo: {
          '@type': 'ImageObject',
          url: 'https://skytrips.com.au/assets/logo.svg',
        },
        description:
          'Leading travel agency specializing in flights to Nepal and worldwide destinations',
        foundingDate: '2014',
        areaServed: ['Australia', 'Nepal', 'Worldwide'],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+61-240720886',
            contactType: 'Customer Service',
            email: 'info@skytrips.com.au',
            areaServed: 'Australia',
            availableLanguage: 'English',
          },
          {
            '@type': 'ContactPoint',
            telephone: '+977-9802378762',
            contactType: 'Customer Service',
            email: 'ticketing@skytrips.com.au',
            areaServed: 'Nepal',
            availableLanguage: 'English',
          },
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '42 Rainbows Way',
          addressLocality: 'Leppington',
          addressRegion: 'NSW',
          postalCode: '2179',
          addressCountry: 'Australia',
        },
        // sameAs: [
        //   'https://www.facebook.com/skytripstravel',
        //   'https://www.instagram.com/skytrips.com.au',
        //   'https://www.linkedin.com/company/skytrips',
        //   'https://www.youtube.com/@SkyTripsComAu',
        // ],
      },
    ],
  };

  return (
    <>
      <NextSeo
        title={defaultMetaTitle}
        description={defaultMetaDescription}
        titleTemplate={
          defaultMetaTitle.includes('SkyTrips') ? '%s' : '%s | SkyTrips'
        }
        canonical="https://skytrips.com.au/"
        nofollow={isDev || isUat}
        noindex={isDev || isUat}
        openGraph={{
          type: 'website',
          locale: 'en_AU',
          url: 'https://skytrips.com.au/',
          title: defaultMetaTitle,
          description: defaultMetaDescription,
          siteName: 'SkyTrips',
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: 'SkyTrips - Book Cheap Flights',
              type: 'image/png',
            },
          ],
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className=" flex flex-col">
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

            <div className="px-4 md:px-10 md:py-10 py-1 relative z-10 pb-10">
              <div className="mb-[2rem]">
                <h1 className="h1 text-secondary-on text-left md:mb-2 ">
                  From your Doorstep to Departure - We take care of it all
                </h1>
                <p className="h5  text-secondary-on">
                  Book Your Tickets in 6 minutes or less.
                </p>
              </div>

              <SearchWidget onSubmit={handleSearchSubmit} />
            </div>
          </section>
          
          <TopDeals />
          
          {/* <section className="mt-7 mb-7 ">
            <RecentSearches
              onSearchClick={handleSearchSubmit}
              onClearAll={() => {
                localStorage.removeItem('recent_searches');
                window.location.reload();
              }}
            />
          </section> */}
          <section className="mt-7 mb-7 px-4 md:px-10">
            <SpecialFare />
          </section>

          {/* <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Find quick answers to common questions about flight bookings
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="flex items-center py-4">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5" />
                      <span>How do I book a flight?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 text-muted-foreground">
                    Enter your travel details in our search form, including
                    departure and arrival cities, dates, and number of passengers.
                    Browse available flights, select your preferred option, fill
                    in passenger information, and proceed to payment. You'll
                    receive a confirmation email once your booking is complete.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="flex items-center py-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5" />
                      <span>What's your cancellation policy?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 text-muted-foreground">
                    Our cancellation policy varies depending on the fare type and
                    airline. Please check the fare rules before completing your
                    booking.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="flex items-center py-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5" />
                      <span>How do I make changes to my ticket?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 text-muted-foreground">
                    You can make changes to your booking through the "Manage
                    Booking" section on our website. Enter your booking reference
                    and last name to access your reservation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="flex items-center py-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <span>What payment methods are accepted?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 text-muted-foreground">
                    We accept all major credit and debit cards, including Visa,
                    Mastercard, and American Express. Some routes also support
                    PayPal and bank transfers.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section> */}
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const settings = await getHomePageConfig();
    return {
      props: {
        initialSettings: settings,
      },
    };
  } catch (error) {
    console.error('Error fetching settings in getServerSideProps:', error);
    return {
      props: {
        initialSettings: null,
      },
    };
  }
};
