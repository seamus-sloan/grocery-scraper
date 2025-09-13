// JavaScript for results page
(function() {
  function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      term: urlParams.get('term') || 'Unknown'
    };
  }

  function toggleMoreResults(button) {
    const storeSection = button.closest('.store-section');
    const hiddenItems = storeSection.querySelectorAll('.hidden-item');
    const showMoreSection = button.closest('.show-more-section');
    const hiddenCount = parseInt(button.dataset.hiddenCount);
    
    // Check if items are currently hidden
    const isHidden = hiddenItems[0]?.hasAttribute('hidden');
    
    if (isHidden) {
      // Show all hidden items
      hiddenItems.forEach(item => item.removeAttribute('hidden'));
      button.textContent = 'Show less';
      // Move the button to the bottom by moving the show-more-section after the product-grid
      const productGrid = storeSection.querySelector('.product-grid');
      productGrid.after(showMoreSection);
    } else {
      // Hide all extra items
      hiddenItems.forEach(item => item.setAttribute('hidden', ''));
      button.textContent = `Show ${hiddenCount} more results`;
      // Move the button back to its original position (after the visible items)
      const productGrid = storeSection.querySelector('.product-grid');
      productGrid.after(showMoreSection);
    }
  }

  function displayResults(results, searchTerm) {
    document.getElementById('searchTerm').textContent = `Results for "${searchTerm}"`;
    
    const resultsContainer = document.getElementById('results');
    
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div class="loading">No results found.</div>';
      return;
    }

    const html = results.map(store => {
      const items = store.items;
      const initialItems = items.slice(0, 5); // Show first 5 items (roughly 2 rows on most screens)
      const hiddenItems = items.slice(5); // Rest of the items

      return `
        <div class="store-section">
          <div class="store-header">${store.name}</div>
          <div class="product-grid">
            ${initialItems.map(item => `
              <div class="product-card">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="product-image">` : ''}
                <div class="product-name">${item.name}</div>
                <div class="product-price">
                  ${item.price}
                  ${item.discount ? '<span class="discount-badge">DISCOUNT</span>' : ''}
                </div>
                ${item.sale ? `<div class="sale-info">${item.sales_desc}</div>` : ''}
              </div>
            `).join('')}
            ${hiddenItems.map(item => `
              <div class="product-card hidden-item" hidden>
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="product-image">` : ''}
                <div class="product-name">${item.name}</div>
                <div class="product-price">
                  ${item.price}
                  ${item.discount ? '<span class="discount-badge">DISCOUNT</span>' : ''}
                </div>
                ${item.sale ? `<div class="sale-info">${item.sales_desc}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ${hiddenItems.length > 0 ? `
            <div class="show-more-section">
              <button class="show-more-btn" data-hidden-count="${hiddenItems.length}">
                Show ${hiddenItems.length} more results
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = html;
    
    // Debug: Check hidden items
    const hiddenItems = resultsContainer.querySelectorAll('.hidden-item');
    console.log(`Found ${hiddenItems.length} hidden items after HTML insertion`);
    hiddenItems.forEach((item, index) => {
      console.log(`Hidden item ${index}:`, item.hasAttribute('hidden'), item.offsetHeight);
    });
    
    // Add event listeners to show-more buttons after HTML is inserted
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
