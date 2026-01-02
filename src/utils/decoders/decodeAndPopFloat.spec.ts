import { floatEncoder } from "../encoders";
import { decodeAndPopFloat } from "./decodeAndPopFloat";

describe("decodeAndPopFloat", () => {
  it("handles 100.11", () => {
    const input = floatEncoder.encode(100.11);
    const res = decodeAndPopFloat(input);
    expect(res.number).toBe(100.11000061035156);
  });

  it("handles 1234567890.1234", () => {
    const input = floatEncoder.encode(567890.132);
    const res = decodeAndPopFloat(input);
    expect(res.number).toBe(567890.125);
  });
});
