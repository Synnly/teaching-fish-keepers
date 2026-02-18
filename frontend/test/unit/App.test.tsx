import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";
import * as useAuthHook from "../../src/hooks/useAuth";

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header and navigation links", () => {
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      token: null,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Club Poisson")).toBeInTheDocument();
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders admin and logout when authenticated", () => {
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      token: "fake-token",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Déconnexion")).toBeInTheDocument();
  });

  it("handleLogout calls logout and navigates to home", async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      loading: false,
      token: "fake-token",
    });

    const { getByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const logoutBtn = getByText("Déconnexion");
    logoutBtn.click();

    await expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
