export const intEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Int32Array.of(number).buffer).reverse();
  },
  encode8Bit: function encode8Bit(number: number) {
    return new Uint8Array(Int8Array.of(number).buffer).reverse();
  },
  encode16Bit: function encode16Bit(number: number) {
    return new Uint8Array(Int16Array.of(number).buffer).reverse();
  },
  encode64Bit: function encode64Bit(number: bigint | number) {
    return new Uint8Array(
      BigInt64Array.of(typeof number === "bigint" ? number : BigInt(number))
        .buffer,
    ).reverse();
  },
};
