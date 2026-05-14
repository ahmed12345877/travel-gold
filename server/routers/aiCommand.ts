/**
 * AI Command Center Router
 * Advanced AI assistant for admin tasks using LLM
 * Supports multimodal input (text + images + files)
 */
import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import type { Message } from "../_core/llm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

/* ═══════════════════════════════════════════════════════════════
   System Prompts for Different Task Types
   ═══════════════════════════════════════════════════════════════ */

const VANIR_SYSTEM_PROMPT = `You are the AI Command Center assistant for Vanir Travel Group — a luxury travel company specializing in Egyptian heritage and premium travel experiences. You combine ancient Egyptian elegance with modern luxury.

Brand voice: Sophisticated, knowledgeable, warm yet professional. Use rich descriptive language that evokes luxury and wonder.

Company details:
- Name: Vanir Travel Group (Vanir Group)
- Specialty: Luxury travel, Egyptian heritage tours, premium experiences
- Style: Art Deco, Black & Gold aesthetic
- Target audience: High-net-worth travelers, culture enthusiasts, luxury seekers

You are fluent in both Arabic and English. Respond in the same language the user writes in.
Always provide actionable, specific, and professional responses.`;

const TASK_PROMPTS: Record<string, string> = {
  content_writer: `${VANIR_SYSTEM_PROMPT}

You are a premium content writer for Vanir Travel Group. Your task is to create compelling, luxury-oriented travel content.

Guidelines:
- Write in an elegant, evocative style that captures the magic of travel
- Highlight unique experiences, cultural richness, and luxury amenities
- Use sensory language that transports the reader
- Include relevant keywords naturally for SEO
- Maintain the brand's sophisticated tone
- Format output in clean Markdown with headers, paragraphs, and lists where appropriate`,

  seo_analyst: `${VANIR_SYSTEM_PROMPT}

You are an expert SEO analyst for Vanir Travel Group. Analyze and optimize content for search engines.

Your capabilities:
- Audit page titles, meta descriptions, and keywords
- Suggest improvements for search rankings
- Analyze keyword density and relevance
- Recommend internal/external linking strategies
- Provide structured SEO reports with scores
- Suggest schema markup improvements
- Analyze competitor keywords in the luxury travel space

Format your analysis with clear sections, scores (1-100), and actionable recommendations.`,

  offer_generator: `${VANIR_SYSTEM_PROMPT}

You are a luxury travel offer creator for Vanir Travel Group. Design irresistible travel packages.

When creating offers:
- Include a compelling title and tagline
- Detail the itinerary day by day
- List included amenities and experiences
- Set pricing tiers (Standard, Premium, Royal)
- Add urgency elements (limited availability, seasonal)
- Highlight unique selling points
- Include terms and conditions summary

Format as a structured offer document in Markdown.`,

  data_analyst: `${VANIR_SYSTEM_PROMPT}

You are a data analyst for Vanir Travel Group. Analyze business metrics and provide insights.

Your capabilities:
- Analyze booking trends and patterns
- Revenue analysis and forecasting
- Customer segmentation insights
- Seasonal demand analysis
- Performance benchmarking
- ROI calculations for marketing campaigns
- Conversion funnel analysis

Provide data-driven insights with specific numbers, percentages, and actionable recommendations.
Use tables and structured formats for clarity.`,

  customer_support: `${VANIR_SYSTEM_PROMPT}

You are a premium customer support specialist for Vanir Travel Group. Handle customer inquiries with grace and professionalism.

Guidelines:
- Respond with warmth and empathy
- Provide detailed, helpful solutions
- Maintain the luxury brand experience in every interaction
- Offer alternatives when the requested option isn't available
- Use professional yet friendly language
- Include relevant policies when needed
- Escalate appropriately when necessary

Draft professional email responses that maintain the Vanir luxury standard.`,

  translator: `${VANIR_SYSTEM_PROMPT}

You are a professional translator for Vanir Travel Group. Translate content between Arabic and English while maintaining the luxury brand voice.

Guidelines:
- Preserve the tone and style of the original text
- Adapt cultural references appropriately
- Maintain marketing appeal in translations
- Keep technical terms accurate
- Preserve formatting and structure
- Add cultural context notes when helpful`,

  social_media: `${VANIR_SYSTEM_PROMPT}

You are a social media strategist for Vanir Travel Group. Create engaging social media content.

Capabilities:
- Write posts for Instagram, Facebook, Twitter/X, LinkedIn
- Create hashtag strategies
- Design content calendars
- Write engaging captions with CTAs
- Create story/reel scripts
- Suggest visual content ideas
- Plan influencer collaboration briefs

Adapt tone for each platform while maintaining brand consistency.`,

  itinerary_planner: `${VANIR_SYSTEM_PROMPT}

You are an expert luxury itinerary planner for Vanir Travel Group. Design detailed, day-by-day travel itineraries.

When creating itineraries:
- Structure each day with morning, afternoon, and evening activities
- Include luxury hotel recommendations with room categories
- Add restaurant suggestions with cuisine types
- Include private transportation arrangements
- Suggest optional VIP experiences and upgrades
- Add practical tips (best time to visit, dress code, local customs)
- Include estimated timing for each activity
- Factor in rest periods and leisure time for luxury travelers

Format as a beautifully structured day-by-day itinerary in Markdown.`,

  review_responder: `${VANIR_SYSTEM_PROMPT}

You are a guest relations specialist for Vanir Travel Group. Craft thoughtful, personalized responses to guest reviews.

Guidelines:
- Always thank the guest by name when available
- Address specific points mentioned in their review
- For positive reviews: express genuine gratitude, highlight what made their experience special
- For negative reviews: apologize sincerely, acknowledge the issue, explain corrective actions, offer resolution
- Maintain professional warmth without being defensive
- Invite them to return and mention upcoming experiences
- Keep responses concise but heartfelt (150-250 words)

Provide responses ready to post on TripAdvisor, Google, and Booking.com.`,

  pricing_advisor: `${VANIR_SYSTEM_PROMPT}

You are a revenue management and pricing strategist for Vanir Travel Group.

Your capabilities:
- Analyze competitive pricing in the luxury travel market
- Suggest dynamic pricing strategies based on seasonality
- Calculate profit margins and break-even points
- Design tiered pricing structures (Standard, Premium, Royal, Ultra-Luxury)
- Recommend upselling and cross-selling strategies
- Analyze price elasticity for different market segments
- Create promotional pricing calendars

Provide specific numbers, percentages, and comparison tables in your analysis.`,

  brand_voice: `${VANIR_SYSTEM_PROMPT}

You are a brand strategist and copywriter for Vanir Travel Group. Ensure all content aligns with the brand identity.

Your capabilities:
- Review and refine content to match brand voice
- Create brand-consistent taglines and slogans
- Develop brand messaging frameworks
- Write brand guidelines and style notes
- Adapt content for different audiences while maintaining brand identity
- Create brand stories that connect Egyptian heritage with modern luxury
- Design email signatures, bio texts, and boilerplate copy

Always maintain the Art Deco, Black & Gold aesthetic in your writing suggestions.`,

  competitor_analysis: `${VANIR_SYSTEM_PROMPT}

You are a competitive intelligence analyst for Vanir Travel Group.

Your capabilities:
- Analyze competitor offerings, pricing, and positioning
- Identify market gaps and opportunities
- Compare service features and unique selling points
- Assess competitor marketing strategies
- Provide SWOT analysis for competitive positioning
- Suggest differentiation strategies
- Monitor industry trends and emerging competitors

Provide structured analysis with comparison tables and actionable recommendations.`,

  report_generator: `${VANIR_SYSTEM_PROMPT}

You are a professional report writer for Vanir Travel Group. Create comprehensive business reports.

Report types you can generate:
- Monthly/quarterly performance reports
- Marketing campaign analysis reports
- Customer satisfaction summaries
- Destination performance reports
- Financial overview reports
- Market research summaries
- Operational efficiency reports

Format reports with executive summary, key findings, detailed analysis, charts descriptions, and recommendations.
Use professional formatting with headers, tables, and bullet points.`,

  email_composer: `${VANIR_SYSTEM_PROMPT}

You are an email communication specialist for Vanir Travel Group. Craft professional emails for various purposes.

Email types:
- Welcome emails for new clients
- Booking confirmations with luxury touches
- Pre-trip preparation guides
- Post-trip thank you and feedback requests
- Partnership and B2B proposals
- Newsletter content
- VIP client communications
- Event invitations
- Seasonal promotions

Maintain the luxury brand voice while being warm and personal. Include subject lines.`,

  general: VANIR_SYSTEM_PROMPT,
};

/* ═══════════════════════════════════════════════════════════════
   All Task Types Metadata
   ═══════════════════════════════════════════════════════════════ */

const ALL_TASK_TYPES = [
  {
    id: "content_writer",
    name: "Content Writer",
    nameAr: "كاتب المحتوى",
    description: "Write compelling travel content, blog posts, and descriptions",
    descriptionAr: "كتابة محتوى سياحي جذاب ومقالات ووصف الرحلات",
    icon: "pen-tool",
    color: "blue",
    category: "content",
    suggestedPrompts: [
      "Write a luxury blog post about Luxor temples",
      "Create a destination description for Sharm El Sheikh",
      "Write an email newsletter about summer offers",
    ],
  },
  {
    id: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "محلل SEO",
    description: "Analyze and optimize content for search engines",
    descriptionAr: "تحليل وتحسين المحتوى لمحركات البحث",
    icon: "search",
    color: "green",
    category: "marketing",
    suggestedPrompts: [
      "Audit the SEO for our Egypt tours page",
      "Suggest keywords for luxury Nile cruise packages",
      "Analyze meta tags for our homepage",
    ],
  },
  {
    id: "offer_generator",
    name: "Offer Generator",
    nameAr: "مولد العروض",
    description: "Design irresistible travel packages and offers",
    descriptionAr: "تصميم عروض وباقات سفر لا تقاوم",
    icon: "gift",
    color: "gold",
    category: "operations",
    suggestedPrompts: [
      "Create a 7-day luxury Egypt tour package",
      "Design a honeymoon package for Red Sea resorts",
      "Generate a group discount offer for Aswan",
    ],
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    nameAr: "محلل البيانات",
    description: "Analyze business metrics and provide insights",
    descriptionAr: "تحليل مقاييس الأعمال وتقديم رؤى",
    icon: "bar-chart",
    color: "purple",
    category: "analysis",
    suggestedPrompts: [
      "Analyze booking trends for Q1 2026",
      "Suggest strategies to increase conversion rates",
      "Create a revenue forecast for summer season",
    ],
  },
  {
    id: "customer_support",
    name: "Customer Support",
    nameAr: "دعم العملاء",
    description: "Draft professional customer responses",
    descriptionAr: "صياغة ردود احترافية للعملاء",
    icon: "headphones",
    color: "teal",
    category: "operations",
    suggestedPrompts: [
      "Draft a response to a booking cancellation request",
      "Write a follow-up email after a completed trip",
      "Handle a complaint about hotel quality",
    ],
  },
  {
    id: "translator",
    name: "Translator",
    nameAr: "المترجم",
    description: "Translate content between Arabic and English",
    descriptionAr: "ترجمة المحتوى بين العربية والإنجليزية",
    icon: "languages",
    color: "orange",
    category: "content",
    suggestedPrompts: [
      "Translate our about page to Arabic",
      "Translate this offer description to English",
      "Localize marketing copy for Arabic audience",
    ],
  },
  {
    id: "social_media",
    name: "Social Media",
    nameAr: "وسائل التواصل",
    description: "Create engaging social media content",
    descriptionAr: "إنشاء محتوى جذاب لوسائل التواصل الاجتماعي",
    icon: "share-2",
    color: "pink",
    category: "marketing",
    suggestedPrompts: [
      "Write 5 Instagram captions for pyramid photos",
      "Create a weekly content calendar for Facebook",
      "Draft a LinkedIn post about our new luxury service",
    ],
  },
  {
    id: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "مخطط الرحلات",
    description: "Design detailed day-by-day luxury travel itineraries",
    descriptionAr: "تصميم جداول رحلات فاخرة مفصلة يوماً بيوم",
    icon: "map-pin",
    color: "emerald",
    category: "operations",
    suggestedPrompts: [
      "Plan a 5-day luxury Cairo & Luxor itinerary",
      "Design a 10-day all-Egypt premium tour",
      "Create a 3-day Red Sea diving & relaxation itinerary",
    ],
  },
  {
    id: "review_responder",
    name: "Review Responder",
    nameAr: "الرد على التقييمات",
    description: "Craft thoughtful responses to guest reviews",
    descriptionAr: "صياغة ردود مدروسة على تقييمات الضيوف",
    icon: "star",
    color: "amber",
    category: "operations",
    suggestedPrompts: [
      "Respond to a 5-star review praising our Nile cruise",
      "Draft a professional response to a negative hotel review",
      "Write a thank-you response to a returning guest",
    ],
  },
  {
    id: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "مستشار التسعير",
    description: "Revenue management and pricing strategy analysis",
    descriptionAr: "إدارة الإيرادات وتحليل استراتيجيات التسعير",
    icon: "dollar-sign",
    color: "lime",
    category: "analysis",
    suggestedPrompts: [
      "Suggest pricing for a new premium Aswan package",
      "Analyze our pricing vs competitors for Nile cruises",
      "Create a seasonal pricing calendar for 2026",
    ],
  },
  {
    id: "brand_voice",
    name: "Brand Voice",
    nameAr: "صوت العلامة",
    description: "Ensure content aligns with Vanir brand identity",
    descriptionAr: "ضمان توافق المحتوى مع هوية علامة فانير",
    icon: "crown",
    color: "yellow",
    category: "content",
    suggestedPrompts: [
      "Review and refine this page copy for brand consistency",
      "Create 5 brand-aligned taglines for our summer campaign",
      "Write brand guidelines for social media posts",
    ],
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "تحليل المنافسين",
    description: "Competitive intelligence and market positioning",
    descriptionAr: "الاستخبارات التنافسية وتحديد المواقع في السوق",
    icon: "target",
    color: "red",
    category: "analysis",
    suggestedPrompts: [
      "Compare our luxury Egypt tours with top 3 competitors",
      "Identify gaps in the luxury Nile cruise market",
      "SWOT analysis for Vanir Travel Group",
    ],
  },
  {
    id: "report_generator",
    name: "Report Generator",
    nameAr: "مولد التقارير",
    description: "Create comprehensive business and performance reports",
    descriptionAr: "إنشاء تقارير أعمال وأداء شاملة",
    icon: "file-text",
    color: "slate",
    category: "analysis",
    suggestedPrompts: [
      "Generate a monthly performance report template",
      "Create a marketing campaign analysis report",
      "Write a customer satisfaction summary report",
    ],
  },
  {
    id: "email_composer",
    name: "Email Composer",
    nameAr: "محرر الإيميلات",
    description: "Craft professional emails for all occasions",
    descriptionAr: "صياغة إيميلات احترافية لجميع المناسبات",
    icon: "mail",
    color: "cyan",
    category: "content",
    suggestedPrompts: [
      "Write a welcome email for new VIP clients",
      "Draft a partnership proposal email to a luxury hotel",
      "Create a pre-trip preparation guide email",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Helper: Build multimodal message content
   ═══════════════════════════════════════════════════════════════ */

function buildMessageContent(
  text: string,
  attachments?: { url: string; mimeType: string }[]
): string | Array<{ type: string; [key: string]: any }> {
  if (!attachments || attachments.length === 0) return text;

  const parts: Array<{ type: string; [key: string]: any }> = [];

  // Add text part first
  if (text) {
    parts.push({ type: "text", text });
  }

  // Add file/image parts
  for (const att of attachments) {
    if (att.mimeType.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.url, detail: "auto" },
      });
    } else if (
      ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"].includes(att.mimeType)
    ) {
      parts.push({
        type: "file_url",
        file_url: { url: att.url, mime_type: att.mimeType },
      });
    }
    // For unsupported types, mention them in text
    else {
      parts.push({
        type: "text",
        text: `[Attached file: ${att.url} (${att.mimeType})]`,
      });
    }
  }

  return parts.length === 1 && parts[0].type === "text" ? text : parts;
}

/* ═══════════════════════════════════════════════════════════════
   Router
   ═══════════════════════════════════════════════════════════════ */

const allTaskTypeIds = ALL_TASK_TYPES.map((t) => t.id);
const taskTypeEnum = z.enum([
  "general",
  ...allTaskTypeIds,
] as [string, ...string[]]);

const attachmentSchema = z.object({
  url: z.string().url(),
  mimeType: z.string(),
  filename: z.string().optional(),
});

export const aiCommandRouter = router({
  /**
   * Upload a file for AI chat (admin only)
   */
  uploadFile: adminProcedure
    .input(
      z.object({
        fileData: z.string(), // base64
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Max 10MB
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = nanoid(8);
      const fileKey = `ai-command/${ctx.user.id}/${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      return {
        url,
        fileKey,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize,
      };
    }),

  /**
   * Main AI chat - send a message with optional file attachments
   */
  chat: adminProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
            attachments: z.array(attachmentSchema).optional(),
          })
        ),
        taskType: taskTypeEnum.default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general;

      const llmMessages: Message[] = [
        { role: "system", content: systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: buildMessageContent(m.content, m.attachments) as any,
        })),
      ];

      const result = await invokeLLM({ messages: llmMessages });

      const content = result.choices?.[0]?.message?.content;
      const responseText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join("\n")
            : "No response generated.";

      return {
        response: responseText,
        usage: result.usage || null,
        model: result.model || "unknown",
      };
    }),

  /**
   * Quick task execution - one-shot tasks with structured output
   * Now supports file attachments
   */
  executeTask: adminProcedure
    .input(
      z.object({
        taskType: z.enum(allTaskTypeIds as [string, ...string[]]),
        prompt: z.string().min(1),
        context: z.string().optional(),
        language: z.enum(["ar", "en", "auto"]).default("auto"),
        attachments: z.array(attachmentSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = TASK_PROMPTS[input.taskType];

      let userPrompt = input.prompt;
      if (input.context) {
        userPrompt += `\n\nAdditional context:\n${input.context}`;
      }
      if (input.language !== "auto") {
        userPrompt += `\n\nPlease respond in ${input.language === "ar" ? "Arabic" : "English"}.`;
      }

      const messageContent = buildMessageContent(userPrompt, input.attachments);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: messageContent as any },
        ],
      });

      const content = result.choices?.[0]?.message?.content;
      const responseText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join("\n")
            : "No response generated.";

      return {
        result: responseText,
        taskType: input.taskType,
        usage: result.usage || null,
        model: result.model || "unknown",
        executedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get available task types and their descriptions
   */
  getTaskTypes: adminProcedure.query(() => {
    return ALL_TASK_TYPES;
  }),
});
