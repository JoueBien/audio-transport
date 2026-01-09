import { intEncoder, stringEncoder } from "../encoders";
import { byteToSByte, sByteToByte } from "../SBitsArray/SBitsArray";
import { decodeAndPopBytes } from "./decodeAndPopBytes";
import { decodeAndPopChars } from "./decodeAndPopChars";
import { decodeAndPopInit8Bit } from "./decodeAndPopInit8Bit";

describe("decodeAndPopBytes", () => {
  it("encodes and decodes", () => {
    const input = Buffer.concat([
      stringEncoder.encodeChars("1234"),
      intEncoder.encode8Bit(10),
      sByteToByte("10101111"),
    ]);

    const { bytes: bytes1, unit8Array: buf1 } = decodeAndPopBytes(input, 1);
    const { bytes: bytes2, unit8Array: buf2 } = decodeAndPopBytes(buf1, 1);
    const { bytes: bytes3, unit8Array: buf3 } = decodeAndPopBytes(buf2, 2);
    const { bytes: bytes5, unit8Array: bu4 } = decodeAndPopBytes(buf3, 1);
    const { bytes: bytes6, unit8Array: _bu5 } = decodeAndPopBytes(bu4, 1);

    const { str: str1 } = decodeAndPopChars(bytes1, 1);
    const { str: str2 } = decodeAndPopChars(bytes2, 1);
    const { str: str3 } = decodeAndPopChars(bytes3, 2);
    const { number } = decodeAndPopInit8Bit(bytes5);
    const { bytes } = decodeAndPopBytes(bytes6, 1);
    const stringBits = byteToSByte(bytes);

    expect(str1).toBe("1");
    expect(str2).toBe("2");
    expect(str3).toBe("34");
    expect(number).toBe(10);
    expect(stringBits).toBe("10101111");
  });
});
