/**
 * Logger - Event tracking and export controls
 */
class Logger {
  constructor() {
    this.logs = [];
    this.onLogCallbacks = [];
  }

  onLog(cb) {
    this.onLogCallbacks.push(cb);
  }

  log(category, message) {
    const entry = {
      timestamp: new Date().toISOString(),
      category,
      message
    };
    this.logs.push(entry);
    console.log(`[FlowAutomate][${category.toUpperCase()}] ${message}`);

    if (typeof StorageManager !== 'undefined') {
      StorageManager.get('logs').then(result => {
        const storedLogs = result.logs || [];
        storedLogs.push(entry);
        StorageManager.set({ logs: storedLogs });
      });
    }

    this.onLogCallbacks.forEach(cb => cb(entry));
  }

  info(msg) { this.log('info', msg); }
  success(msg) { this.log('success', msg); }
  error(msg) { this.log('error', msg); }
  warn(msg) { this.log('warning', msg); }

  clear() {
    this.logs = [];
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set({ logs: [] });
    }
  }

  exportCSV() {
    const headers = ['Timestamp', 'Category', 'Message'];
    const rows = this.logs.map(l => [l.timestamp, l.category, `"${l.message.replace(/"/g, '""')}"`]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flow_automate_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

if (typeof window !== 'undefined') {
  window.AutomationLogger = new Logger();
}
