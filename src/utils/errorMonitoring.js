/**
 * Error monitoring utility
 * Initializes global error handlers for the application
 */

export function initErrorMonitoring() {
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("Uncaught error:", { message, source, lineno, colno, error });
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  };
}
