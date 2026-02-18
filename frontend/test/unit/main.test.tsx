import { describe, it, expect, vi, beforeEach } from "vitest";

describe("main.tsx", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
  });

  it("renders the app without crashing", async () => {
    const renderMock = vi.fn();
    const createRootMock = vi.fn().mockReturnValue({ render: renderMock });

    vi.doMock("react-dom/client", () => ({
      createRoot: createRootMock,
    }));

    await import("../../src/main");

    expect(createRootMock).toHaveBeenCalledWith(expect.any(HTMLElement));
    expect(renderMock).toHaveBeenCalled();
  });
});
