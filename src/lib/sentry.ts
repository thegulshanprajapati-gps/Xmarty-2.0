// Enterprise Sentry Observability Configuration
class SentryTracker {
  private dsn: string = "";

  constructor() {
    this.dsn = process.env.SENTRY_DSN || "";
    if (this.dsn) {
      try {
        const Sentry = require('@sentry/nextjs');
        Sentry.init({
          dsn: this.dsn,
          tracesSampleRate: 1.0,
          debug: false,
        });
        console.log("Sentry telemetry engine initialized.");
      } catch (err) {
        console.warn("Sentry packages could not load.");
      }
    }
  }

  captureException(error: any, metadata: Record<string, any> = {}) {
    console.error("Sentry Exception Captured:", error, metadata);
    if (this.dsn) {
      try {
        const Sentry = require('@sentry/nextjs');
        Sentry.withScope((scope: any) => {
          Object.entries(metadata).forEach(([key, val]) => {
            scope.setTag(key, String(val));
          });
          Sentry.captureException(error);
        });
      } catch (e) {}
    }
  }

  captureMessage(message: string, metadata: Record<string, any> = {}) {
    console.log("Sentry Message Captured:", message, metadata);
    if (this.dsn) {
      try {
        const Sentry = require('@sentry/nextjs');
        Sentry.withScope((scope: any) => {
          Object.entries(metadata).forEach(([key, val]) => {
            scope.setTag(key, String(val));
          });
          Sentry.captureMessage(message);
        });
      } catch (e) {}
    }
  }
}

export const sentryTracker = new SentryTracker();
