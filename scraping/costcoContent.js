console.log('[Costco Content] Script loaded');

let resultsSent = false; // Guard to prevent multiple sends

// Check if we're on the no results page
function isNoResultsPage() {
  return window.location.href.includes('no-search-results-grocery.html');
}

function scrapeCostcoProducts() {
  console.log('[Costco Content] Starting to scrape products');
  
  const products = [];
  
  // Find all product containers - they have data-testid starting with "ProductTile_"
  const productContainers = document.querySelectorAll('[data-testid^="ProductTile_"]');
  console.log('[Costco Content] Found', productContainers.length, 'product containers');
  
  productContainers.forEach((container, index) => {
    try {
      // Extract product ID from the data-testid attribute
      const testId = container.getAttribute('data-testid');
      const productId = testId ? testId.replace('ProductTile_', '') : '';
      
      if (!productId) {
        console.log('[Costco Content] Skipping product', index, '- no product ID found');
        return;
      }
      
      // Get product title using the product ID
      const titleElement = container.querySelector(`[data-testid="Text_ProductTile_${productId}_title"]`);
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      if (!title) {
        console.log('[Costco Content] Skipping product', index, '- no title found');
        return;
      }
      
      // Get price using the product ID
      const priceElement = container.querySelector(`[data-testid="Text_Price_${productId}"]`);
      const price = priceElement ? priceElement.textContent.trim() : '';
      
      if (!price) {
        console.log('[Costco Content] Skipping product - no price found:', title);
        return;
      }
      
      // Get product image using the product ID
      let imageUrl = '';
      const imageContainer = container.querySelector(`[data-testid="ProductImage_${productId}"]`);
      if (imageContainer) {
        const imageElement = imageContainer.querySelector('img');
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
      }
      
      products.push({
        name: title,
        price: price,
        store: 'Costco',
        imageUrl: imageUrl
      });
      
      console.log('[Costco Content] Found product:', { title, price, imageUrl });
      
    } catch (error) {
      console.error('[Costco Content] Error processing product', index, ':', error);
    }
  });
  
  console.log('[Costco Content] Scraped', products.length, 'products total');
  return products;
}

function waitForProducts() {
  console.log('[Costco Content] Waiting for products to load');
  
  // Check if we're on the no results page
  if (isNoResultsPage()) {
    console.log('[Costco Content] Detected no results page, returning empty results');
    if (!resultsSent) {
      resultsSent = true;
      chrome.runtime.sendMessage({
        action: 'costcoResults',
        results: []
      });
    }
    return;
  }
  
  let attempts = 0;
  const maxAttempts = 20; // Wait up to 10 seconds
  
  const checkForProducts = () => {
    attempts++;
    console.log('[Costco Content] Check attempt', attempts);
    
    // Double-check if we got redirected during our waiting
    if (isNoResultsPage()) {
      console.log('[Costco Content] Redirected to no results page during wait');
      if (!resultsSent) {
        resultsSent = true;
        chrome.runtime.sendMessage({
          action: 'costcoResults',
          results: []
        });
      }
      return;
    }
    
    const productContainers = document.querySelectorAll('[data-testid^="ProductTile_"]');
    
    if (productContainers.length > 0) {
      console.log('[Costco Content] Products found, starting scrape');
      const products = scrapeCostcoProducts();
      
      if (!resultsSent) {
        resultsSent = true;
        console.log('[Costco Content] Sending results to background script');
        chrome.runtime.sendMessage({
          action: 'costcoResults',
          results: products
        });
      }
      
    } else if (attempts < maxAttempts) {
      console.log('[Costco Content] No products yet, retrying in 500ms');
      setTimeout(checkForProducts, 500);
    } else {
      console.log('[Costco Content] No products found after', maxAttempts, 'attempts');
      
      if (!resultsSent) {
        resultsSent = true;
        chrome.runtime.sendMessage({
          action: 'costcoResults',
          results: []
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

console.log('[Costco Content] Script setup complete');
