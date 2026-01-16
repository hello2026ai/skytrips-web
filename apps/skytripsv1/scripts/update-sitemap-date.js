const fs = require('fs');
const path = require('path');

// Function to update lastmod dates in sitemap.xml
function updateSitemapDates() {
  // Adjust path for monorepo structure
  const appDir = path.join(__dirname, '..');
  const sitemapPath = path.join(appDir, 'public', 'sitemap.xml');

  console.log('Updating sitemap dates at:', sitemapPath);

  // Check if sitemap.xml exists
  if (!fs.existsSync(sitemapPath)) {
    console.error('Error: sitemap.xml not found at', sitemapPath);
    return;
  }

  try {
    // Read sitemap.xml content
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Get current date in ISO format
    const currentDate = new Date().toISOString();

    // Replace all lastmod dates with current date
    sitemapContent = sitemapContent.replace(
      /<lastmod>.*?<\/lastmod>/g,
      `<lastmod>${currentDate}</lastmod>`
    );

    // Write updated content back to sitemap.xml
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

    console.log('Sitemap dates updated successfully to:', currentDate);
  } catch (error) {
    console.error('Error updating sitemap dates:', error);
  }
}

// Run the function
updateSitemapDates();
