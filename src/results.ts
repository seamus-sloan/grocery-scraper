/// <reference path="./shared-types.ts" />

// JavaScript for results page
(function() {
  // Fixed store order
  const STORE_ORDER = ['Kroger', 'Meijer', 'Aldi', 'Walmart', 'Costco'];
  
  // Store name to gradient class mapping for headers
  const STORE_HEADER_GRADIENTS: Record<string, string> = {
    'Kroger': 'bg-gradient-to-r from-blue-700 to-blue-600',
    'Meijer': 'bg-gradient-to-r from-red-600 to-red-500', 
    'Aldi': 'bg-gradient-to-r from-sky-400 to-sky-300',
    'Walmart': 'bg-gradient-to-r from-blue-600 to-blue-500',
    'Costco': 'bg-gradient-to-r from-red-600 to-red-500'
  };

  interface UrlParams {
    term: string;
  }

  function getUrlParams(): UrlParams {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      term: urlParams.get('term') || 'Unknown'
    };
  }

  function sortStoresByOrder(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      const indexA = STORE_ORDER.indexOf(a.name);
      const indexB = STORE_ORDER.indexOf(b.name);
      
      // If store not found in order, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }

  function toggleMoreResults(button: HTMLButtonElement): void {
    const storeColumn = button.closest('.bg-white');
    if (!storeColumn) return;
    
    const hiddenItems = storeColumn.querySelectorAll('.hidden-item');
    const hiddenCount = parseInt(button.dataset['hiddenCount'] || '0');
    
    // Check if items are currently hidden
    const firstHiddenItem = hiddenItems[0] as HTMLElement;
    const isHidden = firstHiddenItem?.hasAttribute('hidden');
    
    if (isHidden) {
      // Show all hidden items
      hiddenItems.forEach(item => (item as HTMLElement).removeAttribute('hidden'));
      button.textContent = 'Show less';
    } else {
      // Hide all extra items
      hiddenItems.forEach(item => (item as HTMLElement).setAttribute('hidden', ''));
      button.textContent = `Show ${hiddenCount} more`;
    }
  }

  function displayResults(results: SearchResult[], searchTerm: string): void {
    const searchTermElement = document.getElementById('searchTerm');
    if (searchTermElement) {
      searchTermElement.textContent = `Results for "${searchTerm}"`;
    }
    
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div class="text-center text-gray-600">No results found.</div>';
      return;
    }

    // Sort stores in fixed order
    const sortedResults = sortStoresByOrder(results);
    
    let html = '<div class="grid gap-5 w-full" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">';
    
    sortedResults.forEach(store => {
      const items = store.products;
      const initialItems = items.slice(0, 15); // Show first 15 items
      const hiddenItems = items.slice(15); // Rest of the items
      const headerGradient = STORE_HEADER_GRADIENTS[store.name] || 'bg-gradient-to-r from-gray-600 to-gray-500';

      html += `
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div class="px-5 py-4 ${headerGradient} text-white">
            ${store.searchUrl ? 
              `<a href="${store.searchUrl}" target="_blank" class="text-lg font-semibold text-white hover:text-gray-100 hover:underline transition-colors block text-center">${store.name}</a>` : 
              `<h3 class="text-lg font-semibold text-center">${store.name}</h3>`
            }
          </div>
          <div class="flex-1 overflow-y-auto min-h-screen">
            ${initialItems.map(item => `
              <div class="border border-gray-200 rounded-xl p-3 mb-3 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-500 flex gap-3 items-start min-h-[80px] relative${item.discount ? ' shadow-md' : ''}">
                ${item.discount ? `
                  <div class="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-b from-red-500 to-red-600 text-white text-xs font-bold flex items-center justify-center rounded-l-xl">
                    <span class="writing-mode-vertical text-center transform rotate-180" style="writing-mode: vertical-lr; text-orientation: mixed;">PRICE CUT</span>
                  </div>
                ` : ''}
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-15 h-15 object-contain rounded-lg bg-white border border-gray-200 flex-shrink-0${item.discount ? ' ml-2' : ''}">` : ''}
                <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">${item.name}</div>
                  <div class="text-lg font-bold text-amber-600">${item.price}</div>
                  ${item.sale ? `<div class="text-xs bg-gradient-to-r from-indigo-100 to-green-100 text-gray-800 px-2 py-1 rounded text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title="${item.salesDesc}">${item.salesDesc}</div>` : ''}
                </div>
              </div>
            `).join('')}
            ${hiddenItems.map(item => `
              <div class="border border-gray-200 rounded-xl p-3 mb-3 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-500 flex gap-3 items-start min-h-[80px] relative hidden-item${item.discount ? ' shadow-md' : ''}" hidden>
                ${item.discount ? `
                  <div class="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-b from-red-500 to-red-600 text-white text-xs font-bold flex items-center justify-center rounded-l-xl">
                    <span class="writing-mode-vertical text-center transform rotate-180" style="writing-mode: vertical-lr; text-orientation: mixed;">PRICE CUT</span>
                  </div>
                ` : ''}
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-15 h-15 object-contain rounded-lg bg-white border border-gray-200 flex-shrink-0${item.discount ? ' ml-2' : ''}">` : ''}
                <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">${item.name}</div>
                  <div class="text-lg font-bold text-amber-600">${item.price}</div>
                  ${item.sale ? `<div class="text-xs bg-gradient-to-r from-indigo-100 to-green-100 text-gray-800 px-2 py-1 rounded text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title="${item.salesDesc}">${item.salesDesc}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ${hiddenItems.length > 0 ? `
            <div class="p-4 border-t border-gray-200 bg-gray-50">
              <button class="w-full px-4 py-2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 show-more-btn" data-hidden-count="${hiddenItems.length}">
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
      const btn = button as HTMLButtonElement;
      btn.addEventListener('click', function() {
        toggleMoreResults(btn);
      });
    });
    
    // Add error handling for product images
    const productImages = resultsContainer.querySelectorAll('img');
    productImages.forEach(img => {
      const imageElement = img as HTMLImageElement;
      imageElement.addEventListener('error', function() {
        this.style.display = 'none';
      });
    });
  }

  function pollForResults(): void {
    const { term } = getUrlParams();
    
    chrome.storage.local.get(['searchResults', 'currentSearchTerm'], (result) => {
      console.log('Polling for results:', result);
      console.log('Looking for term:', term);
      
      if (result['searchResults']) {
        console.log('Found results, displaying...');
        displayResults(result['searchResults'], term);
      } else {
        console.log('No results yet, polling again...');
        // Keep polling for results
        setTimeout(pollForResults, 500);
      }
    });
  }

  function handleNewSearch(): void {
    const searchInput = document.getElementById('newSearchTerm') as HTMLInputElement;
    const searchBtn = document.getElementById('newSearchBtn') as HTMLButtonElement;
    
    if (!searchInput || !searchBtn) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
      searchInput.focus();
      return;
    }
    
    // Disable button and show loading state
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    searchInput.disabled = true;
    
    // Get current store settings from storage and start new search
    chrome.storage.local.get(['storeSettings'], (result) => {
      const settings: StoreSettings = result['storeSettings'] || {};
      
      // Send search message to background script
      chrome.runtime.sendMessage({
        action: 'search',
        term: searchTerm,
        settings: settings
      });
      
      // Update URL and reload page with new search term
      const newUrl = `${window.location.pathname}?term=${encodeURIComponent(searchTerm)}`;
      window.location.href = newUrl;
    });
  }

  function initializeNewSearch(): void {
    const searchInput = document.getElementById('newSearchTerm') as HTMLInputElement;
    const searchBtn = document.getElementById('newSearchBtn') as HTMLButtonElement;
    
    if (!searchInput || !searchBtn) return;
    
    // Handle button click
    searchBtn.addEventListener('click', handleNewSearch);
    
    // Handle Enter key in input
    searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNewSearch();
      }
    });
    
    // Handle input events for better UX
    searchInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const hasValue = target.value.trim().length > 0;
      searchBtn.disabled = !hasValue;
    });
    
    // Initialize button state
    searchBtn.disabled = true;
  }

  // Initialize
  const { term } = getUrlParams();
  const searchTermElement = document.getElementById('searchTerm');
  if (searchTermElement) {
    searchTermElement.textContent = `Searching for "${term}"...`;
  }
  
  // Initialize new search functionality
  initializeNewSearch();
  
  pollForResults();
})();