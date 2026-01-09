import { SBitsArray } from "./SBitsArray";

describe("SBitsArray", () => {
  it("the constructor creates empty array-like", () => {
    const res = new SBitsArray();
    expect(res.length).toBe(0);
  });

  it("the constructor creates an array-like of size", () => {
    const res = new SBitsArray(10);
    expect(res.length).toBe(10);
    expect(res[0]).toBe("0");
    expect(res[9]).toBe("0");
    expect(res[10]).toBe(undefined);
  });

  it("allows for bit editing", () => {
    const res = new SBitsArray(8);
    res[0] = "1";
    res[1] = "1";
    res[2] = "1";
    res[3] = "1";
    res[4] = "1";
    res[5] = "1";
    res[6] = "1";
    res[7] = "1";
    res[8] = "1";
    expect(res.length).toBe(9);
    expect(res).toMatchObject(["1", "1", "1", "1", "1", "1", "1", "1", "1"]);
  });

  it("joins multiple using concat", () => {
    const res = SBitsArray.concat([
      SBitsArray.from("11111111"),
      SBitsArray.from("00000000"),
      SBitsArray.from("11111111").toSBits(),
      SBitsArray.from("00000000").toSBits(),
      SBitsArray.from("11111111"),
    ]);

    expect(res.unit8Array).toMatchObject({
      "0": 255,
      "1": 0,
      "2": 255,
      "3": 0,
      "4": 255,
    });

    const resEmpty = SBitsArray.concat([]);
    expect(resEmpty.length).toBe(0);
  });

  it("accepts bits using fromBits", () => {
    const res = SBitsArray.fromSBits(["1", "0"]);
    expect(res).toMatchObject(["1", "0"]);
  });

  it("can convert back to a SBits", () => {
    const res = SBitsArray.fromSBits(["1", "0"]).toSBits();
    expect(res).toMatchObject(["1", "0"]);
  });

  it("accepts values using from", () => {
    const res1 = SBitsArray.from("11111111");
    const res2 = SBitsArray.from(["11111111", "00000000", "11111111"]);
    const res3 = SBitsArray.from(Uint8Array.from([255, 0, 255]));

    expect(res1.unit8Array).toMatchObject({
      "0": 255,
    });

    expect(res2.unit8Array).toMatchObject({
      "0": 255,
      "1": 0,
      "2": 255,
    });
    expect(res3.unit8Array).toMatchObject({
      "0": 255,
      "1": 0,
      "2": 255,
    });
  });

  it("calculates byte length - must always be devisable by 8", () => {
    const res0 = new SBitsArray(0);
    const res1 = new SBitsArray(16);
    const res2 = new SBitsArray(17);

    expect(res0.byteLength).toBe(0);
    expect(res1.byteLength).toBe(2);
    expect(res2.byteLength).toBe(2);
  });

  it("converts to bytes - trunks end bits", () => {
    const res0 = new SBitsArray(0);
    const res1 = new SBitsArray(16);
    const res2 = new SBitsArray(17);

    expect(res0.unit8Array.byteLength).toBe(0);
    expect(res1.unit8Array).toMatchObject({ "0": 0, "1": 0 });
    expect(res2.unit8Array).toMatchObject({ "0": 0, "1": 0 });
  });
});
