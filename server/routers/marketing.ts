/**
 * Marketing Suite Router - AI-powered content generation for tourism companies
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { list, getById, insert, update, remove, findOne } from "../_core/firestore-db";

const CONTENT = "marketingContent";
const CALENDAR = "marketingCalendar";
const TEMPLATES = "marketingTemplates";

// ─── System Prompts for Different Content Types ───

const SYSTEM_PROMPTS: Record<string, string> = {
  social_media: `You are an expert tourism social media content creator for VANIR GROUP, a luxury Egyptian travel company. 
Create engaging, platform-optimized social media posts that highlight Egypt's ancient wonders, luxury experiences, and cultural richness.
Always include relevant hashtags. Adapt tone and length to the specified platform.
For Instagram: visual storytelling, 2200 char max, 20-30 hashtags.
For Facebook: longer narrative, engagement questions, 1-5 hashtags.
For Twitter/X: concise, punchy, 280 char max, 3-5 hashtags.
For LinkedIn: professional, industry insights, 3-5 hashtags.
For TikTok: trendy, casual, hook-first, 5-10 hashtags.`,

  email: `You are an expert email marketing specialist for VANIR GROUP, a luxury Egyptian travel company.
Create compelling email campaigns that drive bookings and engagement.
Structure emails with: Subject line, Preview text, Header, Body (with sections), CTA button text, and Footer.
Use persuasive copywriting techniques while maintaining a luxurious, trustworthy tone.
Include personalization placeholders like {{first_name}}, {{destination}}.`,

  trip_description: `You are a luxury travel copywriter for VANIR GROUP, specializing in Egyptian tourism.
Create vivid, immersive trip descriptions that transport readers to the destination.
Include: Overview, Highlights, Itinerary outline, What's included, Pricing hint, and Booking CTA.
Write in a way that appeals to discerning travelers seeking authentic, premium experiences.
Support multiple languages when requested.`,

  blog_seo: `You are an SEO content specialist for VANIR GROUP, a luxury Egyptian travel company.
Create SEO-optimized blog articles about Egyptian travel, culture, and tourism.
Include: Title (with primary keyword), Meta description (155 chars), Introduction, 3-5 H2 sections with detailed content, Conclusion with CTA.
Naturally incorporate keywords without stuffing. Write engaging, informative content that ranks well.
Target word count: 1500-2500 words.`,

  ad_copy: `You are an advertising copywriter for VANIR GROUP, a luxury Egyptian travel company.
Create compelling ad copy for various platforms (Google Ads, Facebook Ads, Display Ads).
For Google Ads: Headlines (30 chars each), Descriptions (90 chars each).
For Facebook/Instagram Ads: Primary text, Headline, Description, CTA.
For Display Ads: Headline, Subheadline, Body, CTA.
Focus on unique selling points, urgency, and luxury appeal.`,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  luxurious: "Use elegant, sophisticated language that conveys exclusivity and premium quality.",
  adventurous: "Use exciting, dynamic language that inspires exploration and discovery.",
  professional: "Use formal, authoritative language suitable for business communications.",
  casual: "Use friendly, conversational language that feels approachable and warm.",
  romantic: "Use poetic, evocative language that appeals to couples and honeymoon travelers.",
  cultural: "Use educational, respectful language that highlights heritage and traditions.",
};

export const marketingRouter = router({
  /**
   * Generate marketing content using AI
   */
  generate: protectedProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]),
        platform: z.string().optional(),
        prompt: z.string().min(5, "Prompt must be at least 5 characters"),
        language: z.string().default("en"),
        tone: z.string().default("luxurious"),
        destination: z.string().optional(),
        templateId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build the system prompt
      let systemPrompt = SYSTEM_PROMPTS[input.type] || SYSTEM_PROMPTS.social_media;

      // Add tone instruction
      const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.luxurious;
      systemPrompt += `\n\nTone: ${toneInstruction}`;

      // Add language instruction
      if (input.language !== "en") {
        const langMap: Record<string, string> = {
          ar: "Arabic", fr: "French", de: "German", es: "Spanish",
          it: "Italian", pt: "Portuguese", zh: "Chinese", ja: "Japanese",
          ko: "Korean", ru: "Russian",
        };
        const langName = langMap[input.language] || input.language;
        systemPrompt += `\n\nIMPORTANT: Write the entire content in ${langName}.`;
      }

      // Add platform-specific instructions
      if (input.platform) {
        systemPrompt += `\n\nTarget platform: ${input.platform}. Optimize content format and length for this platform.`;
      }

      // Add destination context
      if (input.destination) {
        systemPrompt += `\n\nFocus destination: ${input.destination}. Include specific details about this destination.`;
      }

      // If using a template, fetch and include it
      if (input.templateId) {
        const template = (await getById(TEMPLATES, input.templateId)) as any;
        if (template?.systemPrompt) {
          systemPrompt += `\n\nTemplate context: ${template.systemPrompt}`;
        }
        if (template?.templateContent) {
          systemPrompt += `\n\nFollow this template structure:\n${template.templateContent}`;
        }
      }

      // Use structured output for consistent results
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "marketing_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Content title or subject line" },
                content: { type: "string", description: "The main generated content" },
                hashtags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Relevant hashtags (without # prefix)",
                },
                metadata: {
                  type: "object",
                  properties: {
                    wordCount: { type: "number", description: "Approximate word count" },
                    readingTime: { type: "number", description: "Estimated reading time in minutes" },
                    seoScore: { type: "number", description: "Estimated SEO score 1-100 (for blog/SEO content)" },
                  },
                  required: ["wordCount", "readingTime", "seoScore"],
                  additionalProperties: false,
                },
              },
              required: ["title", "content", "hashtags", "metadata"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const contentStr = typeof rawContent === "string" ? rawContent : "";
      let parsed: { title: string; content: string; hashtags: string[]; metadata: { wordCount: number; readingTime: number; seoScore: number } };

      try {
        parsed = JSON.parse(contentStr);
      } catch (error) {
        console.warn("[marketing.generate] Failed to parse LLM JSON response, using fallback:", error instanceof Error ? error.message : String(error));
        parsed = {
          title: input.prompt.slice(0, 100),
          content: contentStr,
          hashtags: [],
          metadata: { wordCount: 0, readingTime: 0, seoScore: 0 },
        };
      }

      // Save to Firestore
      const saved = await insert(CONTENT, {
        userId: ctx.user.id,
        type: input.type,
        platform: input.platform || null,
        title: parsed.title,
        content: parsed.content,
        prompt: input.prompt,
        language: input.language,
        tone: input.tone,
        destination: input.destination || null,
        hashtags: parsed.hashtags,
        isFavorite: "no",
        creditsCost: "1",
      });

      return {
        id: saved.id,
        title: parsed.title,
        content: parsed.content,
        hashtags: parsed.hashtags,
        metadata: parsed.metadata,
        type: input.type,
        platform: input.platform,
      };
    }),

  /**
   * List user's generated content
   */
  listContent: protectedProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let rows = (await list(CONTENT, {
        where: [["userId", "==", ctx.user.id]],
      })) as any[];
      if (input.type) rows = rows.filter((r) => r.type === input.type);
      rows.sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
      const total = rows.length;
      const items = rows.slice(input.offset, input.offset + input.limit);
      return { items, total };
    }),

  /**
   * Toggle favorite status
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = (await getById(CONTENT, input.id)) as any;
      if (!item || item.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const newStatus = item.isFavorite === "yes" ? "no" : "yes";
      await update(CONTENT, input.id, { isFavorite: newStatus });
      return { isFavorite: newStatus };
    }),

  /**
   * Delete content
   */
  deleteContent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = (await getById(CONTENT, input.id)) as any;
      if (!item || item.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await remove(CONTENT, input.id);
      return { success: true };
    }),

  // ─── Calendar ───

  /**
   * List calendar entries
   */
  listCalendar: protectedProcedure
    .input(
      z.object({
        startDate: z.number().optional(),
        endDate: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let rows = (await list(CALENDAR, {
        where: [["userId", "==", ctx.user.id]],
      })) as any[];
      if (input.startDate) rows = rows.filter((r) => Number(r.scheduledDate ?? 0) >= input.startDate!);
      if (input.endDate) rows = rows.filter((r) => Number(r.scheduledDate ?? 0) <= input.endDate!);
      rows.sort((a, b) => Number(a.scheduledDate ?? 0) - Number(b.scheduledDate ?? 0));
      return rows;
    }),

  /**
   * Add calendar entry
   */
  addCalendarEntry: protectedProcedure
    .input(
      z.object({
        contentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        platform: z.string().optional(),
        scheduledDate: z.number(),
        status: z.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
        colorTag: z.string().default("#D4A853"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await insert(CALENDAR, {
        userId: ctx.user.id,
        contentId: input.contentId || null,
        title: input.title,
        description: input.description || null,
        platform: input.platform || null,
        scheduledDate: input.scheduledDate,
        status: input.status,
        colorTag: input.colorTag,
      });
      return { id: entry.id };
    }),

  /**
   * Update calendar entry status
   */
  updateCalendarEntry: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        scheduledDate: z.number().optional(),
        status: z.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
        colorTag: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const item = (await getById(CALENDAR, id)) as any;
      if (!item || item.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const cleanUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.description !== undefined) cleanUpdates.description = updates.description;
      if (updates.scheduledDate !== undefined) cleanUpdates.scheduledDate = updates.scheduledDate;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.colorTag !== undefined) cleanUpdates.colorTag = updates.colorTag;

      if (Object.keys(cleanUpdates).length > 0) {
        await update(CALENDAR, id, cleanUpdates);
      }
      return { success: true };
    }),

  /**
   * Delete calendar entry
   */
  deleteCalendarEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = (await getById(CALENDAR, input.id)) as any;
      if (!item || item.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      await remove(CALENDAR, input.id);
      return { success: true };
    }),

  // ─── Templates ───

  /**
   * List available templates
   */
  listTemplates: publicProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
      })
    )
    .query(async ({ input }) => {
      let rows = (await list(TEMPLATES, {})) as any[];
      if (input.type) rows = rows.filter((t) => t.type === input.type);
      rows.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
      return rows;
    }),

  /**
   * Get content generation stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const content = (await list(CONTENT, {
      where: [["userId", "==", ctx.user.id]],
    })) as any[];
    const calendar = (await list(CALENDAR, {
      where: [["userId", "==", ctx.user.id]],
    })) as any[];

    return {
      totalContent: content.length,
      socialMedia: content.filter((c) => c.type === "social_media").length,
      emails: content.filter((c) => c.type === "email").length,
      blogPosts: content.filter((c) => c.type === "blog_seo").length,
      calendarEntries: calendar.length,
    };
  }),
});
