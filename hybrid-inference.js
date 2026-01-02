/**
 * Hybrid Inference System
 * Integrates local heuristics with external AI APIs
 */

export class HybridInference {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || 'http://localhost:8000/api',
      apiKey: config.apiKey || '',
      useLocalFirst: config.useLocalFirst !== false,
      timeout: config.timeout || 30000
    };
    this.cache = new Map();
  }

  /**
   * Plan a task into executable steps
   * @param {string} task - Task description
   * @param {Object} context - Page context
   * @returns {Object} Task plan with steps
   */
  async planTask(task, context) {
    console.log('[HybridInference] Planning task:', task);

    // Try local heuristics first
    if (this.config.useLocalFirst) {
      const localPlan = this.localTaskPlanner(task, context);
      if (localPlan) {
        return localPlan;
      }
    }

    // Fall back to API-based planning
    try {
      const response = await this.callAPI('/plan', {
        task,
        context: this.sanitizeContext(context)
      });
      return response.plan;
    } catch (error) {
      console.error('[HybridInference] API planning failed:', error);
      // Use fallback local planning
      return this.localTaskPlanner(task, context);
    }
  }

  /**
   * Local task planner using heuristics
   */
  localTaskPlanner(task, context) {
    const taskLower = task.toLowerCase();
    const steps = [];

    // Search-related tasks
    if (taskLower.includes('search for') || taskLower.includes('find')) {
      const query = this.extractQuery(task);
      
      // Find search box
      const searchBox = context.interactiveElements?.find(el => 
        el.role === 'searchbox' || 
        el.role === 'textbox' && (
          el.name.toLowerCase().includes('search') ||
          el.name.toLowerCase().includes('query')
        )
      );

      if (searchBox) {
        steps.push({
          action: 'click',
          target: searchBox.xpath,
          description: 'Focus search box'
        });
        steps.push({
          action: 'type',
          target: searchBox.xpath,
          text: query,
          description: `Type search query: ${query}`
        });
        
        // Find search button
        const searchButton = context.interactiveElements?.find(el =>
          el.role === 'button' && (
            el.name.toLowerCase().includes('search') ||
            el.name.toLowerCase().includes('go')
          )
        );

        if (searchButton) {
          steps.push({
            action: 'click',
            target: searchButton.xpath,
            description: 'Click search button'
          });
        } else {
          // Press Enter as fallback
          steps.push({
            action: 'keypress',
            target: searchBox.xpath,
            key: 'Enter',
            description: 'Submit search'
          });
        }
      }
    }

    // Click-related tasks
    if (taskLower.includes('click') || taskLower.includes('press')) {
      const buttonName = this.extractTargetName(task);
      const button = context.interactiveElements?.find(el =>
        (el.role === 'button' || el.role === 'link') &&
        el.name.toLowerCase().includes(buttonName.toLowerCase())
      );

      if (button) {
        steps.push({
          action: 'click',
          target: button.xpath,
          description: `Click ${button.name}`
        });
      }
    }

    // Form filling tasks
    if (taskLower.includes('fill') || taskLower.includes('enter')) {
      // Extract field name and value
      const fieldInfo = this.extractFieldInfo(task);
      
      const field = context.interactiveElements?.find(el =>
        el.role === 'textbox' &&
        el.name.toLowerCase().includes(fieldInfo.fieldName.toLowerCase())
      );

      if (field) {
        steps.push({
          action: 'type',
          target: field.xpath,
          text: fieldInfo.value,
          description: `Fill ${field.name} with ${fieldInfo.value}`
        });
      }
    }

    // Research tasks
    if (taskLower.includes('research') || taskLower.includes('analyze')) {
      steps.push({
        action: 'research',
        query: task,
        description: 'Perform deep research'
      });
    }

    // If we found steps, return the plan
    if (steps.length > 0) {
      return {
        task,
        steps,
        source: 'local-heuristic'
      };
    }

    // Default fallback plan
    return {
      task,
      steps: [{
        action: 'research',
        query: task,
        description: 'Analyze and respond to request'
      }],
      source: 'fallback'
    };
  }

  /**
   * Perform deep research
   * @param {string} query - Research query
   * @param {Object} context - Current context
   * @returns {Object} Research findings
   */
  async deepResearch(query, context) {
    console.log('[HybridInference] Starting deep research:', query);

    const findings = {
      query,
      timestamp: Date.now(),
      sources: [],
      summary: '',
      insights: []
    };

    // Extract information from current page
    const pageInfo = this.extractPageInformation(context.currentPage);
    findings.sources.push({
      type: 'current-page',
      url: context.url,
      content: pageInfo
    });

    // Try to use API for enhanced research
    try {
      const response = await this.callAPI('/research', {
        query,
        context: pageInfo,
        url: context.url
      });
      
      findings.summary = response.summary;
      findings.insights = response.insights;
      findings.sources.push(...response.sources);
    } catch (error) {
      console.error('[HybridInference] API research failed:', error);
      
      // Use local research capabilities
      findings.summary = this.generateLocalSummary(pageInfo, query);
      findings.insights = this.generateLocalInsights(pageInfo, query);
    }

    return findings;
  }

  /**
   * Suggest recovery from failed step
   */
  async suggestRecovery(step, error, context) {
    console.log('[HybridInference] Suggesting recovery:', step, error);

    // Local recovery strategies
    if (error.includes('Element not found')) {
      // Try to find alternative element
      const alternatives = this.findAlternativeElements(step, context);
      if (alternatives.length > 0) {
        return {
          alternativeStep: {
            ...step,
            target: alternatives[0].xpath,
            description: `${step.description} (alternative element)`
          }
        };
      }
    }

    if (error.includes('timeout') || error.includes('wait')) {
      // Add wait step before retry
      return {
        alternativeStep: {
          action: 'wait',
          duration: 2000,
          description: 'Wait before retry'
        }
      };
    }

    return null;
  }

  /**
   * Extract information from accessibility tree
   */
  extractPageInformation(tree) {
    if (!tree) return '';

    const extractText = (node) => {
      let text = [];
      if (node.name) text.push(node.name);
      if (node.description) text.push(node.description);
      if (node.children) {
        node.children.forEach(child => {
          text.push(...extractText(child));
        });
      }
      return text;
    };

    const allText = extractText(tree);
    return allText.join(' ').substring(0, 5000); // Limit size
  }

  /**
   * Generate local summary
   */
  generateLocalSummary(content, query) {
    // Simple keyword extraction
    const queryTerms = query.toLowerCase().split(' ');
    const sentences = content.split(/[.!?]+/);
    
    const relevantSentences = sentences
      .filter(sentence => {
        const sentenceLower = sentence.toLowerCase();
        return queryTerms.some(term => sentenceLower.includes(term));
      })
      .slice(0, 3);

    return relevantSentences.join('. ') || 'No specific information found on this page.';
  }

  /**
   * Generate local insights
   */
  generateLocalInsights(content, query) {
    return [
      `Analysis based on current page content`,
      `Search terms: ${query}`,
      `Content length: ${content.length} characters`
    ];
  }

  /**
   * Find alternative elements
   */
  findAlternativeElements(step, context) {
    // This would use accessibility tree to find similar elements
    return [];
  }

  /**
   * Extract query from task
   */
  extractQuery(task) {
    const match = task.match(/search for ["']?([^"']+)["']?/i) ||
                  task.match(/find ["']?([^"']+)["']?/i);
    return match ? match[1] : task;
  }

  /**
   * Extract target name from task
   */
  extractTargetName(task) {
    const match = task.match(/click (?:on |the )?["']?([^"']+)["']?/i);
    return match ? match[1] : '';
  }

  /**
   * Extract field information from task
   */
  extractFieldInfo(task) {
    const match = task.match(/fill ["']?([^"']+)["']? with ["']?([^"']+)["']?/i) ||
                  task.match(/enter ["']?([^"']+)["']? in ["']?([^"']+)["']?/i);
    
    if (match) {
      return {
        fieldName: match[2] || match[1],
        value: match[1] || match[2]
      };
    }
    
    return { fieldName: '', value: '' };
  }

  /**
   * Call external API
   */
  async callAPI(endpoint, data) {
    if (!this.config.apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch(this.config.apiEndpoint + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sanitize context for API calls
   */
  sanitizeContext(context) {
    // Remove large data to reduce payload size
    const sanitized = { ...context };
    if (sanitized.accessibilityTree) {
      sanitized.accessibilityTree = this.truncateTree(sanitized.accessibilityTree, 3);
    }
    return sanitized;
  }

  /**
   * Truncate tree depth
   */
  truncateTree(node, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) return null;
    
    return {
      ...node,
      children: node.children
        ?.map(child => this.truncateTree(child, maxDepth, currentDepth + 1))
        .filter(child => child !== null) || []
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}
