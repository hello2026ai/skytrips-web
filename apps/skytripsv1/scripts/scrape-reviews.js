const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://www.google.com/search?q=Skytrips+Travels+and+Tours+Pvt+Ltd&stick=H4sIAAAAAAAA_-NgU1I1qDBKTjRPTEoxNUizTEq0TEmxMqhIS01MMTUC8i0MTRMtzVIWsSoFZ1eWFGUWFCuEFCWWpeYUKyTmpSiE5JcWFSsElJUo-JSkAACcivSMTgAAAA&hl=en&mat=CfzYWRmVwYjmElYBTVDHnpcdRTEbfqVQ2fHvXg6t355UGK63XvYham5RvsV2qgovJMEhFiUjP6lcKhlnzWhmSsYVocS6cEJ6JxYQHw9RQ8Joe9m9KB06_OsOX06C9L8RwQ&authuser=0';

async function scrapeGoogleReviews() {
  console.log('Starting scraper...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  
  // Set User-Agent to mimic a real desktop browser
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to page...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Function to extract reviews from current page state
    const extractReviewsFromPage = async () => {
      return await page.evaluate(() => {
        const reviewElements = document.querySelectorAll('.gws-localreviews__google-review, [data-review-id], .review-snippet');
        const results = [];

        reviewElements.forEach(el => {
          const reviewer = el.querySelector('.TSUbDb, .Y0uHMb, .ui_header_link, .reviewer-name')?.innerText.trim() || 'Anonymous';
          
          const ratingEl = el.querySelector('span[aria-label*="stars"], [role="img"][aria-label*="stars"]');
          const ratingText = ratingEl ? ratingEl.getAttribute('aria-label') : '0';
          const rating = parseFloat(ratingText) || 0;

          const contentElement = el.querySelector('.Jtu6Td, .review-full-text, span[data-expandable-section], .review-snippet-content');
          const content = contentElement ? contentElement.innerText : '';

          const dateElement = el.querySelector('.PUAqLO, .dehysf, .review-date');
          const date = dateElement ? dateElement.innerText : '';
          
          if (content || rating > 0) {
            results.push({
              reviewer,
              rating,
              content: content.replace(/\s+/g, ' ').trim(),
              date,
              metadata: {
                source: 'Google Search'
              }
            });
          }
        });
        return results;
      });
    };

    // 1. Try to find reviews immediately (sometimes they are inline)
    let reviews = await extractReviewsFromPage();
    console.log(`Found ${reviews.length} reviews inline.`);

    // 2. If few reviews, try clicking "Google reviews" link
    if (reviews.length < 3) {
      console.log('Searching for "Google reviews" link...');
      
      const reviewsLink = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('a, span, div'));
        return elements.find(el => 
          el.innerText && 
          (el.innerText.includes('Google reviews') || 
           (el.innerText.includes('reviews') && el.closest('[data-attrid="reviews"]')))
        );
      });
      
      if (reviewsLink && await reviewsLink.jsonValue()) {
        console.log('Found reviews link, clicking...');
        await reviewsLink.asElement().click();
        
        try {
          await page.waitForSelector('.gws-localreviews__general-reviews-block, .review-dialog-list', { timeout: 8000 });
          console.log('Review modal loaded.');
          
          // Scroll
          const scrollableSelector = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div'));
            return divs.reduce((max, el) => {
              if (el.scrollHeight > el.clientHeight && el.clientHeight > 100) {
                 return (!max || el.scrollHeight > max.scrollHeight) ? el : max;
              }
              return max;
            }, null)?.className || null;
          });

          if (scrollableSelector) {
            const className = scrollableSelector.split(' ')[0];
            const scrollableDiv = await page.$(`.${className}`);
            if (scrollableDiv) {
              for (let i = 0; i < 3; i++) {
                await page.evaluate(element => {
                  element.scrollTop = element.scrollHeight;
                }, scrollableDiv);
                await new Promise(r => setTimeout(r, 1500));
              }
            }
          }
          
          // Re-extract after opening modal
          const modalReviews = await extractReviewsFromPage();
          if (modalReviews.length > reviews.length) {
            reviews = modalReviews;
          }
          
        } catch (e) {
          console.log('Modal did not load as expected, using whatever reviews were found.');
        }
      } else {
        console.log('Could not find "Google reviews" link.');
      }
    }

    console.log(`Final count: Extracted ${reviews.length} reviews.`);

    // Format output
    const output = {
      reviews: reviews
    };

    // Save to file
    const outputPath = path.join(__dirname, '../../google_reviews.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Saved reviews to ${outputPath}`);

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeGoogleReviews();
