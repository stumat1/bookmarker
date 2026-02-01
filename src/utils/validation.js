/**
 * Validation and Sanitization Utilities
 */

// Constants
export const MAX_URL_LENGTH = 2048;
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS_COUNT = 20;
export const MAX_DIRECTORY_NAME_LENGTH = 100;
export const MAX_TITLE_LENGTH = 500;

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(str) {
  if (!str) return "";

  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Validate URL format and protocol
 */
export function isValidURL(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }

  // Check length
  if (urlString.length > MAX_URL_LENGTH) {
    return false;
  }

  // Try to create URL object
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    // Check for valid hostname
    if (!url.hostname || url.hostname.length < 3) {
      return false;
    }

    // Check for special cases first
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname);
    const isIPv6 = url.hostname.startsWith("[") && url.hostname.endsWith("]");
    const isLocalhost = url.hostname === "localhost";

    // For regular hostnames (not IP or localhost), require at least one dot
    // This prevents single-label hostnames like "asdf", "test", etc.
    if (!isIPv4 && !isIPv6 && !isLocalhost) {
      // Must contain at least one dot (e.g., example.com, sub.example.com)
      if (!url.hostname.includes(".")) {
        return false;
      }

      // Validate hostname format (no double dots, no hyphens at start/end, valid characters)
      // Regex: alphanumeric start/end, can contain hyphens in middle, dots separate labels
      const hostnameRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!hostnameRegex.test(url.hostname)) {
        return false;
      }
    }

    // Validate port number if present
    if (url.port) {
      const portNum = parseInt(url.port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Normalize URL - add protocol if missing and handle encoding
 */
export function normalizeURL(urlString) {
  if (!urlString) return "";

  const trimmed = urlString.trim();

  // If no protocol, add https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }

  // Use URL constructor to properly handle and encode Unicode characters
  try {
    const url = new URL(trimmed);
    return url.href; // Returns properly encoded URL
  } catch (e) {
    // If URL parsing fails, return as-is and let validation catch it
    return trimmed;
  }
}

/**
 * Validate and sanitize URL
 */
export function validateAndSanitizeURL(urlString) {
  const normalized = normalizeURL(urlString);

  if (!isValidURL(normalized)) {
    // Provide specific error message based on the issue
    try {
      const url = new URL(normalized);
      if (
        !url.hostname.includes(".") &&
        url.hostname !== "localhost" &&
        !url.hostname.startsWith("[")
      ) {
        throw new Error(
          "Invalid URL. Please enter a complete domain name (e.g., example.com, www.site.com)."
        );
      }
    } catch (e) {
      // Fall through to generic error
    }
    throw new Error(
      "Invalid URL format. Please enter a valid http:// or https:// URL with a proper domain name."
    );
  }

  return normalized;
}

/**
 * Parse and validate tags
 */
export function parseAndValidateTags(tagsString) {
  if (!tagsString || typeof tagsString !== "string") {
    return [];
  }

  const tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0) // Remove empty strings
    .filter((tag) => tag.length <= MAX_TAG_LENGTH) // Remove too-long tags
    .map((tag) => sanitizeHTML(tag)) // Sanitize each tag
    .slice(0, MAX_TAGS_COUNT); // Limit number of tags

  // Remove duplicates (case-insensitive)
  const uniqueTags = [];
  const lowerCaseTags = new Set();

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (!lowerCaseTags.has(lowerTag)) {
      lowerCaseTags.add(lowerTag);
      uniqueTags.push(tag);
    }
  }

  return uniqueTags;
}

/**
 * Validate directory name
 */
export function validateDirectoryName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Directory name cannot be empty.");
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new Error("Directory name cannot be empty.");
  }

  if (trimmed.length > MAX_DIRECTORY_NAME_LENGTH) {
    throw new Error(
      `Directory name must be ${MAX_DIRECTORY_NAME_LENGTH} characters or less.`
    );
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(trimmed)) {
    throw new Error("Directory name contains invalid characters.");
  }

  return sanitizeHTML(trimmed);
}

/**
 * Sanitize and validate title
 */
export function sanitizeTitle(title) {
  if (!title) return "";

  const sanitized = sanitizeHTML(title);

  if (sanitized.length > MAX_TITLE_LENGTH) {
    return sanitized.substring(0, MAX_TITLE_LENGTH) + "...";
  }

  return sanitized;
}

/**
 * Validate bookmark object
 */
export function validateBookmark(bookmark) {
  if (!bookmark || typeof bookmark !== "object") {
    return false;
  }

  // Required fields
  if (!bookmark.id || !bookmark.url || !bookmark.title || !bookmark.dateAdded) {
    return false;
  }

  // Validate types
  if (typeof bookmark.id !== "number" || typeof bookmark.url !== "string") {
    return false;
  }

  // Validate URL
  if (!isValidURL(bookmark.url)) {
    return false;
  }

  // Validate tags array
  if (!Array.isArray(bookmark.tags)) {
    return false;
  }

  // Validate dateAdded is a valid date
  const date = new Date(bookmark.dateAdded);
  if (isNaN(date.getTime())) {
    return false;
  }

  return true;
}

/**
 * Check localStorage quota and handle errors
 */
export function safeLocalStorageSet(key, value) {
  try {
    const stringValue = JSON.stringify(value);

    // Check if we're approaching quota (rough estimate)
    const estimatedSize = new Blob([stringValue]).size;
    if (estimatedSize > 4.5 * 1024 * 1024) {
      // 4.5MB warning threshold
      console.warn("LocalStorage approaching quota limit");
    }

    localStorage.setItem(key, stringValue);
    return true;
  } catch (e) {
    if (
      e.name === "QuotaExceededError" ||
      e.name === "NS_ERROR_DOM_QUOTA_REACHED"
    ) {
      throw new Error(
        "Storage quota exceeded. Please export your bookmarks and clear some data."
      );
    }
    throw new Error("Failed to save data: " + e.message);
  }
}

/**
 * Safely parse localStorage data
 */
export function safeLocalStorageGet(key, defaultValue = null) {
  try {
    // Check if localStorage is available
    if (typeof localStorage === "undefined" || !localStorage) {
      console.warn("localStorage is not available");
      return defaultValue;
    }

    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    const parsed = JSON.parse(item);
    return parsed;
  } catch (e) {
    console.error("Failed to parse localStorage data:", e);
    // Check if it's a localStorage access error
    if (e.name === "SecurityError" || e.message.includes("localStorage")) {
      throw new Error(
        "localStorage access denied. Please check browser settings."
      );
    }
    return defaultValue;
  }
}
