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
};
