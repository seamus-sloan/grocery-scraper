// Search functionality
const performSearch = async () => {
  const term = document.getElementById('searchTerm').value.trim();
  if (!term) return;
  
  // Get current settings
  const result = await chrome.storage.sync.get('storeSettings');
  const settings = result.storeSettings || defaultSettings;
  
  // Send search message to background script with settings
  chrome.runtime.sendMessage({ 
    action: 'search', 
    term,
    settings 
  });
  
  // Close the popup
  window.close();
};

// Event listeners
document.getElementById('searchBtn').addEventListener('click', performSearch);

// Handle Enter key submission
document.getElementById('searchTerm').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Focus on search input when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('searchTerm').focus();
  initializeCollapsibleSections();
  await loadSettings();
  initializeSettings();
});

// Collapsible sections functionality
const initializeCollapsibleSections = () => {
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      const content = document.getElementById(targetId);
      
      if (content) {
        toggleCollapse(header, content);
      }
    });
  });
};

const toggleCollapse = (header, content) => {
  const isCollapsed = content.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Expand
    content.classList.remove('collapsed');
    header.classList.remove('collapsed');
  } else {
    // Collapse
    content.classList.add('collapsed');
    header.classList.add('collapsed');
  }
};

// Default settings for all stores
const defaultSettings = {
  kroger: { enabled: true, closeTab: true },
  meijer: { enabled: true, closeTab: true },
  aldi: { enabled: true, closeTab: true },
  walmart: { enabled: true, closeTab: true },
  costco: { enabled: true, closeTab: true }
};

// Load settings from storage
const loadSettings = async () => {
  try {
    const result = await chrome.storage.sync.get('storeSettings');
    const settings = result.storeSettings || defaultSettings;
    
    // Update checkboxes based on loaded settings
    Object.keys(settings).forEach(store => {
      const enableCheckbox = document.getElementById(`enable${capitalizeFirst(store)}`);
      const closeCheckbox = document.getElementById(`close${capitalizeFirst(store)}`);
      
      if (enableCheckbox) {
        enableCheckbox.checked = settings[store].enabled;
      }
      if (closeCheckbox) {
        closeCheckbox.checked = settings[store].closeTab;
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

// Save settings to storage
const saveSettings = async () => {
  try {
    const settings = {};
    
    // Get current checkbox states
    Object.keys(defaultSettings).forEach(store => {
      const enableCheckbox = document.getElementById(`enable${capitalizeFirst(store)}`);
      const closeCheckbox = document.getElementById(`close${capitalizeFirst(store)}`);
      
      settings[store] = {
        enabled: enableCheckbox ? enableCheckbox.checked : defaultSettings[store].enabled,
        closeTab: closeCheckbox ? closeCheckbox.checked : defaultSettings[store].closeTab
      };
    });
    
    await chrome.storage.sync.set({ storeSettings: settings });
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Helper function to capitalize first letter
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Store settings handling
const initializeSettings = () => {
  const storeCheckboxes = document.querySelectorAll('.store-checkbox');
  const closeCheckboxes = document.querySelectorAll('.sub-checkbox');

  // Add change listeners to all checkboxes
  [...storeCheckboxes, ...closeCheckboxes].forEach(checkbox => {
    checkbox.addEventListener('change', saveSettings);
  });
};

// Add visual feedback for interactions
document.getElementById('searchBtn').addEventListener('mousedown', (e) => {
  e.target.style.transform = 'translateY(1px)';
});

document.getElementById('searchBtn').addEventListener('mouseup', (e) => {
  e.target.style.transform = 'translateY(-2px)';
});

document.getElementById('searchBtn').addEventListener('mouseleave', (e) => {
  e.target.style.transform = 'translateY(0)';
});
