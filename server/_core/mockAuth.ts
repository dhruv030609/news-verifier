import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

/**
 * Mock authentication for local development
 * Allows testing without OAuth setup
 */

export function registerMockAuthRoutes(app: Express) {
  // Mock login endpoint - creates a test user session
  app.get("/api/mock-login", async (req: Request, res: Response) => {
    try {
      const mockOpenId = "local-dev-user-" + Date.now();
      const mockUser = {
        openId: mockOpenId,
        name: "Local Developer",
        email: "dev@localhost",
        loginMethod: "local-dev",
        lastSignedIn: new Date(),
      };

      // Upsert user in database
      await db.upsertUser(mockUser);

      // Create session token
      const sessionToken = await sdk.createSessionToken(mockOpenId, {
        name: mockUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to home
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Mock Auth] Login failed", error);
      res.status(500).json({ error: "Mock login failed" });
    }
  });

  // Mock logout endpoint
  app.get("/api/mock-logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Mock Auth] Logout failed", error);
      res.status(500).json({ error: "Mock logout failed" });
    }
  });
}
