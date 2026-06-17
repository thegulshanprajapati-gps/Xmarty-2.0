/**
 * FlowAutomate Popup Dashboard Orchestrator
 */
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  await restoreConfigurations();
  await refreshQueuePreview();

  // Load button binding
  document.getElementById('load-queue-btn').addEventListener('click', loadInputQueue);
  document.getElementById('add-queue-btn').addEventListener('click', addToQueue);
  document.getElementById('clear-queue-btn').addEventListener('click', clearQueue);
  document.getElementById('save-selectors-btn').addEventListener('click', saveSelectors);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

  document.getElementById('pop-start-btn').addEventListener('click', () => sendActionToTab('start'));
  document.getElementById('pop-pause-btn').addEventListener('click', () => sendActionToTab('pause'));
  document.getElementById('pop-stop-btn').addEventListener('click', () => sendActionToTab('stop'));

  // CSV Import
  const fileInput = document.getElementById('csv-file-input');
  document.getElementById('import-csv-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleCSVImport);

  // Queue Export
  document.getElementById('export-queue-btn').addEventListener('click', exportQueueToCSV);
});

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

async function restoreConfigurations() {
  const data = await StorageManager.get(['selectorsConfig', 'delayTime', 'retryCount']);
  
  // Restore Selectors
  const selectors = data.selectorsConfig || {};
  if (selectors.inputField) {
    document.getElementById('selector-input-field').value = selectors.inputField.join('\n');
  }
  if (selectors.resultItem) {
    document.getElementById('selector-result-item').value = selectors.resultItem.join('\n');
  }
  if (selectors.selectableItem) {
    document.getElementById('selector-selectable-item').value = selectors.selectableItem.join('\n');
  }

  // Restore Settings
  document.getElementById('delay-time').value = data.delayTime || 1500;
  document.getElementById('retry-count').value = data.retryCount || 3;
}

async function saveSelectors() {
  const inputField = document.getElementById('selector-input-field').value.split('\n').map(s => s.trim()).filter(Boolean);
  const resultItem = document.getElementById('selector-result-item').value.split('\n').map(s => s.trim()).filter(Boolean);
  const selectableItem = document.getElementById('selector-selectable-item').value.split('\n').map(s => s.trim()).filter(Boolean);

  await StorageManager.set({
    selectorsConfig: { inputField, resultItem, selectableItem }
  });
  alert('Selectors updated.');
  sendActionToTab('updateQueue');
}

async function saveSettings() {
  const delayTime = parseInt(document.getElementById('delay-time').value, 10);
  const retryCount = parseInt(document.getElementById('retry-count').value, 10);

  await StorageManager.set({ delayTime, retryCount });
  alert('Settings saved.');
  sendActionToTab('updateQueue');
}

async function loadInputQueue() {
  const rawText = document.getElementById('queue-input').value;
  if (!rawText.trim()) return alert('Please enter items.');

  const items = rawText.split(',')
    .map(i => i.trim())
    .filter(Boolean);

  // Use QueueManager class to trim and remove duplicates
  const qm = new QueueManager();
  await qm.setItems(items);

  document.getElementById('queue-input').value = '';
  await refreshQueuePreview();
  sendActionToTab('updateQueue');
}

async function addToQueue() {
  const rawText = document.getElementById('queue-input').value;
  if (!rawText.trim()) return alert('Please enter items.');

  const items = rawText.split(',')
    .map(i => i.trim())
    .filter(Boolean);

  const qm = new QueueManager();
  await qm.loadFromStorage();
  await qm.appendItems(items);

  document.getElementById('queue-input').value = '';
  await refreshQueuePreview();
  sendActionToTab('updateQueue');
}

async function refreshQueuePreview() {
  const data = await StorageManager.get(['queueItems', 'queueIndex', 'queueResults']);
  const items = data.queueItems || [];
  const currentIndex = data.queueIndex || 0;
  const results = data.queueResults || {};

  const previewCount = document.getElementById('preview-count');
  const listContainer = document.getElementById('queue-list');

  previewCount.innerText = items.length;
  listContainer.innerHTML = '';

  if (items.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No items loaded.</div>';
    return;
  }

  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'queue-item';
    if (index === currentIndex) el.classList.add('active');

    const result = results[index];
    let statusBadge = '';
    if (result) {
      el.classList.add(result.status);
      statusBadge = `<span class="badge-${result.status}">${result.status.toUpperCase()}</span>`;
    }

    el.innerHTML = `<span>#${index + 1} - ${item}</span> ${statusBadge}`;
    listContainer.appendChild(el);
  });
}

async function handleCSVImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const items = text.split(/[\r\n,]+/)
      .map(i => i.trim())
      .filter(Boolean);

    if (items.length === 0) return alert('No valid items found.');

    const qm = new QueueManager();
    await qm.setItems(items);

    await refreshQueuePreview();
    sendActionToTab('updateQueue');
    alert(`Imported ${items.length} items.`);
  };
  reader.readAsText(file);
}

async function exportQueueToCSV() {
  const data = await StorageManager.get('queueItems');
  const items = data.queueItems || [];
  if (items.length === 0) return alert('Queue is empty.');

  const csvContent = "data:text/csv;charset=utf-8," + items.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `flow_automate_queue.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function sendActionToTab(action) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action }, () => {
        if (chrome.runtime.lastError) {
          // Tab not matching active script
        } else {
          refreshQueuePreview();
        }
      });
    }
  }
}

async function clearQueue() {
  if (confirm("Are you sure you want to clear the queue?")) {
    const qm = new QueueManager();
    await qm.setItems([]);
    await StorageManager.set({ automationStatus: 'IDLE' });
    await refreshQueuePreview();
    sendActionToTab('updateQueue');
  }
}
