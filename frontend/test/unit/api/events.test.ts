import { describe, expect, it, vi } from "vitest";

import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "../../../src/api/events";

describe("api/events", () => {
  it("listEvents fetches /api/events and returns json", async () => {
    const json = vi.fn().mockResolvedValue([{ id: 1 }]);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    const res = await listEvents();

    expect(fetchMock).toHaveBeenCalledWith("/api/events");
    expect(res).toEqual([{ id: 1 }]);
  });

  it("listEvents(all=true) fetches /api/events?all=true", async () => {
    const json = vi.fn().mockResolvedValue([]);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    await listEvents(true);

    expect(fetchMock).toHaveBeenCalledWith("/api/events?all=true");
  });

  it("getEvent fetches /api/events/:id", async () => {
    const json = vi.fn().mockResolvedValue({ id: 42 });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    const res = await getEvent(42);

    expect(fetchMock).toHaveBeenCalledWith("/api/events/42");
    expect(res).toEqual({ id: 42 });
  });

  it("createEvent includes auth header if token in localStorage", async () => {
    localStorage.setItem("club_poisson_token", "tok");

    const json = vi.fn().mockResolvedValue({ id: 1 });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    await createEvent({ title: "t", date: "2026-02-11T12:00:00Z" });

    expect(fetchMock).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer tok",
      },
      body: JSON.stringify({ title: "t", date: "2026-02-11T12:00:00Z" }),
    });
  });

  it("updateEvent uses PUT and includes auth header if token exists", async () => {
    localStorage.setItem("club_poisson_token", "tok2");

    const json = vi.fn().mockResolvedValue({ id: 5 });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    globalThis.fetch = fetchMock;

    await updateEvent(5, { title: "u", date: "2026-02-11T12:00:00Z" });

    expect(fetchMock).toHaveBeenCalledWith("/api/events/5", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer tok2",
      },
      body: JSON.stringify({ title: "u", date: "2026-02-11T12:00:00Z" }),
    });
  });

  it("deleteEvent throws when response not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    globalThis.fetch = fetchMock;

    await expect(deleteEvent(9)).rejects.toThrow("Failed to delete event");
  });
});
