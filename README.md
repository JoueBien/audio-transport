# @joue-bien/audio-transport

A typescript library for sending audio control messages over various network protocols.

The library is primarily focused on providing a base UDP transport and utilities to assist in building tools that can send and receive Open Sound Control or network Midi messages.

# Further reading

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [OSC 1.1](https://opensoundcontrol.stanford.edu/spec-1_1.html) - Open Sound Control documentation.
- [Network Midi](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_8) - Apples MIDI network driver protocol.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.

# Install

`npm install @joue-bien/audio-transport`

# Usage

## Transport as a Client

### Connecting

```typescript
import { UdpTransport } from "@joue-bien/audio-transport";

// Set up the UDP client.
const client = new UdpTransport({
  remotePort: 9000, // Remote port to send messages to.
  remoteAddress: "192.168.1.40", // Remote IP address to send messages to.
  responsePort: 1023, // Port for the remote OSC server to reply to.
});
const cleanUpController = await client.connect();
```

### Sending messages

A connected transport can send messages to a remote server.

```typescript
client.send(buffer);
```

## Transport as a Server

### Start listening

```typescript
import { UdpTransport } from "@joue-bien/audio-transport";

// Set up the UDP server to listen on a port.
const server = new UdpTransport({
  responsePort: 1023, // Port for incoming messages to talk to.
});
const cleanUpController = await server.listen();
```

### Responding to messages

When the transport is listening it can send messages back to any clients that have sent it messages.

```typescript
// Sending a message to a known client.
await server.respond({
  msg: buffer,
  remoteAddress: "localhost",
  remotePort: 9000,
});

// Sending a message to a client that sent the server a message.
const cleanUp = transport.onMessage((msg, rinfo) => {
  console.log(msg, rinfo);
  const { address, port } = rinfo;

  server.respond({
    msg: buffer,
    remoteAddress: address,
    remotePort: port,
  });
});
```

## Listening for messages

Both the server and client can listen for messages.

### On message

`onMessage` is used to add function that is called when any message is received.

```typescript
const cleanUp = transport.onMessage((msg, rinfo) => {
  console.log(msg, rinfo);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On a single message

`onOnceMessage` is used to add function that is called when the next message is received.

```typescript
const cleanUp = transport.onOnceMessage((msg, rinfo) => {
  console.log(msg, rinfo);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

## Handling errors

### On any error

Register a function to run when any error is received.

```typescript
const cleanUp = transport.onError((error) => {
  console.log(error);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On single error

Register a function to run when the next error is received.

```typescript
const cleanUp = transport.onOnceError((error) => {
  console.log(error);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

## Disconnecting

To stop listeners and to release the response/remote ports you need to call abort on the transports abort controller.

```typescript
transport.cleanUpController.abort();
```

Once the UDP transport has been aborted the transport is done and ready to be trash collected. If you want to re-establish a connection or change/update a connection you must create a new instance.

If you try to add a new message listener or send a message with an aborted transport an error will be returned instead.

# Utilities

## Encoders

This library includes several utilities to encode values into a buffer that can be sent in messages.

### Encoding integers

```typescript
import { intEncoder } from "@joue-bien/audio-transport";

// Encoded to 4 bytes.
const buffer = intEncoder.encode(123);

// Encoded to 1 byte.
const buffer = intEncoder.encode8Bit(123);

// Encoded a number/bigInt into 8 bytes.
const buffer = intEncoder.encode8Bit(BigInt(123));
```

### Encoding floats

```typescript
import { floatEncoder } from "@joue-bien/audio-transport";

// Encoded to 4 bytes.
const buffer = floatEncoder.encode(123.1);
```

### Encoding strings

```typescript
import { stringEncoder } from "@joue-bien/audio-transport";

// Encoded to 4 byte aligned. Padding is added to the end of strings to align the string to 4 byte blocks.
// Encoded to 16 bytes.
const buffer = stringEncoder.encodePadded("this is string");

// Encoded to 14 bytes.
const buffer = stringEncoder.encodePadded("this is string");

// Encoded characters into a buffer.
// Encoded to 2 bytes.
const buffer = stringEncoder.encodePadded("th");

// Take a regular string and add a null terminator, before encoding it into a buffer.
// Encoded to 15 bytes - the last byte is null (0).
const buffer = stringEncoder.encodeTerminated("this is string");
```

### Encoding buffers

```typescript
import { bufferEncoder } from "@joue-bien/audio-transport";
// Encode buffer into single value. The buffers size is prefixed as a 4 byte int. Padding is added to the end of buffer to align it to 4 byte blocks.
bufferEncoder.encodePadded(
  // Any buffer data.
  Buffer.concat([
    intToBuffer(12134),
    floatToBuffer(1234.1234),
    stringToPaddedBuffer("athing"),
  ])
);
```

## Decoders

This library includes several utilities to decode values from a buffer into a value.

Each decoder will return a unit8Array that contains the value of the buffer with the value removed. This allows you to chain decoders together to get multiple values.

### Decoding integers

```typescript
import {
  decodeAndPopInit,
  decodeAndPopInit8Bit,
  decodeAndPopInt64Bit,
} from "@joue-bien/audio-transport";

// Decode an int, stored in 4 bytes.
const { number, unit8Array } = decodeAndPopInit(buffer);

// Decode an int, stored in 1 byte.
const { number, unit8Array } = decodeAndPopInit8Bit(buffer);

// Decode an bigInt, stored in 8 bytes.
const { number, unit8Array } = decodeAndPopInt64Bit(buffer);
```

### Decoding floats

```typescript
import { decodeAndPopFloat } from "@joue-bien/audio-transport";
// Decode a float stored, in 4 bytes.
const { number, unit8Array } = decodeAndPopFloat(buffer);
```

### Decoding strings

```typescript
import {
  decodeAndPopPaddedString,
  decodeAndPopChars,
  decodeAndPopTerminatedString,
} from "@joue-bien/audio-transport";

// Decode a string, string aligned and padded to 4 byte blocks.
const { str, unit8Array } = decodeAndPopPaddedString(buffer);

// Decode 2 characters into a string
const { str, unit8Array } = decodeAndPopChars(buffer, 2);

// Decode a string with a null terminator at the end.
const { str, unit8Array } = decodeAndPopTerminatedString(buffer);
```

### Decoding buffers

```typescript
import { decodeAndPopPaddedBuffer } from "@joue-bien/audio-transport";
// Decode a blob into a unit 8 array. Note the size of the buffer must be a 4 byte int at the start of the input buffer.
const { blob, unit8Array } = decodeAndPopPaddedBuffer(buffer);
```

### Decoding bytes

`decodeAndPopBytes` is used to access arbitrary number of bytes at the start of a buffer.
This is particularly useful if you need to remove padding or decode bits.

```typescript
const { bytes, unit8Array } = decodeAndPopBytes(buf2, 2);
```

## Timestamps

Use `timestamp.nowRTP` to generate a timestamp suitable for use with RTP Midi.

The timestamp value is returned as a bigInt (64bit int).

```typescript
import { timestamp } from "@joue-bien/audio-transport";

const nowTime = timestamp.nowRTP();
```

## Bit Manipulation

Javascript does not have a good way to manipulate bits with in a byte without using bit wise operators. To make it easy to assign bits within bytes and words this library supports representing a series of bits in a `SBitsArray`.

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";

const bits: SBitsArray = new SBitsArray();
bits[0] = "1";
bits[0] = "0";
// Results an array like object ["1", "0"].
```

### Generating SBitsArray from other types

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";
// From a string representing a byte.
const bits = SBitsArray.from("11111111");

// From an array of string bytes.
const bits = SBitsArray.from(["11111111", "11111111"]);

// From a Unit8Array.
const bits = SBitsArray.from(Uint8Array.from([255, 255]));

// From a ArrayBuffer.
const bits = SBitsArray.fromArrayBuffer(Uint8Array.from([255, 255]).buffer);

// From an array of strings.
const bits = SBitsArray.from(["1", "0", "1"]);

// From an existing SBitsArray.
const bits = SBitsArray.from(new SBitsArray());
```

### Joining multiple SBitsArray into a single SBitsArray

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";
const bits = SBitsArray.concat([
  SBitsArray.from("11111111"),
  SBitsArray.from("00000000"),
  SBitsArray.from("11111111").toSBits(),
  SBitsArray.from("00000000").toSBits(),
]);
```

### Getting the number of bits stored

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";
const bits = SBitsArray.concat([
  SBitsArray.from("11111111"),
  SBitsArray.from("00000000"),
]);
const noOfBitsInt = bits.length;
// outputs 16.
```

### Getting the number of bytes that can be filled

Note if the length of bits is not divisible by 8, the remainder bits will be left out from this calculation.

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";
const bits = SBitsArray.concat([
  SBitsArray.from("11111111"),
  SBitsArray.from("00000000"),
]);
const noOfBitsInt = bits.byteLength;
// outputs 2.
```

### Converting back to bytes

```typescript
import { SBitsArray } from "@joue-bien/audio-transport";
const bits = SBitsArray.concat([
  SBitsArray.from("11111111"),
  SBitsArray.from("00000000"),
]);

const buffer = bits.buffer; // Outputs ArrayBuffer.
const buffer = bits.unit8Array; // Outputs Unit8Array.
```

### Endianness

An `SBitsArray` that represents floats or integers will need to have there buffer or Unit8Array reversed to get the bits in the correct order.

## Mocked transport

A mock is included to help with the writing of tests.
A good example can be found in this packages `src/UdpTransport.spec.ts` file.

```typescript
import { mockUdpServer, type MockUdpServer } from "@joue-bien/audio-transport";

let serverPtr: MockUdpServer;

describe("UdpTransport", () => {
  beforeAll(async () => {
    serverPtr = await mockUdpServer();
  });

  afterAll(() => {
    // Make sure to clean up, otherwise your test will leak & leave sockets open.
    serverPtr.controller.abort();
  });
});
```

# Error handling

Errors are always returned or provided as a value rather than throwing. This forces you into handling all error paths rather than ignoring errors or missing them. The error type is accessible from the type member.

```typescript
const error = new Failure({
  message: "error message",
  type: "send-failure",
});

if (error.type === "send-failure") {
  // handle error.
  return;
}
```
