/**
 * RetryEngine - Element wait engine with AbortController support
 */
class RetryEngine {
  /**
   * Polls the DOM until selector is resolved or timeout is reached
   * @param {function} resolveFn - Function that returns HTMLElement or null
   * @param {number} timeoutMs 
   * @param {number} intervalMs 
   * @param {AbortSignal} [signal] 
   * @returns {Promise<HTMLElement>}
   */
  async waitForElement(resolveFn, timeoutMs = 5000, intervalMs = 250, signal = null) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const check = () => {
        if (signal && signal.aborted) {
          return reject(new Error('Operation aborted by user.'));
        }

        const el = resolveFn();
        if (el) {
          return resolve(el);
        }

        if (Date.now() - startTime > timeoutMs) {
          return reject(new Error(`Element wait timed out after ${timeoutMs}ms.`));
        }

        setTimeout(check, intervalMs);
      };

      check();
    });
  }

  /**
   * Executes an async action with simple retry configuration
   * @param {function} actionFn 
   * @param {number} maxRetries 
   * @param {number} delayMs 
   * @param {AbortSignal} [signal]
   */
  async executeWithRetry(actionFn, maxRetries = 3, delayMs = 1000, signal = null) {
    let attempt = 0;
    while (attempt < maxRetries) {
      if (signal && signal.aborted) throw new Error('Aborted');
      try {
        return await actionFn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.AutomationRetryEngine = new RetryEngine();
}
