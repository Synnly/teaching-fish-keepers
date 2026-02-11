import { useContext, useState } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContext, AuthProvider } from "../../../src/contexts/AuthContext";
import * as authApi from "../../../src/api/auth";

vi.mock("../../../src/api/auth");

function Consumer() {
  const ctx = useContext(AuthContext);
  const [error, setError] = useState("");

  if (!ctx) return null;

  return (
    <div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="authed">{String(ctx.isAuthenticated)}</div>
      <div data-testid="token">{ctx.token ?? ""}</div>
      <div data-testid="error">{error}</div>
      <button onClick={async () => setError((await ctx.login("pw")) ?? "")}>
        do-login
      </button>
      <button onClick={() => ctx.logout()}>do-logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("verifies stored token on mount and authenticates if valid", async () => {
    localStorage.setItem("club_poisson_token", "stored");

    vi.mocked(authApi.checkAuth).mockResolvedValue({ authenticated: true });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(authApi.checkAuth).toHaveBeenCalledWith("stored");
    expect(screen.getByTestId("authed")).toHaveTextContent("true");
    expect(screen.getByTestId("token")).toHaveTextContent("stored");
  });

  it("removes stored token if invalid", async () => {
    localStorage.setItem("club_poisson_token", "bad");

    vi.mocked(authApi.checkAuth).mockResolvedValue({ authenticated: false });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(localStorage.getItem("club_poisson_token")).toBeNull();
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
  });

  it("login stores token and logout clears it", async () => {
    const user = userEvent.setup();

    vi.mocked(authApi.checkAuth).mockResolvedValue({ authenticated: false });
    vi.mocked(authApi.login).mockResolvedValue({ token: "newtok" });
    vi.mocked(authApi.logout).mockResolvedValue();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );

    await user.click(screen.getByText("do-login"));
    await waitFor(() =>
      expect(localStorage.getItem("club_poisson_token")).toBe("newtok"),
    );
    expect(screen.getByTestId("authed")).toHaveTextContent("true");

    await user.click(screen.getByText("do-logout"));
    await waitFor(() =>
      expect(localStorage.getItem("club_poisson_token")).toBeNull(),
    );
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
  });
});
