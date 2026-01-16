const fs = require('fs');
const path = require('path');

// Function to generate robots.txt
function generateRobotsTxt() {
  // Determine environment - can be set via environment variable
  const environment =
    process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'production';

  // Use hardcoded website URL
  const WEBSITE_URL = 'https://skytrips.com.au';

  console.log('Generating robots.txt for environment:', environment);
  console.log('Using website URL:', WEBSITE_URL);

  // Create robots.txt content based on environment
  let robotsTxt;

  if (environment === 'production') {
    // Production: Allow crawlers with restrictions
    robotsTxt = `# Allow all crawlers
User-agent: *
Disallow: /flights-results
Disallow: /book
Disallow: /_app
Disallow: /_next/
Disallow: /confirmation
Disallow: /itinerary
Disallow: /airlines/[airline]
Disallow: /flight-result-backup
Disallow: /flight-result-backup/
Disallow: /homepage



Sitemap: ${WEBSITE_URL}/sitemap.xml
`;
    console.log('✅ Production mode - allowing crawlers with restrictions');
  } else {
    // Dev/UAT: Block all crawlers
    robotsTxt = `# Disallow all crawlers in non-production environments (${environment})
User-agent: *
Disallow: /
`;
    console.log(
      `⚠️  ${environment.toUpperCase()} mode - blocking all crawlers`
    );
  }

  try {
    // Adjust paths for monorepo structure
    const appDir = path.join(__dirname, '..');
    const publicDir = path.join(appDir, 'public');

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const robotsPath = path.join(publicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);

    console.log('✅ robots.txt generated successfully at:', robotsPath);
    console.log('Content:');
    console.log(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
  }
}

// Run the function
generateRobotsTxt();
