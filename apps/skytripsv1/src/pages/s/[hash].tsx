import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';
import { NextSeo } from 'next-seo';
import { format } from 'date-fns';

// Interface for the mapping data
interface ShortLinkMapping {
  params: string;
  expiry: number;
}

interface ShortLinkData {
  params: string;
  expiry: number;
}

// Interface for decoded flight parameters
interface FlightParams {
  fromAirport: {
    displayName: string;
    city: string;
    code: string;
  };
  toAirport: {
    displayName: string;
    city: string;
    code: string;
  };
  departureDate: string;
  returnDate?: string | null;
  tripType: string;
  airline?: {
    airlineName: string;
    airlineCode: string;
  } | null;
  currencyCode?: string | null;
  price?: number | null;
  ogImageUrl?: string | null; // Add root-level ogImageUrl
  originalDeal?: {
    ogImageUrl?: string;
    ogImageFullUrl?: string;
    [key: string]: any;
  } | null;
}

interface ShortLinkProps {
  params?: string;
  error?: string;
  flightInfo?: FlightParams;
}

// Helper function to decode and extract flight information
const decodeFlightParams = (encodedParams: string): FlightParams | null => {
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedParams, 'base64').toString('utf8')
    );
    console.log('Debug - Decoded params:', decoded);
    console.log('Debug - Decoded ogImageUrl:', decoded.ogImageUrl);
    console.log('Debug - Decoded originalDeal:', decoded.originalDeal);

    const params = {
      fromAirport: decoded.fromAirport || {
        displayName: decoded.originLocationCode,
        city: decoded.originLocationCode,
        code: decoded.originLocationCode,
      },
      toAirport: decoded.toAirport || {
        displayName: decoded.destinationLocationCode,
        city: decoded.destinationLocationCode,
        code: decoded.destinationLocationCode,
      },
      departureDate: decoded.departureDate,
      returnDate: decoded.returnDate,
      tripType: decoded.tripType,
      airline: decoded.airline,
      currencyCode: decoded.currencyCode,
      price: decoded.price || decoded.estimatedPrice,
      originalDeal: {
        id: decoded.dealId,
        // Prioritize ogImageUrl from the root level if it exists
        ogImageUrl:
          decoded.ogImageUrl ||
          (decoded.originalDeal?.ogImageUrl
            ? decoded.originalDeal.ogImageUrl
            : null),
        // Include any other deal fields that might be useful
        ...(decoded.originalDeal || {}),
      },
    };
    console.log('Debug - Constructed params:', params);
    return params;
  } catch (error) {
    console.error('Error decoding flight params:', error);
    return null;
  }
};

// Helper function to format date for display
const formatDisplayDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy');
  } catch (error) {
    return dateStr;
  }
};

// Page component that handles redirection
export default function ShortLink({
  params,
  error,
  flightInfo,
}: ShortLinkProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string>(
    'Redirecting to your flight search...'
  );
  const [currentFlightInfo, setCurrentFlightInfo] =
    useState<FlightParams | null>(flightInfo || null);
  const [isLoading, setIsLoading] = useState(
    !flightInfo && !!router.query.hash
  );

  // Effect to handle client-side data fetching
  useEffect(() => {
    const fetchData = async () => {
      const { hash } = router.query;
      if (!currentFlightInfo && hash && typeof hash === 'string') {
        try {
          setIsLoading(true);
          const response = await axios.get(`/api/shortlinks/get?hash=${hash}`);
          if (response.data.success && response.data.params) {
            const flightData = decodeFlightParams(response.data.params);
            console.log('Debug - Client-side data fetched:', flightData);
            if (flightData) {
              setCurrentFlightInfo(flightData);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [router.query.hash, currentFlightInfo]);

  console.log(
    'Debug - Component render with currentFlightInfo:',
    currentFlightInfo
  );

  // Handle redirection and error states
  useEffect(() => {
    if (error) {
      setMessage(`Error: ${error}`);
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    // If we have SSR params, use them for redirection
    if (params) {
      setMessage('Loading your flight search...');
      setTimeout(() => router.push(`/flights-results?q=${params}`), 1000);
      return;
    }

    // Handle client-side state
    if (!isLoading) {
      const { hash } = router.query;
      if (!hash) {
        setMessage('Invalid link.');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      if (!currentFlightInfo) {
        setMessage('Link not found or expired.');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      // We have the data, proceed with redirection
      setMessage('Loading your flight search...');
      setTimeout(() => {
        const encodedParams = Buffer.from(
          JSON.stringify({
            ...currentFlightInfo,
            ogImageUrl:
              currentFlightInfo.originalDeal?.ogImageUrl ||
              currentFlightInfo.ogImageUrl,
          })
        ).toString('base64');
        router.push(`/flights-results?q=${encodedParams}`);
      }, 1000);
    }
  }, [error, params, isLoading, currentFlightInfo, router]);

  // Generate SEO title and description based on flight info
  const seoTitle = currentFlightInfo
    ? `Flights from ${currentFlightInfo.fromAirport.city} to ${currentFlightInfo.toAirport.city} | SkyTrips`
    : 'SkyTrips | Flight Search';

  const seoDescription = currentFlightInfo
    ? `Find cheap flights from ${
        currentFlightInfo.fromAirport.displayName
      } to ${currentFlightInfo.toAirport.displayName}${
        currentFlightInfo.departureDate
          ? ` departing ${formatDisplayDate(currentFlightInfo.departureDate)}`
          : ''
      }${
        currentFlightInfo.returnDate
          ? ` returning ${formatDisplayDate(currentFlightInfo.returnDate)}`
          : ''
      }. Compare prices and book with SkyTrips.`
    : 'Find and compare cheap flights with SkyTrips';

  // Generate OG image URL with flight data
  const getOgImageUrl = () => {
    console.log(
      'Debug - getOgImageUrl called with currentFlightInfo:',
      currentFlightInfo
    );

    // First priority: Check if we have a pre-constructed full URL
    if (currentFlightInfo?.originalDeal?.ogImageFullUrl) {
      console.log(
        'Debug - Using pre-constructed full URL:',
        currentFlightInfo.originalDeal.ogImageFullUrl
      );
      return currentFlightInfo.originalDeal.ogImageFullUrl;
    }

    // Second priority: Check if we have a valid ogImageUrl from the deal
    if (currentFlightInfo?.originalDeal?.ogImageUrl) {
      const ogImageUrl = currentFlightInfo.originalDeal.ogImageUrl.trim();
      console.log('Debug - Found ogImageUrl in originalDeal:', ogImageUrl);

      if (ogImageUrl) {
        const fullUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
          /\/$/,
          ''
        )}/${ogImageUrl.replace(/^\//, '')}`;
        console.log('Debug - Constructed full OG Image URL:', fullUrl);
        return fullUrl;
      }
    }

    // Third priority: Check root level ogImageUrl
    if (currentFlightInfo?.ogImageUrl) {
      const ogImageUrl = currentFlightInfo.ogImageUrl.trim();
      console.log('Debug - Found ogImageUrl at root level:', ogImageUrl);

      if (ogImageUrl) {
        const fullUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
          /\/$/,
          ''
        )}/${ogImageUrl.replace(/^\//, '')}`;
        console.log(
          'Debug - Constructed full OG Image URL from root:',
          fullUrl
        );
        return fullUrl;
      }
    }

    // Also check root level ogImageUrl as fallback
    if (currentFlightInfo?.ogImageUrl) {
      const ogImageUrl = currentFlightInfo.ogImageUrl.trim();
      console.log('Debug - Found ogImageUrl at root level:', ogImageUrl);

      if (ogImageUrl) {
        const fullUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
          /\/$/,
          ''
        )}/${ogImageUrl.replace(/^\//, '')}`;
        console.log('Debug - Returning full OG Image URL from root:', fullUrl);
        return fullUrl;
      }
    }

    // Second priority: Generate dynamic OG image if we have flight info
    if (currentFlightInfo) {
      return `/api/og/flight-share?from=${encodeURIComponent(
        currentFlightInfo.fromAirport.city
      )}&to=${encodeURIComponent(currentFlightInfo.toAirport.city)}${
        currentFlightInfo.departureDate
          ? `&date=${encodeURIComponent(currentFlightInfo.departureDate)}`
          : ''
      }${
        currentFlightInfo.returnDate
          ? `&returnDate=${encodeURIComponent(currentFlightInfo.returnDate)}`
          : ''
      }${
        currentFlightInfo.airline?.airlineName
          ? `&airline=${encodeURIComponent(
              currentFlightInfo.airline.airlineName
            )}`
          : ''
      }${
        currentFlightInfo.price
          ? `&price=${encodeURIComponent(currentFlightInfo.price.toString())}`
          : ''
      }${
        currentFlightInfo.currencyCode
          ? `&currency=${encodeURIComponent(currentFlightInfo.currencyCode)}`
          : ''
      }&tripType=${encodeURIComponent(currentFlightInfo.tripType)}`;
    }

    // Fallback: Default OG image
    return 'https://skytrips.com.au/assets/og/skytrips-og.png';
  };

  const ogImageUrl = getOgImageUrl();

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        noindex={true}
        openGraph={{
          url: `https://skytrips.com.au/s/${router.query.hash}`,
          title: seoTitle,
          description: seoDescription,
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: currentFlightInfo
                ? `Flights from ${currentFlightInfo.fromAirport.city} to ${currentFlightInfo.toAirport.city}`
                : 'SkyTrips - Find Cheap Flights',
            },
          ],
          site_name: 'SkyTrips',
        }}
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4">SkyTrips</h1>
          <p className="text-center">{message}</p>
        </div>
      </div>
    </>
  );
}

// Server-side logic to fetch the link data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash } = context.params || {};

  if (!hash || typeof hash !== 'string') {
    return {
      props: {
        error: 'Invalid link',
      },
    };
  }

  try {
    // Read from the file storage directly on the server
    const STORAGE_FILE = path.join(process.cwd(), 'shortlinks-data.json');

    if (!fs.existsSync(STORAGE_FILE)) {
      return {
        props: {
          error: 'Link not found',
        },
      };
    }

    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const links: Record<string, ShortLinkData> = JSON.parse(data);
    const linkData = links[hash];

    if (!linkData || linkData.expiry < Date.now()) {
      return {
        props: {
          error: 'Link not found or expired',
        },
      };
    }

    // Decode flight information for server-side rendering
    const flightInfo = decodeFlightParams(linkData.params);

    // Sanitize flightInfo to ensure all undefined values are converted to null
    // This prevents Next.js serialization errors
    const sanitizedFlightInfo = flightInfo
      ? {
          fromAirport: flightInfo.fromAirport,
          toAirport: flightInfo.toAirport,
          departureDate: flightInfo.departureDate,
          returnDate: flightInfo.returnDate || null,
          tripType: flightInfo.tripType,
          airline: flightInfo.airline || null,
          currencyCode: flightInfo.currencyCode || null,
          price: flightInfo.price || null,
          originalDeal: flightInfo.originalDeal
            ? {
                ...flightInfo.originalDeal,
                // Ensure ogImageUrl is preserved
                ogImageUrl: flightInfo.originalDeal.ogImageUrl || null,
              }
            : null,
        }
      : null;

    return {
      props: {
        params: linkData.params,
        flightInfo: sanitizedFlightInfo,
      },
    };
  } catch (error) {
    console.error('Error retrieving shortlink on server:', error);
    return {
      props: {
        error: 'Server error',
      },
    };
  }
};
