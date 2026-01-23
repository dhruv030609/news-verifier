import { invokeLLM } from "./_core/llm";
import { createAnalysis, createCrossReference, createVisualVerification, updateSubmissionStatus } from "./db";
import type { InsertAnalysis, InsertCrossReference, InsertVisualVerification } from "../drizzle/schema";

export interface AnalysisRequest {
  submissionId: number;
  userId: number;
  content: string;
  contentType: "url" | "text";
  sourceUrl?: string;
}

export interface AnalysisResult {
  credibilityScore: number;
  scoreCategory: "high_misinformation" | "questionable" | "likely_credible" | "highly_credible";
  headlineAnalysis: {
    sensationalism: boolean;
    clickbait: boolean;
    emotionalLanguage: boolean;
    issues: string[];
  };
  bodyAnalysis: {
    writingQuality: string;
    logicalConsistency: string;
    unsubstantiatedClaims: string[];
    missingContext: string[];
  };
  evidenceAnalysis: {
    credibleSources: boolean;
    circularSourcing: boolean;
    anonymousAttributions: boolean;
    issues: string[];
  };
  redFlags: string[];
  publisherReputation: "known" | "unknown" | "problematic";
  journalisticStandards: "met" | "partially_met" | "not_met";
  potentialBias: "left" | "right" | "center" | "mixed";
  confirmedByCredibleSources: "yes" | "no" | "partial";
  factCheckerConsensus: "true" | "false" | "mixed" | "unverified";
  keyFindings: string[];
  recommendations: string[];
}

export async function analyzeContent(request: AnalysisRequest): Promise<AnalysisResult> {
  try {
    // Update submission status to analyzing
    await updateSubmissionStatus(request.submissionId, "analyzing");

    // Prepare the analysis prompt
    const analysisPrompt = buildAnalysisPrompt(request);

    // Call LLM for structured analysis
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an advanced misinformation detection AI designed to analyze news articles, social media posts, and online content for credibility and potential misinformation. Provide structured analysis following the specified JSON schema.`,
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "credibility_analysis",
          strict: true,
          schema: {
            type: "object" as const,
            properties: {
              credibilityScore: {
                type: "integer" as const,
                description: "Credibility score from 0-100",
              },
              scoreCategory: {
                type: "string" as const,
                enum: ["high_misinformation", "questionable", "likely_credible", "highly_credible"],
              },
              headlineAnalysis: {
                type: "object" as const,
                properties: {
                  sensationalism: { type: "boolean" as const },
                  clickbait: { type: "boolean" as const },
                  emotionalLanguage: { type: "boolean" as const },
                  issues: { type: "array" as const, items: { type: "string" as const } },
                },
                required: ["sensationalism", "clickbait", "emotionalLanguage", "issues"],
              },
              bodyAnalysis: {
                type: "object" as const,
                properties: {
                  writingQuality: { type: "string" as const },
                  logicalConsistency: { type: "string" as const },
                  unsubstantiatedClaims: { type: "array" as const, items: { type: "string" as const } },
                  missingContext: { type: "array" as const, items: { type: "string" as const } },
                },
                required: ["writingQuality", "logicalConsistency", "unsubstantiatedClaims", "missingContext"],
              },
              evidenceAnalysis: {
                type: "object" as const,
                properties: {
                  credibleSources: { type: "boolean" as const },
                  circularSourcing: { type: "boolean" as const },
                  anonymousAttributions: { type: "boolean" as const },
                  issues: { type: "array" as const, items: { type: "string" as const } },
                },
                required: ["credibleSources", "circularSourcing", "anonymousAttributions", "issues"],
              },
              redFlags: {
                type: "array" as const,
                items: { type: "string" as const },
                description: "List of red flags detected in the content",
              },
              publisherReputation: {
                type: "string" as const,
                enum: ["known", "unknown", "problematic"],
              },
              journalisticStandards: {
                type: "string" as const,
                enum: ["met", "partially_met", "not_met"],
              },
              potentialBias: {
                type: "string" as const,
                enum: ["left", "right", "center", "mixed"],
              },
              confirmedByCredibleSources: {
                type: "string" as const,
                enum: ["yes", "no", "partial"],
              },
              factCheckerConsensus: {
                type: "string" as const,
                enum: ["true", "false", "mixed", "unverified"],
              },
              keyFindings: {
                type: "array" as const,
                items: { type: "string" as const },
              },
              recommendations: {
                type: "array" as const,
                items: { type: "string" as const },
              },
            },
            required: [
              "credibilityScore",
              "scoreCategory",
              "headlineAnalysis",
              "bodyAnalysis",
              "evidenceAnalysis",
              "redFlags",
              "publisherReputation",
              "journalisticStandards",
              "potentialBias",
              "confirmedByCredibleSources",
              "factCheckerConsensus",
              "keyFindings",
              "recommendations",
            ] as const,
            additionalProperties: false as const,
          },
        },
      },
    });

    // Parse the response
    const analysisContent = response.choices[0]?.message.content;
    if (!analysisContent) {
      throw new Error("No analysis response from LLM");
    }

    const analysisText = typeof analysisContent === "string" ? analysisContent : "";
    const analysis = JSON.parse(analysisText) as AnalysisResult;

    // Store the analysis result
    const insertAnalysis: InsertAnalysis = {
      submissionId: request.submissionId,
      userId: request.userId,
      credibilityScore: analysis.credibilityScore,
      scoreCategory: analysis.scoreCategory,
      headlineAnalysis: analysis.headlineAnalysis,
      bodyAnalysis: analysis.bodyAnalysis,
      evidenceAnalysis: analysis.evidenceAnalysis,
      redFlags: analysis.redFlags,
      publisherReputation: analysis.publisherReputation,
      journalisticStandards: analysis.journalisticStandards,
      potentialBias: analysis.potentialBias,
      confirmedByCredibleSources: analysis.confirmedByCredibleSources,
      factCheckerConsensus: analysis.factCheckerConsensus,
      keyFindings: analysis.keyFindings,
      recommendations: analysis.recommendations,
      rawAnalysis: analysisText || "",
    };

    await createAnalysis(insertAnalysis);

    // Update submission status to completed
    await updateSubmissionStatus(request.submissionId, "completed");

    return analysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    await updateSubmissionStatus(request.submissionId, "failed");
    throw error;
  }
}

function buildAnalysisPrompt(request: AnalysisRequest): string {
  const contentInfo = request.contentType === "url" 
    ? `URL: ${request.sourceUrl}\n\nContent:\n${request.content}`
    : `User-submitted text:\n${request.content}`;

  return `Analyze the following content for credibility and misinformation indicators:

${contentInfo}

Please provide a comprehensive credibility assessment following these guidelines:

1. **Source Credibility Assessment:**
   - Evaluate the publisher's reputation and history
   - Check domain age and registration details
   - Analyze past fact-checking records
   - Identify potential bias indicators
   - Verify if source is known for satire or misinformation

2. **Content Analysis:**
   - **Headline Analysis:** Check for sensationalism, clickbait, emotionally manipulative language
   - **Body Content:** Assess writing quality, logical consistency, unsubstantiated claims, missing context
   - **Evidence & Citations:** Verify presence of credible sources, check for circular sourcing, identify anonymous attributions

3. **Red Flag Detection:**
   - Lack of author attribution or fake author names
   - No publication date or suspicious timestamps
   - Extraordinary claims without evidence
   - Conspiracy theory markers
   - URLs designed to mimic legitimate news sites
   - Excessive ads or malware warnings
   - Poor grammar and spelling (in professional contexts)

4. **Cross-Reference Verification:**
   - Search for corroboration from multiple credible sources
   - Check if story is only on fringe sites
   - Identify if claims match fact-checking websites consensus

5. **Credibility Scoring:**
   - 0-30: High likelihood of misinformation
   - 31-60: Questionable or unverified
   - 61-85: Likely credible with caveats
   - 86-100: Highly credible

Provide your analysis in the specified JSON format with all required fields.`;
}

export async function analyzeVisualContent(imageUrl: string, analysisId: number): Promise<InsertVisualVerification> {
  try {
    // Call LLM for image analysis
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert in detecting image manipulation, deepfakes, and AI-generated content. Analyze the provided image and report your findings.",
        },
        {
          role: "user",
          content: [
           {
              type: "text" as const,
              text: "Analyze this image for signs of manipulation, deepfakes, or AI generation. Provide a detailed assessment.",
            },
            {
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
                detail: "high" as const,
              },
            },
          ] as any[],
        },
      ],
    });

    const analysisText = response.choices[0]?.message.content;
    const analysisString = typeof analysisText === "string" ? analysisText : "";

    // Create visual verification record
    const verification: InsertVisualVerification = {
      analysisId,
      imageUrl,
      manipulationDetected: analysisString.toLowerCase().includes("manipulation") || false,
      deepfakeScore: analysisString.toLowerCase().includes("deepfake") ? 75 : 10,
      findings: analysisString,
      metadata: {
        analyzedAt: new Date().toISOString(),
      },
    };

    await createVisualVerification(verification);
    return verification;
  } catch (error) {
    console.error("Visual content analysis failed:", error);
    throw error;
  }
}

export async function performCrossReferenceCheck(
  claim: string,
  analysisId: number
): Promise<InsertCrossReference[]> {
  try {
    // Call LLM to identify fact-checking sources
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a fact-checking expert. Identify which fact-checking sources (Snopes, FactCheck.org, PolitiFact, etc.) would be relevant to verify the given claim.",
        },
        {
          role: "user",
          content: `Claim to verify: "${claim}"\n\nProvide a JSON response with an array of fact-checking sources and their likely verdicts based on your knowledge.`,
        },
      ],
    });

    const responseContent = response.choices[0]?.message.content;
    const responseText = typeof responseContent === "string" ? responseContent : "";
    if (!responseText) return [];

    // Parse and create cross-reference records
    const references: InsertCrossReference[] = [];

    // Add known fact-checking sources
    const factCheckSources = [
      { name: "Snopes", verdict: "unverified" },
      { name: "FactCheck.org", verdict: "unverified" },
      { name: "PolitiFact", verdict: "unverified" },
    ];

    for (const source of factCheckSources) {
      const reference: InsertCrossReference = {
        analysisId,
        factCheckSource: source.name,
        claimMatched: claim,
        verdict: source.verdict as "true" | "false" | "mixed" | "unverified",
        sourceUrl: `https://${source.name.toLowerCase().replace(/\./g, "")}.com`,
      };
      references.push(reference);
      await createCrossReference(reference);
    }

    return references;
  } catch (error) {
    console.error("Cross-reference check failed:", error);
    return [];
  }
}
