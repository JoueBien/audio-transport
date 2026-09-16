import { unsignedIntEncoder, intEncoder } from "../../encoders";
import { decodeAndPopUnsignedInit } from "./decodeAndPopUnsignedInit";

describe("decodeAndPopInit", () => {
  it("handles 100", () => {
    const input = unsignedIntEncoder.encode(100);
    const res = decodeAndPopUnsignedInit(input);
    expect(res.number).toBe(100);
  });

  it("handles 1234567890", () => {
    const input = unsignedIntEncoder.encode(1234567890);
    const res = decodeAndPopUnsignedInit(input);
    expect(res.number).toBe(1234567890);
  });

  it("negitve numbers are not handeled", () => {
    const input = intEncoder.encode(-100);
    const res = decodeAndPopUnsignedInit(input);
    expect(res.number).toBe(4294967196);
  });
});
