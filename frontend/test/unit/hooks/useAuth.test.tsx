import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";

import { useAuth } from "../../../src/hooks/useAuth";
import { AuthProvider } from "../../../src/contexts/AuthContext";
import * as authApi from "../../../src/api/auth";

vi.mock("../../../src/api/auth", () => ({
  checkAuth: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

function UsesAuth() {
  useAuth();
  return <div>ok</div>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("throws if used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<UsesAuth />)).toThrow(
      "useAuth must be used within AuthProvider",
    );
    consoleSpy.mockRestore();
  });

  describe("Initialization", () => {
    it("restores session if localStorage has valid token", async () => {
      localStorage.setItem("club_poisson_token", "valid-token");
      (authApi.checkAuth).mockResolvedValue({ authenticated: true });
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("clears session if localStorage has invalid token", async () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
      localStorage.setItem("club_poisson_token", "invalid-token");
      (authApi.checkAuth).mockResolvedValue({ authenticated: false });
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);
      expect(removeItemSpy).toHaveBeenCalledWith("club_poisson_token");
    });
  });

  describe("Login", () => {
    it("updates state and storage on success", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      (authApi.checkAuth).mockResolvedValue({ authenticated: false });
      (authApi.login).mockResolvedValue({ token: "new-token" });
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => {
        await result.current.login("secret");
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(setItemSpy).toHaveBeenCalledWith(
        "club_poisson_token",
        "new-token",
      );
    });

    it("returns error and keeps state on failure", async () => {
      (authApi.checkAuth).mockResolvedValue({ authenticated: false });
      (authApi.login).mockResolvedValue({ error: "Bad password" });
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      let error;
      await act(async () => {
        error = await result.current.login("wrong");
      });
      expect(error).toBe("Bad password");
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Logout", () => {
    it("clears state and storage", async () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
      localStorage.setItem("club_poisson_token", "token-to-delete");
      (authApi.checkAuth).mockResolvedValue({ authenticated: true });
      (authApi.logout).mockResolvedValue({});
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
      await act(async () => {
        await result.current.logout();
      });
      expect(result.current.isAuthenticated).toBe(false);
      expect(removeItemSpy).toHaveBeenCalledWith("club_poisson_token");
    });
  });
});
