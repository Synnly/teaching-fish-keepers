import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { useAuth } from "../../../src/hooks/useAuth";

function UsesAuth() {
  useAuth();
  return <div>ok</div>;
}

describe("useAuth", () => {
  it("throws if used outside AuthProvider", () => {
    expect(() => render(<UsesAuth />)).toThrow(
      "useAuth must be used within AuthProvider",
    );
  });
});
