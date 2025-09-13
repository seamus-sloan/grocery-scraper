// Search functionality
const performSearch = async () => {
  const term = document.getElementById('searchTerm').value.trim();
  if (!term) return;
  
  // Send search message to background script which will handle opening the results tab
  chrome.runtime.sendMessage({ action: 'search', term });
  
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
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchTerm').focus();
  initializeCollapsibleSections();
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

// Store settings handling (placeholder for future implementation)
const storeCheckboxes = document.querySelectorAll('.store-checkbox');
const closeCheckboxes = document.querySelectorAll('.sub-checkbox');

// Add change listeners to all checkboxes (for future settings functionality)
[...storeCheckboxes, ...closeCheckboxes].forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // TODO: Save settings to chrome.storage
    console.log('Settings changed - implementation coming soon');
  });
});

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
