import { intEncoder, stringEncoder } from "../../encoders";
import { decodeAndPopChars } from "./../decodeAndPopChars";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopInit16Bit } from "./decodeAndPopInit16Bit";

describe("decodeAndPopInit8Bit", () => {
  it("encodes and decodes", () => {
    const input = Uint8Array.from([
      ...intEncoder.encode16Bit(-32768), // Padding
      ...intEncoder.encode16Bit(4), // Padding
      ...stringEncoder.encodeChars("IN"), // Command
      ...intEncoder.encode(2), // Protocol Version no
      ...intEncoder.encode(124), // Random initiator token
      ...intEncoder.encode(1003), // SSRC - self identifier
      ...stringEncoder.encodeChars("ZRXX"),
    ]);
    // console.log("@@@input", input);

    const { number: firstInt, unit8Array: buf1 } = decodeAndPopInit16Bit(input);
    expect(firstInt).toBe(-32768);
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
