import { describe, it, expect } from "bun:test";
import { handleAuthRoutes, extractBearerToken } from "../../../src/auth/routes";
import { createSession } from "../../../src/auth/sessions";

describe("auth routes", () => {
  describe("extractBearerToken", () => {
    it("should extract token from valid Authorization header", () => {
      const req = new Request("http://localhost", {
        headers: { "Authorization": "Bearer my-token" }
      });
      expect(extractBearerToken(req)).toBe("my-token");
    });

    it("should return null if header is missing", () => {
      const req = new Request("http://localhost");
      expect(extractBearerToken(req)).toBeNull();
    });

    it("should return null if header does not start with Bearer", () => {
      const req = new Request("http://localhost", {
        headers: { "Authorization": "Basic something" }
      });
      expect(extractBearerToken(req)).toBeNull();
    });
  });

  describe("handleAuthRoutes", () => {
    const password = process.env.ADMIN_PASSWORD ?? "admin";

    it("POST /api/auth/login - should return token on correct password", async () => {
      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(200);
      const body = await response?.json();
      expect(body.token).toBeDefined();
    });

    it("POST /api/auth/login - should return 401 on wrong password", async () => {
      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password: password + "wrong" })
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
      const body = await response?.json();
      expect(body.error).toBe("Invalid password");
    });

    it("GET /api/auth/me - should return authenticated true for valid token", async () => {
      const token = createSession();
      const req = new Request("http://localhost/api/auth/me", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).not.toBeNull();
      const body = await response?.json();
      expect(body.authenticated).toBe(true);
    });

    it("GET /api/auth/me - should return authenticated false for invalid token", async () => {
      const req = new Request("http://localhost/api/auth/me", {
        method: "GET",
        headers: { "Authorization": "Bearer invalid" }
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).not.toBeNull();
      const body = await response?.json();
      expect(body.authenticated).toBe(false);
    });

    it("POST /api/auth/logout - should return ok true", async () => {
      const token = createSession();
      const req = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).not.toBeNull();
      const body = await response?.json();
      expect(body.ok).toBe(true);
    });

    it("should return null for unknown routes", async () => {
      const req = new Request("http://localhost/api/other", {
        method: "GET"
      });
      const url = new URL(req.url);
      const response = await handleAuthRoutes(req, url);

      expect(response).toBeNull();
    });
  });
});
