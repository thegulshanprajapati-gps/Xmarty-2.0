/**
 * SelectorEngine - Robust element resolution using fallback arrays
 */
class SelectorEngine {
  constructor() {
    // Default selectors for common UI elements or mock UI
    this.selectors = {
      inputField: ['input[type="text"]', '#search-input', '.search-box', 'input[placeholder*="Search"]'],
      resultItem: ['.result-item', '.user-row', '.suggestion-item', 'li.item'],
      confirmIndicator: ['.success-badge', '.notification', '.toast-success']
    };
  }

  async loadFromStorage() {
    const data = await StorageManager.get('selectorsConfig');
    if (data.selectorsConfig) {
      this.selectors = { ...this.selectors, ...data.selectorsConfig };
    }
  }

  async saveToStorage() {
    await StorageManager.set({ selectorsConfig: this.selectors });
  }

  /**
   * Find an element on the page using a list of fallback selector strings
   * @param {string[]} selectorArray 
   * @returns {HTMLElement|null}
   */
  resolveElement(selectorArray) {
    if (!selectorArray || !Array.isArray(selectorArray)) return null;
    
    for (const selector of selectorArray) {
      if (!selector.trim()) continue;
      try {
        const el = document.querySelector(selector);
        if (el) return el;
      } catch (err) {
        console.warn(`[FlowAutomate] Invalid selector discarded: ${selector}`, err);
      }
    }
    return null;
  }

  /**
   * Validate if selectors are present/syntactically correct
   * @returns {object} { inputField: boolean, resultItem: boolean }
   */
  validateSelectors() {
    return {
      inputField: this.resolveElement(this.selectors.inputField) !== null,
      resultItem: this.resolveElement(this.selectors.resultItem) !== null
    };
  }
}

if (typeof window !== 'undefined') {
  window.AutomationSelectorEngine = new SelectorEngine();
}
