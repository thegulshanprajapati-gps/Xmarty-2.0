/**
 * Content orchestrator for FlowAutomate Extension with advanced error handling and recovery
 */
class FlowAutomateContent {
  constructor() {
    this.abortController = null;
    this.isPaused = false;
    this.startTime = null;
    this.itemStartTimes = [];
    this.failedItemsList = [];
    this.currentAction = "Idle";
    this.completionInterval = null;
    
    // Selectors
    this.selectors = {
      inputField: [
        'input[aria-label]',
        'input[placeholder]',
        'input[role="textbox"]',
        'input[type="text"]'
      ],
      resultItem: [
        '[data-testid*="list-item"]',
        '[data-testid*="container"]',
        '[role="listitem"]',
        '[role="checkbox"]'
      ],
      selectableItem: [
        '[aria-checked="false"]',
        'input[type="checkbox"]',
        '[role="checkbox"]'
      ],
      selectedItem: [
        '[aria-checked="true"]'
      ],
      actionButton: [
        'button',
        '[role="button"]',
        '[data-testid*="button"]'
      ]
    };

    this.initializeUI();
    this.listenToMessages();
    this.restoreSession();
  }

  async restoreSession() {
    await AutomationQueueManager.loadFromStorage();
    const storedConfig = await StorageManager.get('selectorsConfig');
    if (storedConfig.selectorsConfig) {
      this.selectors = { ...this.selectors, ...storedConfig.selectorsConfig };
    }
    this.updateUI();
  }

  initializeUI() {
    if (document.getElementById('flow-automate-panel')) return;

    const version = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest)
      ? chrome.runtime.getManifest().version
      : '1.2.0';

    this.panelElement = document.createElement('div');
    this.panelElement.id = 'flow-automate-panel';
    this.panelElement.innerHTML = `
      <div class="panel-header" id="flow-panel-header">
        <span class="title">⚡ AnaAutomate v${version}</span>
        <div class="controls">
          <button id="flow-min-btn">—</button>
          <button id="flow-close-btn">×</button>
        </div>
      </div>
      <div class="panel-body">
        <!-- Live Status Panel -->
        <div class="status-panel">
          <div class="status-row">
            <span class="status-label">Current:</span>
            <span id="flow-current-item" class="status-value-text">-</span>
          </div>
          <div class="status-row">
            <span class="status-label">Action:</span>
            <span id="flow-current-action" class="status-value-text info">Idle</span>
          </div>
          <div class="status-row">
            <span class="status-label">Status:</span>
            <span id="flow-status-badge" class="status-badge idle">Idle</span>
          </div>
          <div class="status-row">
            <span class="status-label">Progress:</span>
            <span id="flow-progress-text" class="status-value-text">0/0</span>
          </div>
          <div class="status-row">
            <span class="status-label">ETA:</span>
            <span id="flow-eta-text" class="status-value-text">-</span>
          </div>
        </div>
        
        <div class="progress-container">
          <div id="flow-progress-bar" class="progress-bar"></div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">Success</div>
            <div id="flow-stat-success" class="stat-value success">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Failed</div>
            <div id="flow-stat-failed" class="stat-value failed">0</div>
          </div>
        </div>

        <div class="log-panel" id="flow-log-panel"></div>

        <!-- Action Panel -->
        <div class="action-row" id="flow-action-row">
          <button id="flow-skip-btn" class="action-btn secondary" style="display:none;">Skip Item</button>
          <button id="flow-start-btn" class="action-btn">Start</button>
        </div>

        <!-- Completion Report Modal Layer -->
        <div id="flow-completion-report" class="completion-report" style="display: none;">
          <h3 class="report-title">🎉 Run Completed</h3>
          <div class="report-stats">
            <div class="report-row"><span>Total Items:</span><span id="rep-total">0</span></div>
            <div class="report-row"><span>Successful:</span><span id="rep-success" class="success">0</span></div>
            <div class="report-row"><span>Failed:</span><span id="rep-failed" class="failed">0</span></div>
            <div class="report-row"><span>Duration:</span><span id="rep-duration">0 min</span></div>
          </div>
          <div id="flow-countdown-text" style="text-align: center; font-size: 12px; opacity: 0.8; margin: 8px 0; color: #ff9500; font-weight: bold;">Resetting to Idle in 5s...</div>
          <div class="report-buttons">
            <button id="flow-retry-failed-btn" class="action-btn">Retry Failed</button>
            <button id="flow-copy-failed-btn" class="action-btn secondary">Copy Failed</button>
            <button id="flow-export-report-btn" class="action-btn secondary">Export Logs</button>
          </div>
        </div>
      </div>

      <!-- Toast Layer Container -->
      <div id="flow-toast-container" class="toast-container"></div>
    `;

    document.body.appendChild(this.panelElement);
    this.makeDraggable(this.panelElement);
    this.setupUIListeners();

    if (typeof AutomationLogger !== 'undefined') {
      AutomationLogger.onLog((entry) => this.renderLog(entry));
    }
  }

  showToast(message, type = 'error') {
    const container = document.getElementById('flow-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flow-toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'error' ? '⚠️' : '✓'}</span>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  makeDraggable(el) {
    const header = document.getElementById('flow-panel-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
      el.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  setupUIListeners() {
    const minBtn = document.getElementById('flow-min-btn');
    minBtn.addEventListener('click', () => {
      this.panelElement.classList.toggle('minimized');
      minBtn.innerText = this.panelElement.classList.contains('minimized') ? '⬜' : '—';
    });

    document.getElementById('flow-close-btn').addEventListener('click', () => {
      this.panelElement.remove();
    });

    const startBtn = document.getElementById('flow-start-btn');
    startBtn.addEventListener('click', async () => {
      const status = await StorageManager.get('automationStatus');
      const curStatus = status.automationStatus || 'IDLE';

      if (curStatus === 'RUNNING') {
        this.pauseAutomation();
      } else {
        this.startAutomation();
      }
    });

    document.getElementById('flow-skip-btn').addEventListener('click', () => {
      this.skipCurrentItem();
    });

    // Report Actions
    document.getElementById('flow-retry-failed-btn').addEventListener('click', () => this.retryFailedItems());
    document.getElementById('flow-copy-failed-btn').addEventListener('click', () => this.copyFailedItems());
    document.getElementById('flow-export-report-btn').addEventListener('click', () => {
      if (typeof AutomationLogger !== 'undefined') {
        AutomationLogger.exportCSV();
      }
    });
  }

  renderLog(entry) {
    const panel = document.getElementById('flow-log-panel');
    if (!panel) return;
    const item = document.createElement('div');
    item.className = `log-item ${entry.category}`;
    const cleanTime = entry.timestamp.split('T')[1].slice(0, 8);
    item.innerText = `[${cleanTime}] ${entry.message}`;
    panel.appendChild(item);
    panel.scrollTop = panel.scrollHeight;
  }

  async updateUI() {
    if (!this.panelElement) return;

    const data = await StorageManager.get('automationStatus');
    const status = data.automationStatus || 'IDLE';
    const stats = AutomationQueueManager.getStats();

    // Update Live Panel Text
    const badge = document.getElementById('flow-status-badge');
    badge.className = `status-badge ${status.toLowerCase()}`;
    badge.innerText = status;

    const currentItemText = document.getElementById('flow-current-item');
    currentItemText.innerText = AutomationQueueManager.getCurrentItem() || '-';

    const actionText = document.getElementById('flow-current-action');
    actionText.innerText = this.currentAction;

    document.getElementById('flow-progress-text').innerText = `${AutomationQueueManager.currentIndex}/${stats.total}`;
    document.getElementById('flow-progress-bar').style.width = `${stats.progress}%`;

    document.getElementById('flow-stat-success').innerText = stats.success;
    document.getElementById('flow-stat-failed').innerText = stats.failed;

    // Show/Hide Skip Button
    const skipBtn = document.getElementById('flow-skip-btn');
    if (status === 'RUNNING') {
      skipBtn.style.display = 'block';
    } else {
      skipBtn.style.display = 'none';
    }

    const startBtn = document.getElementById('flow-start-btn');
    if (status === 'RUNNING') {
      startBtn.innerText = 'Pause';
      startBtn.style.background = '#ff9500';
    } else {
      startBtn.innerText = status === 'PAUSED' ? 'Resume' : 'Start';
      startBtn.style.background = '#007aff';
    }

    // Dynamic ETA calculation
    const etaText = document.getElementById('flow-eta-text');
    if (status === 'RUNNING' && this.itemStartTimes.length > 0) {
      const avgTime = this.itemStartTimes.reduce((a,b) => a+b, 0) / this.itemStartTimes.length;
      const etaMs = stats.remaining * avgTime;
      const etaMin = Math.ceil(etaMs / 60000);
      etaText.innerText = `${etaMin} min`;
    } else {
      etaText.innerText = '-';
    }

    // Finished Report Display
    const reportModal = document.getElementById('flow-completion-report');
    if (status === 'FINISHED') {
      reportModal.style.display = 'block';
      document.getElementById('rep-total').innerText = stats.total;
      document.getElementById('rep-success').innerText = stats.success;
      document.getElementById('rep-failed').innerText = stats.failed;
      
      const durationMs = Date.now() - (this.startTime || Date.now());
      const durationMin = Math.round(durationMs / 60000);
      document.getElementById('rep-duration').innerText = `${durationMin} min`;
    } else {
      reportModal.style.display = 'none';
    }
  }

  async startAutomation() {
    if (this.completionInterval) {
      clearInterval(this.completionInterval);
      this.completionInterval = null;
    }

    await AutomationQueueManager.loadFromStorage();
    if (AutomationQueueManager.items.length === 0) {
      this.showToast("Queue is empty. Load items first.", "error");
      AutomationLogger.error("Queue is empty.");
      return;
    }

    // Auto reset if the queue is already finished/completed
    if (AutomationQueueManager.currentIndex >= AutomationQueueManager.items.length) {
      AutomationLogger.info("Resetting queue to start from beginning.");
      await AutomationQueueManager.reset();
    }

    if (!this.startTime) this.startTime = Date.now();
    await StorageManager.set({ automationStatus: 'RUNNING' });
    this.abortController = new AbortController();
    this.isPaused = false;
    this.updateUI();

    AutomationLogger.info("Queue Started");
    this.runLoop();
  }

  async pauseAutomation() {
    if (this.completionInterval) {
      clearInterval(this.completionInterval);
      this.completionInterval = null;
    }

    this.isPaused = true;
    if (this.abortController) this.abortController.abort();
    await StorageManager.set({ automationStatus: 'PAUSED' });
    this.updateUI();
    AutomationLogger.warn("Queue Paused");
  }

  async stopAutomation() {
    if (this.completionInterval) {
      clearInterval(this.completionInterval);
      this.completionInterval = null;
    }

    this.isPaused = true;
    if (this.abortController) this.abortController.abort();
    await StorageManager.set({ automationStatus: 'STOPPED' });
    await AutomationQueueManager.reset();
    this.startTime = null;
    this.itemStartTimes = [];
    this.updateUI();
    AutomationLogger.error("Queue Stopped");
  }

  async skipCurrentItem() {
    const item = AutomationQueueManager.getCurrentItem();
    AutomationLogger.warn(`Skipped item: ${item}`);
    await AutomationQueueManager.next();
    this.updateUI();
  }

  async retryFailedItems() {
    if (this.failedItemsList.length === 0) {
      this.showToast("No failed items to retry.", "error");
      return;
    }
    AutomationQueueManager.setItems(this.failedItemsList);
    this.failedItemsList = [];
    this.startTime = Date.now();
    this.itemStartTimes = [];
    this.startAutomation();
  }

  copyFailedItems() {
    if (this.failedItemsList.length === 0) {
      this.showToast("No failed items to copy.", "error");
      return;
    }
    const txt = this.failedItemsList.join(', ');
    navigator.clipboard.writeText(txt);
    this.showToast("Copied to clipboard!", "success");
  }

  listenToMessages() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "start") {
        this.startAutomation();
        sendResponse({ success: true });
      } else if (request.action === "pause") {
        this.pauseAutomation();
        sendResponse({ success: true });
      } else if (request.action === "stop") {
        this.stopAutomation();
        sendResponse({ success: true });
      } else if (request.action === "updateQueue") {
        this.restoreSession();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  async runLoop() {
    const signal = this.abortController.signal;
    const settings = await StorageManager.get(['delayTime', 'retryCount']);
    const delay = settings.delayTime || 1500;
    const maxRetries = settings.retryCount || 3;

    while (AutomationQueueManager.currentIndex < AutomationQueueManager.items.length) {
      if (this.isPaused || signal.aborted) break;

      const item = AutomationQueueManager.getCurrentItem();
      const itemStartTime = Date.now();
      
      this.currentAction = `Searching: ${item}`;
      this.updateUI();
      AutomationLogger.info(`Searching: ${item}`);

      try {
        await AutomationRetryEngine.runWithRetry(async () => {
          // 1. Resolve search field input
          let inputEl = AutomationDOMController.resolveElement(this.selectors.inputField);
          if (!inputEl) {
            this.showToast("Search field not detected", "error");
            throw new Error("Search field not detected");
          }

          // 2. Clear & insert text
          AutomationDOMController.clearValue(inputEl);
          await new Promise(r => setTimeout(r, 200));
          AutomationDOMController.setValue(inputEl, item);

          // 3. Wait for matching selection result box
          this.currentAction = "Waiting for result...";
          this.updateUI();

          let textEl = null;
          let checkboxEl = null;
          let rowContainer = null;

          const resultEl = await AutomationRetryEngine.waitForElement(
            () => {
              const cleanSearchDigits = item.toString().replace(/\D/g, '');
              if (cleanSearchDigits) {
                const elements = document.querySelectorAll('span, div, [dir="auto"]');
                for (const el of elements) {
                  const title = el.getAttribute('title') || '';
                  const text = el.textContent || '';
                  const cleanTitle = title.replace(/\D/g, '');
                  const cleanText = text.replace(/\D/g, '');
                  
                  if ((cleanTitle && cleanTitle.includes(cleanSearchDigits)) || 
                      (cleanText && cleanText.includes(cleanSearchDigits) && el.children.length === 0)) {
                    textEl = el;
                    let parent = el.parentElement;
                    let highestRoleCheckbox = null;
                    let ariaCheckedAncestor = null;
                    for (let i = 0; i < 12; i++) {
                      if (!parent) break;
                      if (parent.hasAttribute('aria-checked')) {
                        ariaCheckedAncestor = parent;
                      }
                      if (parent.getAttribute('data-testid') === 'cell-frame-container' || 
                          parent.getAttribute('role') === 'checkbox' ||
                          parent.getAttribute('role') === 'row' ||
                          parent.getAttribute('role') === 'listitem') {
                        highestRoleCheckbox = parent;
                      }
                      parent = parent.parentElement;
                    }
                    rowContainer = ariaCheckedAncestor || highestRoleCheckbox;
                    return rowContainer;
                  }
                }
              }
              return AutomationDOMController.resolveElement(this.selectors.resultItem);
            },
            4000,
            250,
            signal
          );

          if (!resultEl) {
            this.showToast("No matching result found", "error");
            throw new Error("No matching result found");
          }

          // 4. Click selectable component
          this.currentAction = "Selecting...";
          this.updateUI();

          if (!rowContainer) {
            rowContainer = resultEl;
          }

          if (rowContainer) {
            checkboxEl = rowContainer.querySelector('[role="checkbox"]:not([data-testid="cell-frame-container"]), input[type="checkbox"]');
            if (!checkboxEl) {
              checkboxEl = rowContainer;
            }
          } else {
            checkboxEl = resultEl;
            rowContainer = resultEl;
          }

          const getCheckState = (el) => {
            if (!el) return false;
            if (el.getAttribute('aria-checked') === 'true' || el.checked === true || el.classList.contains('checked')) {
              return true;
            }
            if (el.querySelector) {
              const checkedChild = el.querySelector('[aria-checked="true"], input[type="checkbox"]:checked, .checked');
              if (checkedChild) return true;
            }
            return false;
          };

          try {
            if (getCheckState(rowContainer) || getCheckState(checkboxEl)) {
              AutomationLogger.info("Item already selected");
            } else {
              AutomationLogger.info("Step 1: Attempting to click row container / state owner...");
              AutomationDOMController.click(rowContainer);
              await new Promise(r => setTimeout(r, 150));
              
              if (!getCheckState(rowContainer) && !getCheckState(checkboxEl)) {
                AutomationLogger.info("Step 2: State did not update. Clicking inner checkbox element...");
                AutomationDOMController.click(checkboxEl);
                await new Promise(r => setTimeout(r, 150));
              }
              
              if (!getCheckState(rowContainer) && !getCheckState(checkboxEl)) {
                if (textEl) {
                  AutomationLogger.info("Step 3: Still not updated. Clicking text element...");
                  AutomationDOMController.click(textEl);
                  await new Promise(r => setTimeout(r, 150));
                }
              }

              // Verify if the checkbox is checked now
              if (!getCheckState(rowContainer) && !getCheckState(checkboxEl)) {
                throw new Error("Selection verification failed: checkbox is still not checked.");
              }
            }
          } catch (clickErr) {
            this.showToast(clickErr.message || "Could not select item", "error");
            throw clickErr;
          }

          // 5. Success confirm state wait
          AutomationLogger.success(`Success`);
          await new Promise(r => setTimeout(r, 600));
        }, maxRetries, 1000, signal);

        await AutomationQueueManager.markSuccess();
      } catch (err) {
        if (signal.aborted) break;
        
        // Track failed item list
        this.failedItemsList.push(item);
        AutomationLogger.error(`Added to failed list: ${err.message}`);
        await AutomationQueueManager.markFailed(err.message);
      }

      // Record performance item durations for ETA math
      this.itemStartTimes.push(Date.now() - itemStartTime);
      this.currentAction = "Idle";
      this.updateUI();

      // Delay between steps
      if (AutomationQueueManager.currentIndex < AutomationQueueManager.items.length - 1) {
        try {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, delay);
            signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new Error('aborted'));
            });
          });
        } catch (e) {
          break;
        }
      }

      await AutomationQueueManager.next();
    }

    if (AutomationQueueManager.currentIndex >= AutomationQueueManager.items.length) {
      await StorageManager.set({ automationStatus: 'FINISHED' });
      this.currentAction = "Completed";
      this.updateUI();

      const stats = AutomationQueueManager.getStats();
      const countdownText = document.getElementById('flow-countdown-text');
      
      if (stats.failed > 0) {
        if (countdownText) {
          countdownText.innerText = "Some items failed. Auto-reset disabled.";
          countdownText.style.color = "#ff3b30";
        }
        return;
      }

      let secondsLeft = 5;
      if (countdownText) {
        countdownText.innerText = `Resetting to Idle in ${secondsLeft}s...`;
        countdownText.style.color = "#ff9500";
      }
      
      if (this.completionInterval) {
        clearInterval(this.completionInterval);
      }
      
      this.completionInterval = setInterval(async () => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          clearInterval(this.completionInterval);
          this.completionInterval = null;
          const statusData = await StorageManager.get('automationStatus');
          if (statusData.automationStatus === 'FINISHED') {
            await AutomationQueueManager.reset();
            await StorageManager.set({ automationStatus: 'IDLE' });
            this.startTime = null;
            this.itemStartTimes = [];
            this.currentAction = "Idle";
            this.updateUI();
            AutomationLogger.info("Automation auto-reset to Idle status.");
          }
        } else {
          const statusData = await StorageManager.get('automationStatus');
          if (statusData.automationStatus !== 'FINISHED') {
            clearInterval(this.completionInterval);
            this.completionInterval = null;
          } else if (countdownText) {
            countdownText.innerText = `Resetting to Idle in ${secondsLeft}s...`;
          }
        }
      }, 1000);
    }
  }
}

if (typeof window !== 'undefined') {
  window.FlowAutomateInstance = new FlowAutomateContent();
}
