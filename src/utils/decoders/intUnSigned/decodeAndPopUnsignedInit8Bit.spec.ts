import { intEncoder, unsignedIntEncoder, stringEncoder } from "../../encoders";
import { decodeAndPopChars } from "./../decodeAndPopChars";
import { decodeAndPopUnsignedInit } from "./decodeAndPopUnsignedInit";
import { decodeAndPopUnsignedInit8Bit } from "./decodeAndPopUnsignedInit8Bit";

describe("decodeAndPopInit8Bit", () => {
  it("encodes and decodes", () => {
    const input = Buffer.concat([
      unsignedIntEncoder.encode8Bit(255), // Padding
      unsignedIntEncoder.encode8Bit(4), // Padding
      Buffer.from(stringEncoder.encodeChars("IN")), // Command
      intEncoder.encode(2), // Protocol Version no
      intEncoder.encode(124), // Random initiator token
      intEncoder.encode(1003), // SSRC - self identifier
      Buffer.from(stringEncoder.encodeChars("ZRXX")),
    ]);

    const { number: firstInt, unit8Array: buf1 } =
      decodeAndPopUnsignedInit8Bit(input);
    expect(firstInt).toBe(255);

    const { number: secondInit, unit8Array: buf2 } =
      decodeAndPopUnsignedInit8Bit(buf1);
    expect(secondInit).toBe(4);

    const { str: thirdString, unit8Array: buf3 } = decodeAndPopChars(buf2, 2);
    expect(thirdString).toBe("IN");

    const { number: fourthInit } = decodeAndPopUnsignedInit(buf3);
    expect(fourthInit).toBe(2);
  });
});
