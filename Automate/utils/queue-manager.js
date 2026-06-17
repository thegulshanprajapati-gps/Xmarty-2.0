/**
 * QueueManager - Handles items array processing and state syncs
 */
class QueueManager {
  constructor() {
    this.items = [];
    this.currentIndex = 0;
    this.results = {}; // { index: { status: 'success'|'failed', error?: string } }
  }

  async loadFromStorage() {
    const data = await StorageManager.get(['queueItems', 'queueIndex', 'queueResults']);
    this.items = data.queueItems || [];
    this.currentIndex = data.queueIndex || 0;
    this.results = data.queueResults || {};
  }

  async saveToStorage() {
    await StorageManager.set({
      queueItems: this.items,
      queueIndex: this.currentIndex,
      queueResults: this.results
    });
  }

  async setItems(itemsArray) {
    // Trim and filter empty values
    const cleanList = itemsArray.map(i => i.trim()).filter(Boolean);
    // Remove duplicates
    this.items = [...new Set(cleanList)];
    this.currentIndex = 0;
    this.results = {};
    await this.saveToStorage();
  }

  async appendItems(newItemsArray) {
    const cleanList = newItemsArray.map(i => i.trim()).filter(Boolean);
    const combined = [...this.items, ...cleanList];
    this.items = [...new Set(combined)];
    await this.saveToStorage();
  }

  getCurrentItem() {
    if (this.currentIndex >= this.items.length) return null;
    return this.items[this.currentIndex];
  }

  async next() {
    this.currentIndex++;
    await this.saveToStorage();
  }

  async markSuccess() {
    this.results[this.currentIndex] = { status: 'success', timestamp: new Date().toISOString() };
    await this.saveToStorage();
  }

  async markFailed(reason) {
    this.results[this.currentIndex] = { status: 'failed', error: reason, timestamp: new Date().toISOString() };
    await this.saveToStorage();
  }

  async reset() {
    this.currentIndex = 0;
    this.results = {};
    await this.saveToStorage();
  }

  getStats() {
    const total = this.items.length;
    let success = 0;
    let failed = 0;
    
    Object.values(this.results).forEach(res => {
      if (res.status === 'success') success++;
      else if (res.status === 'failed') failed++;
    });

    return {
      total,
      success,
      failed,
      remaining: Math.max(0, total - this.currentIndex),
      progress: total > 0 ? Math.round((this.currentIndex / total) * 100) : 0
    };
  }
}

if (typeof window !== 'undefined') {
  window.AutomationQueueManager = new QueueManager();
}
