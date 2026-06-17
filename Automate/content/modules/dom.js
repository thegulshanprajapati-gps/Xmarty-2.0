/**
 * DOMController - Standardized DOM interactions and emulation
 */
class DOMController {
  /**
   * Set text value and dispatch standard input/change events
   * @param {HTMLInputElement} inputEl 
   * @param {string} value 
   */
  setValue(inputEl, value) {
    inputEl.focus();
    inputEl.value = value;
    
    // Dispatch events to trigger framework data binding (React, Angular, Vue, etc.)
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Emulate key events for standard listeners
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: value.slice(-1) }));
    inputEl.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: value.slice(-1) }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: value.slice(-1) }));
  }

  /**
   * Click element and dispatch pointer events
   * @param {HTMLElement} element 
   */
  click(element) {
    element.focus();
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.click();
  }

  /**
   * Clears the input field and triggers change events
   * @param {HTMLInputElement} inputEl 
   */
  clearValue(inputEl) {
    inputEl.focus();
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

if (typeof window !== 'undefined') {
  window.AutomationDOMController = new DOMController();
}
