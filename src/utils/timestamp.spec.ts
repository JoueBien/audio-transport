import { describe, expect, it, vi } from "vitest";
import { delay } from "./delay";
import { timestamp } from "./timestamp";
import { setupFakeTimers } from "../testing/setupFakeTimers";

const NOW = new Date();

describe("timestamp", () => {
  setupFakeTimers({
    now: NOW,
    fake: ["fake", "Date", "performance"],
  });

  it("nowRTP64Bit now returns big ints", async () => {
    // This test needs real time to get two different timestamps.
    vi.useRealTimers();
    const res = timestamp.nowRTP64Bit();
    // Wait for 100 microseconds.
    await delay({
      ms: 1 / 100,
    });

    const res2 = timestamp.nowRTP64Bit();

    expect(res2).toBeGreaterThan(res);
  });

  it("nowRTP32Bit now returns lower half of nowRTP64Bit", async () => {
    const benchmark = Number(timestamp.nowRTP64Bit() & 0xffffffffn);
    const res = timestamp.nowRTP32Bit();

    expect(res).toBe(benchmark);
    expect(typeof res).toBe("number");
  });
});
