import { describe, expect, it } from "vitest";
import { estateChecklistTemplates } from "@/convex/seeds/estateChecklistTemplates";

/**
 * Estate Checklist Templates Tests
 *
 * Validates the integrity of the default checklist template data
 * seeded when estate mode is activated. Ensures all templates have
 * required fields, valid categories, and sensible ordering.
 */

const VALID_CATEGORIES = [
  "first_things_first",
  "legal_and_financial",
  "property_and_assets",
  "notifications",
  "ongoing",
  "when_ready",
] as const;

describe("Estate Checklist Templates", () => {
  describe("data integrity", () => {
    it("should have at least one template", () => {
      expect(estateChecklistTemplates.length).toBeGreaterThan(0);
    });

    it("should export an array of ChecklistTemplate objects", () => {
      expect(Array.isArray(estateChecklistTemplates)).toBe(true);
    });
  });

  describe("required fields", () => {
    it("every template should have a non-empty title", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.title).toBeDefined();
        expect(typeof template.title).toBe("string");
        expect(template.title.trim().length).toBeGreaterThan(0);
      }
    });

    it("every template should have a category", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.category).toBeDefined();
        expect(typeof template.category).toBe("string");
      }
    });

    it("every template should have a numeric sortOrder", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.sortOrder).toBeDefined();
        expect(typeof template.sortOrder).toBe("number");
      }
    });
  });

  describe("category validation", () => {
    it("every template should have a valid category", () => {
      for (const template of estateChecklistTemplates) {
        expect(VALID_CATEGORIES).toContain(template.category);
      }
    });

    it("should have templates in every category", () => {
      for (const category of VALID_CATEGORIES) {
        const templatesInCategory = estateChecklistTemplates.filter((t) => t.category === category);
        expect(templatesInCategory.length).toBeGreaterThan(0);
      }
    });
  });

  describe("sort order", () => {
    it("sort orders should be unique within each category", () => {
      for (const category of VALID_CATEGORIES) {
        const templatesInCategory = estateChecklistTemplates.filter((t) => t.category === category);
        const sortOrders = templatesInCategory.map((t) => t.sortOrder);
        const uniqueSortOrders = new Set(sortOrders);
        expect(uniqueSortOrders.size).toBe(sortOrders.length);
      }
    });

    it("sort orders should be positive numbers", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.sortOrder).toBeGreaterThan(0);
      }
    });
  });

  describe("descriptions", () => {
    it("every template should have a non-empty description", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.description).toBeDefined();
        expect(typeof template.description).toBe("string");
        expect(template.description.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("title quality", () => {
    it("no titles should contain only whitespace", () => {
      for (const template of estateChecklistTemplates) {
        expect(template.title.trim()).not.toBe("");
      }
    });

    it("no titles should be duplicated", () => {
      const titles = estateChecklistTemplates.map((t) => t.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });
  });

  describe("progressive disclosure structure", () => {
    it("should have first_things_first templates for immediate priorities", () => {
      const firstThings = estateChecklistTemplates.filter(
        (t) => t.category === "first_things_first",
      );
      expect(firstThings.length).toBeGreaterThanOrEqual(5);
    });

    it("should have when_ready templates for final distribution", () => {
      const whenReady = estateChecklistTemplates.filter((t) => t.category === "when_ready");
      expect(whenReady.length).toBeGreaterThanOrEqual(3);
    });
  });
});
