
// Store configuration
const STORES = {
  kroger: {
    name: 'Kroger',
    buildUrl: (term) => `https://www.kroger.com/search?query=${encodeURIComponent(term)}`,
    tabId: null
  },
  meijer: {
    name: 'Meijer', 
    buildUrl: (term) => `https://www.meijer.com/shopping/search.html?text=${encodeURIComponent(term)}`,
    tabId: null
  },
  aldi: {
    name: 'Aldi',
    buildUrl: (term) => `https://www.aldi.us/results?q=${encodeURIComponent(term)}`,
    tabId: null
  },
  walmart: {
    name: 'Walmart',
    buildUrl: (term) => {
      const filter = `exclude_oos:Show+available+items+only||fulfillment_method_in_store:In-store`;
      return `https://www.walmart.com/search?q=${encodeURIComponent(term)}&${encodeURIComponent(filter)}`;
    },
    tabId: null
  },
  costco: {
    name: 'Costco',
    buildUrl: (term) => {
      const filter = `refine=item_program_eligibility-InWarehouse`;
      return `https://www.costco.com/s?keyword=${encodeURIComponent(term)}&${encodeURIComponent(filter)}`;
    },
    tabId: null
  }
};

const SEARCH_TIMEOUT_MS = 15_000; // 15 seconds timeout for search completion
let searchResults = {}; // Track results from each store
let searchTimeout = null; // Track timeout for search completion

/**
 * Sets the `searchResults` in chrome.storage.local in the format expected by results page
 */
const updateSearchResults = () => {
  const resultsArray = Object.values(searchResults);
  console.log('[Background] Updating combined results:', resultsArray);
  chrome.storage.local.set({ searchResults: resultsArray }, () => {
    console.log('[Background] Stored combined results in chrome.storage.local');
  });
};

/**
 * Checks if all stores have reported results and updates storage if so
 */
const checkSearchCompletion = () => {
  const expectedStores = Object.keys(STORES);
  const completedStores = Object.keys(searchResults);

  console.log('[Background] Checking completion. Expected:', expectedStores, 'Completed:', completedStores);
  console.log('[Background] Current searchResults:', searchResults);

  // Check if we have results from all expected stores
  const allStoresComplete = expectedStores.every(store => completedStores.includes(store));

  if (allStoresComplete) {
    console.log('[Background] All stores completed, storing final results');
    updateSearchResults();

    // Clear the timeout since we're done
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  } else {
    const missingStores = expectedStores.filter(store => !completedStores.includes(store));
    console.log('[Background] Still waiting for stores:', missingStores);
  }
};


/**
 * Creates a new tab for a specific store's search results.
 * @param storeKey 
 * @param term 
 */
const createStoreTab = (storeKey, term) => {
  const store = STORES[storeKey];
  const url = store.buildUrl(term);
  
  console.log(`Creating a tab for ${store.name}:`, url);
  
  chrome.tabs.create({ url, active: false }, (tab) => {
    STORES[storeKey].tabId = tab.id;
    console.log(`[Background] Created ${store.name} tab with ID:`, tab.id);
  });
};


/**
 * Handles behavior when results are received from the provided store.
 * @param storeKey 
 * @param results 
 */
const handleStoreResults = (storeKey, results) => {
  const store = STORES[storeKey];
  console.log(`[Background] Received ${storeKey} results:`, results);

  // Store results
  searchResults[storeKey] = {
    name: store.name,
    items: results.length ? results : [{ name: 'No results found', price: '' }]
  };

  // Close the scraping tab if it exists
  if (store.tabId) {
    chrome.tabs.remove(store.tabId);
    STORES[storeKey].tabId = null;
  }
};

/**
 * Initializes the search process for the given term by creating tabs for each store and opening results page.
 * @param term 
 */
const initializeSearch = (term) => {
  // Clear previous results and reset tab IDs
  searchResults = {};
  Object.keys(STORES).forEach(storeKey => {
    STORES[storeKey].tabId = null;
  });
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set current search term and clear previous results
  chrome.storage.local.set({ currentSearchTerm: term, searchResults: null }, () => {
    console.log(`[Background] currentSearchTerm: ${term}`);
    console.log(`[Background] searchResults: null`);
  });

  // Set timeout to finalize results after 15 seconds even if not all stores complete
  searchTimeout = setTimeout(() => {
    console.log('[Background] Search timeout reached after 15 seconds');
    console.log('[Background] Final searchResults at timeout:', searchResults);
    console.log('[Background] Completed stores:', Object.keys(searchResults));
    updateSearchResults();
    searchTimeout = null;
  }, SEARCH_TIMEOUT_MS);

  // Open results page and all store search tabs
  chrome.tabs.create({ url: chrome.runtime.getURL(`results.html?term=${encodeURIComponent(term)}`) });
  Object.keys(STORES).forEach(storeKey => createStoreTab(storeKey, term));
};

/**
 * The listener for messages from content scripts and results page
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // The 'search' action comes from the popup to start a new search
  if (message.action === 'search') {
    const term = message.term;
    console.log('[Background] Starting search for:', term);
    initializeSearch(term);
    return false;
  }
  
  // Search result messages will have actions like 'krogerResults', 'meijerResults', etc.
  const storeKey = message.action.replace('Results', '');
  if (STORES[storeKey]) {
    handleStoreResults(storeKey, message.results);
    checkSearchCompletion();
  }
});