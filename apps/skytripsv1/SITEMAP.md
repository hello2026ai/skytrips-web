# SkyTrips Sitemap Implementation

This document outlines how the sitemap for SkyTrips flight booking website is implemented and maintained.

## Overview

A sitemap is an XML file that lists the URLs of a website along with additional metadata about each URL (when it was last updated, how often it changes, and how important it is relative to other URLs). Search engines like Google read this file to more intelligently crawl your site.

## Files Created

1. `public/sitemap.xml` - The actual sitemap file that will be served to search engines
2. `public/robots.txt` - Instructions for search engine crawlers
3. `scripts/generate-sitemap.js` - Script to auto-generate the sitemap based on your pages directory
4. `scripts/update-sitemap-date.js` - Script to update lastmod dates in the sitemap
5. `scripts/generate-robots.js` - Script to generate robots.txt with the site URL

## Website URL Configuration

The sitemap and robots.txt files use the hardcoded website URL: `https://skytrips.com.au`.

To change this URL in the future, you'll need to update it in these files:

- `apps/skytripsv1/scripts/generate-sitemap.js`
- `apps/skytripsv1/scripts/generate-robots.js`
- `apps/skytripsv1/next.config.js` (in the env.SITE_URL property)

## Excluded Pages

The following pages are excluded from the sitemap and blocked from search engine crawling:

- `/flights-results` - Flight search results pages (dynamic content not meant to be indexed)
- `/book` - Booking pages (contain sensitive transaction information)
- `/_app` - Next.js application file
- `/_next` - Next.js internal files
- All API routes
- Next.js internal pages (\_app, \_document, etc.)
- Error pages (404, 500)

To change the excluded pages, update the `shouldExcludeRoute` function in `scripts/generate-sitemap.js` and the `Disallow` directives in `scripts/generate-robots.js`.

## How It Works

### Automatic Generation

- The sitemap and robots.txt are automatically generated during the build process using `next build`
- This happens through the `build:skytripsv1` script in the root `package.json`
- The scripts scan your `pages` directory and create URLs for each page, excluding any pages that should not be indexed

### Manual Updates

The current sitemap includes:

- Main pages (Home, About, Team, etc.)
- Popular domestic flight routes
- Popular international flight routes
- Popular airlines

### When to Update Manually

You should update the sitemap manually when:

1. Adding new important pages to your website
2. Creating new landing pages for specific routes
3. Adding new airline partners
4. Restructuring URLs
5. Changing which pages should be excluded from indexing

## How to Update the Sitemap

### Generate Robots.txt

Run this command to generate robots.txt:

```
yarn generate-robots
```

### Automatic Date Updates

Run this command to update all "lastmod" dates to the current date:

```
yarn update-sitemap-date
```

### Regenerating the Entire Sitemap

Run this command to re-generate the sitemap:

```
yarn generate-sitemap
```

### Manual Editing

For more precise control, you can directly edit `public/sitemap.xml`. The format is:

```xml
<url>
  <loc>https://skytrips.com.au/your-page</loc>
  <lastmod>2023-12-01T00:00:00+00:00</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

Where:

- `loc`: The full URL of the page
- `lastmod`: When the page was last modified (ISO 8601 format)
- `changefreq`: How frequently the page changes (always, hourly, daily, weekly, monthly, yearly, never)
- `priority`: The importance of this page relative to other pages (0.0 to 1.0)

## Best Practices

1. Keep your sitemap up to date with the current structure of your website
2. Don't include pages that are blocked by robots.txt
3. Include only canonical URLs (avoid duplicates)
4. Use lower priority values for less important pages
5. Resubmit your sitemap in Google Search Console after major updates

## Testing Your Sitemap

1. Access your sitemap at: https://skytrips.com.au/sitemap.xml
2. Validate it using [Google's Sitemap Testing Tool](https://search.google.com/search-console)
3. Check for errors in Google Search Console after submission

## SEO Benefits

A well-maintained sitemap can help:

- Improve search engine discovery of your site
- Provide information about your site structure
- Help search engines understand update frequency
- Prioritize important content

By maintaining your sitemap, you're helping search engines better index your site, which can lead to improved rankings and visibility.
