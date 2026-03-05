import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, submissions, analyses, visualVerifications, crossReferences, articles, InsertSubmission, InsertAnalysis, InsertVisualVerification, InsertCrossReference, InsertArticle } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Analysis-related queries
export async function createSubmission(submission: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(submissions).values(submission);
  return { insertId: result[0]?.insertId || 0 };
}

export async function getSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAnalysis(analysis: InsertAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(analyses).values(analysis);
  return { insertId: result[0]?.insertId || 0 };
}

export async function getAnalysisById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserAnalyses(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit)
    .offset(offset);
  return result;
}

export async function updateSubmissionStatus(submissionId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(submissions)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(submissions.id, submissionId));
}

export async function saveAnalysis(analysisId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(analyses)
    .set({ isSaved: true, updatedAt: new Date() })
    .where(eq(analyses.id, analysisId));
}

export async function getSavedAnalyses(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(analyses)
    .where(eq(analyses.userId, userId) && eq(analyses.isSaved, true))
    .orderBy((t) => t.createdAt);
  return result;
}

export async function createVisualVerification(verification: InsertVisualVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(visualVerifications).values(verification);
  return { insertId: result[0]?.insertId || 0 };
}

export async function createCrossReference(reference: InsertCrossReference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(crossReferences).values(reference);
  return { insertId: result[0]?.insertId || 0 };
}

export async function getCrossReferences(analysisId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(crossReferences)
    .where(eq(crossReferences.analysisId, analysisId));
  return result;
}

// Article-related queries
export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(articles).values(article);
  return { insertId: result[0]?.insertId || 0 };
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserArticles(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(articles)
    .where(eq(articles.userId, userId))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);
  return result;
}

export async function getPublicArticles(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(articles)
    .where(and(eq(articles.isPublic, true), eq(articles.status, "verified")))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);
  return result;
}

export async function updateArticleStatus(articleId: number, status: string, verificationScore?: number, verificationNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status: status as any, updatedAt: new Date() };
  if (verificationScore !== undefined) updateData.verificationScore = verificationScore;
  if (verificationNotes !== undefined) updateData.verificationNotes = verificationNotes;
  
  await db.update(articles)
    .set(updateData)
    .where(eq(articles.id, articleId));
}

export async function incrementArticleViews(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const article = await getArticleById(articleId);
  if (!article) return;
  
  await db.update(articles)
    .set({ viewCount: (article.viewCount || 0) + 1 })
    .where(eq(articles.id, articleId));
}

export async function publishArticle(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(articles)
    .set({ isPublic: true, status: "submitted", updatedAt: new Date() })
    .where(eq(articles.id, articleId));
}
