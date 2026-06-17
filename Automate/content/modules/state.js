/**
 * StateManager - Handles sync, retrieval, and updates of extension automation states.
 */
class StateManager {
  constructor() {
    this.states = {
      STATUS: {
        IDLE: 'IDLE',
        RUNNING: 'RUNNING',
        PAUSED: 'PAUSED',
        FINISHED: 'FINISHED',
        STOPPED: 'STOPPED'
      }
    };
    
    this.currentState = this.states.STATUS.IDLE;
    this.listeners = [];
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  async setStatus(status) {
    if (!Object.values(this.states.STATUS).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    this.currentState = status;
    await StorageManager.set({ automationStatus: status });
    this.listeners.forEach(cb => cb(status));
  }

  async getStatus() {
    const result = await StorageManager.get('automationStatus');
    this.currentState = result.automationStatus || this.states.STATUS.IDLE;
    return this.currentState;
  }
}

if (typeof window !== 'undefined') {
  window.AutomationStateManager = new StateManager();
}
