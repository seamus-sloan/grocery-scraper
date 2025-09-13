// Content script to scrape Meijer search results

(function () {
    function scrapeMeijer() {
        const items = [];
        const productTiles = document.querySelectorAll('.product-tile');

        productTiles.forEach((card, index) => {
            const nameElement = card.querySelector('.ads-type-heading-07');
            const name = nameElement ? nameElement.textContent.trim() : '';

            // Try sale price first, then regular price
            let priceElement = card.querySelector('.product-tile__sale-price span:not(.sr-only)');
            let price = '';
            let isDiscount = false;


            if (priceElement && priceElement.textContent.trim()) {
                // Use the sale price text as displayed
                price = priceElement.textContent.trim();
                isDiscount = true; // If there's a sale price, it's discounted
            } else {
                // No sale price, get regular price - including units if present
                const regularPriceContainer = card.querySelector('.product-tile__regular-price');
                if (regularPriceContainer) {
                    // Get the full text including units, but exclude screen reader text
                    const priceText = regularPriceContainer.querySelector('.product-tile__regular-price-text');
                    const unitsText = regularPriceContainer.querySelector('.product-tile__units');

                    price = priceText ? priceText.textContent.trim() : '';
                    if (unitsText && unitsText.textContent.trim()) {
                        price = `${price} ${unitsText.textContent.trim()}`;
                    }
                } else {
                    // Fallback to just the price text element
                    priceElement = card.querySelector('.product-tile__regular-price-text');
                    price = priceElement ? priceElement.textContent.trim() : '';
                }
            }

            const imageElement = card.querySelector('.product-tile__image');
            const imageUrl = imageElement ? imageElement.src : '';

            // Check for sale info
            const savingsElement = card.querySelector('.product-tile__savings-price');
            const isSale = savingsElement !== null;
            const salesDesc = isSale ? savingsElement.textContent.trim() : '';


            if (name && price) {
                const item = {
                    name,
                    price,
                    imageUrl,
                    discount: isDiscount,
                    sale: isSale,
                    sales_desc: salesDesc
                };
                items.push(item);
            } else {
            }
        });

        return items;
    }

    function waitForProductsAndScrape(maxAttempts = 20, interval = 1_000) {
        let attempts = 0;
        let resultsSent = false;

        function tryScrape() {
            if (resultsSent) return; // Prevent multiple sends
            
            attempts++;

            const cards = document.querySelectorAll('.product-tile');

            if (cards.length > 0) {
                const results = scrapeMeijer();
                chrome.runtime.sendMessage({ action: 'meijerResults', results });
                resultsSent = true;
            } else if (attempts < maxAttempts) {

                // Debug: Log some page content to see what's there
                const bodyText = document.body?.textContent?.substring(0, 200) || 'No body content';

                setTimeout(tryScrape, interval);
            } else {
                chrome.runtime.sendMessage({ action: 'meijerResults', results: [] });
                resultsSent = true;
            }
        }

        // Start trying immediately, but also try again when DOM is fully loaded
        tryScrape();

        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => {
                setTimeout(tryScrape, 1000); // Give it a second after load
            });
        }
    }

    waitForProductsAndScrape();
})();
