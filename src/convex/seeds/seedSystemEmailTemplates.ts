import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { systemEmailTemplates } from "./systemEmailTemplates";

/**
 * Seed System Email Templates
 *
 * This mutation populates the emailTemplates table with system templates
 * for automated emails (cron-triggered engagement emails).
 *
 * Usage from Convex dashboard or CLI:
 *   npx convex run seeds/seedSystemEmailTemplates:seed
 *
 * To update existing templates:
 *   npx convex run seeds/seedSystemEmailTemplates:upsert
 */

/**
 * Seed system templates into the database
 * Skips templates that already exist (based on systemTemplateKey)
 */
export const seed = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const template of systemEmailTemplates) {
      try {
        // Check if template with this systemTemplateKey already exists
        const existing = await ctx.db
          .query("emailTemplates")
          .withIndex("by_systemTemplateKey", (q) =>
            q.eq("systemTemplateKey", template.systemTemplateKey),
          )
          .unique();

        if (existing) {
          skipped++;
          continue;
        }

        await ctx.db.insert("emailTemplates", {
          name: template.name,
          subject: template.subject,
          content: template.content,
          description: template.description,
          variables: template.variables,
          category: template.category,
          isSystemTemplate: template.isSystemTemplate,
          systemTemplateKey: template.systemTemplateKey,
          enabled: template.enabled,
          schedule: template.schedule,
          triggerConditions: template.triggerConditions,
          campaignType: template.campaignType,
          updatedAt: now,
        });

        created++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to create "${template.name}": ${message}`);
      }
    }

    return { created, skipped, errors };
  },
});

/**
 * Upsert system templates - update existing or create new
 * This is useful when template content changes in code
 */
export const upsert = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const template of systemEmailTemplates) {
      try {
        // Check if template with this systemTemplateKey already exists
        const existing = await ctx.db
          .query("emailTemplates")
          .withIndex("by_systemTemplateKey", (q) =>
            q.eq("systemTemplateKey", template.systemTemplateKey),
          )
          .unique();

        if (existing) {
          // Update existing template (preserve enabled state from DB)
          await ctx.db.patch(existing._id, {
            name: template.name,
            subject: template.subject,
            content: template.content,
            description: template.description,
            variables: template.variables,
            category: template.category,
            isSystemTemplate: template.isSystemTemplate,
            schedule: template.schedule,
            triggerConditions: template.triggerConditions,
            campaignType: template.campaignType,
            updatedAt: now,
          });
          updated++;
        } else {
          // Create new template
          await ctx.db.insert("emailTemplates", {
            name: template.name,
            subject: template.subject,
            content: template.content,
            description: template.description,
            variables: template.variables,
            category: template.category,
            isSystemTemplate: template.isSystemTemplate,
            systemTemplateKey: template.systemTemplateKey,
            enabled: template.enabled,
            schedule: template.schedule,
            triggerConditions: template.triggerConditions,
            campaignType: template.campaignType,
            updatedAt: now,
          });
          created++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to upsert "${template.name}": ${message}`);
      }
    }

    return { created, updated, errors };
  },
});

/**
 * Get seed data info (for verification)
 */
export const getSeedInfo = internalMutation({
  args: {},
  returns: v.object({
    totalTemplates: v.number(),
    templates: v.array(
      v.object({
        name: v.string(),
        systemTemplateKey: v.string(),
        campaignType: v.string(),
        enabled: v.boolean(),
      }),
    ),
  }),
  handler: async () => {
    return {
      totalTemplates: systemEmailTemplates.length,
      templates: systemEmailTemplates.map((t) => ({
        name: t.name,
        systemTemplateKey: t.systemTemplateKey,
        campaignType: t.campaignType,
        enabled: t.enabled,
      })),
    };
  },
});
