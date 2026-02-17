import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../../src/hooks/useAuth", () => {
  return {
    useAuth: vi.fn(),
  };
});

import RequireAuth from "../../../src/components/RequireAuth";
import { useAuth } from "../../../src/hooks/useAuth";

describe("RequireAuth", () => {
  it("shows spinner while loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      isAuthenticated: false,
      loading: true,
      login: vi.fn(async () => null),
      logout: vi.fn(async () => undefined),
    });

    const { container } = render(
      <MemoryRouter>
        <RequireAuth>
          <div>secret</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("redirects to /login when unauthenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(async () => null),
      logout: vi.fn(async () => undefined),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <div>secret</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("login")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: "t",
      isAuthenticated: true,
      loading: false,
      login: vi.fn(async () => null),
      logout: vi.fn(async () => undefined),
    });

    render(
      <MemoryRouter>
        <RequireAuth>
          <div>secret</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    expect(screen.getByText("secret")).toBeInTheDocument();
  });
});
