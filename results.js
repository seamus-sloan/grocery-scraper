// JavaScript for results page
(function() {
  // Fixed store order
  const STORE_ORDER = ['Kroger', 'Meijer', 'Aldi', 'Walmart', 'Costco'];
  
  // Store name to CSS class mapping
  const STORE_CLASSES = {
    'Kroger': 'store-kroger',
    'Meijer': 'store-meijer', 
    'Aldi': 'store-aldi',
    'Walmart': 'store-walmart',
    'Costco': 'store-costco'
  };

  function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      term: urlParams.get('term') || 'Unknown'
    };
  }

  function sortStoresByOrder(results) {
    return results.sort((a, b) => {
      const indexA = STORE_ORDER.indexOf(a.name);
      const indexB = STORE_ORDER.indexOf(b.name);
      
      // If store not found in order, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }

  function toggleMoreResults(button) {
    const storeColumn = button.closest('.store-column');
    const hiddenItems = storeColumn.querySelectorAll('.hidden-item');
    const hiddenCount = parseInt(button.dataset.hiddenCount);
    
    // Check if items are currently hidden
    const isHidden = hiddenItems[0]?.hasAttribute('hidden');
    
    if (isHidden) {
      // Show all hidden items
      hiddenItems.forEach(item => item.removeAttribute('hidden'));
      button.textContent = 'Show less';
    } else {
      // Hide all extra items
      hiddenItems.forEach(item => item.setAttribute('hidden', ''));
      button.textContent = `Show ${hiddenCount} more`;
    }
  }

  function displayResults(results, searchTerm) {
    document.getElementById('searchTerm').textContent = `Results for "${searchTerm}"`;
    
    const resultsContainer = document.getElementById('results');
    
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div class="loading">No results found.</div>';
      return;
    }

    // Sort stores in fixed order
    const sortedResults = sortStoresByOrder(results);
    
    let html = '<div class="stores-container">';
    
    sortedResults.forEach(store => {
      const items = store.items;
      const initialItems = items.slice(0, 15); // Show first 15 items
      const hiddenItems = items.slice(15); // Rest of the items
      const storeClass = STORE_CLASSES[store.name] || '';

      html += `
        <div class="store-column ${storeClass}">
          <div class="store-header">${store.name}</div>
          <div class="products-list">
            ${initialItems.map(item => `
              <div class="product-item${item.discount ? ' has-discount' : ''}">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="product-image" onerror="this.style.display='none'">` : ''}
                <div class="product-details">
                  <div class="product-name">${item.name}</div>
                  <div class="product-price">${item.price}</div>
                  ${item.sale ? `<div class="sale-info" title="${item.sales_desc}">${item.sales_desc}</div>` : ''}
                </div>
              </div>
            `).join('')}
            ${hiddenItems.map(item => `
              <div class="product-item hidden-item${item.discount ? ' has-discount' : ''}" hidden>
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="product-image" onerror="this.style.display='none'">` : ''}
                <div class="product-details">
                  <div class="product-name">${item.name}</div>
                  <div class="product-price">${item.price}</div>
                  ${item.sale ? `<div class="sale-info" title="${item.sales_desc}">${item.sales_desc}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ${hiddenItems.length > 0 ? `
            <div class="show-more-section">
              <button class="show-more-btn" data-hidden-count="${hiddenItems.length}">
                Show ${hiddenItems.length} more
              </button>
            </div>
          ` : ''}
        </div>
      `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
    
    // Add event listeners to show-more buttons
    const showMoreButtons = resultsContainer.querySelectorAll('.show-more-btn');
    showMoreButtons.forEach(button => {
      button.addEventListener('click', function() {
        toggleMoreResults(this);
      });
    });
  }

  function pollForResults() {
    const { term } = getUrlParams();
    
    chrome.storage.local.get(['searchResults', 'currentSearchTerm'], (result) => {
      console.log('Polling for results:', result);
      console.log('Looking for term:', term);
      
      if (result.searchResults) {
        console.log('Found results, displaying...');
        displayResults(result.searchResults, term);
      } else {
        console.log('No results yet, polling again...');
        // Keep polling for results
        setTimeout(pollForResults, 500);
      }
    });
  }

  // Initialize
  const { term } = getUrlParams();
  document.getElementById('searchTerm').textContent = `Searching for "${term}"...`;
  pollForResults();
})();
