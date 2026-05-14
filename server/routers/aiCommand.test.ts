import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock invokeLLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "../_core/llm";
import { aiCommandRouter } from "./aiCommand";
import { router } from "../_core/trpc";

const mockedInvokeLLM = vi.mocked(invokeLLM);

// Create a caller with admin context
const testRouter = router({ aiCommand: aiCommandRouter });
const createCaller = testRouter.createCaller;

const adminCtx = {
  user: {
    id: "admin-1",
    name: "Admin",
    role: "admin" as const,
    openId: "oid-1",
  },
  req: {} as any,
  res: {} as any,
};

const nonAdminCtx = {
  user: { id: "user-1", name: "User", role: "user" as const, openId: "oid-2" },
  req: {} as any,
  res: {} as any,
};

const noUserCtx = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("AI Command Center Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("chat mutation", () => {
    it("should return AI response for admin user", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Here is a luxury blog post about Luxor temples...",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      });

      const caller = createCaller(adminCtx);
      const result = await caller.aiCommand.chat({
        messages: [{ role: "user", content: "Write a blog post about Luxor" }],
        taskType: "content_writer",
      });

      expect(result.response).toBe(
        "Here is a luxury blog post about Luxor temples...",
      );
      expect(result.usage?.total_tokens).toBe(300);
      expect(result.model).toBe("gemini-2.5-flash");
      expect(mockedInvokeLLM).toHaveBeenCalledOnce();
    });

    it("should use correct system prompt based on taskType", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "SEO analysis..." },
            finish_reason: "stop",
          },
        ],
      });

      const caller = createCaller(adminCtx);
      await caller.aiCommand.chat({
        messages: [{ role: "user", content: "Audit our homepage" }],
        taskType: "seo_analyst",
      });

      const callArgs = mockedInvokeLLM.mock.calls[0][0];
      expect(callArgs.messages[0].role).toBe("system");
      expect(callArgs.messages[0].content).toContain("SEO analyst");
    });

    it("should default to general taskType", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Hello!" },
            finish_reason: "stop",
          },
        ],
      });

      const caller = createCaller(adminCtx);
      await caller.aiCommand.chat({
        messages: [{ role: "user", content: "Hello" }],
      });

      const callArgs = mockedInvokeLLM.mock.calls[0][0];
      expect(callArgs.messages[0].role).toBe("system");
      expect(callArgs.messages[0].content).toContain("Vanir Travel Group");
    });

    it("should handle array content response", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: [
                { type: "text", text: "Part 1. " },
                { type: "text", text: "Part 2." },
              ],
            },
            finish_reason: "stop",
          },
        ],
      });

      const caller = createCaller(adminCtx);
      const result = await caller.aiCommand.chat({
        messages: [{ role: "user", content: "Test" }],
      });

      expect(result.response).toBe("Part 1. \nPart 2.");
    });

    it("should reject non-admin users", async () => {
      const caller = createCaller(nonAdminCtx);
      await expect(
        caller.aiCommand.chat({
          messages: [{ role: "user", content: "Hello" }],
        }),
      ).rejects.toThrow();
    });

    it("should reject unauthenticated users", async () => {
      const caller = createCaller(noUserCtx);
      await expect(
        caller.aiCommand.chat({
          messages: [{ role: "user", content: "Hello" }],
        }),
      ).rejects.toThrow();
    });
  });

  describe("executeTask mutation", () => {
    it("should execute a task and return result", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "# 7-Day Luxury Egypt Tour\n\nDay 1: Cairo...",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 500,
          total_tokens: 650,
        },
      });

      const caller = createCaller(adminCtx);
      const result = await caller.aiCommand.executeTask({
        taskType: "offer_generator",
        prompt: "Create a 7-day luxury Egypt tour",
      });

      expect(result.result).toContain("7-Day Luxury Egypt Tour");
      expect(result.taskType).toBe("offer_generator");
      expect(result.usage?.total_tokens).toBe(650);
      expect(result.executedAt).toBeDefined();
    });

    it("should include context in the prompt when provided", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "gemini-2.5-flash",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Translation..." },
            finish_reason: "stop",
          },
        ],
      });

      const caller = createCaller(adminCtx);
      await caller.aiCommand.executeTask({
        taskType: "translator",
        prompt: "Translate this to Arabic",
        context: "Welcome to Vanir Travel Group",
        language: "ar",
      });

      const callArgs = mockedInvokeLLM.mock.calls[0][0];
      const userMsg = callArgs.messages.find((m: any) => m.role === "user");
      expect(userMsg?.content).toContain("Welcome to Vanir Travel Group");
      expect(userMsg?.content).toContain("Arabic");
    });

    it("should reject non-admin users", async () => {
      const caller = createCaller(nonAdminCtx);
      await expect(
        caller.aiCommand.executeTask({
          taskType: "content_writer",
          prompt: "Write something",
        }),
      ).rejects.toThrow();
    });
  });

  describe("getTaskTypes query", () => {
    it("should return all 14 task types", async () => {
      const caller = createCaller(adminCtx);
      const taskTypes = await caller.aiCommand.getTaskTypes();

      expect(taskTypes).toHaveLength(14);
      expect(taskTypes.map((t) => t.id)).toEqual([
        "content_writer",
        "seo_analyst",
        "offer_generator",
        "data_analyst",
        "customer_support",
        "translator",
        "social_media",
        "itinerary_planner",
        "review_responder",
        "pricing_advisor",
        "brand_voice",
        "competitor_analysis",
        "report_generator",
        "email_composer",
      ]);
    });

    it("should include both English and Arabic names", async () => {
      const caller = createCaller(adminCtx);
      const taskTypes = await caller.aiCommand.getTaskTypes();

      for (const task of taskTypes) {
        expect(task.name).toBeTruthy();
        expect(task.nameAr).toBeTruthy();
        expect(task.description).toBeTruthy();
        expect(task.descriptionAr).toBeTruthy();
        expect(task.icon).toBeTruthy();
        expect(task.suggestedPrompts.length).toBeGreaterThan(0);
      }
    });

    it("should reject non-admin users", async () => {
      const caller = createCaller(nonAdminCtx);
      await expect(caller.aiCommand.getTaskTypes()).rejects.toThrow();
    });
  });
});
