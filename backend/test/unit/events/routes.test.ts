import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
import * as repo from "../../../src/events/repository";
import * as guard from "../../../src/auth/guard";
import { handleEventRoutes } from "../../../src/events/routes";

describe("event routes", () => {
  beforeEach(() => {
    mock.restore();
  });

  describe("GET /api/events", () => {
    it("should list events", async () => {
      const mockEvents = [{ id: 1, title: "Event" }];
      const spy = spyOn(repo, "listEvents").mockResolvedValue(mockEvents);

      const req = new Request("http://localhost/api/events");
      const url = new URL(req.url);
      const response = await handleEventRoutes(req, url);

      expect(response?.status).toBe(200);
      expect(await response?.json()).toEqual(mockEvents);
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe("POST /api/events", () => {
    it("should return 401 if unauthorized", async () => {
      const spy = spyOn(guard, "requireAuth").mockReturnValue(Response.json({ error: "Unauthorized" }, { status: 401 }));
      const req = new Request("http://localhost/api/events", { method: "POST" });
      const url = new URL(req.url);
      const response = await handleEventRoutes(req, url);
      expect(response?.status).toBe(401);
      spy.mockRestore();
    });

    it("should create event", async () => {
      const gSpy = spyOn(guard, "requireAuth").mockReturnValue(null);
      const newEvent = { title: "New", date: "2024-01-01" };
      const rSpy = spyOn(repo, "createEvent").mockResolvedValue({ id: 1, ...newEvent });

      const req = new Request("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify(newEvent)
      });
      const url = new URL(req.url);
      const response = await handleEventRoutes(req, url);

      expect(response?.status).toBe(201);
      gSpy.mockRestore();
      rSpy.mockRestore();
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return event", async () => {
      const mockEvent = { id: 1, title: "Found" };
      const spy = spyOn(repo, "getEvent").mockResolvedValue(mockEvent);

      const req = new Request("http://localhost/api/events/1");
      const url = new URL(req.url);
      const response = await handleEventRoutes(req, url);

      expect(response?.status).toBe(200);
      expect(spy).toHaveBeenCalledWith(1);
      spy.mockRestore();
    });
  });

  describe("PUT /api/events/:id", () => {
    it("should update event", async () => {
      const gSpy = spyOn(guard, "requireAuth").mockReturnValue(null);
      const rSpy = spyOn(repo, "updateEvent").mockResolvedValue({ id: 1, title: "Updated" });

      const req = new Request("http://localhost/api/events/1", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated", date: "2024-01-01" })
      });
      const url = new URL(req.url);
      await handleEventRoutes(req, url);

      expect(rSpy).toHaveBeenCalledWith(1, expect.any(Object));
      gSpy.mockRestore();
      rSpy.mockRestore();
    });
  });

  describe("DELETE /api/events/:id", () => {
    it("should delete event", async () => {
      const gSpy = spyOn(guard, "requireAuth").mockReturnValue(null);
      const rSpy = spyOn(repo, "deleteEvent").mockResolvedValue(true);

      const req = new Request("http://localhost/api/events/1", { method: "DELETE" });
      const url = new URL(req.url);
      const response = await handleEventRoutes(req, url);

      expect(response?.status).toBe(200);
      expect(rSpy).toHaveBeenCalledWith(1);
      gSpy.mockRestore();
      rSpy.mockRestore();
    });
  });
});
