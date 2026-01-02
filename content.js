/**
 * Content Script
 * Runs on all pages and integrates all modules
 */

import { AccessibilityTreePerception } from './accessibility-tree.js';
import { HybridInference } from './hybrid-inference.js';
import { AgenticExecutor } from './agentic-executor.js';

class CometContent {
  constructor() {
    this.accessibilityTree = new AccessibilityTreePerception();
    this.hybridInference = new HybridInference();
    this.agenticExecutor = new AgenticExecutor(this.hybridInference, this.accessibilityTree);
    this.sidecarInjected = false;
    this.isActive = false;

    this.init();
  }

  async init() {
    console.log('[Comet] Content script initialized on:', window.location.href);

    // Listen for messages from background script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Will respond asynchronously
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+Space to toggle sidecar
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        this.toggleSidecar();
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('[Comet] Received message:', message);

    try {
      switch (message.action) {
        case 'getAccessibilityTree':
          const tree = await this.accessibilityTree.getAccessibilityTree();
          sendResponse({ success: true, data: tree });
          break;

        case 'getInteractiveElements':
          const elements = await this.accessibilityTree.getInteractiveElements();
          sendResponse({ success: true, data: elements });
          break;

        case 'executeTask':
          const result = await this.agenticExecutor.executeTask(message.task);
          sendResponse({ success: true, data: result });
          break;

        case 'deepResearch':
          const research = await this.hybridInference.deepResearch(
            message.query,
            { currentPage: await this.accessibilityTree.getAccessibilityTree(), url: window.location.href }
          );
          sendResponse({ success: true, data: research });
          break;

        case 'toggleSidecar':
          this.toggleSidecar();
          sendResponse({ success: true });
          break;

        case 'updateConfig':
          this.hybridInference.updateConfig(message.config);
          sendResponse({ success: true });
          break;

        case 'getExecutionHistory':
          const history = this.agenticExecutor.getHistory();
          sendResponse({ success: true, data: history });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Comet] Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  toggleSidecar() {
    if (!this.sidecarInjected) {
      this.injectSidecar();
    } else {
      const sidecar = document.getElementById('comet-sidecar');
      if (sidecar) {
        sidecar.style.display = sidecar.style.display === 'none' ? 'flex' : 'none';
        this.isActive = sidecar.style.display !== 'none';
      }
    }
  }

  injectSidecar() {
    if (this.sidecarInjected) return;

    // Create sidecar container
    const sidecar = document.createElement('div');
    sidecar.id = 'comet-sidecar';
    sidecar.innerHTML = `
      <div class="comet-header">
        <h3>🌟 Comet AI Assistant</h3>
        <button id="comet-close" class="comet-btn-close">×</button>
      </div>
      <div class="comet-content">
        <div class="comet-tabs">
          <button class="comet-tab active" data-tab="task">Task</button>
          <button class="comet-tab" data-tab="research">Research</button>
          <button class="comet-tab" data-tab="history">History</button>
        </div>
        
        <div class="comet-tab-content active" id="comet-tab-task">
          <div class="comet-input-group">
            <textarea id="comet-task-input" placeholder="Describe what you want to do...
Examples:
- Search for 'machine learning'
- Click the 'Sign In' button
- Fill the form with my information
- Research this page content"></textarea>
            <button id="comet-execute-btn" class="comet-btn-primary">Execute Task</button>
          </div>
          <div id="comet-task-status"></div>
        </div>
        
        <div class="comet-tab-content" id="comet-tab-research">
          <div class="comet-input-group">
            <input type="text" id="comet-research-input" placeholder="What do you want to research?" />
            <button id="comet-research-btn" class="comet-btn-primary">Research</button>
          </div>
          <div id="comet-research-results"></div>
        </div>
        
        <div class="comet-tab-content" id="comet-tab-history">
          <div id="comet-history-list"></div>
        </div>
      </div>
      <div class="comet-footer">
        <div class="comet-status">Ready</div>
      </div>
    `;

    document.body.appendChild(sidecar);
    this.sidecarInjected = true;
    this.isActive = true;

    // Add event listeners
    this.setupSidecarListeners();
  }

  setupSidecarListeners() {
    // Close button
    document.getElementById('comet-close').addEventListener('click', () => {
      this.toggleSidecar();
    });

    // Tab switching
    document.querySelectorAll('.comet-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Execute task button
    document.getElementById('comet-execute-btn').addEventListener('click', () => {
      this.handleTaskExecution();
    });

    // Research button
    document.getElementById('comet-research-btn').addEventListener('click', () => {
      this.handleResearch();
    });

    // Enter key in task input
    document.getElementById('comet-task-input').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.handleTaskExecution();
      }
    });

    // Enter key in research input
    document.getElementById('comet-research-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleResearch();
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.comet-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.comet-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`comet-tab-${tabName}`).classList.add('active');

    // Load history if history tab
    if (tabName === 'history') {
      this.loadHistory();
    }
  }

  async handleTaskExecution() {
    const input = document.getElementById('comet-task-input');
    const task = input.value.trim();
    
    if (!task) return;

    const statusDiv = document.getElementById('comet-task-status');
    statusDiv.innerHTML = '<div class="comet-loading">Executing task...</div>';

    try {
      const result = await this.agenticExecutor.executeTask(task);
      
      if (result.success) {
        statusDiv.innerHTML = `
          <div class="comet-success">
            <h4>✓ Task Completed</h4>
            <p>${result.results.length} steps executed</p>
            <div class="comet-steps">
              ${result.results.map((r, i) => `
                <div class="comet-step ${r.success ? 'success' : 'failed'}">
                  <span>${i + 1}. ${r.action || 'action'}</span>
                  ${r.success ? '✓' : '✗'}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        statusDiv.innerHTML = `
          <div class="comet-error">
            <h4>✗ Task Failed</h4>
            <p>${result.error}</p>
          </div>
        `;
      }
    } catch (error) {
      statusDiv.innerHTML = `
        <div class="comet-error">
          <h4>✗ Error</h4>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  async handleResearch() {
    const input = document.getElementById('comet-research-input');
    const query = input.value.trim();
    
    if (!query) return;

    const resultsDiv = document.getElementById('comet-research-results');
    resultsDiv.innerHTML = '<div class="comet-loading">Researching...</div>';

    try {
      const research = await this.hybridInference.deepResearch(
        query,
        {
          currentPage: await this.accessibilityTree.getAccessibilityTree(),
          url: window.location.href
        }
      );

      resultsDiv.innerHTML = `
        <div class="comet-research">
          <h4>Research Results</h4>
          <div class="comet-summary">
            <h5>Summary</h5>
            <p>${research.summary}</p>
          </div>
          <div class="comet-insights">
            <h5>Insights</h5>
            <ul>
              ${research.insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
          </div>
          <div class="comet-sources">
            <h5>Sources</h5>
            <ul>
              ${research.sources.map(source => `
                <li>${source.type}: ${source.url || 'current page'}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    } catch (error) {
      resultsDiv.innerHTML = `
        <div class="comet-error">
          <h4>✗ Research Failed</h4>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  loadHistory() {
    const historyList = document.getElementById('comet-history-list');
    const history = this.agenticExecutor.getHistory();

    if (history.length === 0) {
      historyList.innerHTML = '<p class="comet-empty">No execution history yet</p>';
      return;
    }

    historyList.innerHTML = history.map((item, i) => `
      <div class="comet-history-item">
        <h5>${item.task}</h5>
        <p class="comet-timestamp">${new Date(item.timestamp).toLocaleString()}</p>
        <p class="comet-status ${item.success ? 'success' : 'failed'}">
          ${item.success ? '✓ Completed' : '✗ Failed'}
        </p>
      </div>
    `).join('');
  }
}

// Initialize Comet when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CometContent();
  });
} else {
  new CometContent();
}
