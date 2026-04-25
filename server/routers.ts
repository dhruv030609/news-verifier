import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createSubmission, getUserAnalyses, getAnalysisById, saveAnalysis, getSavedAnalyses, getDb, createArticle, getArticleById, getUserArticles, getPublicArticles, updateArticleStatus, publishArticle, incrementArticleViews, createImageNewsVerification, getImageNewsVerificationById, getUserImageVerifications, toggleSaveImageVerification, deleteImageNewsVerification, getSavedImageVerifications } from "./db";
import { analyzeContent, analyzeVisualContent, performCrossReferenceCheck } from "./analysisEngine";
import { analyzeImageNews } from "./imageAnalysisEngine";
import { analyses, imageNewsVerifications } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  dashboard: router({
    getAnalysisHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(analyses).where(eq(analyses.userId, ctx.user.id)).orderBy(desc(analyses.createdAt)).limit(50);
    }),
    getStatistics: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { totalAnalyses: 0, averageScore: 0, savedCount: 0 };
      const userAnalyses = await db.select().from(analyses).where(eq(analyses.userId, ctx.user.id));
      const savedAnalyses = userAnalyses.filter(a => a.isSaved);
      const avgScore = userAnalyses.length > 0 ? Math.round(userAnalyses.reduce((sum, a) => sum + a.credibilityScore, 0) / userAnalyses.length) : 0;
      return {
        totalAnalyses: userAnalyses.length,
        averageScore: avgScore,
        savedCount: savedAnalyses.length,
      };
    }),
  }),

  analysis: router({
    // Submit content for analysis
    submit: protectedProcedure
      .input(z.object({
        contentType: z.enum(["url", "text"]),
        content: z.string().min(5),
        title: z.string().optional(),
        sourceUrl: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const submission = await createSubmission({
          userId: ctx.user.id,
          contentType: input.contentType,
          content: input.content,
          title: input.title,
          sourceUrl: input.sourceUrl,
          status: "pending",
        });

        // Trigger analysis asynchronously
        analyzeContent({
          submissionId: submission.insertId as number,
          userId: ctx.user.id,
          content: input.content,
          contentType: input.contentType,
          sourceUrl: input.sourceUrl,
        }).catch(err => console.error("Analysis error:", err));

        return {
          submissionId: submission.insertId,
          status: "pending",
        };
      }),

    // Get analysis history for user
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const analyses = await getUserAnalyses(ctx.user.id, input.limit, input.offset);
        return analyses;
      }),

    // Get specific analysis result
    getResult: protectedProcedure
      .input(z.object({
        analysisId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const analysis = await getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new Error("Analysis not found");
        }
        return analysis;
      }),

    // Save/bookmark an analysis
    save: protectedProcedure
      .input(z.object({
        analysisId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new Error("Analysis not found");
        }
        await saveAnalysis(input.analysisId);
        return { success: true };
      }),

    // Get saved analyses
    getSaved: protectedProcedure
      .query(async ({ ctx }) => {
        const saved = await getSavedAnalyses(ctx.user.id);
        return saved;
      }),

    // Analyze visual content
    analyzeImage: protectedProcedure
      .input(z.object({
        analysisId: z.number(),
        imageUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new Error("Analysis not found");
        }
        const verification = await analyzeVisualContent(input.imageUrl, input.analysisId);
        return verification;
      }),

    // Perform cross-reference check
    crossReference: protectedProcedure
      .input(z.object({
        analysisId: z.number(),
        claim: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new Error("Analysis not found");
        }
        const references = await performCrossReferenceCheck(input.claim, input.analysisId);
        return references;
      }),
  }),

  articles: router({
    submit: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(500),
        content: z.string().min(50),
        author: z.string().optional(),
        sourceUrl: z.string().url().optional(),
        publicationDate: z.date().optional(),
        category: z.enum(["politics", "health", "science", "business", "technology", "other"]).default("other"),
      }))
      .mutation(async ({ ctx, input }) => {
        const article = await createArticle({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          author: input.author || null,
          sourceUrl: input.sourceUrl || null,
          publicationDate: input.publicationDate || null,
          category: input.category,
          status: "draft",
          isPublic: false,
          viewCount: 0,
        });
        return { articleId: article.insertId, status: "draft" };
      }),

    getUserArticles: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        return getUserArticles(ctx.user.id, input.limit, input.offset);
      }),

    getArticle: protectedProcedure
      .input(z.object({
        articleId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const article = await getArticleById(input.articleId);
        if (!article) throw new Error("Article not found");
        if (article.userId !== ctx.user.id && !article.isPublic) {
          throw new Error("Unauthorized");
        }
        if (article.isPublic) {
          await incrementArticleViews(input.articleId);
        }
        return article;
      }),

    publish: protectedProcedure
      .input(z.object({
        articleId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const article = await getArticleById(input.articleId);
        if (!article || article.userId !== ctx.user.id) {
          throw new Error("Article not found");
        }
        await publishArticle(input.articleId);
        return { success: true, status: "submitted" };
      }),

    getPublicArticles: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getPublicArticles(input.limit, input.offset);
      }),
  }),

  imageVerification: router({
    analyze: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url().optional(),
        imageBase64: z.string().optional(),
        imageDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Use base64 if provided, otherwise use URL
          const imageUrlToAnalyze = input.imageBase64 || input.imageUrl;
          if (!imageUrlToAnalyze) {
            throw new Error("Either imageUrl or imageBase64 must be provided");
          }

          const analysisResult = await analyzeImageNews({
            imageUrl: imageUrlToAnalyze,
            imageDescription: input.imageDescription,
          });

          await createImageNewsVerification({
            userId: ctx.user.id,
            imageUrl: imageUrlToAnalyze,
            imageKey: `image-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            extractedText: analysisResult.extractedText,
            imageDescription: analysisResult.imageDescription,
            manipulationScore: analysisResult.manipulationScore,
            deepfakeScore: analysisResult.deepfakeScore,
            authenticityScore: analysisResult.authenticityScore,
            newsCredibilityScore: analysisResult.newsCredibilityScore,
            newsCategory: analysisResult.newsCategory as any,
            redFlags: analysisResult.redFlags,
            keyFindings: analysisResult.keyFindings,
            recommendations: analysisResult.recommendations,
            status: "completed",
            rawAnalysis: analysisResult.rawAnalysis,
            imageMetadata: { uploadedAt: new Date().toISOString() },
            isSaved: false,
          });

          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const records = await db.select().from(imageNewsVerifications).where(eq(imageNewsVerifications.userId, ctx.user.id)).orderBy(desc(imageNewsVerifications.createdAt)).limit(1);
          
          return { success: true, verification: records[0] || null };
        } catch (error) {
          console.error("[ImageVerification] Error:", error);
          throw new Error("Failed to analyze image");
        }
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => getUserImageVerifications(ctx.user.id, input.limit, input.offset)),

    getById: protectedProcedure
      .input(z.object({ verificationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const v = await getImageNewsVerificationById(input.verificationId);
        if (!v || v.userId !== ctx.user.id) throw new Error("Not found");
        return v;
      }),

    toggleSave: protectedProcedure
      .input(z.object({ verificationId: z.number(), isSaved: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const v = await getImageNewsVerificationById(input.verificationId);
        if (!v || v.userId !== ctx.user.id) throw new Error("Not found");
        await toggleSaveImageVerification(input.verificationId, input.isSaved);
        return { success: true };
      }),

    getSaved: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => getSavedImageVerifications(ctx.user.id, input.limit, input.offset)),

    delete: protectedProcedure
      .input(z.object({ verificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const v = await getImageNewsVerificationById(input.verificationId);
        if (!v || v.userId !== ctx.user.id) throw new Error("Not found");
        await deleteImageNewsVerification(input.verificationId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
