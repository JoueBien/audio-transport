export const unsignedIntEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Uint32Array.of(number).buffer).reverse();
  },
  encode8Bit: function encode8Bit(number: number) {
    return new Uint8Array(Uint8Array.of(number).buffer).reverse();
  },
  encode16Bit: function encode16Bit(number: number) {
    return new Uint8Array(Uint16Array.of(number).buffer).reverse();
  },
  encode64Bit: function encode64Bit(number: bigint | number) {
    const uint8Array = new Uint8Array(8);
    const input = typeof number === "bigint" ? number : BigInt(number);
    const view = new DataView(uint8Array.buffer);
    view.setBigUint64(0, input, false);
    return uint8Array;
  },
};
