import { describe, it, expect } from "vitest";
import { formatTime } from "./time";

describe("formatTime", () => {
  it("форматирует 0 секунд как 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("форматирует 59 секунд как 00:59", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  it("форматирует 60 секунд как 01:00", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("форматирует 65 секунд как 01:05 (с ведущим нулём)", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("форматирует 3600 секунд как 60:00", () => {
    expect(formatTime(3600)).toBe("60:00");
  });

  it("форматирует 3661 секунду как 61:01", () => {
    expect(formatTime(3661)).toBe("61:01");
  });
});
