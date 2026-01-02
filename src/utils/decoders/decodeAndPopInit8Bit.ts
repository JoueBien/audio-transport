export function decodeAndPopInit8Bit(unit8Buf: Uint8Array<ArrayBuffer>) {
  const [number] = Uint8Array.from([unit8Buf[0]]).reverse();

  const nextBuf = unit8Buf.slice(1);
  return {
    number,
    unit8Array: nextBuf,
  };
}
