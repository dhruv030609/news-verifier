import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Content submissions table - stores user-submitted content for analysis
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentType: mysqlEnum("contentType", ["url", "text"]).notNull(),
  content: text("content").notNull(),
  title: varchar("title", { length: 500 }),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  status: mysqlEnum("status", ["pending", "analyzing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * Analysis results table - stores credibility analysis results
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  userId: int("userId").notNull(),
  credibilityScore: int("credibilityScore").notNull(),
  scoreCategory: mysqlEnum("scoreCategory", ["high_misinformation", "questionable", "likely_credible", "highly_credible"]).notNull(),
  
  // Structured analysis results
  headlineAnalysis: json("headlineAnalysis"),
  bodyAnalysis: json("bodyAnalysis"),
  evidenceAnalysis: json("evidenceAnalysis"),
  redFlags: json("redFlags"),
  
  // Source assessment
  publisherReputation: mysqlEnum("publisherReputation", ["known", "unknown", "problematic"]).notNull(),
  journalisticStandards: mysqlEnum("journalisticStandards", ["met", "partially_met", "not_met"]).notNull(),
  potentialBias: mysqlEnum("potentialBias", ["left", "right", "center", "mixed"]).notNull(),
  
  // Verification status
  confirmedByCredibleSources: mysqlEnum("confirmedByCredibleSources", ["yes", "no", "partial"]).notNull(),
  factCheckerConsensus: mysqlEnum("factCheckerConsensus", ["true", "false", "mixed", "unverified"]).notNull(),
  
  // Key findings and recommendations
  keyFindings: json("keyFindings"),
  recommendations: json("recommendations"),
  rawAnalysis: text("rawAnalysis"),
  
  isSaved: boolean("isSaved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Visual content verification table - stores image analysis results
 */
export const visualVerifications = mysqlTable("visualVerifications", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  imageUrl: varchar("imageUrl", { length: 2048 }).notNull(),
  manipulationDetected: boolean("manipulationDetected").notNull(),
  deepfakeScore: int("deepfakeScore"),
  metadata: json("metadata"),
  findings: text("findings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisualVerification = typeof visualVerifications.$inferSelect;
export type InsertVisualVerification = typeof visualVerifications.$inferInsert;

/**
 * Cross-reference verification table - stores fact-checking database matches
 */
export const crossReferences = mysqlTable("crossReferences", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  factCheckSource: varchar("factCheckSource", { length: 255 }).notNull(),
  claimMatched: text("claimMatched"),
  verdict: mysqlEnum("verdict", ["true", "false", "mixed", "unverified"]).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrossReference = typeof crossReferences.$inferSelect;
export type InsertCrossReference = typeof crossReferences.$inferInsert;

/**
 * User-submitted articles table - stores articles submitted by users for verification
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  author: varchar("author", { length: 255 }),
  publicationDate: timestamp("publicationDate"),
  category: mysqlEnum("category", ["politics", "health", "science", "business", "technology", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "verified", "rejected"]).default("draft").notNull(),
  verificationScore: int("verificationScore"),
  verificationNotes: text("verificationNotes"),
  viewCount: int("viewCount").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Image news verification table - stores image-based news analysis
 */
export const imageNewsVerifications = mysqlTable("imageNewsVerifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: varchar("imageUrl", { length: 2048 }).notNull(),
  imageKey: varchar("imageKey", { length: 500 }).notNull(),
  
  // OCR extracted text from image
  extractedText: text("extractedText"),
  
  // Image analysis
  imageDescription: text("imageDescription"),
  manipulationScore: int("manipulationScore"), // 0-100, higher = more likely manipulated
  deepfakeScore: int("deepfakeScore"), // 0-100, higher = more likely deepfake
  authenticityScore: int("authenticityScore"), // 0-100, higher = more authentic
  
  // News analysis from extracted text
  newsCredibilityScore: int("newsCredibilityScore"), // 0-100
  newsCategory: mysqlEnum("newsCategory", ["politics", "health", "science", "business", "technology", "entertainment", "sports", "other"]).default("other").notNull(),
  
  // Analysis results
  redFlags: json("redFlags"), // Array of red flags found
  keyFindings: json("keyFindings"), // Array of key findings
  recommendations: json("recommendations"), // Array of recommendations
  
  // Verification status
  status: mysqlEnum("status", ["pending", "analyzing", "completed", "failed"]).default("pending").notNull(),
  rawAnalysis: text("rawAnalysis"), // Full LLM analysis response
  
  // Metadata
  imageMetadata: json("imageMetadata"), // Image properties (size, format, etc)
  isSaved: boolean("isSaved").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImageNewsVerification = typeof imageNewsVerifications.$inferSelect;
export type InsertImageNewsVerification = typeof imageNewsVerifications.$inferInsert;