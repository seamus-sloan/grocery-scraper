// Store configurations for the generic scraper
const STORE_CONFIGS = {
  kroger: {
    name: 'Kroger',
    productSelector: '.ProductCard',
    fields: {
      name: '.kds-Text--l[data-testid="cart-page-item-description"]',
      price: 'data[data-qa="cart-page-item-price"]',
      image: 'img[data-testid="product-image-loaded"]',
      discount: {
        selector: '.kds-Price-promotional',
        condition: (el) => el && 
          el.classList.contains('kds-Price-promotional--decorated') && 
          !el.classList.contains('kds-Price-promotional--plain')
      },
      sale: {
        selector: '[data-testid="savings-zone-text"]',
        condition: (el) => el !== null
      },
      salesDesc: '[data-testid="savings-zone-text"]'
    },
    priceParser: (priceElement) => {
      return "$" + (priceElement ? priceElement.getAttribute('value') : '');
    },
    maxRetries: 20,
    retryInterval: 1000
  },

  meijer: {
    name: 'Meijer',
    productSelector: '.product-tile',
    fields: {
      name: '.ads-type-heading-07',
      price: null, // Special handling needed
      image: '.product-tile__image',
      discount: {
        selector: '.product-tile__sale-price span:not(.sr-only)',
        condition: (el) => el && el.textContent.trim()
      },
      sale: {
        selector: '.product-tile__savings-price',
        condition: (el) => el !== null
      },
      salesDesc: '.product-tile__savings-price'
    },
    priceParser: (container) => {
      // Try sale price first, then regular price
      let priceElement = container.querySelector('.product-tile__sale-price span:not(.sr-only)');
      let price = '';

      if (priceElement && priceElement.textContent.trim()) {
        price = priceElement.textContent.trim();
      } else {
        // No sale price, get regular price
        const regularPriceContainer = container.querySelector('.product-tile__regular-price');
        if (regularPriceContainer) {
          const priceText = regularPriceContainer.querySelector('.product-tile__regular-price-text');
          const unitsText = regularPriceContainer.querySelector('.product-tile__units');

          price = priceText ? priceText.textContent.trim() : '';
          if (unitsText && unitsText.textContent.trim()) {
            price = `${price} ${unitsText.textContent.trim()}`;
          }
        } else {
          priceElement = container.querySelector('.product-tile__regular-price-text');
          price = priceElement ? priceElement.textContent.trim() : '';
        }
      }
      return price;
    },
    maxRetries: 10,
    retryInterval: 1000
  },

  aldi: {
    name: 'Aldi',
    productSelector: '.product-tile',
    fields: {
      name: '.product-tile__name p',
      price: '.product-tile__price',
      image: '.base-image',
      discount: {
        selector: null,
        condition: () => false // Aldi doesn't show discounts on website
      },
      sale: {
        selector: null,
        condition: () => false // No sale info visible
      },
      salesDesc: null
    },
    priceParser: (priceElement) => {
      return priceElement ? priceElement.textContent.trim() : '';
    },
    maxRetries: 10,
    retryInterval: 1000
  },

  walmart: {
    name: 'Walmart',
    productSelector: 'div[data-item-id]',
    fields: {
      name: '[data-automation-id="product-title"]',
      price: '[data-automation-id="product-price"]',
      image: '[data-testid="productTileImage"]',
      discount: {
        selector: '[data-testid="badgeTagComponent"]',
        condition: (el) => el && el.textContent.toLowerCase().includes('rollback')
      },
      sale: {
        selector: '.product-tile__savings-price',
        condition: (el) => el !== null
      },
      salesDesc: '[data-testid="badgeTagComponent"]'
    },
    priceParser: (priceContainer) => {
      if (!priceContainer) return '';
      
      // Method 1: Try to get the readable "current price" span
      const currentPriceSpan = priceContainer.querySelector('span.w_iUH7');
      if (currentPriceSpan) {
        const priceText = currentPriceSpan.textContent.trim();
        const priceMatch = priceText.match(/current price (\$[\d,.]+)/);
        if (priceMatch) {
          return priceMatch[1];
        }
      }
      
      // Method 2: Try to construct price from separate spans
      const priceMainDiv = priceContainer.querySelector('div[aria-hidden="true"]');
      if (priceMainDiv) {
        const dollarSpan = priceMainDiv.querySelector('span[style*="margin-right"]');
        const priceSpans = priceMainDiv.querySelectorAll('span.f2, span.f6');
        
        if (dollarSpan && priceSpans.length > 0) {
          let constructedPrice = '$';
          priceSpans.forEach(span => {
            constructedPrice += span.textContent.trim();
          });
          return constructedPrice;
        }
      }
      
      // Method 3: Fallback - get all price-related text
      return priceContainer.textContent.trim().split('\n')[0] || '';
    },
    maxRetries: 10,
    retryInterval: 500
  },

  costco: {
    name: 'Costco',
    productSelector: '[data-testid^="ProductTile_"]',
    fields: {
      name: null, // Special handling with product ID
      price: null, // Special handling with product ID
      image: null, // Special handling with product ID
      discount: {
        selector: null,
        condition: () => false // Need to implement discount detection
      },
      sale: {
        selector: null,
        condition: () => false
      },
      salesDesc: null
    },
    priceParser: (container) => {
      // Extract product ID from the data-testid attribute
      const testId = container.getAttribute('data-testid');
      const productId = testId ? testId.replace('ProductTile_', '') : '';
      
      if (!productId) return '';
      
      const priceElement = container.querySelector(`[data-testid="Text_Price_${productId}"]`);
      return priceElement ? priceElement.textContent.trim() : '';
    },
    nameExtractor: (container) => {
      const testId = container.getAttribute('data-testid');
      const productId = testId ? testId.replace('ProductTile_', '') : '';
      
      if (!productId) return '';
      
      const titleElement = container.querySelector(`[data-testid="Text_ProductTile_${productId}_title"]`);
      return titleElement ? titleElement.textContent.trim() : '';
    },
    imageExtractor: (container) => {
      const testId = container.getAttribute('data-testid');
      const productId = testId ? testId.replace('ProductTile_', '') : '';
      
      if (!productId) return '';
      
      const imageContainer = container.querySelector(`[data-testid="ProductImage_${productId}"]`);
      if (imageContainer) {
        const img = imageContainer.querySelector('img');
        return img ? img.src : '';
      }
      return '';
    },
    maxRetries: 10,
    retryInterval: 1000
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STORE_CONFIGS;
} else {
  window.STORE_CONFIGS = STORE_CONFIGS;
}
