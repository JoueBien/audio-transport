import { delay } from "./delay";
import { timestamp } from "./timestamp";

describe("timestamp", () => {
  it("now returns big ints", async () => {
    const res = timestamp.nowRTP64Bit();
    // Wait for 100 microseconds.
    await delay({
      ms: 1 / 100,
    });
    const res2 = timestamp.nowRTP64Bit();

    expect(res2).toBeGreaterThan(res);
  });
});
