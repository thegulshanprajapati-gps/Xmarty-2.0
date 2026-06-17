/**
 * DOMController - Manages element operations and events
 */
class DOMController {
  /**
   * Safe click event dispatcher
   * @param {HTMLElement} element 
   */
  click(element) {
    if (!element) return;
    try {
      element.focus();
    } catch (e) {}
    
    const options = { bubbles: true, cancelable: true, view: window, buttons: 1 };
    
    // Dispatch Pointer Events for modern touch/pointer listeners (React Native Web, etc.)
    try {
      element.dispatchEvent(new PointerEvent('pointerdown', options));
    } catch (e) {}
    
    // Dispatch Mouse Events
    try {
      element.dispatchEvent(new MouseEvent('mousedown', options));
    } catch (e) {}
    
    try {
      element.dispatchEvent(new PointerEvent('pointerup', options));
    } catch (e) {}
    
    try {
      element.dispatchEvent(new MouseEvent('mouseup', options));
    } catch (e) {}
    
    try {
      element.click();
    } catch (e) {}
  }

  /**
   * Sets text value on inputs triggering events
   * @param {HTMLInputElement} inputEl 
   * @param {string} value 
   */
  setValue(inputEl, value) {
    if (!inputEl) return;
    inputEl.focus();
    inputEl.value = value;
    
    // Dispatch lifecycle events
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Keystroke emulation
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: value.slice(-1) }));
    inputEl.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: value.slice(-1) }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: value.slice(-1) }));
  }

  /**
   * Clears value of text input
   * @param {HTMLInputElement} inputEl 
   */
  clearValue(inputEl) {
    if (!inputEl) return;
    inputEl.focus();
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Resolves first matching element from query options
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
      } catch (e) {
        // Discard invalid syntax
      }
    }
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.AutomationDOMController = new DOMController();
}
