/**
 * Accessibility Tree Perception Module
 * Extracts and processes accessibility tree information from the DOM
 */

export class AccessibilityTreePerception {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get accessibility tree for the current page
   * @returns {Object} Structured accessibility tree
   */
  async getAccessibilityTree() {
    const rootElement = document.body;
    return this.buildAccessibilityNode(rootElement, 0);
  }

  /**
   * Build accessibility node recursively
   * @param {Element} element - DOM element
   * @param {number} depth - Current depth in tree
   * @param {number} maxDepth - Maximum depth to traverse
   * @returns {Object} Accessibility node
   */
  buildAccessibilityNode(element, depth, maxDepth = 10) {
    if (depth > maxDepth || !element) return null;

    const node = {
      role: this.getRole(element),
      name: this.getName(element),
      description: this.getDescription(element),
      value: this.getValue(element),
      state: this.getState(element),
      position: this.getPosition(element),
      visible: this.isVisible(element),
      interactive: this.isInteractive(element),
      tagName: element.tagName?.toLowerCase(),
      id: element.id || null,
      classes: Array.from(element.classList || []),
      xpath: this.getXPath(element),
      children: []
    };

    // Only include visible and meaningful children
    const children = Array.from(element.children).filter(child => 
      this.isVisible(child) && this.isMeaningful(child)
    );

    node.children = children
      .map(child => this.buildAccessibilityNode(child, depth + 1, maxDepth))
      .filter(child => child !== null);

    return node;
  }

  /**
   * Get ARIA role or implicit role
   */
  getRole(element) {
    return element.getAttribute('role') || 
           this.getImplicitRole(element) || 
           'generic';
  }

  /**
   * Get implicit role based on element type
   */
  getImplicitRole(element) {
    const tagName = element.tagName?.toLowerCase();
    const roleMap = {
      'button': 'button',
      'a': 'link',
      'input': this.getInputRole(element),
      'textarea': 'textbox',
      'select': 'combobox',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'article': 'article',
      'section': 'region',
      'aside': 'complementary',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'img': 'image',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'table': 'table',
      'form': 'form'
    };
    return roleMap[tagName];
  }

  /**
   * Get role for input elements
   */
  getInputRole(element) {
    const type = element.getAttribute('type')?.toLowerCase() || 'text';
    const inputRoles = {
      'checkbox': 'checkbox',
      'radio': 'radio',
      'button': 'button',
      'submit': 'button',
      'reset': 'button',
      'search': 'searchbox',
      'range': 'slider'
    };
    return inputRoles[type] || 'textbox';
  }

  /**
   * Get accessible name
   */
  getName(element) {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') &&
           this.getTextFromId(element.getAttribute('aria-labelledby')) ||
           element.getAttribute('title') ||
           element.getAttribute('alt') ||
           element.getAttribute('placeholder') ||
           this.getTextContent(element) ||
           '';
  }

  /**
   * Get accessible description
   */
  getDescription(element) {
    return element.getAttribute('aria-description') ||
           element.getAttribute('aria-describedby') &&
           this.getTextFromId(element.getAttribute('aria-describedby')) ||
           '';
  }

  /**
   * Get current value
   */
  getValue(element) {
    if (element.value !== undefined) return element.value;
    if (element.getAttribute('aria-valuenow')) return element.getAttribute('aria-valuenow');
    return null;
  }

  /**
   * Get state information
   */
  getState(element) {
    return {
      disabled: element.disabled || element.getAttribute('aria-disabled') === 'true',
      checked: element.checked || element.getAttribute('aria-checked') === 'true',
      selected: element.selected || element.getAttribute('aria-selected') === 'true',
      expanded: element.getAttribute('aria-expanded') === 'true',
      pressed: element.getAttribute('aria-pressed') === 'true',
      hidden: element.getAttribute('aria-hidden') === 'true'
    };
  }

  /**
   * Get element position
   */
  getPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * Check if element is visible
   */
  isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Check if element is interactive
   */
  isInteractive(element) {
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox'];
    
    return interactiveTags.includes(element.tagName?.toLowerCase()) ||
           interactiveRoles.includes(this.getRole(element)) ||
           element.onclick !== null ||
           element.hasAttribute('onclick') ||
           element.tabIndex >= 0;
  }

  /**
   * Check if element is meaningful for accessibility tree
   */
  isMeaningful(element) {
    const role = this.getRole(element);
    const name = this.getName(element);
    const hasChildren = element.children.length > 0;
    
    return role !== 'generic' || name || hasChildren || this.isInteractive(element);
  }

  /**
   * Get text content (truncated)
   */
  getTextContent(element) {
    const text = element.textContent?.trim() || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  /**
   * Get text from element by ID
   */
  getTextFromId(id) {
    const element = document.getElementById(id);
    return element ? element.textContent?.trim() : '';
  }

  /**
   * Get XPath for element
   */
  getXPath(element) {
    if (element.id) return `//*[@id="${element.id}"]`;
    
    const paths = [];
    for (; element && element.nodeType === 1; element = element.parentNode) {
      let index = 0;
      for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          index++;
        }
      }
      const tagName = element.tagName.toLowerCase();
      const pathIndex = index ? `[${index + 1}]` : '';
      paths.unshift(`${tagName}${pathIndex}`);
    }
    return paths.length ? `/${paths.join('/')}` : '';
  }

  /**
   * Find elements by role and name
   */
  findElementsByRoleAndName(role, name) {
    const allElements = document.querySelectorAll('*');
    return Array.from(allElements).filter(element => {
      const elementRole = this.getRole(element);
      const elementName = this.getName(element);
      return elementRole === role && 
             elementName.toLowerCase().includes(name.toLowerCase());
    });
  }

  /**
   * Get interactive elements summary
   */
  getInteractiveElements() {
    const allElements = document.querySelectorAll('*');
    return Array.from(allElements)
      .filter(element => this.isInteractive(element) && this.isVisible(element))
      .map(element => ({
        role: this.getRole(element),
        name: this.getName(element),
        xpath: this.getXPath(element),
        position: this.getPosition(element),
        state: this.getState(element)
      }));
  }
}
