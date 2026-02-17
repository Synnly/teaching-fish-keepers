import { describe, it, expect, spyOn } from "bun:test";
import { createSession, validateSession, deleteSession } from "../../../src/auth/sessions";

describe("sessions", () => {
  it("should create a session and return a token", () => {
    const token = createSession();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    expect(validateSession(token)).toBe(true);
  });

  it("should validate an existing session", () => {
    const token = createSession();
    expect(validateSession(token)).toBe(true);
  });

  it("should return false for non-existent session", () => {
    expect(validateSession("invalid-token")).toBe(false);
  });

  it("should delete a session", () => {
    const token = createSession();
    deleteSession(token);
    expect(validateSession(token)).toBe(false);
  });

  it("should invalidate expired sessions", () => {
    const token = createSession();
    
    // Mock Date.now to simulate 25 hours later
    const now = Date.now();
    const dateSpy = spyOn(Date, "now").mockImplementation(() => now + 25 * 60 * 60 * 1000);
    
    expect(validateSession(token)).toBe(false);
    
    dateSpy.mockRestore();
  });
});
