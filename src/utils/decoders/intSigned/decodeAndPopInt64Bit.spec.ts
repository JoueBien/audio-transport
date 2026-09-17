import { intEncoder } from "../../encoders";
import { timestamp } from "../../timestamp";
import { decodeAndPopInt64Bit } from "./decodeAndPopInt64Bit";

describe("decodeAndPopInit", () => {
  it("handles 100 and 101 in same buffer", () => {
    const input = Buffer.concat([
      intEncoder.encode64Bit(BigInt(-9_223_372_036_854_775_808)),
      intEncoder.encode64Bit(101),
    ]);
    const res = decodeAndPopInt64Bit(input);
    const res2 = decodeAndPopInt64Bit(res.unit8Array);
    expect(res.number).toBe(BigInt(-9_223_372_036_854_775_808));
    expect(res2.number).toBe(BigInt(101));
  });

  it("handles 1234567890", () => {
    const input = intEncoder.encode64Bit(BigInt(1234567890));
    const res = decodeAndPopInt64Bit(input);
    expect(res.number).toBe(BigInt(1234567890));
  });

  it("handles timestamps", () => {
    const now = timestamp.nowRTP64Bit();
    const input = intEncoder.encode64Bit(now);
    const res = decodeAndPopInt64Bit(input);
    expect(res.number).toBe(now);
  });
});
