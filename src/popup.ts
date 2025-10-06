/// <reference path="./shared-types.ts" />

// Default settings for all stores
const defaultSettings: StoreSettings = {
  kroger: { enabled: true, closeTab: true },
  meijer: { enabled: true, closeTab: true },
  aldi: { enabled: true, closeTab: true },
  walmart: { enabled: true, closeTab: true },
  costco: { enabled: true, closeTab: true }
};

// Search functionality
const performSearch = async (): Promise<void> => {
  const searchInput = document.getElementById('searchTerm') as HTMLInputElement;
  const term = searchInput?.value.trim();
  if (!term) return;
  
  // Get current settings
  const result = await chrome.storage.sync.get('storeSettings');
  const settings: StoreSettings = result['storeSettings'] || defaultSettings;
  
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
const searchBtn = document.getElementById('searchBtn');
searchBtn?.addEventListener('click', performSearch);

// Handle Enter key submission
const searchInput = document.getElementById('searchTerm') as HTMLInputElement;
searchInput?.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Focus on search input when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('searchTerm') as HTMLInputElement;
  searchInput?.focus();
  initializeCollapsibleSections();
  await loadSettings();
  initializeSettings();
});

// Collapsible sections functionality
const initializeCollapsibleSections = (): void => {
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      if (targetId) {
        const content = document.getElementById(targetId);
        if (content) {
          toggleCollapse(header as HTMLElement, content);
        }
      }
    });
  });
};

const toggleCollapse = (header: HTMLElement, content: HTMLElement): void => {
  const isCollapsed = content.classList.contains('collapsed');
  const icon = header.querySelector('.collapse-icon') as HTMLElement;
  
  if (isCollapsed) {
    // Expand
    content.classList.remove('collapsed', 'max-h-0', 'opacity-0');
    content.classList.add('max-h-96', 'opacity-100');
    header.classList.remove('collapsed');
    if (icon) {
      icon.style.transform = 'rotate(180deg)';
    }
  } else {
    // Collapse  
    content.classList.add('collapsed', 'max-h-0', 'opacity-0');
    content.classList.remove('max-h-96', 'opacity-100');
    header.classList.add('collapsed');
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
  }
};

// Load settings from storage
const loadSettings = async (): Promise<void> => {
  try {
    const result = await chrome.storage.sync.get('storeSettings');
    const settings: StoreSettings = result['storeSettings'] || defaultSettings;
    
    // Update checkboxes based on loaded settings
    Object.keys(settings).forEach(store => {
      const storeKey = store as StoreKey;
      const enableCheckbox = document.getElementById(`enable${capitalizeFirst(storeKey)}`) as HTMLInputElement;
      const closeCheckbox = document.getElementById(`close${capitalizeFirst(storeKey)}`) as HTMLInputElement;
      
      if (enableCheckbox) {
        enableCheckbox.checked = settings[storeKey].enabled;
      }
      if (closeCheckbox) {
        closeCheckbox.checked = settings[storeKey].closeTab;
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

// Save settings to storage
const saveSettings = async (): Promise<void> => {
  try {
    const settings: StoreSettings = {};
    
    // Get current checkbox states
    Object.keys(defaultSettings).forEach(store => {
      const storeKey = store as StoreKey;
      const enableCheckbox = document.getElementById(`enable${capitalizeFirst(storeKey)}`) as HTMLInputElement;
      const closeCheckbox = document.getElementById(`close${capitalizeFirst(storeKey)}`) as HTMLInputElement;
      
      settings[storeKey] = {
        enabled: enableCheckbox ? enableCheckbox.checked : defaultSettings[storeKey].enabled,
        closeTab: closeCheckbox ? closeCheckbox.checked : defaultSettings[storeKey].closeTab
      };
    });
    
    await chrome.storage.sync.set({ storeSettings: settings });
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Helper function to capitalize first letter
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Store settings handling
const initializeSettings = (): void => {
  const storeCheckboxes = document.querySelectorAll('.store-checkbox');
  const closeCheckboxes = document.querySelectorAll('.sub-checkbox');

  // Add change listeners to all checkboxes
  Array.from(storeCheckboxes).concat(Array.from(closeCheckboxes)).forEach(checkbox => {
    checkbox.addEventListener('change', saveSettings);
  });
};

// Add visual feedback for interactions
const searchButton = document.getElementById('searchBtn') as HTMLButtonElement;

searchButton?.addEventListener('mousedown', (e) => {
  const target = e.target as HTMLElement;
  target.style.transform = 'translateY(1px)';
});

searchButton?.addEventListener('mouseup', (e) => {
  const target = e.target as HTMLElement;
  target.style.transform = 'translateY(-2px)';
});

searchButton?.addEventListener('mouseleave', (e) => {
  const target = e.target as HTMLElement;
  target.style.transform = 'translateY(0)';
});