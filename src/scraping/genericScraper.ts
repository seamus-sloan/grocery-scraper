/// <reference path="../shared-types.ts" />

// Generic scraper engine that works with store configurations
// Auto-detects which store it's running on and uses appropriate config
(function() {
  'use strict';
  
  // Auto-detect which store we're on based on URL
  const detectStore = (): StoreKey | null => {
    const hostname = window.location.hostname;

    if (hostname.includes('kroger.com')) return 'kroger';
    if (hostname.includes('meijer.com')) return 'meijer';
    if (hostname.includes('aldi.us')) return 'aldi';
    if (hostname.includes('walmart.com')) return 'walmart';
    if (hostname.includes('costco.com')) return 'costco';
    
    console.error('[GenericScraper] Unknown store:', hostname);
    return null;
  };
  
  // Helper function to safely extract text from an element
  const extractText = (container: Element, selector: string | null): string => {
    if (!selector) return '';
    const element = container.querySelector(selector);
    return element ? element.textContent?.trim() || '' : '';
  };

  // Helper function to safely extract image URL
  const extractImage = (container: Element, selector: string | null): string => {
    if (!selector) return '';
    const element = container.querySelector(selector);
    if (!element) return '';
    const img = element as HTMLImageElement;
    return img.src || img.srcset?.split(' ')[0] || '';
  };

  // Helper function to check conditions
  const checkCondition = (container: Element, fieldConfig: FieldConfig): boolean => {
    if (!fieldConfig || !fieldConfig.condition) return false;
    
    if (fieldConfig.selector) {
      const element = container.querySelector(fieldConfig.selector);
      return fieldConfig.condition(element);
    }
    
    return fieldConfig.condition(container);
  };

  interface Scraper {
    scrapeProducts: () => Product[];
    waitAndScrape: () => void;
    sendResults: (results: Product[]) => void;
  }

  // Main scraper function
  const createScraper = (storeKey: StoreKey): Scraper | null => {
    const config: StoreScrapingConfig = (window as any).STORE_CONFIGS[storeKey];
    if (!config) {
      console.error(`[GenericScraper] Unknown store: ${storeKey}`);
      return null;
    }
    
    console.log(`[GenericScraper] Creating scraper for ${config.name}`);
    
    let resultsSent = false;
    
    const scrapeProducts = (): Product[] => {
      console.log(`[${config.name}] Starting to scrape products`);
      const products: Product[] = [];
      const containers = document.querySelectorAll(config.productSelector);
      
      console.log(`[${config.name}] Found ${containers.length} product containers`);
      
      containers.forEach((container, index) => {
        try {
          let name = '';
          let price = '';
          let image = '';
          
          // Handle special cases for stores with custom extractors
          if (config.nameExtractor) {
            name = config.nameExtractor(container);
          } else {
            name = extractText(container, config.fields.name);
          }
          
          if (config.imageExtractor) {
            image = config.imageExtractor(container);
          } else {
            image = extractImage(container, config.fields.image);
          }
          
          // Handle price parsing
          if (config.fields.price === null) {
            // Use custom price parser with container (for complex stores like Meijer, Costco)
            price = config.priceParser ? config.priceParser(container) : '';
          } else {
            // Get the price element first, then use parser if available
            const priceElement = container.querySelector(config.fields.price);
            if (config.priceParser) {
              // Use custom price parser with the price element
              price = config.priceParser(priceElement);
            } else {
              // Default text extraction
              price = priceElement ? priceElement.textContent?.trim() || '' : '';
            }
          }
          
          // Check for discounts and sales
          const discount = checkCondition(container, config.fields.discount);
          const sale = checkCondition(container, config.fields.sale);
          const salesDesc = sale ? extractText(container, config.fields.salesDesc) : '';
          
          if (name && price) {
            products.push({
              name,
              price,
              image,
              discount,
              sale,
              salesDesc
            });
          } else {
            console.log(`[${config.name}] Skipping product ${index} - missing name or price:`, { name, price });
          }
        } catch (error) {
          console.error(`[${config.name}] Error scraping product ${index}:`, error);
        }
      });
      
      console.log(`[${config.name}] Scraped ${products.length} products`);
      return products;
    };
    
    const sendResults = (results: Product[]): void => {
      if (resultsSent) return;
      resultsSent = true;
      
      console.log(`[${config.name}] Sending results:`, results);
      chrome.runtime.sendMessage({
        action: `${storeKey}Results`,
        results: results,
        searchUrl: window.location.href
      });
    };
    
    const waitAndScrape = (): void => {
      let attempt = 1;
      
      const tryScape = (): void => {
        const containers = document.querySelectorAll(config.productSelector);
        console.log(`[${config.name}] Attempt ${attempt}: Found ${containers.length} product containers`);
        
        if (containers.length > 0) {
          const results = scrapeProducts();
          if (results.length > 0) {
            sendResults(results);
            return;
          }
        }
        
        if (attempt < config.maxRetries) {
          attempt++;
          setTimeout(tryScape, config.retryInterval);
        } else {
          console.log(`[${config.name}] No products found after ${config.maxRetries} attempts`);
          sendResults([]);
        }
      };
      
      tryScape();
    };
    
    return {
      scrapeProducts,
      waitAndScrape,
      sendResults
    };
  };
  
  // Auto-initialize when script loads
  const init = (): void => {
    const storeKey = detectStore();
    if (!storeKey) return;
    
    console.log(`[GenericScraper] Detected store: ${storeKey}`);
    
    // Special handling for Costco no-results page
    if (storeKey === 'costco' && window.location.href.includes('no-search-results-grocery.html')) {
      console.log('[Costco Content] On no results page, sending empty results');
      chrome.runtime.sendMessage({
        action: 'costcoResults',
        results: [],
        searchUrl: window.location.href
      });
      return;
    }
    
    // Wait for configs to be available, then create and run scraper
    const waitForConfigs = (): void => {
      if (typeof (window as any).STORE_CONFIGS === 'undefined') {
        setTimeout(waitForConfigs, 50);
        return;
      }
      
      const scraper = createScraper(storeKey);
      if (scraper) {
        scraper.waitAndScrape();
      }
    };
    
    waitForConfigs();
  };
  
  // Start the process
  init();
  
})();