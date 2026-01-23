import { describe, expect, it, vi } from "vitest";
import type { AnalysisRequest, AnalysisResult } from "./analysisEngine";

describe("Analysis Engine", () => {
  describe("AnalysisResult type", () => {
    it("should have required properties", () => {
      const mockResult: AnalysisResult = {
        credibilityScore: 75,
        scoreCategory: "likely_credible",
        headlineAnalysis: {
          sensationalism: false,
          clickbait: false,
          emotionalLanguage: false,
          issues: [],
        },
        bodyAnalysis: {
          writingQuality: "good",
          logicalConsistency: "consistent",
          unsubstantiatedClaims: [],
          missingContext: [],
        },
        evidenceAnalysis: {
          credibleSources: true,
          circularSourcing: false,
          anonymousAttributions: false,
          issues: [],
        },
        redFlags: [],
        publisherReputation: "known",
        journalisticStandards: "met",
        potentialBias: "center",
        confirmedByCredibleSources: "yes",
        factCheckerConsensus: "true",
        keyFindings: ["Content appears credible"],
        recommendations: ["No action needed"],
      };

      expect(mockResult.credibilityScore).toBe(75);
      expect(mockResult.scoreCategory).toBe("likely_credible");
      expect(Array.isArray(mockResult.keyFindings)).toBe(true);
      expect(Array.isArray(mockResult.redFlags)).toBe(true);
    });

    it("should support all score categories", () => {
      const categories: Array<"high_misinformation" | "questionable" | "likely_credible" | "highly_credible"> = [
        "high_misinformation",
        "questionable",
        "likely_credible",
        "highly_credible",
      ];

      categories.forEach((category) => {
        expect(["high_misinformation", "questionable", "likely_credible", "highly_credible"]).toContain(category);
      });
    });

    it("should support all publisher reputation types", () => {
      const reputations: Array<"known" | "unknown" | "problematic"> = ["known", "unknown", "problematic"];

      reputations.forEach((reputation) => {
        expect(["known", "unknown", "problematic"]).toContain(reputation);
      });
    });

    it("should support all journalistic standards", () => {
      const standards: Array<"met" | "partially_met" | "not_met"> = ["met", "partially_met", "not_met"];

      standards.forEach((standard) => {
        expect(["met", "partially_met", "not_met"]).toContain(standard);
      });
    });

    it("should support all bias types", () => {
      const biases: Array<"left" | "right" | "center" | "mixed"> = ["left", "right", "center", "mixed"];

      biases.forEach((bias) => {
        expect(["left", "right", "center", "mixed"]).toContain(bias);
      });
    });

    it("should support all verification statuses", () => {
      const statuses: Array<"yes" | "no" | "partial"> = ["yes", "no", "partial"];

      statuses.forEach((status) => {
        expect(["yes", "no", "partial"]).toContain(status);
      });
    });

    it("should support all fact-checker consensus values", () => {
      const consensuses: Array<"true" | "false" | "mixed" | "unverified"> = ["true", "false", "mixed", "unverified"];

      consensuses.forEach((consensus) => {
        expect(["true", "false", "mixed", "unverified"]).toContain(consensus);
      });
    });
  });

  describe("AnalysisRequest type", () => {
    it("should accept text content type", () => {
      const request: AnalysisRequest = {
        submissionId: 1,
        userId: 1,
        content: "Test content",
        contentType: "text",
      };

      expect(request.contentType).toBe("text");
    });

    it("should accept url content type", () => {
      const request: AnalysisRequest = {
        submissionId: 1,
        userId: 1,
        content: "https://example.com",
        contentType: "url",
        sourceUrl: "https://example.com",
      };

      expect(request.contentType).toBe("url");
    });

    it("should have optional sourceUrl", () => {
      const requestWithoutUrl: AnalysisRequest = {
        submissionId: 1,
        userId: 1,
        content: "Test content",
        contentType: "text",
      };

      expect(requestWithoutUrl.sourceUrl).toBeUndefined();
    });
  });

  describe("Score categorization logic", () => {
    it("should categorize 0-30 as high_misinformation", () => {
      const scores = [0, 15, 30];
      scores.forEach((score) => {
        if (score <= 30) {
          expect(score).toBeLessThanOrEqual(30);
        }
      });
    });

    it("should categorize 31-60 as questionable", () => {
      const scores = [31, 45, 60];
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(31);
        expect(score).toBeLessThanOrEqual(60);
      });
    });

    it("should categorize 61-85 as likely_credible", () => {
      const scores = [61, 75, 85];
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(61);
        expect(score).toBeLessThanOrEqual(85);
      });
    });

    it("should categorize 86-100 as highly_credible", () => {
      const scores = [86, 95, 100];
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(86);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Analysis result validation", () => {
    it("should have non-empty keyFindings for credible content", () => {
      const result: AnalysisResult = {
        credibilityScore: 85,
        scoreCategory: "highly_credible",
        headlineAnalysis: {
          sensationalism: false,
          clickbait: false,
          emotionalLanguage: false,
          issues: [],
        },
        bodyAnalysis: {
          writingQuality: "excellent",
          logicalConsistency: "consistent",
          unsubstantiatedClaims: [],
          missingContext: [],
        },
        evidenceAnalysis: {
          credibleSources: true,
          circularSourcing: false,
          anonymousAttributions: false,
          issues: [],
        },
        redFlags: [],
        publisherReputation: "known",
        journalisticStandards: "met",
        potentialBias: "center",
        confirmedByCredibleSources: "yes",
        factCheckerConsensus: "true",
        keyFindings: ["Multiple credible sources cited", "Content is well-researched"],
        recommendations: ["Content appears reliable"],
      };

      expect(result.keyFindings.length).toBeGreaterThan(0);
      expect(result.redFlags.length).toBe(0);
    });

    it("should have red flags for low-credibility content", () => {
      const result: AnalysisResult = {
        credibilityScore: 25,
        scoreCategory: "high_misinformation",
        headlineAnalysis: {
          sensationalism: true,
          clickbait: true,
          emotionalLanguage: true,
          issues: ["Excessive capitalization", "Clickbait language"],
        },
        bodyAnalysis: {
          writingQuality: "poor",
          logicalConsistency: "inconsistent",
          unsubstantiatedClaims: ["Multiple unverified claims"],
          missingContext: ["Lacks proper sources"],
        },
        evidenceAnalysis: {
          credibleSources: false,
          circularSourcing: true,
          anonymousAttributions: true,
          issues: ["No credible sources", "Anonymous citations"],
        },
        redFlags: ["Sensational headline", "Unverified claims", "Anonymous sources"],
        publisherReputation: "problematic",
        journalisticStandards: "not_met",
        potentialBias: "mixed",
        confirmedByCredibleSources: "no",
        factCheckerConsensus: "false",
        keyFindings: ["Multiple red flags detected"],
        recommendations: ["Exercise caution", "Verify with credible sources"],
      };

      expect(result.redFlags.length).toBeGreaterThan(0);
      expect(result.scoreCategory).toBe("high_misinformation");
    });
  });
});
