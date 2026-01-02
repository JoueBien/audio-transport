import { stringEncoder } from "../encoders";
import { decodeAndPopPaddedString } from "./decodeAndPopPaddedString";

describe("decodeAndPopPaddedString", () => {
  it("it decodes strings", () => {
    const input = Buffer.concat([
      stringEncoder.encodePadded("/argument"),
      stringEncoder.encodePadded("ii"),
    ]);
    const res1 = decodeAndPopPaddedString(input);
    const res2 = decodeAndPopPaddedString(res1.unit8Array);
    // Values match
    expect(res1.str).toBe("/argument");
    expect(res2.str).toBe("ii");
    // Buffer is empty
    expect(res2.unit8Array.length).toBe(0);
  });

  it("4 char has 0000 padded at end", () => {
    const res = stringEncoder.encodePadded("1234");
    expect(Buffer.from(res).toJSON().data).toEqual([
      49, 50, 51, 52, 0, 0, 0, 0,
    ]);
  });

  it("3 char has 0 padded at end", () => {
    const res = stringEncoder.encodePadded("123");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 50, 51, 0]);
  });

  it("2 char has 00 padded at end", () => {
    const res = stringEncoder.encodePadded("12");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 50, 0, 0]);
  });

  it("1 char has 000 padded at end", () => {
    const res = stringEncoder.encodePadded("1");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 0, 0, 0]);
  });

  it("empty char has 0000 padded at end", () => {
    const res = stringEncoder.encodePadded("");
    expect(Buffer.from(res).toJSON().data).toEqual([0, 0, 0, 0]);
  });
});
