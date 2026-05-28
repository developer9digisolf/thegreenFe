import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("should format number as Indonesian Rupiah", () => {
    expect(formatCurrency(100000)).toBe("Rp\u00A0100.000");
  });

  it("should format zero", () => {
    expect(formatCurrency(0)).toBe("Rp\u00A00");
  });

  it("should format large numbers", () => {
    expect(formatCurrency(15000000)).toBe("Rp\u00A015.000.000");
  });

  it("should format decimal numbers without fraction digits", () => {
    expect(formatCurrency(1250.5)).toBe("Rp\u00A01.251");
  });
});
