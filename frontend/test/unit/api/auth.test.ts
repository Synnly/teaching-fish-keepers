import { describe, expect, it, vi } from "vitest";

import { checkAuth, login, logout } from "../../../src/api/auth";

describe("api/auth", () => {
  it("login posts password and returns json", async () => {
    const json = vi.fn().mockResolvedValue({ token: "t123" });
    const fetchMock = vi.fn().mockResolvedValue({ json });
    globalThis.fetch = fetchMock;

    const res = await login("secret");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "secret" }),
    });
    expect(res).toEqual({ token: "t123" });
  });

  it("checkAuth sends bearer token", async () => {
    const json = vi.fn().mockResolvedValue({ authenticated: true });
    const fetchMock = vi.fn().mockResolvedValue({ json });
    globalThis.fetch = fetchMock;

    const res = await checkAuth("abc");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      headers: { Authorization: "Bearer abc" },
    });
    expect(res).toEqual({ authenticated: true });
  });

  it("logout posts to endpoint with bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock;

    await logout("zzz");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer zzz" },
    });
  });
});
