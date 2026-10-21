import { describe, expect, it } from "vitest";
import { delay } from "./delay";

describe("delay", () => {
  it("it delays when ms is specified", async () => {
    const cancelOnController = new AbortController();
    await delay({ ms: 5, cancelOnController });
    await delay({ ms: 5 });
    expect(cancelOnController.signal.aborted).toBeFalsy();
  });

  it("it returns when aborted", async () => {
    const cancelOnController = new AbortController();
    const floatingDelay = delay({ ms: 100000, cancelOnController });
    cancelOnController.abort();
    await floatingDelay;
    expect(cancelOnController.signal.aborted).toBeTruthy();
  });
});
