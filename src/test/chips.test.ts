import { describe, expect, it } from "vitest";
import { short } from "@/lib/chips";

describe("short", () => {
  it("fits the header pill", () => {
    expect([0, 950, 10_000, 12_550, 1_234_567].map(short)).toEqual([
      "0",
      "950",
      "10K",
      "12.5K",
      "1.2M",
    ]);
  });
});
