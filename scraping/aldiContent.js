// Content script to scrape Aldi search results

(function() {
  function scrapeAldi() {
    const items = [];
    document.querySelectorAll('.product-tile').forEach(card => {
      const nameElement = card.querySelector('.product-tile__name p');
      const name = nameElement ? nameElement.textContent.trim() : '';

      const priceElement = card.querySelector('.product-tile__price');
      const price = priceElement ? priceElement.textContent.trim() : '';

      const imageElement = card.querySelector('.base-image');
      const imageUrl = imageElement ? imageElement.src : '';
      
      // Aldi doesn't seem to show discounts on their website based on the HTML
      const isDiscount = false;
      
      // No sale info visible in the HTML structure
      const isSale = false;
      const salesDesc = '';
      
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
      
      const cards = document.querySelectorAll('.product-tile');
      console.log(`[AldiContent] Attempt ${attempts+1}: Found ${cards.length} product tiles.`);
      if (cards.length > 0) {
        const results = scrapeAldi();
        console.log('[AldiContent] Scraped results:', results);
        chrome.runtime.sendMessage({ action: 'aldiResults', results });
        resultsSent = true;
      } else if (++attempts < maxAttempts) {
        setTimeout(tryScrape, interval);
      } else {
        console.log('[AldiContent] No products found after waiting.');
        chrome.runtime.sendMessage({ action: 'aldiResults', results: [] });
        resultsSent = true;
      }
    }
    tryScrape();
  }
  
  waitForProductsAndScrape();
})();
