/**
 * Error Monitoring and Logging
 *
 * This module provides error tracking and monitoring capabilities.
 *
 * For production monitoring, install Sentry:
 * npm install @sentry/react
 * Then configure VITE_SENTRY_DSN in .env.production
 */

// Environment configuration
const isDevelopment = import.meta.env.DEV;

/**
 * Initialize error monitoring service
 * Call this once at app startup
 *
 * Note: Sentry integration is optional and disabled by default.
 * Install @sentry/react and configure VITE_SENTRY_DSN to enable.
 */
export async function initErrorMonitoring() {
  if (isDevelopment) {
    console.info("[Error Monitoring] Running in development mode");
  }
  // Sentry setup would go here if installed
  // See DEPLOYMENT.md for setup instructions
}

/**
 * Log an error to monitoring service
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context
 */
export function logError(error, context = {}) {
  console.error("[Error]", error, context);
  // Future: Add Sentry captureException here if configured
}

/**
 * Log a message for debugging
 * @param {string} message - The message to log
 * @param {Object} context - Additional context
 */
export function logMessage(message, context = {}) {
  if (isDevelopment) {
    console.log("[Info]", message, context);
  }
  // Future: Add Sentry captureMessage here if configured
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
export function setUserContext(user) {
  if (isDevelopment) {
    console.log("[User Context]", user);
  }
  // Future: Add Sentry setUser here if configured
}

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (e.g., 'user-action', 'navigation')
 * @param {Object} data - Additional data
 */
export function addBreadcrumb(message, category = "info", data = {}) {
  if (isDevelopment) {
    console.debug(`[Breadcrumb: ${category}]`, message, data);
  }
  // Future: Add Sentry addBreadcrumb here if configured
}

/**
 * Performance monitoring - measure operation duration
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 */
export async function measurePerformance(operation, fn) {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    if (isDevelopment && duration > 1000) {
      console.warn(`[Performance] ${operation} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logError(error, { operation, duration });
    throw error;
  }
}

export default {
  initErrorMonitoring,
  logError,
  logMessage,
  setUserContext,
  addBreadcrumb,
  measurePerformance,
};
