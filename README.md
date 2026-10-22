# @joue-bien/audio-transport

A typescript library for sending audio control messages over various network protocols.

The library is primarily focused on providing a base UDP transport and utilities to assist in building tools that can send and receive Open Sound Control or network Midi messages.

# Install

`npm install @joue-bien/audio-transport`

# Documintation

Documintation can be found on the projects [GitHub Wiki](https://github.com/JoueBien/audio-transport/wiki).

# Further reading

## Packages that use audio transport

- [@joue-bien/osc-ts](https://github.com/JoueBien/osc-toy) - A typescript library for sending OSC messages over UDP.
- [@joue-bien/rtp-midi-transport](https://github.com/JoueBien/rtp-midi-transport) - A TypeScript library for sending controller MIDI messages over UDP without a driver, in compliance with Apple's RTP implementation.

## Protocol documentation

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [OSC 1.1](https://opensoundcontrol.stanford.edu/spec-1_1.html) - Open Sound Control documentation.
- [Network Midi](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_8) - Apples MIDI network driver protocol.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.
