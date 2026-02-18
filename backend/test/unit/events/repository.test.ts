import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock the connection module once
mock.module("../../../src/db/connection", () => {
  const m = mock(async () => []);
  m.unsafe = mock(async () => []);
  return { default: m };
});

import * as repository from "../../../src/events/repository";
import sql from "../../../src/db/connection";

describe("events repository", () => {
  beforeEach(() => {
    sql.mockClear();
  });

  it("listEvents (upcoming) should return rows", async () => {
    const mockData = [{ id: 1 }];
    sql.mockResolvedValueOnce(mockData);
    const result = await repository.listEvents(false);
    expect(result).toEqual(mockData);
  });

  it("listEvents (all) should return rows", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    sql.mockResolvedValueOnce(mockData);
    const result = await repository.listEvents(true);
    expect(result).toEqual(mockData);
  });

  it("getEvent should return first row", async () => {
    const mockEvent = { id: 42 };
    sql.mockResolvedValueOnce([mockEvent]);
    const result = await repository.getEvent(42);
    expect(result).toEqual(mockEvent);
  });

  it("getEvent should return undefined if empty", async () => {
    sql.mockResolvedValueOnce([]);
    const result = await repository.getEvent(42);
    expect(result).toBeUndefined();
  });

  it("createEvent should return inserted row", async () => {
    const mockEvent = { id: 1, title: "New" };
    sql.mockResolvedValueOnce([mockEvent]);
    const result = await repository.createEvent({ title: "New", date: "2024" });
    expect(result).toEqual(mockEvent);
  });

  it("updateEvent should return updated row", async () => {
    const mockEvent = { id: 1, title: "Updated" };
    sql.mockResolvedValueOnce([mockEvent]);
    const result = await repository.updateEvent(1, { title: "Updated", date: "2024" });
    expect(result).toEqual(mockEvent);
  });

  it("deleteEvent should return true if result has rows", async () => {
    sql.mockResolvedValueOnce([{ id: 1 }]);
    const result = await repository.deleteEvent(1);
    expect(result).toBe(true);
  });

  it("deleteEvent should return false if result is empty", async () => {
    sql.mockResolvedValueOnce([]);
    const result = await repository.deleteEvent(1);
    expect(result).toBe(false);
  });
});