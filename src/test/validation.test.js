import { describe, it, expect } from "vitest";
import {
  isValidURL,
  normalizeURL,
  validateAndSanitizeURL,
  parseAndValidateTags,
  validateDirectoryName,
  sanitizeTitle,
  validateBookmark,
  sanitizeHTML,
  MAX_TAG_LENGTH,
  MAX_TAGS_COUNT,
  MAX_DIRECTORY_NAME_LENGTH,
  MAX_TITLE_LENGTH,
} from "../utils/validation.js";

describe("URL Validation", () => {
  describe("isValidURL", () => {
    it("should accept valid HTTP URLs", () => {
      expect(isValidURL("http://example.com")).toBe(true);
      expect(isValidURL("http://www.example.com")).toBe(true);
      expect(isValidURL("http://sub.example.com")).toBe(true);
    });

    it("should accept valid HTTPS URLs", () => {
      expect(isValidURL("https://example.com")).toBe(true);
      expect(isValidURL("https://www.example.com")).toBe(true);
      expect(isValidURL("https://api.example.com/path")).toBe(true);
    });

    it("should accept URLs with paths and query strings", () => {
      expect(isValidURL("https://example.com/path/to/page")).toBe(true);
      expect(isValidURL("https://example.com?query=value")).toBe(true);
      expect(isValidURL("https://example.com/path?q=1&p=2")).toBe(true);
    });

    it("should accept URLs with fragments", () => {
      expect(isValidURL("https://example.com#section")).toBe(true);
      expect(isValidURL("https://example.com/page#top")).toBe(true);
    });

    it("should accept localhost URLs", () => {
      expect(isValidURL("http://localhost")).toBe(true);
      expect(isValidURL("http://localhost:3000")).toBe(true);
      expect(isValidURL("https://localhost:8080")).toBe(true);
    });

    it("should accept IPv4 addresses", () => {
      expect(isValidURL("http://192.168.1.1")).toBe(true);
      expect(isValidURL("http://10.0.0.1:8080")).toBe(true);
      expect(isValidURL("https://127.0.0.1")).toBe(true);
    });

    it("should accept IPv6 addresses", () => {
      expect(isValidURL("http://[::1]")).toBe(true);
      expect(isValidURL("http://[2001:db8::1]")).toBe(true);
    });

    it("should accept valid port numbers", () => {
      expect(isValidURL("http://example.com:80")).toBe(true);
      expect(isValidURL("http://example.com:8080")).toBe(true);
      expect(isValidURL("https://example.com:443")).toBe(true);
      expect(isValidURL("http://example.com:65535")).toBe(true);
    });

    it("should reject single-label hostnames", () => {
      expect(isValidURL("http://example")).toBe(false);
      expect(isValidURL("http://asdf")).toBe(false);
      expect(isValidURL("https://test")).toBe(false);
      expect(isValidURL("http://notarealwebsite")).toBe(false);
    });

    it("should reject invalid protocols", () => {
      expect(isValidURL("ftp://example.com")).toBe(false);
      expect(isValidURL("file:///path/to/file")).toBe(false);
      expect(isValidURL("javascript:alert(1)")).toBe(false);
    });

    it("should reject malformed URLs", () => {
      expect(isValidURL("http://")).toBe(false);
      expect(isValidURL("https://")).toBe(false);
      expect(isValidURL("http://.com")).toBe(false);
      expect(isValidURL("http://..")).toBe(false);
      expect(isValidURL("http://-.com")).toBe(false);
      expect(isValidURL("http://example..com")).toBe(false);
    });

    it("should reject invalid port numbers", () => {
      expect(isValidURL("http://example.com:0")).toBe(false);
      expect(isValidURL("http://example.com:99999")).toBe(false);
      expect(isValidURL("http://example.com:-1")).toBe(false);
    });

    it("should reject empty or invalid inputs", () => {
      expect(isValidURL("")).toBe(false);
      expect(isValidURL(null)).toBe(false);
      expect(isValidURL(undefined)).toBe(false);
      expect(isValidURL(123)).toBe(false);
    });

    it("should handle case-insensitive protocols", () => {
      expect(isValidURL("HTTP://EXAMPLE.COM")).toBe(true);
      expect(isValidURL("hTTps://example.com")).toBe(true);
    });

    it("should reject URLs exceeding max length", () => {
      const longURL = "https://example.com/" + "a".repeat(2100);
      expect(isValidURL(longURL)).toBe(false);
    });
  });

  describe("normalizeURL", () => {
    it("should add https:// to URLs without protocol", () => {
      expect(normalizeURL("example.com")).toMatch(/^https:\/\/example\.com/);
      expect(normalizeURL("www.example.com")).toMatch(
        /^https:\/\/www\.example\.com/
      );
    });

    it("should preserve existing protocols", () => {
      expect(normalizeURL("http://example.com")).toBe("http://example.com/");
      expect(normalizeURL("https://example.com")).toBe("https://example.com/");
    });

    it("should handle URLs with paths", () => {
      expect(normalizeURL("example.com/path")).toBe("https://example.com/path");
    });

    it("should trim whitespace", () => {
      expect(normalizeURL("  example.com  ")).toMatch(
        /^https:\/\/example\.com/
      );
    });

    it("should return empty string for empty input", () => {
      expect(normalizeURL("")).toBe("");
      expect(normalizeURL(null)).toBe("");
    });
  });

  describe("validateAndSanitizeURL", () => {
    it("should accept and normalize valid URLs", () => {
      expect(validateAndSanitizeURL("example.com")).toMatch(
        /^https:\/\/example\.com/
      );
      expect(validateAndSanitizeURL("http://example.com")).toMatch(
        /^http:\/\/example\.com/
      );
    });

    it("should throw error for invalid URLs", () => {
      expect(() => validateAndSanitizeURL("not a url")).toThrow();
      expect(() => validateAndSanitizeURL("http://")).toThrow();
      expect(() => validateAndSanitizeURL("http://example")).toThrow();
    });

    it("should provide helpful error messages for single-label hostnames", () => {
      expect(() => validateAndSanitizeURL("http://example")).toThrow(
        /Invalid URL|complete domain name/
      );
    });
  });
});

describe("Tag Validation", () => {
  describe("parseAndValidateTags", () => {
    it("should parse comma-separated tags", () => {
      expect(parseAndValidateTags("tag1, tag2, tag3")).toEqual([
        "tag1",
        "tag2",
        "tag3",
      ]);
    });

    it("should trim whitespace", () => {
      expect(parseAndValidateTags(" tag1 , tag2 , tag3 ")).toEqual([
        "tag1",
        "tag2",
        "tag3",
      ]);
    });

    it("should remove empty tags", () => {
      expect(parseAndValidateTags("tag1,  , tag2,, tag3")).toEqual([
        "tag1",
        "tag2",
        "tag3",
      ]);
    });

    it("should remove duplicate tags (case-insensitive)", () => {
      expect(parseAndValidateTags("tag1, Tag1, TAG1")).toEqual(["tag1"]);
      expect(
        parseAndValidateTags("JavaScript, javascript, JAVASCRIPT")
      ).toEqual(["JavaScript"]);
    });

    it("should limit to MAX_TAGS_COUNT", () => {
      const manyTags = Array.from(
        { length: MAX_TAGS_COUNT + 5 },
        (_, i) => `tag${i}`
      ).join(",");
      const result = parseAndValidateTags(manyTags);
      expect(result.length).toBe(MAX_TAGS_COUNT);
    });

    it("should filter out tags exceeding MAX_TAG_LENGTH", () => {
      const longTag = "a".repeat(MAX_TAG_LENGTH + 1);
      expect(parseAndValidateTags(`tag1, ${longTag}, tag2`)).toEqual([
        "tag1",
        "tag2",
      ]);
    });

    it("should handle empty or invalid input", () => {
      expect(parseAndValidateTags("")).toEqual([]);
      expect(parseAndValidateTags(null)).toEqual([]);
      expect(parseAndValidateTags(undefined)).toEqual([]);
    });

    it("should sanitize HTML in tags", () => {
      const result = parseAndValidateTags(
        '<script>alert("xss")</script>, normalTag'
      );
      expect(result[0]).not.toContain("<script>");
      expect(result).toContain("normalTag");
    });
  });
});

describe("Directory Name Validation", () => {
  describe("validateDirectoryName", () => {
    it("should accept valid directory names", () => {
      expect(validateDirectoryName("Work")).toBe("Work");
      expect(validateDirectoryName("Personal Projects")).toBe(
        "Personal Projects"
      );
      expect(validateDirectoryName("Dev-2024")).toBe("Dev-2024");
    });

    it("should trim whitespace", () => {
      expect(validateDirectoryName("  Work  ")).toBe("Work");
    });

    it("should reject empty names", () => {
      expect(() => validateDirectoryName("")).toThrow("cannot be empty");
      expect(() => validateDirectoryName("   ")).toThrow("cannot be empty");
      expect(() => validateDirectoryName(null)).toThrow("cannot be empty");
    });

    it("should reject names exceeding max length", () => {
      const longName = "a".repeat(MAX_DIRECTORY_NAME_LENGTH + 1);
      expect(() => validateDirectoryName(longName)).toThrow(
        "characters or less"
      );
    });

    it("should reject invalid characters", () => {
      expect(() => validateDirectoryName("Work<>:")).toThrow(
        "invalid characters"
      );
      expect(() => validateDirectoryName("Work/Stuff")).toThrow(
        "invalid characters"
      );
      expect(() => validateDirectoryName("Work|Personal")).toThrow(
        "invalid characters"
      );
    });

    it("should sanitize HTML when valid characters", () => {
      const result = validateDirectoryName("Work & Projects");
      expect(result).toBe("Work &amp; Projects");
    });
  });
});

describe("Title Sanitization", () => {
  describe("sanitizeTitle", () => {
    it("should return sanitized title", () => {
      expect(sanitizeTitle("Normal Title")).toBe("Normal Title");
    });

    it("should sanitize HTML", () => {
      const result = sanitizeTitle('<script>alert("xss")</script>Title');
      expect(result).not.toContain("<script>");
    });

    it("should truncate long titles", () => {
      const longTitle = "a".repeat(MAX_TITLE_LENGTH + 100);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH + 3); // +3 for ellipsis
      expect(result).toContain("...");
    });

    it("should handle empty input", () => {
      expect(sanitizeTitle("")).toBe("");
      expect(sanitizeTitle(null)).toBe("");
    });
  });
});

describe("HTML Sanitization", () => {
  describe("sanitizeHTML", () => {
    it("should escape HTML tags", () => {
      const result = sanitizeHTML('<script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });

    it("should escape special characters", () => {
      const result = sanitizeHTML("<b>Bold</b> & text");
      expect(result).toContain("&lt;b&gt;");
      expect(result).toContain("&amp;");
      expect(result).not.toContain("<b>");
    });

    it("should handle empty input", () => {
      expect(sanitizeHTML("")).toBe("");
      expect(sanitizeHTML(null)).toBe("");
    });
  });
});

describe("Bookmark Validation", () => {
  describe("validateBookmark", () => {
    const validBookmark = {
      id: 1,
      url: "https://example.com",
      title: "Example",
      dateAdded: new Date().toISOString(),
      tags: ["tag1", "tag2"],
      directory: "unsorted",
    };

    it("should accept valid bookmarks", () => {
      expect(validateBookmark(validBookmark)).toBe(true);
    });

    it("should reject bookmarks missing required fields", () => {
      expect(validateBookmark({ ...validBookmark, id: undefined })).toBe(false);
      expect(validateBookmark({ ...validBookmark, url: undefined })).toBe(
        false
      );
      expect(validateBookmark({ ...validBookmark, title: undefined })).toBe(
        false
      );
      expect(validateBookmark({ ...validBookmark, dateAdded: undefined })).toBe(
        false
      );
    });

    it("should reject bookmarks with invalid types", () => {
      expect(validateBookmark({ ...validBookmark, id: "string" })).toBe(false);
      expect(validateBookmark({ ...validBookmark, url: 123 })).toBe(false);
    });

    it("should reject bookmarks with invalid URLs", () => {
      expect(validateBookmark({ ...validBookmark, url: "not a url" })).toBe(
        false
      );
      expect(
        validateBookmark({ ...validBookmark, url: "http://example" })
      ).toBe(false);
    });

    it("should reject bookmarks with invalid tags", () => {
      expect(validateBookmark({ ...validBookmark, tags: "not an array" })).toBe(
        false
      );
    });

    it("should reject bookmarks with invalid dates", () => {
      expect(
        validateBookmark({ ...validBookmark, dateAdded: "invalid date" })
      ).toBe(false);
      expect(
        validateBookmark({ ...validBookmark, dateAdded: "not-a-date" })
      ).toBe(false);
    });

    it("should reject null or non-object input", () => {
      expect(validateBookmark(null)).toBe(false);
      expect(validateBookmark(undefined)).toBe(false);
      expect(validateBookmark("string")).toBe(false);
      expect(validateBookmark(123)).toBe(false);
    });
  });
});
