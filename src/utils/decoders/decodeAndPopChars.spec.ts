import { intEncoder, stringEncoder } from "../encoders";
import { decodeAndPopChars } from "./decodeAndPopChars";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopInit8Bit } from "./decodeAndPopInit8Bit";

describe("decodeAndPopChars", () => {
  it("encodes and decodes", () => {
    const input = Buffer.concat([
      intEncoder.encode8Bit(255), // Padding
      intEncoder.encode8Bit(4), // Padding
      Buffer.from(stringEncoder.encodeChars("IN")), // Command
      intEncoder.encode(2).reverse(), // Protocol Version no
      intEncoder.encode(124), // Random initiator token
      intEncoder.encode(1003), // SSRC - self identifier
      Buffer.from(stringEncoder.encodeChars("ZRXX")),
    ]);

    const { number: firstInt, unit8Array: buf1 } = decodeAndPopInit8Bit(input);
    expect(firstInt).toBe(255);

    const { number: secondInit, unit8Array: buf2 } = decodeAndPopInit8Bit(buf1);
    expect(secondInit).toBe(4);

    const { str: thirdString, unit8Array: buf3 } = decodeAndPopChars(buf2, 2);
    expect(thirdString).toBe("IN");

    const { number: fourthInit } = decodeAndPopInit(buf3);
    expect(fourthInit).toBe(2);
  });
});
