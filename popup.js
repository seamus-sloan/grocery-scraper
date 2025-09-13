document.getElementById('searchBtn').addEventListener('click', async () => {
  const term = document.getElementById('searchTerm').value.trim();
  if (!term) return;
  
  // Send search message to background script which will handle opening the results tab
  chrome.runtime.sendMessage({ action: 'search', term });
  
  // Close the popup
  window.close();
});
