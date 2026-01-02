/**
 * Agentic Execution Engine
 * Handles multi-step task chaining and execution
 */

export class AgenticExecutor {
  constructor(hybridInference, accessibilityTree) {
    this.hybridInference = hybridInference;
    this.accessibilityTree = accessibilityTree;
    this.taskQueue = [];
    this.executionHistory = [];
    this.currentTask = null;
    this.maxRetries = 3;
  }

  /**
   * Execute a high-level task by breaking it into steps
   * @param {string} task - Natural language task description
   * @returns {Object} Execution result
   */
  async executeTask(task) {
    console.log('[AgenticExecutor] Starting task:', task);
    
    try {
      // Get accessibility tree context
      const context = await this.accessibilityTree.getAccessibilityTree();
      const interactiveElements = await this.accessibilityTree.getInteractiveElements();

      // Plan the task steps
      const plan = await this.hybridInference.planTask(task, {
        accessibilityTree: context,
        interactiveElements: interactiveElements,
        url: window.location.href,
        title: document.title
      });

      // Execute each step in the plan
      const results = [];
      for (const step of plan.steps) {
        const stepResult = await this.executeStep(step);
        results.push(stepResult);
        
        if (!stepResult.success) {
          console.error('[AgenticExecutor] Step failed:', step, stepResult.error);
          
          // Attempt recovery
          const recovery = await this.attemptRecovery(step, stepResult.error);
          if (recovery.success) {
            results.push(recovery);
          } else {
            return {
              success: false,
              task,
              plan,
              results,
              error: `Failed at step: ${step.description}`
            };
          }
        }
      }

      this.executionHistory.push({
        task,
        plan,
        results,
        timestamp: Date.now(),
        success: true
      });

      return {
        success: true,
        task,
        plan,
        results
      };
    } catch (error) {
      console.error('[AgenticExecutor] Task execution failed:', error);
      return {
        success: false,
        task,
        error: error.message
      };
    }
  }

  /**
   * Execute a single step
   * @param {Object} step - Step to execute
   * @returns {Object} Step result
   */
  async executeStep(step) {
    console.log('[AgenticExecutor] Executing step:', step);

    try {
      switch (step.action) {
        case 'click':
          return await this.performClick(step);
        case 'type':
          return await this.performType(step);
        case 'scroll':
          return await this.performScroll(step);
        case 'wait':
          return await this.performWait(step);
        case 'extract':
          return await this.performExtraction(step);
        case 'navigate':
          return await this.performNavigation(step);
        case 'research':
          return await this.performResearch(step);
        default:
          throw new Error(`Unknown action: ${step.action}`);
      }
    } catch (error) {
      return {
        success: false,
        step,
        error: error.message
      };
    }
  }

  /**
   * Perform click action
   */
  async performClick(step) {
    const element = await this.findElement(step.target);
    
    if (!element) {
      throw new Error(`Element not found: ${step.target}`);
    }

    element.click();
    await this.wait(500); // Wait for any action to complete

    return {
      success: true,
      action: 'click',
      target: step.target,
      element: element.tagName
    };
  }

  /**
   * Perform type action
   */
  async performType(step) {
    const element = await this.findElement(step.target);
    
    if (!element) {
      throw new Error(`Element not found: ${step.target}`);
    }

    element.focus();
    element.value = step.text;
    
    // Trigger input events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    return {
      success: true,
      action: 'type',
      target: step.target,
      text: step.text
    };
  }

  /**
   * Perform scroll action
   */
  async performScroll(step) {
    const options = step.options || {};
    
    if (step.target) {
      const element = await this.findElement(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', ...options });
      }
    } else {
      window.scrollBy({
        top: options.top || 0,
        left: options.left || 0,
        behavior: 'smooth'
      });
    }

    await this.wait(300);

    return {
      success: true,
      action: 'scroll'
    };
  }

  /**
   * Perform wait action
   */
  async performWait(step) {
    await this.wait(step.duration || 1000);
    
    return {
      success: true,
      action: 'wait',
      duration: step.duration
    };
  }

  /**
   * Perform data extraction
   */
  async performExtraction(step) {
    const elements = await this.findElements(step.selector);
    const data = elements.map(el => ({
      text: el.textContent?.trim(),
      html: el.innerHTML,
      attributes: this.getAttributes(el)
    }));

    return {
      success: true,
      action: 'extract',
      data
    };
  }

  /**
   * Perform navigation
   */
  async performNavigation(step) {
    // This would be handled by background script
    return {
      success: true,
      action: 'navigate',
      url: step.url,
      message: 'Navigation requested (handled by background script)'
    };
  }

  /**
   * Perform research action
   */
  async performResearch(step) {
    const context = await this.accessibilityTree.getAccessibilityTree();
    const research = await this.hybridInference.deepResearch(step.query, {
      currentPage: context,
      url: window.location.href
    });

    return {
      success: true,
      action: 'research',
      query: step.query,
      findings: research
    };
  }

  /**
   * Find element using various strategies
   */
  async findElement(target) {
    // Try different selection strategies
    if (typeof target === 'string') {
      // Try as CSS selector
      let element = document.querySelector(target);
      if (element) return element;

      // Try as XPath
      const xpathResult = document.evaluate(
        target,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      element = xpathResult.singleNodeValue;
      if (element) return element;
    }

    // Try using accessibility tree
    if (target.role && target.name) {
      const elements = this.accessibilityTree.findElementsByRoleAndName(
        target.role,
        target.name
      );
      if (elements.length > 0) return elements[0];
    }

    return null;
  }

  /**
   * Find multiple elements
   */
  async findElements(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Get element attributes
   */
  getAttributes(element) {
    const attrs = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }

  /**
   * Wait utility
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Attempt to recover from a failed step
   */
  async attemptRecovery(step, error) {
    console.log('[AgenticExecutor] Attempting recovery for:', step, error);

    // Get current context
    const context = await this.accessibilityTree.getAccessibilityTree();
    
    // Ask inference engine for recovery strategy
    const recovery = await this.hybridInference.suggestRecovery(step, error, context);

    if (recovery && recovery.alternativeStep) {
      return await this.executeStep(recovery.alternativeStep);
    }

    return { success: false, error: 'Recovery failed' };
  }

  /**
   * Get execution history
   */
  getHistory() {
    return this.executionHistory;
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }
}
