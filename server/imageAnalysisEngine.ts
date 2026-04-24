/**
 * Image News Verification Engine
 * 
 * Analyzes images for news content verification including:
 * - OCR (Optical Character Recognition) to extract text
 * - Image manipulation detection
 * - Deepfake detection
 * - News credibility analysis of extracted text
 */

import { invokeLLM } from "./_core/llm";

export interface ImageAnalysisRequest {
  imageUrl: string;
  imageDescription?: string;
}

export interface ImageAnalysisResult {
  extractedText: string;
  imageDescription: string;
  manipulationScore: number;
  deepfakeScore: number;
  authenticityScore: number;
  newsCredibilityScore: number;
  newsCategory: string;
  redFlags: string[];
  keyFindings: string[];
  recommendations: string[];
  rawAnalysis: string;
}

/**
 * Analyze an image for news content and credibility
 */
export async function analyzeImageNews(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
  try {
    // Step 1: Extract text from image using LLM vision capabilities
    const extractedText = await extractTextFromImage(request.imageUrl);
    
    // Step 2: Analyze image for manipulation and deepfakes
    const imageAnalysis = await analyzeImageManipulation(request.imageUrl, extractedText);
    
    // Step 3: Analyze the extracted text as news content
    const newsAnalysis = await analyzeNewsContent(extractedText);
    
    // Combine all analyses
    const result: ImageAnalysisResult = {
      extractedText,
      imageDescription: request.imageDescription || imageAnalysis.description,
      manipulationScore: imageAnalysis.manipulationScore,
      deepfakeScore: imageAnalysis.deepfakeScore,
      authenticityScore: imageAnalysis.authenticityScore,
      newsCredibilityScore: newsAnalysis.credibilityScore,
      newsCategory: newsAnalysis.category,
      redFlags: [...imageAnalysis.redFlags, ...newsAnalysis.redFlags],
      keyFindings: [...imageAnalysis.findings, ...newsAnalysis.keyFindings],
      recommendations: newsAnalysis.recommendations,
      rawAnalysis: JSON.stringify({ imageAnalysis, newsAnalysis }, null, 2)
    };
    
    return result;
  } catch (error) {
    console.error("[ImageAnalysis] Error analyzing image:", error);
    throw error;
  }
}

/**
 * Extract text from image using OCR
 */
async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an OCR specialist. Extract ALL text visible in the image. Be thorough and accurate. If no text is found, respond with 'NO_TEXT_FOUND'."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from this image:"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ] as any
        }
      ]
    });

    const extractedText = typeof response.choices?.[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : "NO_TEXT_FOUND";
    return extractedText;
  } catch (error) {
    console.error("[ImageAnalysis] Error extracting text:", error);
    throw error;
  }
}

/**
 * Analyze image for manipulation, deepfakes, and authenticity
 */
async function analyzeImageManipulation(imageUrl: string, extractedText: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert image forensics analyst. Analyze the image for:
1. Signs of manipulation (edited, photoshopped, etc)
2. Deepfake indicators
3. Overall authenticity

Respond with a JSON object containing:
{
  "description": "brief description of the image",
  "manipulationScore": 0-100,
  "deepfakeScore": 0-100,
  "authenticityScore": 0-100,
  "redFlags": ["flag1", "flag2"],
  "findings": ["finding1", "finding2"]
}

Scores: 0 = not present, 100 = definitely present`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image for manipulation and authenticity. Extracted text: "${extractedText}"`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ] as any
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "image_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              description: { type: "string" },
              manipulationScore: { type: "integer", minimum: 0, maximum: 100 },
              deepfakeScore: { type: "integer", minimum: 0, maximum: 100 },
              authenticityScore: { type: "integer", minimum: 0, maximum: 100 },
              redFlags: { type: "array", items: { type: "string" } },
              findings: { type: "array", items: { type: "string" } }
            },
            required: ["description", "manipulationScore", "deepfakeScore", "authenticityScore", "redFlags", "findings"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from LLM");
    
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      description: parsed.description || "Image analyzed",
      manipulationScore: parsed.manipulationScore || 0,
      deepfakeScore: parsed.deepfakeScore || 0,
      authenticityScore: parsed.authenticityScore || 50,
      redFlags: parsed.redFlags || [],
      findings: parsed.findings || []
    };
  } catch (error) {
    console.error("[ImageAnalysis] Error analyzing manipulation:", error);
    return {
      description: "Analysis failed",
      manipulationScore: 0,
      deepfakeScore: 0,
      authenticityScore: 50,
      redFlags: ["Analysis error"],
      findings: []
    };
  }
}

/**
 * Analyze extracted text as news content
 */
async function analyzeNewsContent(text: string) {
  try {
    if (text === "NO_TEXT_FOUND" || !text || text.length < 5) {
      return {
        credibilityScore: 50,
        category: "other",
        redFlags: ["No text found in image"],
        keyFindings: ["Image contains no readable text or minimal text"],
        recommendations: ["Try uploading an image with clear, readable text"]
      };
    }

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a news credibility analyst. Analyze the provided text for news content and credibility.

Respond with a JSON object containing:
{
  "credibilityScore": 0-100,
  "category": "politics|health|science|business|technology|entertainment|sports|other",
  "redFlags": ["flag1", "flag2"],
  "keyFindings": ["finding1", "finding2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Score: 0 = completely false/misleading, 100 = highly credible`
        },
        {
          role: "user",
          content: `Analyze this text extracted from an image for news credibility:\n\n"${text.substring(0, 1000)}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "news_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              credibilityScore: { type: "integer", minimum: 0, maximum: 100 },
              category: { 
                type: "string",
                enum: ["politics", "health", "science", "business", "technology", "entertainment", "sports", "other"]
              },
              redFlags: { type: "array", items: { type: "string" } },
              keyFindings: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            },
            required: ["credibilityScore", "category", "redFlags", "keyFindings", "recommendations"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from LLM");
    
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      credibilityScore: parsed.credibilityScore || 50,
      category: parsed.category || "other",
      redFlags: parsed.redFlags || [],
      keyFindings: parsed.keyFindings || [],
      recommendations: parsed.recommendations || []
    };
  } catch (error) {
    console.error("[ImageAnalysis] Error analyzing news content:", error);
    return {
      credibilityScore: 50,
      category: "other",
      redFlags: ["Analysis error"],
      keyFindings: ["Could not analyze text"],
      recommendations: ["Try again or use text analysis instead"]
    };
  }
}

/**
 * Get credibility category based on score
 */
export function getCredibilityCategory(score: number): string {
  if (score >= 80) return "highly_credible";
  if (score >= 60) return "likely_credible";
  if (score >= 40) return "questionable";
  return "high_misinformation";
}

/**
 * Get color for credibility score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "green";
  if (score >= 60) return "blue";
  if (score >= 40) return "yellow";
  return "red";
}
