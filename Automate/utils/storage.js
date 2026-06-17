/**
 * Storage utility for chrome.storage.local
 */
const StorageManager = {
  /**
   * Get values from chrome.storage.local
   * @param {string[]|string|object} keys
   * @returns {Promise<object>}
   */
  get(keys) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, (result) => resolve(result || {}));
      } else {
        const fallback = {};
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach(k => {
          try {
            fallback[k] = JSON.parse(localStorage.getItem(k));
          } catch {
            fallback[k] = localStorage.getItem(k);
          }
        });
        resolve(fallback);
      }
    });
  },

  /**
   * Set values in chrome.storage.local
   * @param {object} data
   * @returns {Promise<void>}
   */
  set(data) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data, () => resolve());
      } else {
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
        });
        resolve();
      }
    });
  },

  /**
   * Clear session data
   * @returns {Promise<void>}
   */
  async clearSession() {
    const keysToRemove = ['automationState', 'queueState', 'logs'];
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keysToRemove, () => resolve());
      });
    } else {
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  }
};

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
