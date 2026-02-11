import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../../src/hooks/useAuth", () => {
  return {
    useAuth: vi.fn(),
  };
});

import LoginPage from "../../../src/pages/LoginPage";
import { useAuth } from "../../../src/hooks/useAuth";

describe("LoginPage", () => {
  it("redirects to /admin when already authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      token: "t",
      isAuthenticated: true,
      loading: false,
      login: vi.fn(async () => null),
      logout: vi.fn(async () => undefined),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div>admin</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("admin")).toBeInTheDocument();
  });

  it("shows error when login returns an error string", async () => {
    const loginMock = vi.fn(async () => "Bad password");

    vi.mocked(useAuth).mockReturnValue({
      token: null,
      isAuthenticated: false,
      loading: false,
      login: loginMock,
      logout: vi.fn(async () => undefined),
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Mot de passe"), "nope");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByText("Bad password")).toBeInTheDocument();
    expect(loginMock).toHaveBeenCalledWith("nope");
  });
});
