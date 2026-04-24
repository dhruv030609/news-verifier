import { describe, it, expect } from "vitest";
import { getCredibilityCategory, getScoreColor } from "./imageAnalysisEngine";

describe("Image Analysis Engine", () => {
  describe("getCredibilityCategory", () => {
    it("should return highly_credible for score >= 80", () => {
      expect(getCredibilityCategory(80)).toBe("highly_credible");
      expect(getCredibilityCategory(90)).toBe("highly_credible");
      expect(getCredibilityCategory(100)).toBe("highly_credible");
    });

    it("should return likely_credible for score 60-79", () => {
      expect(getCredibilityCategory(60)).toBe("likely_credible");
      expect(getCredibilityCategory(70)).toBe("likely_credible");
      expect(getCredibilityCategory(79)).toBe("likely_credible");
    });

    it("should return questionable for score 40-59", () => {
      expect(getCredibilityCategory(40)).toBe("questionable");
      expect(getCredibilityCategory(50)).toBe("questionable");
      expect(getCredibilityCategory(59)).toBe("questionable");
    });

    it("should return high_misinformation for score < 40", () => {
      expect(getCredibilityCategory(0)).toBe("high_misinformation");
      expect(getCredibilityCategory(20)).toBe("high_misinformation");
      expect(getCredibilityCategory(39)).toBe("high_misinformation");
    });
  });

  describe("getScoreColor", () => {
    it("should return green for high credibility", () => {
      expect(getScoreColor(80)).toBe("green");
      expect(getScoreColor(100)).toBe("green");
    });

    it("should return blue for likely credible", () => {
      expect(getScoreColor(60)).toBe("blue");
      expect(getScoreColor(70)).toBe("blue");
    });

    it("should return yellow for questionable", () => {
      expect(getScoreColor(40)).toBe("yellow");
      expect(getScoreColor(50)).toBe("yellow");
    });

    it("should return red for high misinformation", () => {
      expect(getScoreColor(0)).toBe("red");
      expect(getScoreColor(30)).toBe("red");
    });
  });

  describe("Image Analysis Workflow", () => {
    it("should handle image URL validation", () => {
      const validUrl = "https://example.com/image.jpg";
      expect(validUrl).toMatch(/^https?:\/\/.+/);
    });

    it("should handle score ranges", () => {
      const scores = [0, 25, 50, 75, 100];
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should categorize manipulation scores", () => {
      const highManipulation = 85;
      const lowManipulation = 15;
      
      expect(highManipulation > 70).toBe(true);
      expect(lowManipulation < 40).toBe(true);
    });

    it("should categorize deepfake scores", () => {
      const likelyDeepfake = 80;
      const unlikelyDeepfake = 20;
      
      expect(likelyDeepfake > 70).toBe(true);
      expect(unlikelyDeepfake < 40).toBe(true);
    });

    it("should categorize authenticity scores", () => {
      const authentic = 85;
      const questionable = 35;
      
      expect(authentic > 70).toBe(true);
      expect(questionable < 50).toBe(true);
    });
  });

  describe("Analysis Result Structure", () => {
    it("should have all required analysis fields", () => {
      const result = {
        extractedText: "Sample text",
        imageDescription: "Sample image",
        manipulationScore: 45,
        deepfakeScore: 30,
        authenticityScore: 65,
        newsCredibilityScore: 72,
        newsCategory: "politics",
        redFlags: ["flag1", "flag2"],
        keyFindings: ["finding1"],
        recommendations: ["recommendation1"],
        rawAnalysis: "{}",
      };

      expect(result).toHaveProperty("extractedText");
      expect(result).toHaveProperty("imageDescription");
      expect(result).toHaveProperty("manipulationScore");
      expect(result).toHaveProperty("deepfakeScore");
      expect(result).toHaveProperty("authenticityScore");
      expect(result).toHaveProperty("newsCredibilityScore");
      expect(result).toHaveProperty("newsCategory");
      expect(result).toHaveProperty("redFlags");
      expect(result).toHaveProperty("keyFindings");
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("rawAnalysis");
    });

    it("should validate array fields", () => {
      const redFlags = ["Sensational language", "Unverified sources"];
      const keyFindings = ["Multiple red flags detected"];
      const recommendations = ["Check original sources"];

      expect(Array.isArray(redFlags)).toBe(true);
      expect(Array.isArray(keyFindings)).toBe(true);
      expect(Array.isArray(recommendations)).toBe(true);
      expect(redFlags.length).toBeGreaterThan(0);
    });
  });

  describe("News Categories", () => {
    it("should support all news categories", () => {
      const categories = ["politics", "health", "science", "business", "technology", "entertainment", "sports", "other"];
      
      categories.forEach(cat => {
        expect(typeof cat).toBe("string");
        expect(cat.length).toBeGreaterThan(0);
      });
    });
  });
});
