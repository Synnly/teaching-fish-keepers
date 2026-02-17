import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import HomePage from "../../../src/pages/HomePage";

describe("HomePage", () => {
  it("shows loading then renders events from API", async () => {
    const json = vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "Conférence",
        description: "desc",
        date: "2026-02-11T18:30:00.000Z",
        end_date: null,
        location: "Paris",
        image_url: null,
        max_participants: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    render(<HomePage />);

    expect(
      screen.getByText("Chargement des événements..."),
    ).toBeInTheDocument();

    expect(await screen.findByText("Conférence")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/events");
  });

  it("shows empty state when no events", async () => {
    const json = vi.fn().mockResolvedValue([]);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    render(<HomePage />);

    expect(
      await screen.findByText("Aucun événement à venir."),
    ).toBeInTheDocument();
  });
});
