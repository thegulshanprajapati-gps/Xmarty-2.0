/**
 * MutationObserverManager - Monitors dynamic DOM updates
 */
class MutationObserverManager {
  constructor() {
    this.observer = null;
  }

  /**
   * Watches a target node until a child matching targetSelector is added.
   * @param {HTMLElement} targetNode 
   * @param {string} targetSelector 
   * @param {number} timeoutMs 
   * @returns {Promise<HTMLElement>}
   */
  watchForAddition(targetNode, targetSelector, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.disconnect();
        reject(new Error(`Timeout waiting for addition of selector: ${targetSelector}`));
      }, timeoutMs);

      // Check if already present first
      const existing = targetNode.querySelector(targetSelector);
      if (existing) {
        clearTimeout(timer);
        return resolve(existing);
      }

      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            const element = targetNode.querySelector(targetSelector);
            if (element) {
              clearTimeout(timer);
              this.disconnect();
              resolve(element);
              break;
            }
          }
        }
      });

      this.observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.AutomationObserverManager = new MutationObserverManager();
}
