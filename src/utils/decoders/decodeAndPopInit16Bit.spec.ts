import { intEncoder, stringEncoder } from "../encoders";
import { decodeAndPopChars } from "./decodeAndPopChars";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopInit16Bit } from "./decodeAndPopInit16Bit";

describe("decodeAndPopInit8Bit", () => {
  it("encodes and decodes", () => {
    const input = Uint8Array.from(
      Buffer.concat([
        intEncoder.encode16Bit(4000), // Padding
        intEncoder.encode16Bit(4), // Padding
        Buffer.from(stringEncoder.encodeChars("IN")), // Command
        intEncoder.encode(2), // Protocol Version no
        intEncoder.encode(124), // Random initiator token
        intEncoder.encode(1003), // SSRC - self identifier
        Buffer.from(stringEncoder.encodeChars("ZRXX")),
      ]),
    );
    // console.log("@@@input", input);

    const { number: firstInt, unit8Array: buf1 } = decodeAndPopInit16Bit(input);
    expect(firstInt).toBe(4000);
    // console.log("@@@buf1", buf1);

    const { number: secondInit, unit8Array: buf2 } =
      decodeAndPopInit16Bit(buf1);
    expect(secondInit).toBe(4);

    const { str: thirdString, unit8Array: buf3 } = decodeAndPopChars(buf2, 2);
    expect(thirdString).toBe("IN");
    // console.log("@@@buf2", buf2);

    const { number: fourthInit } = decodeAndPopInit(buf3);

    expect(fourthInit).toBe(2);
  });
});
