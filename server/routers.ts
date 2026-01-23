import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createSubmission, getUserAnalyses, getAnalysisById, saveAnalysis, getSavedAnalyses } from "./db";
import { analyzeContent, analyzeVisualContent, performCrossReferenceCheck } from "./analysisEngine";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  analysis: router({
    // Submit content for analysis
    submit: protectedProcedure
      .input(z.object({
        contentType: z.enum(["url", "text"]),
        content: z.string().min(10),
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
});

export type AppRouter = typeof appRouter;
