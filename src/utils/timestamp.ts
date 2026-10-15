export const timestamp = {
  /**
   * Get a 64 bit time relative to a known fixed point.
   * This timestamp is suitable for use in RTP Midi messages.
   */
  nowRTP64Bit(): bigint {
    return BigInt(
      Math.trunc((performance.timeOrigin + performance.now()) * 10),
    );
  },

  /**
   * Get a 32 bit time relative to a known fixed point.
   * This timestamp is suitable for use in RTP Midi messages..
   */
  nowRTP32Bit(): number {
    const bigNow = timestamp.nowRTP64Bit();
    return Number(BigInt.asUintN(32, bigNow));
  },
};
