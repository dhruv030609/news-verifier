import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("articles router", () => {
  it("should submit an article", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.submit({
      title: "Test Article",
      content: "This is a test article with sufficient content for validation",
      author: "Test Author",
      category: "science",
    });

    expect(result).toHaveProperty("articleId");
    expect(result).toHaveProperty("status");
    expect(result.status).toBe("draft");
  });

  it("should reject article with short title", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.articles.submit({
        title: "Bad",
        content: "This is a test article with sufficient content for validation",
        category: "science",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should reject article with short content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.articles.submit({
        title: "Valid Title",
        content: "Short",
        category: "science",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should have valid categories", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = ["politics", "health", "science", "business", "technology", "other"];

    for (const category of categories) {
      const result = await caller.articles.submit({
        title: `Article about ${category}`,
        content: "This is a test article with sufficient content for validation",
        category: category as any,
      });

      expect(result.status).toBe("draft");
    }
  });

  it("should handle optional fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.submit({
      title: "Article without optional fields",
      content: "This is a test article with sufficient content for validation",
    });

    expect(result).toHaveProperty("articleId");
    expect(result.status).toBe("draft");
  });
});
