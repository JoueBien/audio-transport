import {
  LOOK_UP_BYTE_TO_SBYTE,
  LOOK_UP_S_BYTE_TO_BYTE,
  SBit,
  SByte,
  SWord,
} from "./bitMaps";

/**
 * Convert a string representation of binary to a byte.
 * Returns a deep copy from look up table.
 */
export function sByteToByte(sByte: SByte): Uint8Array<ArrayBufferLike> {
  // Make sure we deep copy.
  return Uint8Array.from(
    LOOK_UP_S_BYTE_TO_BYTE[sByte] || LOOK_UP_S_BYTE_TO_BYTE[0]
  );
}

export function bitsToSByte(bits: SBitsArray | SBit[]) {
  const sByte: SByte = `${bits[0] || "0"}${bits[1] || "0"}${bits[2] || "0"}${
    bits[3] || "0"
  }${bits[4] || "0"}${bits[5] || "0"}${bits[6] || "0"}${bits[7] || "0"}`;
  return sByteToByte(sByte);
}

/**
 * Convert a byte into a string representation byte.
 * Returns a deep copy from look up table.
 */
export function byteToSByte(byte: Uint8Array<ArrayBufferLike>): SByte {
  // Make sure we deep copy.
  return `${LOOK_UP_BYTE_TO_SBYTE[byte[0]] || LOOK_UP_BYTE_TO_SBYTE[0]}`;
}

function sByteToBits(input: SByte) {
  const bits = new SBitsArray();
  bits[0] = input[0] === "1" ? "1" : "0";
  bits[1] = input[1] === "1" ? "1" : "0";
  bits[2] = input[2] === "1" ? "1" : "0";
  bits[3] = input[3] === "1" ? "1" : "0";
  bits[4] = input[4] === "1" ? "1" : "0";
  bits[5] = input[5] === "1" ? "1" : "0";
  bits[6] = input[6] === "1" ? "1" : "0";
  bits[7] = input[7] === "1" ? "1" : "0";

  return bits;
}

/** An array like class that represents a series of bits. */
export class SBitsArray extends Array<SBit> {
  length: number = 0;
  [n: number]: SBit;

  constructor(
    /** The number of bits to start the array with. */
    size?: number
  ) {
    super();
    if (size !== undefined && size > 0) {
      for (let i = 0; i < size; i++) {
        this[i] = "0";
      }
      this.length = size;
    }

    return new Proxy(this, {});
  }

  /**
   * Join multiple SBitsArrays into a ingle SBitsArray.
   * Return SBitsArray is a deep copy. This Includes a deep copy of individual bits.
   */
  public static concat(input: (SBitsArray | SBit[])[]): SBitsArray {
    return input.reduce<SBitsArray>((all, item) => {
      return this.fromSBits([...all, ...item]);
    }, new SBitsArray());
  }

  /**
   * From an array filled with bits. Return an SBitsArray.
   * Return SBitsArray is a deep copy.
   */
  public static fromSBits(input?: SBit[]) {
    const bits = new SBitsArray();
    // Fill in the array
    if (input !== undefined) {
      input.forEach((bit, index) => {
        bits[index] = bit === "1" ? "1" : "0";
      });
    }

    return bits;
  }

  /** Converts to an array of Bits.
   * Return Bits[] is a deep copy.
   */
  toSBits(): SBit[] {
    const bits: SBit[] = this.map((bit) => (bit === "1" ? "1" : "0"));
    return bits;
  }

  /** Produce a SBitsArray from ArrayBuffer. */
  public static fromArrayBuffer(input: ArrayBuffer) {
    const shallowCopy = Array.from(new Uint8Array(input)).map(
      (item) => LOOK_UP_BYTE_TO_BIT_ARRAY[item] || LOOK_UP_BYTE_TO_BIT_ARRAY[0]
    );

    // Create a deep copy.
    const deep = SBitsArray.concat(shallowCopy);
    return deep;
  }

  /** Produce a SBitsArray from other array types or an SByte string. */
  public static from(input?: SByte | SWord | Uint8Array): SBitsArray {
    if (typeof input === "string") {
      return sByteToBits(input);
    }

    if (
      typeof input === "object" &&
      input instanceof Uint8Array === false &&
      input instanceof ArrayBuffer === false &&
      input.length !== 8
    ) {
      return SBitsArray.concat(input.map((item) => sByteToBits(item)));
    }

    if (typeof input === "object" && input instanceof Uint8Array) {
      const shallowCopy = Array.from(input).map(
        (item) =>
          LOOK_UP_BYTE_TO_BIT_ARRAY[item] || LOOK_UP_BYTE_TO_BIT_ARRAY[0]
      );

      // Create a deep copy.
      const deep = SBitsArray.concat(shallowCopy);
      return deep;
    }

    return new SBitsArray();
  }

  /**
   * Get the number of bytes the bits can fully fill.
   */
  get byteLength() {
    const noOfBytes = Math.trunc(this.length / 8);
    return noOfBytes;
  }

  /**
   * Convert bits to a Unit8Array.
   * This will ignore bit at the end if they don't fit into an 8bit block.
   */
  get unit8Array() {
    const noOfBytes = Math.trunc(this.length / 8);

    const bytes = new Uint8Array(noOfBytes).map((_, index) => {
      const start = 0 + index * 8;
      const end = start + 8;
      return bitsToSByte(this.slice(start, end))[0];
    });

    return bytes;
  }

  /**
   * Convert bits to a ArrayBuffer.
   * This will ignore bit at the end if they don't fit into an 8bit block.
   */
  get buffer() {
    return this.unit8Array.buffer;
  }

  /**
   * Add padding to bits so that the bits align to bytes.
   * This function is destructive and will modify the value in the current instance. */
  alignBytes(
    /** Where to insert the padding
     * @default { leading: true }
     */
    params?:
      | {
          leading: true;
        }
      | { trailing: true }
  ): void {
    const inputs: typeof params = params || { leading: true };

    // Decide if we should insert at start or at end
    const insertAtLead = "trailing" in inputs ? false : true;

    // How many bits to insert
    // If mod returns 8 we don't need to add any.
    const sizeToNextByte = 8 - (this.length % 8);
    if (sizeToNextByte === 8) {
      return;
    }

    // Generate padding as zeros to insert
    const newParts: SBit[] = [];
    newParts.length = sizeToNextByte;
    newParts.fill("0");

    if (insertAtLead) {
      this.unshift(...newParts);
    } else {
      this.push(...newParts);
    }
  }

  /**
   * Add padding to bits so that the bits align to bytes.
   * This function creates a deep copy and is non-destructive to the original SBitsArray.  */
  alignToBytes(
    /** Where to insert the padding
     * @default { leading: true }
     */
    params?:
      | {
          leading: true;
        }
      | { trailing: true }
  ): SBitsArray {
    const inputs: typeof params = params || { leading: true };

    // Decide if we should insert at start or at end
    const insertAtLead = "trailing" in inputs ? false : true;

    // How many bits to insert
    // If mod returns 8 we don't need to add any.
    const sizeToNextByte = 8 - (this.length % 8);
    if (sizeToNextByte === 8) {
      return SBitsArray.concat([this]);
    }

    // Generate padding as zeros to insert
    const newParts: SBit[] = [];
    newParts.length = sizeToNextByte;
    newParts.fill("0");

    if (insertAtLead) {
      const ret = SBitsArray.concat([newParts, this]);
      return ret;
    } else {
      const ret = SBitsArray.concat([this, newParts]);
      return ret;
    }
  }
}

// TODO: make this a look up that is not made using a map
const LOOK_UP_BYTE_TO_BIT_ARRAY: SBitsArray[] & { length: 256 } =
  LOOK_UP_BYTE_TO_SBYTE.map((sByte) =>
    SBitsArray.from(sByte)
  ) as SBitsArray[] & {
    length: 256;
  };
