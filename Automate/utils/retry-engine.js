/**
 * RetryEngine - Element lookup and step retries
 */
class RetryEngine {
  /**
   * Polls the page for element selection
   * @param {function} resolveFn 
   * @param {number} timeoutMs 
   * @param {number} intervalMs 
   * @param {AbortSignal} [signal] 
   */
  async waitForElement(resolveFn, timeoutMs = 5000, intervalMs = 250, signal = null) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (signal && signal.aborted) {
          return reject(new Error('Process cancelled by user.'));
        }

        const el = resolveFn();
        if (el) return resolve(el);

        if (Date.now() - startTime > timeoutMs) {
          return reject(new Error(`Timeout waiting for elements to appear.`));
        }
        setTimeout(check, intervalMs);
      };
      check();
    });
  }

  /**
   * Executes callback action with configured attempts
   * @param {function} actionFn 
   * @param {number} maxRetries 
   * @param {number} delayMs 
   * @param {AbortSignal} [signal]
   */
  async runWithRetry(actionFn, maxRetries = 3, delayMs = 1000, signal = null) {
    let attempt = 0;
    while (attempt < maxRetries) {
      if (signal && signal.aborted) throw new Error('Aborted');
      try {
        return await actionFn();
      } catch (e) {
        attempt++;
        if (attempt >= maxRetries) throw e;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.AutomationRetryEngine = new RetryEngine();
}
