import Image from 'next/image';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const returnDate = searchParams.get('returnDate');
    const airline = searchParams.get('airline');
    const tripType = searchParams.get('tripType');
    const price = searchParams.get('price');
    const currency = searchParams.get('currency');

    // Fallback values
    const fromCity = from || 'Origin';
    const toCity = to || 'Destination';
    const departureDate = date
      ? new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const returnDateFormatted = returnDate
      ? new Date(returnDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const airlineName = airline || '';
    const trip = tripType === 'ONE_WAY' ? 'One Way' : 'Round Trip';
    const isRoundTrip = tripType === 'ROUND_TRIP';

    // Format price with currency
    const displayCurrency = currency || 'AUD';
    const displayPrice = price
      ? parseFloat(price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

    // Show price section if we have price data, otherwise show "Find Deals"
    const showActualPrice = price && displayPrice;
    const priceText = showActualPrice
      ? `${displayCurrency} ${displayPrice}`
      : '';
    const showPriceSection = true; // Always show some call-to-action

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1E3A8A', // Blue background
            backgroundImage:
              'linear-gradient(135deg, #0C0073 0%, #5143D9 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px',
          }}
        >
          {/* SkyTrips Logo */}
          <div
            style={{
              fontSize: '70px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '40px',
            }}
          >
            SkyTrips
          </div>

          {/* Airline Name */}
          {airlineName && (
            <div
              style={{
                fontSize: '40px',
                color: '#f9b55d', // Yellow/orange color
                marginBottom: '20px',
                fontWeight: '600',
              }}
            >
              {airlineName}
            </div>
          )}

          {/* Flight Route */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
            }}
          >
            {/* From City */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: '700',
                color: '#ffffff',
              }}
            >
              {fromCity}
            </div>

            {/* Arrow */}
            <div
              style={{
                margin: '0 40px',
                fontSize: '48px',
                color: '#ffffff',
              }}
            >
              →
            </div>

            {/* To City */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: '700',
                color: '#ffffff',
              }}
            >
              {toCity}
            </div>
          </div>

          {/* Flight Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#ffffff',
              gap: '10px',
            }}
          >
            {departureDate && (
              <div
                style={{
                  fontSize: '34px',
                  opacity: 0.9,
                }}
              >
                {isRoundTrip && returnDateFormatted
                  ? `${departureDate} - ${returnDateFormatted}`
                  : departureDate}
              </div>
            )}

            <div
              style={{
                fontSize: '30px',
                opacity: 0.8,
              }}
            >
              {trip}
            </div>
          </div>

          {/* Price Section - Always show call-to-action */}
          {showPriceSection && (
            <div
              style={{
                marginTop: '40px',
                display: 'flex',
                alignItems: 'center',
                color: '#fbbf24', // Yellow/orange color
              }}
            >
              {showActualPrice ? (
                <>
                  <div
                    style={{
                      fontSize: '40px',
                      marginRight: '10px',
                      color: '#ffffff',
                    }}
                  >
                    from
                  </div>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: '800',
                      color: '#f9b55d',
                    }}
                  >
                    {priceText}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: '#f9b55d',
                    textAlign: 'center',
                  }}
                >
                  Find Best Deals
                </div>
              )}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate OG image`, {
      status: 500,
    });
  }
}
