import { intEncoder, stringEncoder } from "../encoders";
import { decodeAndPopTerminatedString } from "./decodeAndPopTerminatedString";

describe("decodeAndPopTerminatedString", () => {
  it("it decodes strings", () => {
    const input = Buffer.concat([
      stringEncoder.encodeTerminated("/argument"),
      stringEncoder.encodeTerminated("ii"),
      intEncoder.encode(123),
    ]);
    const res1 = decodeAndPopTerminatedString(input);
    const res2 = decodeAndPopTerminatedString(res1.unit8Array);
    // Values match
    console.log("res1.str", res1.str, res2.str);
    expect(res1.str).toBe("/argument");
    expect(res2.str).toBe("ii");
    // Buffer is empty
    expect(res2.unit8Array.length).toBe(4);
  });

  it("4 char has null at end", () => {
    const res = stringEncoder.encodeTerminated("1234");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 50, 51, 52, 0]);
  });

  it("3 char has null at end", () => {
    const res = stringEncoder.encodeTerminated("123");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 50, 51, 0]);
  });

  it("2 char has null at end", () => {
    const res = stringEncoder.encodeTerminated("12");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 50, 0]);
  });

  it("1 char has null at end", () => {
    const res = stringEncoder.encodeTerminated("1");
    expect(Buffer.from(res).toJSON().data).toEqual([49, 0]);
  });

  it("empty char has 0000 padded at end", () => {
    const res = stringEncoder.encodeTerminated("");
    expect(Buffer.from(res).toJSON().data).toEqual([0]);
  });
});
