/**
 * Background Service Worker
 * Handles cross-tab orchestration and persistent state
 */

class CometBackground {
  constructor() {
    this.state = {
      activeTab: null,
      config: {
        apiEndpoint: 'http://localhost:8000/api',
        apiKey: '',
        useLocalFirst: true
      },
      tasks: []
    };

    this.init();
  }

  init() {
    console.log('[Comet Background] Service worker initialized');

    // Listen for extension icon clicks
    chrome.action.onClicked.addListener((tab) => {
      this.handleIconClick(tab);
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Will respond asynchronously
    });

    // Load saved configuration
    this.loadConfig();

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.onTabLoaded(tab);
      }
    });
  }

  async handleIconClick(tab) {
    // Toggle sidecar in the active tab
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidecar' });
    } catch (error) {
      console.error('[Comet Background] Error toggling sidecar:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('[Comet Background] Received message:', message);

    try {
      switch (message.action) {
        case 'getConfig':
          sendResponse({ success: true, data: this.state.config });
          break;

        case 'updateConfig':
          await this.updateConfig(message.config);
          sendResponse({ success: true });
          break;

        case 'executeTaskInTab':
          const result = await this.executeTaskInTab(message.tabId, message.task);
          sendResponse({ success: true, data: result });
          break;

        case 'getActiveTab':
          const activeTab = await this.getActiveTab();
          sendResponse({ success: true, data: activeTab });
          break;

        case 'navigateTab':
          await chrome.tabs.update(message.tabId, { url: message.url });
          sendResponse({ success: true });
          break;

        case 'createTab':
          const newTab = await chrome.tabs.create({ url: message.url });
          sendResponse({ success: true, data: newTab });
          break;

        case 'getTasks':
          sendResponse({ success: true, data: this.state.tasks });
          break;

        case 'addTask':
          this.addTask(message.task);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Comet Background] Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.sync.get('cometConfig');
      if (result.cometConfig) {
        this.state.config = { ...this.state.config, ...result.cometConfig };
        console.log('[Comet Background] Config loaded:', this.state.config);
      }
    } catch (error) {
      console.error('[Comet Background] Error loading config:', error);
    }
  }

  async updateConfig(newConfig) {
    this.state.config = { ...this.state.config, ...newConfig };
    
    try {
      await chrome.storage.sync.set({ cometConfig: this.state.config });
      console.log('[Comet Background] Config saved:', this.state.config);

      // Notify all tabs about config update
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateConfig',
            config: this.state.config
          });
        } catch (error) {
          // Tab might not have content script, ignore
        }
      }
    } catch (error) {
      console.error('[Comet Background] Error saving config:', error);
      throw error;
    }
  }

  async executeTaskInTab(tabId, task) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        action: 'executeTask',
        task
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute task in tab ${tabId}: ${error.message}`);
    }
  }

  async getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  onTabLoaded(tab) {
    console.log('[Comet Background] Tab loaded:', tab.url);
    // Could perform initialization here if needed
  }

  addTask(task) {
    this.state.tasks.push({
      ...task,
      id: Date.now(),
      timestamp: Date.now(),
      status: 'pending'
    });

    // Keep only last 100 tasks
    if (this.state.tasks.length > 100) {
      this.state.tasks.shift();
    }
  }
}

// Initialize the background service
new CometBackground();
