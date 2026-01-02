import { bufferEncoder, floatEncoder, intEncoder } from "../encoders";
import {
  stringToPaddedBuffer,
  textEncoder,
} from "../encoders/stringToPaddedBuffer";

import { decodeAndPopPaddedBuffer } from "./decodeAndPopPaddedBuffer";
import { decodeAndPopFloat } from "./decodeAndPopFloat";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopPaddedString } from "./decodeAndPopPaddedString";

describe("decodeAndPopBlob", () => {
  it("encodes and decodes", () => {
    const input = bufferEncoder.encodePadded(
      Buffer.concat([
        intEncoder.encode(12134),
        floatEncoder.encode(1234.1234),
        stringToPaddedBuffer("athing"),
      ])
    );
    const { number: res1, unit8Array: unit8Array1 } = decodeAndPopInit(
      decodeAndPopPaddedBuffer(input).blob
    );
    const { number: res2, unit8Array: unit8Array2 } =
      decodeAndPopFloat(unit8Array1);
    const { str: res3, unit8Array: unit8Array3 } =
      decodeAndPopPaddedString(unit8Array2);

    expect(res1).toBe(12134);
    expect(res2).toBe(1234.1234130859375);
    expect(res3).toBe("athing");
    expect(unit8Array3.length).toBe(0);
  });

  it("1 byte is padded with 000", () => {
    const input = bufferEncoder.encodePadded(
      Buffer.from(textEncoder.encode("1"))
    );
    const res = decodeAndPopPaddedBuffer(input);
    expect(res.blob.length).toBe(4);
  });

  it("2 byte is padded with 00s", () => {
    const input = bufferEncoder.encodePadded(
      Buffer.from(textEncoder.encode("12"))
    );
    const res = decodeAndPopPaddedBuffer(input);
    expect(res.blob.length).toBe(4);
  });

  it("3 byte is padded with 0", () => {
    const input = bufferEncoder.encodePadded(
      Buffer.from(textEncoder.encode("123"))
    );
    const res = decodeAndPopPaddedBuffer(input);
    expect(res.blob.length).toBe(4);
  });

  it("4 byte has no padding", () => {
    const input = bufferEncoder.encodePadded(
      Buffer.from(textEncoder.encode("1234"))
    );
    const res = decodeAndPopPaddedBuffer(input);
    expect(res.blob.length).toBe(4);
  });
});
