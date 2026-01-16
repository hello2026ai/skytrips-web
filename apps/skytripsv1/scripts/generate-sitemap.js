const fs = require('fs');
const path = require('path');
const glob = require('glob');
const https = require('https');
const http = require('http');

// Load environment variables from .env files
function loadEnvFile() {
  const envFiles = [
    path.join(__dirname, '../../.env.local'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env'),
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log(`Loaded environment variables from: ${envFile}`);
    }
  }
}

// Load env files
loadEnvFile();

// Use hardcoded website URL
const WEBSITE_URL = 'https://skytrips.com.au';

// API base URL - can be overridden with environment variable
// Set SKIP_API_CALL=true to skip API calls during build (useful if API is not available)
const SKIP_API_CALL = process.env.SKIP_API_CALL === 'true';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_REST_API ||
  process.env.API_BASE_URL ||
  'https://api.skytrips.com.au';

// Import route data from the route file
const { readFileSync } = require('fs');

// Function to extract airline routes
function extractAirlineRoutes() {
  try {
    const airlineFilePath = path.join(
      __dirname,
      '../src/pages/airlines/[airline].tsx'
    );
    const fileContent = readFileSync(airlineFilePath, 'utf8');

    // Find all airline route keys in the content
    const routeRegex = /['"]([^'"]+)['"]:\s*{/g;
    const airlines = [];
    let match;

    while ((match = routeRegex.exec(fileContent)) !== null) {
      // Skip the 'code', 'name', 'logo' etc. properties
      if (
        !match[1].includes('code') &&
        !match[1].includes('name') &&
        !match[1].includes('logo')
      ) {
        airlines.push(`/airlines/${match[1]}`);
      }
    }

    if (airlines.length === 0) {
      console.error('Could not extract airline routes');
      return [];
    }

    console.log('Airlines routes extracted:', airlines);
    return airlines;
  } catch (error) {
    console.error('Error extracting airline routes:', error);
    return [];
  }
}

// Function to fetch dynamic routes from API
async function fetchDynamicRoutesFromAPI() {
  // Skip API call if SKIP_API_CALL is set
  if (SKIP_API_CALL) {
    console.log('ℹ️  SKIP_API_CALL is set to true. Skipping API call.');
    return [];
  }

  try {
    // Ensure base URL doesn't have trailing slash
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const url = new URL(`${baseUrl}/route/page`);
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', '2000');

    console.log(`   Full API URL: ${url.href}`);
    console.log(`   Method: GET`);
    console.log(
      `   Expected to match Swagger: ${baseUrl}/route/page?page=1&limit=2000`
    );

    return new Promise((resolve) => {
      const client = url.protocol === 'https:' ? https : http;

      const req = client.get(
        url.href,
        {
          headers: {
            'Content-Type': 'application/json',
            'ama-client-ref': `sitemap_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 10)}`,
          },
          timeout: 30000,
        },
        (res) => {
          let data = '';

          // Check if response is successful
          if (res.statusCode !== 200) {
            console.warn(
              `⚠️  API returned status code ${res.statusCode}. Continuing with static routes only.`
            );
            console.warn(`   API URL attempted: ${url.href}`);
            console.warn(`   Response headers:`, res.headers);

            // Try to read error response body
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              if (data) {
                console.warn(
                  `   Error response body: ${data.substring(0, 200)}`
                );
              }
            });
            resolve([]);
            return;
          }

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);

              // API returns routes in data.data array
              if (response && response.data && Array.isArray(response.data)) {
                const routes = response.data
                  .map((route) => route.key)
                  .filter((key) => key && typeof key === 'string');

                console.log(
                  `✅ Routes fetched from API: ${routes.length} routes`
                );
                return resolve(routes);
              } else {
                console.warn(
                  '⚠️  API response format unexpected, no routes found'
                );
                console.warn(
                  `   Response structure:`,
                  JSON.stringify(response).substring(0, 300)
                );
                resolve([]);
              }
            } catch (parseError) {
              console.error('Error parsing API response:', parseError);
              resolve([]);
            }
          });
        }
      );

      req.on('error', (error) => {
        console.warn(`⚠️  Error fetching routes from API: ${error.message}`);
        console.warn(
          `   Continuing with static routes only. Build will not fail.`
        );
        resolve([]); // Return empty array instead of rejecting to allow fallback
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('API request timeout');
        resolve([]);
      });
    });
  } catch (error) {
    console.error('Error in fetchDynamicRoutesFromAPI:', error.message);
    return [];
  }
}

// Function to extract routes from [route].tsx file (static routes from ROUTE_SEO_DATA)
function extractRouteDataFromFile() {
  try {
    const routeFilePath = path.join(
      __dirname,
      '../src/pages/flights/[route].tsx'
    );
    const fileContent = readFileSync(routeFilePath, 'utf8');

    // Find the ROUTE_SEO_DATA object in the file content
    const startMarker = 'const ROUTE_SEO_DATA = {';
    const endMarker = '};';

    const startIndex = fileContent.indexOf(startMarker);
    if (startIndex === -1) {
      console.error('Could not find ROUTE_SEO_DATA in [route].tsx');
      return [];
    }

    // Extract just the object part
    let objectText = fileContent.substring(startIndex);
    const endIndex = objectText.indexOf(endMarker) + endMarker.length;
    objectText = objectText.substring(0, endIndex);

    // Extract route keys using regex
    const routeRegex = /'([^']+)'\s*:/g;
    const routes = [];
    let match;

    while ((match = routeRegex.exec(objectText)) !== null) {
      routes.push(match[1]);
    }

    if (routes.length === 0) {
      console.error('Could not extract routes from ROUTE_SEO_DATA');
      return [];
    }

    console.log(
      `Routes extracted from ROUTE_SEO_DATA: ${routes.length} routes`
    );
    return routes;
  } catch (error) {
    console.error('Error extracting route data:', error);
    return [];
  }
}

// Function to extract route from file path
function extractRouteFromFilePath(filePath) {
  // Remove the pages directory and file extension
  let route = filePath
    .replace(/^.*?\/pages/, '')
    .replace(/\.(js|jsx|ts|tsx)$/, '');

  // Handle index routes
  route = route.replace(/\/index$/, '/');

  // Handle dynamic routes (keep them as is for now, as we can't determine the actual values)
  // For example, /blog/[slug].js becomes /blog/[slug]

  // Handle catch-all routes
  route = route.replace(/\/\[\[\.\.\.(.*?)\]\]/, '/*');

  return route;
}

// Function to check if a route is a dynamic route
function isDynamicRoute(route) {
  return route.includes('[') && route.includes(']');
}

// Function to check if a route should be excluded from the sitemap
function shouldExcludeRoute(route) {
  // Always include the home page route
  if (route === '/' || route === '') {
    return false;
  }

  // List of routes to exclude (with and without leading slashes)
  const excludedPatterns = [
    'flights-results',
    'book',
    '_app',
    '_document',
    'server-error',
    'api',
    '_',
    '404',
    '500',
    'index',
    'confirmation',
    'flight-result-backup',
    'account',
    'itinerary',
    'itinerary-confirmation',
    'airlines/[airline]',
    'flight-result-backup',
    'flights/cheap-flights-darwin-to-tokyo',
'flights/darwin-to-tokyo-flights',
'flights/adelaide-to-fukuoka-flights',
'flights/adl-to-nrt-flights',
'flights/cheap-flights-adelaide-to-tokyo',
'flights/adelaide-to-tokyo-flights',
'flights/qantas-perth-to-tokyo-flights',
'flights/ana-flights-perth-to-tokyo',
'flights/perth-to-fukuoka-flights',
'flights/perth-to-hnd-flights',
'flights/perth-to-nrt-flights',
'flights/cheap-flights-perth-to-tokyo',
'flights/perth-to-tokyo-flights',
'flights/qantas-brisbane-to-tokyo-flights',
'flights/ana-flights-brisbane-to-tokyo',
'flights/brisbane-to-fukuoka-flights',
'flights/brisbane-to-tokyo-haneda-flights',
'flights/bne-to-hnd-flights',
'flights/bne-to-nrt-flights',
'flights/cheap-flights-brisbane-to-tokyo',
'flights/brisbane-to-tokyo-flights',
'flights/qantas-melbourne-to-tokyo-flights',
'flights/ana-flights-melbourne-to-tokyo',
'flights/melbourne-to-fukuoka-flights',
'flights/melbourne-to-tokyo-haneda-flights',
'flights/mel-to-hnd-flights',
'flights/mel-to-nrt-flights',
'flights/cheap-flights-melbourne-to-tokyo',
'flights/melbourne-to-tokyo-flights',
'flights/qantas-flights-sydney-to-tokyo',
'flights/ana-flights-sydney-to-tokyo',
'flights/sydney-to-fukuoka-flights',
'flights/sydney-to-tokyo-haneda-flights',
'flights/sydney-to-tokyo-narita-flights',
'flights/syd-to-hnd-flights',
'flights/syd-to-nrt-flights',
'flights/cheap-flights-sydney-to-tokyo',
'flights/flights-sydney-to-tokyo',
'flights/sydney-to-buenos-aires-air-ticket',
'flights/direct-flight-from-sydney-to-buenos-aires',
'flights/syd-to-buenos-aires-direct-flights',
'flights/flight-time-sydney-to-buenos-aires',
'flights/sydney-to-buenos-aires-cheap-flights',
'flights/syd-to-eze-flights',
'flights/cheap-flights-to-buenos-aires-from-sydney',
'flights/flights-to-buenos-aires-from-sydney',
'flights/sydney-to-buenos-aires-flights',
'flights/qantas-to-santiago',
'flights/flight-time-santiago-to-sydney',
'flights/direct-flight-from-sydney-to-santiago',
'flights/sydney-to-santiago-direct-flights',
'flights/syd-to-scl',
'flights/syd-to-scl-flights',
'flights/sydney-to-santiago-flight-time',
'flights/flights-to-santiago-from-sydney',
'flights/sydney-to-santiago-chile-flights',
'flights/flights-to-santiago-chile-from-sydney',
'flights/flights-sydney-to-santiago',
'flights/brisbane-to-santiago-flights',
'flights/melbourne-to-santiago-flight',
'flights/sydney-to-santiago-flights',
'flights/singapore-cairns-flights',
'flights/cairns-singapore-flights',
'flights/cheap-flights-cairns-to-singapore',
'flights/cheap-singapore-flights-from-cairns',
'flights/direct-flights-cairns-to-singapore',
'flights/cairns-to-singapore-direct-flights',
'flights/flights-cairns-to-singapore',
'flights/cairns-to-singapore-flights',
'flights/bali-flights-from-cairns',
'flights/cheap-flight-cairns-to-bali',
'flights/bali-to-cairns',
'flights/cheap-flights-cairns-to-bali',
'flights/cairns-to-denpasar-flights',
'flights/cairns-to-bali-cheap-flights',
'flights/cheap-bali-flights-from-cairns',
'flights/direct-flight-cairns-to-bali',
'flights/cairns-to-bali-direct-flights',
'flights/cairns-to-bali-flights',
'flights/flights-cairns-to-bali',
'flights/cairns-to-thailand-flight',
'flights/cairns-to-thailand-flights',
'flights/cairns-thailand-flights',
'flights/cairns-to-bangkok-flights',
'flights/cairns-to-bangkok-flight',
'flights/cairns-to-kathmandu-flights',
'flights/albury-to-kathmandu-cheap-flights-skytrips',
'flights/ballina-to-kathmandu-cheap-flights-skytrips',
'flights/rockhampton-to-kathmandu-cheap-flights-skytrips',
'flights/mackay-to-kathmandu-cheap-flights-skytrips',
'flights/launceston-to-kathmandu-cheap-flights-skytrips',
'flights/alice-springs-to-kathmandu-cheap-flights-skytrips',
'flights/sunshine-coast-to-kathmandu-cheap-flights-skytrips',
'flights/newcastle-to-kathmandu-cheap-flights-skytrips',
'flights/cairns-to-kathmandu-cheap-flights-skytrips',
'flights/darwin-to-kathmandu-cheap-flights-skytrips',
'flights/gold-coast-to-kathmandu-cheap-flights-skytrips',
'flights/hobart-to-kathmandu-cheap-flights-skytrips',
'flights/canberra-to-kathmandu-cheap-flights-skytrips',
'flights/adelaide-to-kathmandu-flights-cheap-deals-skytrips',
'flights/perth-to-kathmandu-cheap-flights-skytrips',
'flights/fly-brisbane-to-kathmandu-cheap-flights-skytrips',
'flights/melbourne-to-kathmandu-cheap-flights-skytrips',
'flights/cheap-sydney-to-kathmandu-flights-skytrips',
'flights/sydney-to-delhi-flights',
'flights/melbourne-to-nepal-flight-price',
'flights/flight-to-kathmandu-from-melbourne',
'flights/melbourne-to-nepal-flights',
'flights/melbourne-to-kathmandu-cheap-flights',
'flights/mel-to-ktm-flight',
'flights/melbourne-to-ktm-flight',
'flights/mel-to-ktm',
'flights/airfare-to-kathmandu-from-melbourne',
'flights/melbourne-to-kathmandu-flights',
'flights/flights-to-kathmandu-from-melbourne',
'flights/cheap-flights-from-sydney-to-nepal',
'flights/cheapest-flight-from-kathmandu-to-sydney',
'flights/syd-to-ktm-cheap-flights',
'flights/sydney-to-kathmandu-flight-time',
'flights/cheap-flights-to-ktm-from-sydney',
'flights/sydney-to-kathmandu-air-ticket',
'flights/flight-from-sydney-to-kathmandu-nepal',
'flights/flights-sydney-to-kathmandu-nepal',
'flights/cheap-flights-from-sydney-to-kathmandu',
'flights/sydney-to-kathmandu-flight',
'flights/flight-from-sydney-to-kathmandu',
'flights/flights-to-nepal-from-brisbane',
'flights/brisbane-to-nepal-flights',
'flights/brisbane-to-ktm-flights',
'flights/bne-to-ktm',
'flights/flights-to-kathmandu-from-brisbane',
'flights/brisbane-to-kathmandu-flight',
'flights/flight-deals-from-adelaide-to-kathmandu',
'flights/adelaide-to-uk-flights',
'flights/melbourne-to-london-flights',
'flights/brisbane-to-london-flight',
'flights/perth-to-london-flight',
'flights/brisbane-to-ktm-flight',
'flights/melbourne-to-sydney-cheap-flights',
'homepage',


    
  ];

  // Normalize route by removing leading slash if present
  const normalizedRoute = route.startsWith('/') ? route.substring(1) : route;

  // Check if the route matches any excluded pattern
  return excludedPatterns.some((pattern) => {
    // Exact match or starts with pattern + "/"
    return (
      normalizedRoute === pattern ||
      normalizedRoute.startsWith(pattern + '/') ||
      // Also check with trailing slash
      (pattern.endsWith('/') && normalizedRoute.startsWith(pattern))
    );
  });
}

// Generate sitemap XML content
function generateSitemap(routes, staticRoutes, apiRoutes, airlineRoutes) {
  // Filter out dynamic routes and excluded routes
  const filteredRoutes = routes.filter((route) => {
    const shouldInclude = !isDynamicRoute(route) && !shouldExcludeRoute(route);
    return shouldInclude;
  });

  // Ensure home page route (/) is included
  if (!filteredRoutes.includes('/')) {
    filteredRoutes.unshift('/');
  }

  // Combine static routes (from ROUTE_SEO_DATA) and API routes
  // Remove duplicates by using a Set
  const allRouteKeys = new Set([...staticRoutes, ...apiRoutes]);

  // Convert to array and map to URL paths
  const allRoutePaths = Array.from(allRouteKeys).map((route) => `/${route}`);

  // Add all routes: static pages, route pages (static + API), and airline routes
  const allRoutes = [...filteredRoutes, ...allRoutePaths, ...airlineRoutes];

  console.log(
    'Routes EXCLUDED from sitemap:',
    routes.filter((route) => shouldExcludeRoute(route))
  );
  console.log(
    `Static page routes included in sitemap: ${filteredRoutes.length}`
  );
  console.log(
    `Static flight routes (from ROUTE_SEO_DATA): ${staticRoutes.length}`
  );
  console.log(`Dynamic flight routes (from API): ${apiRoutes.length}`);
  console.log(`Total unique flight routes: ${allRoutePaths.length}`);
  console.log(`Airline routes included in sitemap: ${airlineRoutes.length}`);
  console.log(`Total routes in sitemap: ${allRoutes.length}`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
  <url>
    <loc>${WEBSITE_URL}${route.startsWith('/') ? route : '/' + route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return sitemap;
}

// Main function
async function main() {
  try {
    // Adjust paths for monorepo structure
    const appDir = path.join(__dirname, '..');
    const pagesDir = path.join(appDir, 'src/pages');

    console.log('Generating sitemap from pages directory:', pagesDir);
    console.log('Using website URL:', WEBSITE_URL);
    console.log('Using API base URL:', API_BASE_URL);
    console.log('Environment variables:');
    console.log(
      '  NEXT_PUBLIC_REST_API:',
      process.env.NEXT_PUBLIC_REST_API || '(not set)'
    );
    console.log('  API_BASE_URL:', process.env.API_BASE_URL || '(not set)');
    console.log('  SKIP_API_CALL:', SKIP_API_CALL);

    // Get all page files
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: pagesDir });

    // Extract routes from file paths
    const routes = files.map((file) => extractRouteFromFilePath(file));

    console.log(`All page routes found: ${routes.length}`);

    // Extract static routes from ROUTE_SEO_DATA in [route].tsx
    const staticRoutes = extractRouteDataFromFile();

    // Fetch dynamic routes from API (optional - will use static routes if API fails)
    console.log('Fetching dynamic routes from API...');
    console.log(`API URL: ${API_BASE_URL}/route/page?page=1&limit=2000`);
    let apiRoutes = await fetchDynamicRoutesFromAPI();

    if (apiRoutes.length === 0) {
      console.log(
        'ℹ️  No routes fetched from API. Using static routes from ROUTE_SEO_DATA only.'
      );
    } else {
      // Filter API routes to exclude specified patterns
      const originalCount = apiRoutes.length;
      apiRoutes = apiRoutes.filter((route) => !shouldExcludeRoute(route));
      console.log(`Filtered API routes: ${apiRoutes.length} routes (excluded ${originalCount - apiRoutes.length} routes)`);
    }

    // Extract airline routes
    const airlineRoutes = extractAirlineRoutes();

    // Generate sitemap content with static routes, API routes, and airline routes
    const sitemap = generateSitemap(
      routes,
      staticRoutes,
      apiRoutes,
      airlineRoutes
    );

    // Write sitemap to file
    const publicDir = path.join(appDir, 'public');

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log('Sitemap generated successfully at:', sitemapPath);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

main();
