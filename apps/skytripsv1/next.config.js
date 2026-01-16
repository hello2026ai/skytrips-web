// //@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // Enable image optimization
  images: {
    domains: ['pics.avs.io', 'via.placeholder.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Enable strict mode for React
  reactStrictMode: true,
  // Configure trailing slash behavior
  trailingSlash: false,
  // Configure build directory to root .next for Vercel compatibility
  distDir: '../../.next',
  // Set environment variables (optional)
  env: {
    SITE_URL: 'https://skytrips.com.au',
  },
  // Redirect old routes to new /flights/* routes
  async redirects() {
    const staticRedirects = [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*',
              has: [
                {
                  type: 'header',
                  key: 'x-forwarded-proto',
                  value: 'http',
                },
              ],
              destination: 'https://skytrips.com.au/:path*',
              permanent: true,
            },
            // Redirect www to non-www
            {
              source: '/:path*',
              has: [
                {
                  type: 'host',
                  value: 'www.skytrips.com.au',
                },
              ],
              destination: 'https://skytrips.com.au/:path*',
              permanent: true,
            },
          ]
        : []),
      // Specific route redirects for all ROUTE_SEO_DATA entries
      {
        source: '/our-team',
        destination: '/team',
        permanent: true,
      },
      {
        source: '/au',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sydney-to-kathmandu',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/melbourne-to-kathmandu',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/brisbane-to-kathmandu',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      {
        source: '/perth-to-kathmandu',
        destination: '/flights/perth-to-kathmandu',
        permanent: true,
      },
      {
        source: '/adelaide-to-kathmandu',
        destination: '/flights/adelaide-to-kathmandu',
        permanent: true,
      },
      {
        source: '/canberra-to-kathmandu',
        destination: '/flights/canberra-to-kathmandu',
        permanent: true,
      },
      {
        source: '/hobart-to-kathmandu',
        destination: '/flights/hobart-to-kathmandu',
        permanent: true,
      },
      {
        source: '/gold-coast-to-kathmandu',
        destination: '/flights/gold-coast-to-kathmandu',
        permanent: true,
      },
      {
        source: '/darwin-to-kathmandu',
        destination: '/flights/darwin-to-kathmandu',
        permanent: true,
      },
      {
        source: '/cairns-to-kathmandu',
        destination: '/flights/cairns-to-kathmandu',
        permanent: true,
      },
      {
        source: '/newcastle-to-kathmandu',
        destination: '/flights/newcastle-to-kathmandu',
        permanent: true,
      },
      {
        source: '/townsville-to-kathmandu',
        destination: '/flights/townsville-to-kathmandu',
        permanent: true,
      },
      {
        source: '/sunshine-coast-to-kathmandu',
        destination: '/flights/sunshine-coast-to-kathmandu',
        permanent: true,
      },
      {
        source: '/alice-springs-to-kathmandu',
        destination: '/flights/alice-springs-to-kathmandu',
        permanent: true,
      },
      {
        source: '/launceston-to-kathmandu',
        destination: '/flights/launceston-to-kathmandu',
        permanent: true,
      },
      {
        source: '/mackay-to-kathmandu',
        destination: '/flights/mackay-to-kathmandu',
        permanent: true,
      },
      {
        source: '/rockhampton-to-kathmandu',
        destination: '/flights/rockhampton-to-kathmandu',
        permanent: true,
      },
      {
        source: '/geelong-to-kathmandu',
        destination: '/flights/geelong-to-kathmandu',
        permanent: true,
      },
      {
        source: '/ballina-to-kathmandu',
        destination: '/flights/ballina-to-kathmandu',
        permanent: true,
      },
      {
        source: '/albury-to-kathmandu',
        destination: '/flights/albury-to-kathmandu',
        permanent: true,
      },

      {
        source: '/nepal-to-malaysia',
        destination: '/',
        permanent: true,
      },
      {
        source: '/nepal-to-india',
        destination: '/',
        permanent: true,
      },
      {
        source: '/kathmandu-to-panjab',
        destination: '/',
        permanent: true,
      },
      {
        source: '/kathmandu-to-beijing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/broome-to-kathmandu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/kathmandu-to-england',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ballarat-to-kathmandu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/kathmandu-to-kathmandu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wollongong-to-kathmandu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sydney-to-dubai',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wagga-wagga-to-kathmandu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/nepal-to-bhutan',
        destination: '/',
        permanent: true,
      },
      {
        source: '/melbourne-to-nepal-flights',
        destination: '/flights/melbourne-to-nepal-flights',
        permanent: true,
      },
      {
        source: '/brisbane-to-kathmandu-flight',
        destination: '/flights/brisbane-to-kathmandu-flight',
        permanent: true,
      },
      {
        source: '/newcastle-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/newcastle-to-kathmandu-cheap-flights-skytrips',
        permanent: true,
      },
      {
        source: '/canberra-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/canberra-to-kathmandu-cheap-flights-skytrips',
        permanent: true,
      },
      {
        source: '/flights-to-kathmandu-from-brisbane',
        destination: '/flights/flights-to-kathmandu-from-brisbane',
        permanent: true,
      },
      {
        source: '/flight-from-sydney-to-kathmandu-nepal',
        destination: '/flights/flight-from-sydney-to-kathmandu-nepal',
        permanent: true,
      },
      {
        source: '/cheap-flights-to-ktm-from-sydney',
        destination: '/flights/cheap-flights-to-ktm-from-sydney',
        permanent: true,
      },
      {
        source: '/melbourne-to-london-flights',
        destination: '/flights/melbourne-to-london-flights',
        permanent: true,
      },
      {
        source: '/canberra-to-ktm',
        destination: '/flights/canberra-to-ktm',
        permanent: true,
      },
      {
        source: '/brisbane-to-ktm-flight',
        destination: '/flights/brisbane-to-ktm-flight',
        permanent: true,
      },
      {
        source: '/darwin-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/darwin-to-kathmandu-cheap-flights-skytrips',
        permanent: true,
      },
      {
        source: '/cheapest-flight-to-nepal',
        destination: '/flights/cheapest-flight-to-nepal',
        permanent: true,
      },
      {
        source: '/flight-deals-from-adelaide-to-kathmandu',
        destination: '/flights/flight-deals-from-adelaide-to-kathmandu',
        permanent: true,
      },
      {
        source: '/sydney-to-kathmandu-flight-time',
        destination: '/flights/sydney-to-kathmandu-flight-time',
        permanent: true,
      },
      {
        source: '/mel-to-ktm',
        destination: '/flights//mel-to-ktm',
        permanent: true,
      },
      {
        source: '/airfare-to-kathmandu-from-melbourne',
        destination: '/flights/airfare-to-kathmandu-from-melbourne',
        permanent: true,
      },
      {
        source: '/sydney-to-kathmandu-flight',
        destination: '/flights/sydney-to-kathmandu-flight',
        permanent: true,
      },
      {
        source: '/sydney-to-melbourne',
        destination: '/flights/sydney-to-melbourne',
        permanent: true,
      },
      {
        source: '/perth-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/perth-to-kathmandu-cheap-flights-skytrips',
        permanent: true,
      },
      {
        source: '/brisbane-to-london-flight',
        destination: '/flights/brisbane-to-london-flight',
        permanent: true,
      },
      {
        source: '/sydney-to-delhi-flights',
        destination: '/flights/sydney-to-delhi-flights',
        permanent: true,
      },
      {
        source: '/sydney-to-melbourne',
        destination: '/flights/sydney-to-melbourne',
        permanent: true,
      },

      //new
      {
        source: '/flights/cheap-flights-from-sydney-to-kathmandu',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/cheap-flights-to-ktm-from-sydney',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/cheap-sydney-to-kathmandu-flights-skytrips',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flight-from-sydney-to-kathmandu',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flight-from-sydney-to-kathmandu-nepal',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/syd-to-ktm-cheap-flights',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/sydney-to-kathmandu-air-ticket',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/sydney-to-kathmandu-flight-time',
        destination: '/flights/sydney-to-kathmandu',
        permanent: true,
      },
      //melbourne to kathmandu

      {
        source: '/flights/airfare-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flight-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flights-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/mel-to-ktm',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/mel-to-ktm-flight',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-kathmandu-cheap-flights',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-kathmandu-flights',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-ktm-flight',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      //brisbane to kathmandu
      {
        source: '/flights/bne-to-ktm',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/brisbane-to-ktm-flight',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/brisbane-to-ktm-flights',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flights-to-kathmandu-from-brisbane',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/fly-brisbane-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/brisbane-to-kathmandu',
        permanent: true,
      },
      //adelaide to kathmandu
      {
        source: '/flights/adelaide-to-kathmandu-flights-cheap-deals-skytrips',
        destination: '/flights/adelaide-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flight-deals-from-adelaide-to-kathmandu',
        destination: '/flights/adelaide-to-kathmandu',
        permanent: true,
      },
      //hobert to kathmandu
      {
        source: '/flights/hobart-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/hobart-to-kathmandu',
        permanent: true,
      },
      //darwin to kathmandu
      {
        source: '/flights/darwin-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/darwin-to-kathmandu',
        permanent: true,
      },
      //melbourne to kathmandu
      {
        source: '/flights/airfare-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flight-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/flights-to-kathmandu-from-melbourne',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/mel-to-ktm',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/mel-to-ktm-flight',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-kathmandu-cheap-flights',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },

      {
        source: '/flights/melbourne-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-kathmandu-flights',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      {
        source: '/flights/melbourne-to-ktm-flight',
        destination: '/flights/melbourne-to-kathmandu',
        permanent: true,
      },
      //perth to kathmandu

      {
        source: '/flights/perth-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/perth-to-kathmandu',
        permanent: true,
      },
      //canberra to kathmandu

      {
        source: '/flights/canberra-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/canberra-to-kathmandu',
        permanent: true,
      },
      //gold coast to kathmandu
      {
        source: '/flights/gold-coast-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/gold-coast-to-kathmandu',
        permanent: true,
      },
      //new castle to kathmandu
      {
        source: '/flights/newcastle-to-kathmandu-cheap-flights-skytrips',
        destination: '/flights/newcastle-to-kathmandu',
        permanent: true,
      },
    ];

    // Fetch dynamic redirects from API
    let dynamicRedirects = [];
    let redirectMappings = []; // Track original URLs for logging
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_REST_API?.trim() ||
        'https://api.skytrips.com.au';
      const keyword = process.env.REDIRECT_KEYWORD || '';

      // Build query parameters
      const params = new URLSearchParams({
        limit: '1000',
        page: '1',
      });

      if (keyword.trim()) {
        params.append('keyword', keyword.trim());
        console.log('🔍 [REDIRECTS] Using keyword filter:', keyword.trim());
      }

      const fetchUrl = `${apiUrl}/redirection-page?${params.toString()}`;
      console.log('🌐 [REDIRECTS] Fetching from:', fetchUrl);

      const response = await fetch(fetchUrl);

      if (response.ok) {
        const data = await response.json();
        console.log(
          '📊 [REDIRECTS] Raw API Response:',
          JSON.stringify(data, null, 2)
        );

        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item) => {
            if (item.urlRedirects && Array.isArray(item.urlRedirects)) {
              item.urlRedirects.forEach((redirect) => {
                if (redirect.sourceUrl && redirect.destinationUrl) {
                  const statusCode =
                    redirect.redirectionType === '302'
                      ? 302
                      : redirect.redirectionType === '307'
                      ? 307
                      : redirect.redirectionType === '308'
                      ? 308
                      : 301;

                  // Process source path - admin panel now only stores paths
                  let source = redirect.sourceUrl;

                  // Ensure source starts with /
                  if (!source.startsWith('/')) {
                    source = '/' + source;
                  }

                  // Only add redirect if source is a valid path
                  if (source.startsWith('/')) {
                    const redirectConfig = {
                      source: source,
                      destination: redirect.destinationUrl,
                      permanent: statusCode === 301 || statusCode === 308,
                      statusCode: statusCode,
                    };

                    dynamicRedirects.push(redirectConfig);

                    // Store mapping for logging
                    redirectMappings.push({
                      originalSource: redirect.sourceUrl,
                      extractedPath: source,
                      destination: redirect.destinationUrl,
                      permanent: statusCode === 301 || statusCode === 308,
                    });

                    console.log(
                      `✅ [REDIRECTS] Added redirect: ${source} -> ${
                        redirect.destinationUrl
                      } (${
                        statusCode === 301 || statusCode === 308
                          ? 'permanent'
                          : 'temporary'
                      })`
                    );
                  } else {
                    console.warn(
                      `⚠️ [REDIRECTS] Skipping invalid source path: ${redirect.sourceUrl}`
                    );
                  }
                }
              });
            }
          });
        }
      } else {
        // console.error(
        //   '❌ [REDIRECTS] API Error:',
        //   response.status,
        //   response.statusText
        // );
      }
    } catch (error) {
      // console.error('💥 [REDIRECTS] Fetch Error:', error);
    }

    // Debug: Log ALL dynamic redirects
    console.log('📋 [REDIRECTS] All dynamic redirects:');
    redirectMappings.forEach((mapping, index) => {
      console.log(
        `   ${index + 1}. ${mapping.extractedPath} -> ${mapping.destination} (${
          mapping.permanent ? 'permanent' : 'temporary'
        })`
      );
    });

    // Debug: Log any redirects that might affect root path or use wildcards
    const problematicRedirects = [
      ...staticRedirects,
      ...dynamicRedirects,
    ].filter(
      (redirect) =>
        redirect.source === '/' ||
        redirect.source.includes(':path*') ||
        redirect.source.includes('*') ||
        redirect.source === '/:path*'
    );

    if (problematicRedirects.length > 0) {
      console.warn('⚠️ [REDIRECTS] Found potentially problematic redirects:');
      problematicRedirects.forEach((redirect) => {
        console.warn(`   ${redirect.source} -> ${redirect.destination}`);
      });
    }

    // Combine static and dynamic redirects
    const allRedirects = [...staticRedirects, ...dynamicRedirects];

    console.log(
      `🔧 [REDIRECTS] Total combined redirects: ${allRedirects.length}`
    );

    // Important note about how redirects work
    console.log(
      '📌 [REDIRECTS] Important: Next.js redirects are path-based and work on any domain.'
    );
    console.log(
      '   - Source paths like "/flights/trip-to-bali" will match on localhost:3500, dev.skytrips.com.au, etc.'
    );
    console.log(
      '   - Admin panel now stores only paths (no full URLs) for consistency.'
    );

    return allRedirects;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);

// let userConfig = undefined
// try {
//   // userConfig = await import('./v0-user-next.config')
// } catch (e) {
//   // ignore error
// }

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   experimental: {
//     webpackBuildWorker: true,
//     parallelServerBuildTraces: true,
//     parallelServerCompiles: true,
//   },
// }

// mergeConfig(nextConfig, userConfig)

// function mergeConfig(nextConfig, userConfig) {
//   if (!userConfig) {
//     return
//   }

//   for (const key in userConfig) {
//     if (
//       typeof nextConfig[key] === 'object' &&
//       !Array.isArray(nextConfig[key])
//     ) {
//       nextConfig[key] = {
//         ...nextConfig[key],
//         ...userConfig[key],
//       }
//     } else {
//       nextConfig[key] = userConfig[key]
//     }
//   }
// }

// export default nextConfig
