import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import EventCard from "../../../src/components/EventCard";
import type { Event } from "../../../src/types";

describe("EventCard", () => {
  it("renders optional fields and formats date", () => {
    const event: Event = {
      id: 1,
      title: "Atelier aquascaping",
      description: "Apprendre les bases",
      date: "2026-02-11T18:30:00.000Z",
      end_date: null,
      location: "Salle A",
      image_url: "example",
      max_participants: 20,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };

    render(<EventCard event={event} />);

    expect(
      screen.getByRole("img", { name: "Atelier aquascaping" }),
    ).toHaveAttribute("src", "example");
    expect(screen.getByText("Atelier aquascaping")).toBeInTheDocument();

    const expectedDate = new Date(event.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();

    expect(screen.getByText("Salle A")).toBeInTheDocument();
    expect(screen.getByText("Apprendre les bases")).toBeInTheDocument();
    expect(screen.getByText("20 participants max")).toBeInTheDocument();
  });
});
