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

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Normalize URL - add protocol if missing
 */
export function normalizeURL(urlString) {
  if (!urlString) return "";

  const trimmed = urlString.trim();

  // If no protocol, add https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Validate and sanitize URL
 */
export function validateAndSanitizeURL(urlString) {
  const normalized = normalizeURL(urlString);

  if (!isValidURL(normalized)) {
    throw new Error(
      "Invalid URL format. Please enter a valid http:// or https:// URL."
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
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    const parsed = JSON.parse(item);
    return parsed;
  } catch (e) {
    console.error("Failed to parse localStorage data:", e);
    return defaultValue;
  }
}
