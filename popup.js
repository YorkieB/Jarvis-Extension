/**
 * Popup Script
 * Handles popup UI interactions
 */

// Load configuration on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
});

async function loadConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
    if (response.success) {
      const config = response.data;
      document.getElementById('api-endpoint').value = config.apiEndpoint || '';
      document.getElementById('api-key').value = config.apiKey || '';
      document.getElementById('use-local-first').checked = config.useLocalFirst !== false;
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

function setupEventListeners() {
  // Toggle sidecar button
  document.getElementById('toggle-sidecar').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidecar' });
      window.close();
    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
    }
  });

  // Get accessibility tree button
  document.getElementById('get-accessibility-tree').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAccessibilityTree' });
      
      if (response.success) {
        console.log('Accessibility Tree:', response.data);
        
        // Create a new tab with the tree visualization
        const treeJson = JSON.stringify(response.data, null, 2);
        const blob = new Blob([treeJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        chrome.tabs.create({ url: `data:text/plain,${encodeURIComponent(treeJson)}` });
        showStatus('Accessibility tree opened in new tab', 'success');
      }
    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
    }
  });

  // Get interactive elements button
  document.getElementById('get-interactive-elements').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getInteractiveElements' });
      
      if (response.success) {
        console.log('Interactive Elements:', response.data);
        
        // Create a formatted output
        const elements = response.data;
        const output = elements.map((el, i) => 
          `${i + 1}. ${el.role}: "${el.name}" (${el.xpath})`
        ).join('\n');
        
        chrome.tabs.create({ url: `data:text/plain,${encodeURIComponent(output)}` });
        showStatus(`Found ${elements.length} interactive elements`, 'success');
      }
    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
    }
  });

  // Save configuration button
  document.getElementById('save-config').addEventListener('click', async () => {
    const config = {
      apiEndpoint: document.getElementById('api-endpoint').value,
      apiKey: document.getElementById('api-key').value,
      useLocalFirst: document.getElementById('use-local-first').checked
    };

    try {
      await chrome.runtime.sendMessage({ action: 'updateConfig', config });
      showStatus('Configuration saved successfully!', 'success');
      
      // Hide status after 2 seconds
      setTimeout(() => {
        document.getElementById('status-message').classList.remove('success');
      }, 2000);
    } catch (error) {
      showStatus('Error saving configuration: ' + error.message, 'error');
    }
  });
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  if (type === 'error') {
    setTimeout(() => {
      statusEl.className = 'status-message';
    }, 3000);
  }
}
