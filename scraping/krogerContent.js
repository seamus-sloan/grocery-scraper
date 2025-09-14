// Content script to scrape Kroger search results

(function() {
  function scrapeKroger() {
    const items = [];
    document.querySelectorAll('.ProductCard').forEach(card => {
      const nameElement = card.querySelector('.kds-Text--l[data-testid="cart-page-item-description"]');
      const name = nameElement ? nameElement.textContent.trim() : '';

      const priceElement = card.querySelector('data[data-qa="cart-page-item-price"]');
      const price = "$" + (priceElement ? priceElement.getAttribute('value') : '');

      const imageElement = card.querySelector('img[data-testid="product-image-loaded"]');
      const imageUrl = imageElement ? imageElement.src : '';
      
      // Check for discount (promotional pricing) - only if it has decorated but NOT plain
      const promotionalElement = card.querySelector('.kds-Price-promotional');
      const isDiscount = promotionalElement && 
                        promotionalElement.classList.contains('kds-Price-promotional--decorated') && 
                        !promotionalElement.classList.contains('kds-Price-promotional--plain');
      
      // Check for sale and get sale description
      const saleElement = card.querySelector('[data-testid="savings-zone-text"]');
      const isSale = saleElement !== null;
      const salesDesc = isSale ? saleElement.textContent.trim() : '';
      
      if (name && price) {
        items.push({ 
          name, 
          price, 
          imageUrl,
          discount: isDiscount,
          sale: isSale,
          sales_desc: salesDesc
        });
      }
    });
    return items;
  }
  
  function waitForProductsAndScrape(maxAttempts = 20, interval = 1_000) {
    let attempts = 0;
    let resultsSent = false;
    
    function tryScrape() {
      if (resultsSent) return; // Prevent multiple sends
      
      const cards = document.querySelectorAll('.ProductCard');
      console.log(`[KrogerContent] Attempt ${attempts+1}: Found ${cards.length} product cards.`);
      if (cards.length > 0) {
        const results = scrapeKroger();
        console.log('[KrogerContent] Scraped results:', results);
        chrome.runtime.sendMessage({ 
          action: 'krogerResults', 
          results,
          searchUrl: window.location.href
        });
        resultsSent = true;
      } else if (++attempts < maxAttempts) {
        setTimeout(tryScrape, interval);
      } else {
        console.log('[KrogerContent] No products found after waiting.');
        chrome.runtime.sendMessage({ 
          action: 'krogerResults', 
          results: [],
          searchUrl: window.location.href
        });
        resultsSent = true;
      }
    }
    tryScrape();
  }
  
  waitForProductsAndScrape();
})();
