import { describe, it, expect, mock, spyOn } from "bun:test";
import { migrate } from "../../../src/db/migrate";
import sql from "../../../src/db/connection";

// Mocking the sql connection as a function with an unsafe method
mock.module("../../../src/db/connection", () => {
  const m = mock(async () => []);
  m.unsafe = mock(async () => []);
  return { default: m };
});

describe("migrate", () => {
  it("should read init.sql and execute it via sql.unsafe", async () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    
    await migrate();

    expect(logSpy).toHaveBeenCalledWith("Migrating database...");
    expect(sql.unsafe).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("Database migration complete");
    
    logSpy.mockRestore();
  });

  it("should throw an error if sql.unsafe fails", async () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    sql.unsafe.mockImplementationOnce(async () => {
      throw new Error("DB Error");
    });

    expect(migrate()).rejects.toThrow("DB Error");
    
    logSpy.mockRestore();
  });
});