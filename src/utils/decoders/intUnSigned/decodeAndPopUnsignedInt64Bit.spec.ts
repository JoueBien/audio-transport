import { unsignedIntEncoder } from "../../encoders";
import { timestamp } from "../../timestamp";
import { decodeAndPopUnsignedInt64Bit } from "./decodeAndPopUnsignedInt64Bit";

describe("decodeAndPopInit", () => {
  it("handles max and 101 in same buffer", () => {
    const input = Buffer.concat([
      unsignedIntEncoder.encode64Bit(18_446_744_073_709_551_615n),
      unsignedIntEncoder.encode64Bit(101),
    ]);
    const res = decodeAndPopUnsignedInt64Bit(input);
    const res2 = decodeAndPopUnsignedInt64Bit(res.unit8Array);
    expect(res.number).toBe(18_446_744_073_709_551_615n);
    expect(res2.number).toBe(BigInt(101));
  });

  it("handles 1234567890", () => {
    const input = unsignedIntEncoder.encode64Bit(BigInt(1234567890));
    const res = decodeAndPopUnsignedInt64Bit(input);
    expect(res.number).toBe(BigInt(1234567890));
  });

  it("handles timestamps", () => {
    const now = timestamp.nowRTP64Bit();
    const input = unsignedIntEncoder.encode64Bit(now);
    const res = decodeAndPopUnsignedInt64Bit(input);
    expect(res.number).toBe(now);
  });
});
