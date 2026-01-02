import { intEncoder } from "../encoders";
import { decodeAndPopInit } from "./decodeAndPopInit";

describe("decodeAndPopInit", () => {
  it("handles 100", () => {
    const input = intEncoder.encode(100);
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(100);
  });

  it("handles 1234567890", () => {
    const input = intEncoder.encode(1234567890);
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(1234567890);
  });
});
