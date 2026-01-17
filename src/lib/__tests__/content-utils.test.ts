import { describe, expect, it } from "vitest";
import { calculateReadTime, countWords, truncateContent } from "../content-utils";

/**
 * Content Utilities Tests
 *
 * Tests for content manipulation functions used in the public Learn feature,
 * including subscriber article teaser truncation.
 */

describe("truncateContent", () => {
  describe("basic functionality", () => {
    it("should return original content if under word limit", () => {
      const content = "This is a short article with only a few words.";
      const result = truncateContent(content, 200);

      expect(result.content).toBe(content);
      expect(result.isTruncated).toBe(false);
    });

    it("should truncate content that exceeds word limit", () => {
      // Create content with exactly 250 words
      const words = Array(250).fill("word");
      const content = words.join(" ");
      const result = truncateContent(content, 200);

      expect(result.isTruncated).toBe(true);
      expect(result.content.endsWith("...")).toBe(true);
    });

    it("should have correct number of words when truncated", () => {
      // Create content with 300 words
      const words = Array(300).fill("test");
      const content = words.join(" ");
      const result = truncateContent(content, 200);

      // Count words in truncated content (excluding the ellipsis)
      const truncatedWords = result.content
        .replace("...", "")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      expect(truncatedWords.length).toBe(200);
    });

    it("should not truncate content exactly at word limit", () => {
      const words = Array(200).fill("word");
      const content = words.join(" ");
      const result = truncateContent(content, 200);

      expect(result.isTruncated).toBe(false);
      expect(result.content).toBe(content);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = truncateContent("", 200);

      expect(result.content).toBe("");
      expect(result.isTruncated).toBe(false);
    });

    it("should handle single word", () => {
      const result = truncateContent("Hello", 200);

      expect(result.content).toBe("Hello");
      expect(result.isTruncated).toBe(false);
    });

    it("should handle content with multiple spaces", () => {
      const content = "word1   word2    word3     word4";
      const result = truncateContent(content, 2);

      expect(result.isTruncated).toBe(true);
      expect(result.content).toBe("word1 word2...");
    });

    it("should handle content with newlines", () => {
      const content = "word1\nword2\n\nword3";
      const result = truncateContent(content, 2);

      expect(result.isTruncated).toBe(true);
      expect(result.content).toBe("word1 word2...");
    });

    it("should handle content with tabs", () => {
      const content = "word1\tword2\t\tword3";
      const result = truncateContent(content, 2);

      expect(result.isTruncated).toBe(true);
      expect(result.content).toBe("word1 word2...");
    });

    it("should use default word limit of 200", () => {
      const words = Array(250).fill("word");
      const content = words.join(" ");
      const result = truncateContent(content);

      const truncatedWords = result.content
        .replace("...", "")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      expect(truncatedWords.length).toBe(200);
    });

    it("should handle custom word limits", () => {
      const words = Array(100).fill("word");
      const content = words.join(" ");
      const result = truncateContent(content, 50);

      const truncatedWords = result.content
        .replace("...", "")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      expect(truncatedWords.length).toBe(50);
      expect(result.isTruncated).toBe(true);
    });
  });

  describe("markdown content", () => {
    it("should preserve markdown formatting in truncated content", () => {
      const content = "## Introduction\n\nThis is **bold** and *italic* text. More words here.";
      const result = truncateContent(content, 5);

      expect(result.isTruncated).toBe(true);
      // First 5 "words" including markdown symbols
      expect(result.content).toContain("##");
    });

    it("should handle markdown headers in word count", () => {
      const content = "# Title\n\nParagraph text here.";
      const result = truncateContent(content, 10);

      expect(result.isTruncated).toBe(false);
    });
  });
});

describe("calculateReadTime", () => {
  it("should return 1 minute for short content", () => {
    const content = "This is a short article.";
    expect(calculateReadTime(content)).toBe(1);
  });

  it("should calculate read time based on 200 words per minute", () => {
    // 400 words should be 2 minutes
    const words = Array(400).fill("word");
    const content = words.join(" ");
    expect(calculateReadTime(content)).toBe(2);
  });

  it("should round up to nearest minute", () => {
    // 250 words should be 2 minutes (rounds up from 1.25)
    const words = Array(250).fill("word");
    const content = words.join(" ");
    expect(calculateReadTime(content)).toBe(2);
  });

  it("should return 1 for empty string", () => {
    expect(calculateReadTime("")).toBe(1);
  });

  it("should handle content with multiple spaces", () => {
    const content = "word1   word2    word3"; // 3 words
    expect(calculateReadTime(content)).toBe(1);
  });

  it("should return 5 minutes for 1000 word article", () => {
    const words = Array(1000).fill("word");
    const content = words.join(" ");
    expect(calculateReadTime(content)).toBe(5);
  });
});

describe("countWords", () => {
  it("should count words correctly", () => {
    expect(countWords("one two three")).toBe(3);
  });

  it("should handle multiple spaces", () => {
    expect(countWords("one   two    three")).toBe(3);
  });

  it("should handle newlines", () => {
    expect(countWords("one\ntwo\nthree")).toBe(3);
  });

  it("should return 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("should handle single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("should ignore empty entries from split", () => {
    expect(countWords("  word  ")).toBe(1);
  });
});
