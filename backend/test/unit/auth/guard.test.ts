import { describe, it, expect } from "bun:test";
import { requireAuth } from "../../../src/auth/guard";
import * as sessions from "../../../src/auth/sessions";

describe("requireAuth", () => {
  it("should return 401 if no token is provided", () => {
    const req = new Request("http://localhost/api/data");
    const response = requireAuth(req);
    
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
  });

  it("should return 401 if token is invalid", () => {
    const req = new Request("http://localhost/api/data", {
      headers: { "Authorization": "Bearer invalid-token" }
    });
    const response = requireAuth(req);
    
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
  });

  it("should return null if token is valid", () => {
    const token = sessions.createSession();
    const req = new Request("http://localhost/api/data", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const response = requireAuth(req);
    
    expect(response).toBeNull();
  });
});
