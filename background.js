
let krogerTabId = null;
let meijerTabId = null;
let aldiTabId = null;
let walmartTabId = null;
let costcoTabId = null;
let krogerSendResponse = null;
let searchResults = {}; // Track results from each store
let searchTimeout = null; // Track timeout for search completion

function updateSearchResults() {
  // Convert searchResults object to array format expected by results page
  const resultsArray = Object.values(searchResults);
  console.log('[Background] Updating combined results:', resultsArray);
  chrome.storage.local.set({ searchResults: resultsArray }, () => {
    console.log('[Background] Stored combined results in chrome.storage.local');
  });
}

function checkSearchCompletion() {
  const expectedStores = ['kroger', 'meijer', 'aldi', 'walmart', 'costco'];
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
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'search') {
    const term = message.term;
    console.log('[Background] Starting search for:', term);

    // Clear previous results and initialize search tracking
    searchResults = {};
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    chrome.storage.local.set({ currentSearchTerm: term, searchResults: null }, () => {
      console.log('[Background] Stored search term and cleared results');
    });

    // Set timeout to finalize results after 15 seconds even if not all stores complete
    searchTimeout = setTimeout(() => {
      console.log('[Background] Search timeout reached after 15 seconds');
      console.log('[Background] Final searchResults at timeout:', searchResults);
      console.log('[Background] Completed stores:', Object.keys(searchResults));
      updateSearchResults();
      searchTimeout = null;
    }, 15000);

    // Open results page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL(`results.html?term=${encodeURIComponent(term)}`) });

    // Start scraping Kroger
    const krogerUrl = `https://www.kroger.com/search?query=${encodeURIComponent(term)}`;
    console.log("Creating a tab for URL:", krogerUrl);
    chrome.tabs.create({ url: krogerUrl, active: false }, (tab) => {
      krogerTabId = tab.id;
      console.log('[Background] Created Kroger tab with ID:', tab.id);
    });

    // Start scraping Meijer
    const meijerUrl = `https://www.meijer.com/shopping/search.html?text=${encodeURIComponent(term)}`;
    console.log("Creating a tab for URL:", meijerUrl);
    chrome.tabs.create({ url: meijerUrl, active: false }, (tab) => {
      meijerTabId = tab.id;
      console.log('[Background] Created Meijer tab with ID:', tab.id);
    });

    // Start scraping Aldi
    const aldiUrl = `https://www.aldi.us/results?q=${encodeURIComponent(term)}`;
    console.log("Creating a tab for URL:", aldiUrl);
    chrome.tabs.create({ url: aldiUrl, active: false }, (tab) => {
      aldiTabId = tab.id;
      console.log('[Background] Created Aldi tab with ID:', tab.id);
    });

    // Start scraping Walmart
    const walmartFilter = `exclude_oos:Show+available+items+only||fulfillment_method_in_store:In-store`;
    const walmartUrl = `https://www.walmart.com/search?q=${encodeURIComponent(term)}&${encodeURIComponent(walmartFilter)}`;
    console.log("Creating a tab for URL:", walmartUrl);
    chrome.tabs.create({ url: walmartUrl, active: false }, (tab) => {
      walmartTabId = tab.id;
      console.log('[Background] Created Walmart tab with ID:', tab.id);
    });

    // Start scraping Costco
    const costcoFilter = `refine=item_program_eligibility-InWarehouse`;
    const costcoUrl = `https://www.costco.com/s?keyword=${encodeURIComponent(term)}&${encodeURIComponent(costcoFilter)}`;
    console.log("Creating a tab for URL:", costcoUrl);
    chrome.tabs.create({ url: costcoUrl, active: false }, (tab) => {
      costcoTabId = tab.id;
      console.log('[Background] Created Costco tab with ID:', tab.id);
    });

    return false;
  }
  
  if (message.action === 'krogerResults') {
    console.log('[Background] Received kroger results:', message.results);

    // Store Kroger results
    searchResults.kroger = {
      name: 'Kroger',
      items: message.results.length ? message.results : [{ name: 'No results found', price: '' }]
    };

    if (krogerTabId) {
      // Close the scraping tab after getting results
      chrome.tabs.remove(krogerTabId);
      krogerTabId = null;
    }
  }

  if (message.action === 'meijerResults') {
    console.log('[Background] Received meijer results:', message.results);

    // Store Meijer results
    searchResults.meijer = {
      name: 'Meijer',
      items: message.results.length ? message.results : [{ name: 'No results found', price: '' }]
    };

    if (meijerTabId) {
      // Close the scraping tab after getting results
      chrome.tabs.remove(meijerTabId);
      meijerTabId = null;
    }
  }

  if (message.action === 'aldiResults') {
    console.log('[Background] Received aldi results:', message.results);

    // Store Aldi results
    searchResults.aldi = {
      name: 'Aldi',
      items: message.results.length ? message.results : [{ name: 'No results found', price: '' }]
    };

    if (aldiTabId) {
      // Close the scraping tab after getting results
      chrome.tabs.remove(aldiTabId);
      aldiTabId = null;
    }
    }

    if (message.action === 'walmartResults') {
      console.log('[Background] Received walmart results:', message.results);

      // Store Walmart results
      searchResults.walmart = {
        name: 'Walmart',
        items: message.results.length ? message.results : [{ name: 'No results found', price: '' }]
      };

      if (walmartTabId) {
        // Close the scraping tab after getting results
        chrome.tabs.remove(walmartTabId);
        walmartTabId = null;
      }
    }

  if (message.action === 'costcoResults') {
    console.log('[Background] Received costco results:', message.results);

    // Store Costco results
    searchResults.costco = {
      name: 'Costco',
      items: message.results.length ? message.results : [{ name: 'No results found', price: '' }]
    };

    if (costcoTabId) {
      // Close the scraping tab after getting results
      chrome.tabs.remove(costcoTabId);
      costcoTabId = null;
    }
  }

  // Check if all stores are complete
  checkSearchCompletion();
});
