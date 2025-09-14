console.log('[Walmart Content] Script loaded');

let resultsSent = false; // Guard to prevent multiple sends

function scrapeWalmartProducts() {
  console.log('[Walmart Content] Starting to scrape products');
  
  const products = [];
  
  // Find all product containers - they have data-item-id attributes
  const productContainers = document.querySelectorAll('div[data-item-id]');
  console.log('[Walmart Content] Found', productContainers.length, 'product containers');
  
  productContainers.forEach((container, index) => {
    try {
      // Get product title
      const titleElement = container.querySelector('[data-automation-id="product-title"]');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      if (!title) {
        console.log('[Walmart Content] Skipping product', index, '- no title found');
        return;
      }
      
      // Get price information
      const priceContainer = container.querySelector('[data-automation-id="product-price"]');
      let price = '';
      let originalPrice = '';
      
      if (priceContainer) {
        // Method 1: Try to get the readable "current price" span
        const currentPriceSpan = priceContainer.querySelector('span.w_iUH7');
        if (currentPriceSpan) {
          const priceText = currentPriceSpan.textContent.trim();
          // Extract price from "current price $7.47" or similar
          const priceMatch = priceText.match(/current price (\$[\d,.]+)/);
          if (priceMatch) {
            price = priceMatch[1];
          }
        }
        
        // If Method 1 didn't work, Method 2: Try to construct price from separate spans
        if (!price) {
          const priceMainDiv = priceContainer.querySelector('div[aria-hidden="true"]');
          if (priceMainDiv) {
            const dollarSpan = priceMainDiv.querySelector('span[style*="margin-right"]'); // Dollar sign span
            const priceSpans = priceMainDiv.querySelectorAll('span.f2, span.f6'); // Number spans
            
            if (dollarSpan && priceSpans.length > 0) {
              let constructedPrice = '$';
              priceSpans.forEach(span => {
                if (span.textContent.trim() !== '$') {
                  constructedPrice += span.textContent.trim();
                }
              });
              if (constructedPrice !== '$') {
                price = constructedPrice;
              }
            }
          }
        }
        
        // Method 3: Fallback - look for any price pattern in the container
        if (!price) {
          const priceText = priceContainer.textContent;
          const priceMatch = priceText.match(/\$\d+\.?\d*/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }
        
        // Add unit information if available
        if (price) {
          const unitText = priceContainer.querySelector('.gray.f7, .gray.f6-l');
          if (unitText) {
            const unitMatch = unitText.textContent.match(/(each|per|lb|oz|count).*?(?:\s|$)/i);
            if (unitMatch) {
              price = `${price} ${unitMatch[0].trim()}`;
            }
          }
        }
        
        // Look for original/struck-through price for discounted items
        const originalPriceElement = priceContainer.querySelector('.strike');
        if (originalPriceElement) {
          originalPrice = originalPriceElement.textContent.trim();
          // If we have both current and original price, format as "Now $X.XX (was $Y.YY)"
          if (price && originalPrice) {
            price = `${price} (was ${originalPrice})`;
          }
        }
      }
      
      // Get product image
      let imageUrl = '';
      const imageElement = container.querySelector('[data-testid="productTileImage"]');
      if (imageElement) {
        // Prefer src attribute, fallback to srcset if needed
        imageUrl = imageElement.src || '';
        if (!imageUrl && imageElement.srcset) {
          // Extract the first URL from srcset
          const srcsetMatch = imageElement.srcset.match(/https?:\/\/[^\s,]+/);
          if (srcsetMatch) {
            imageUrl = srcsetMatch[0];
          }
        }
      }
      
      if (price) {
        products.push({
          name: title,
          price: price,
          store: 'Walmart',
          imageUrl: imageUrl
        });
        console.log('[Walmart Content] Found product:', { title, price, imageUrl });
      } else {
        console.log('[Walmart Content] Skipping product - no price found:', title);
      }
      
    } catch (error) {
      console.error('[Walmart Content] Error processing product', index, ':', error);
    }
  });
  
  console.log('[Walmart Content] Scraped', products.length, 'products total');
  return products;
}

function waitForProducts() {
  console.log('[Walmart Content] Waiting for products to load');
  
  let attempts = 0;
  const maxAttempts = 20; // Wait up to 10 seconds
  
  const checkForProducts = () => {
    attempts++;
    console.log('[Walmart Content] Check attempt', attempts);
    
    const productContainers = document.querySelectorAll('div[data-item-id]');
    
    if (productContainers.length > 0) {
      console.log('[Walmart Content] Products found, starting scrape');
      const products = scrapeWalmartProducts();
      
      if (!resultsSent) {
        resultsSent = true;
        console.log('[Walmart Content] Sending results to background script');
        chrome.runtime.sendMessage({
          action: 'walmartResults',
          results: products,
          searchUrl: window.location.href
        });
      }
      
    } else if (attempts < maxAttempts) {
      console.log('[Walmart Content] No products yet, retrying in 500ms');
      setTimeout(checkForProducts, 500);
    } else {
      console.log('[Walmart Content] No products found after', maxAttempts, 'attempts');
      
      if (!resultsSent) {
        resultsSent = true;
        chrome.runtime.sendMessage({
          action: 'walmartResults',
          results: [],
          searchUrl: window.location.href
        });
      }
    }
  };
  
  checkForProducts();
}

// Start the scraping process when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForProducts);
} else {
  // Document is already loaded
  setTimeout(waitForProducts, 1000); // Give it a moment for dynamic content
}

console.log('[Walmart Content] Script setup complete');
