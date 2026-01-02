import dgram from "dgram";
import { type Result, Failure } from "fail-up";
import { delay } from "./utils/delay";

export type ListenerCleanUpFunc = () => void;

/**
 * A class that looks after connecting to a UDP server or listening as a server.
 */
export class UdpTransport {
  private remoteAddress: string;
  private remotePort: number;
  private responsePort: number;

  private client: dgram.Socket;
  private connectRan: boolean = false;
  private listenRan: boolean = false;

  cleanUpController = new AbortController();

  constructor(params: {
    /** Remote port to send messages to. */
    remotePort?: number;
    /**
     * Remote IP address to send messages to.
     * @default `"localhost"`
     */
    remoteAddress?: string;
    /**
     * The port to listen for remote messages on.
     * This is normally the port the remote OSC server to replies to.
     */
    responsePort: number;
  }) {
    // Set Local State
    this.remoteAddress = params.remoteAddress || "localhost";
    this.remotePort = params.remotePort || 1005;
    this.responsePort = params.responsePort;
    // Set Client
    const client = dgram.createSocket({
      type: "udp4",
      signal: this.cleanUpController.signal,
    });

    this.client = client;
  }

  /** Check if the transport is connected. */
  async isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">> {
    if (this.cleanUpController.signal.aborted) {
      return new Failure({
        type: "aborted",
        message: "Unable to communicate as socket was aborted.",
      });
    }

    if (this.connectRan === false) {
      return new Failure({
        type: "not-connected",
        message: "Unable to communicate as socket was never connected.",
      });
    }

    return "ok";
  }

  /** Check if the transport is listening. */
  async isListeningOk(): Promise<Result<"ok", "aborted" | "not-listening">> {
    if (this.cleanUpController.signal.aborted) {
      return new Failure({
        type: "aborted",
        message: "Unable to communicate as socket was aborted.",
      });
    }

    if (this.listenRan === false) {
      return new Failure({
        type: "not-listening",
        message: "Unable to communicate as socket was never connected.",
      });
    }

    return "ok";
  }

  /** Listen on a single port. */
  async listen(): Promise<Result<AbortController, "listen-failed">> {
    // Do not allow if already listening or connected
    if (this.connectRan === true) {
      return new Failure({
        type: "listen-failed",
        message: "already connected",
      });
    }

    if (this.listenRan === true) {
      return new Failure({
        type: "listen-failed",
        message: "already  listening",
      });
    }

    // We need an AbortController to deal with the delay below
    // as there is no other way to check a bind error.
    const listenAbort = new AbortController();
    const floatingPromise = new Promise<
      Result<AbortController, "listen-failed">
    >((resolve, rejects) => {
      this.listenRan = false;
      // Deal with error
      function onConnectError(err: Error) {
        listenAbort.abort();
        this.listenRan = false;
        console.error(err);
        console.trace(err);

        rejects(
          new Failure({
            type: "listen-failed",
            message: err.message,
          })
        );
      }
      try {
        this.client.once("error", onConnectError);
        this.client.bind(this.responsePort);
        // If we don't get an error then we are okay and can continue.
        delay({ ms: 200, cancelOnController: listenAbort }).then(() => {
          this.client.off("error", onConnectError);
          this.listenRan = true;
          resolve(this.cleanUpController);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          onConnectError(e);
        }
        onConnectError(new Error("Unknown connection error"));
      }
    });

    return floatingPromise;
  }

  /** Connect to port on address as async */
  async connect(): Promise<Result<AbortController, "connection-failed">> {
    // Do not allow if already listening or connected
    if (this.connectRan === true) {
      return new Failure({
        type: "connection-failed",
        message: "already connected",
      });
    }

    if (this.listenRan === true) {
      return new Failure({
        type: "connection-failed",
        message: "already already listening",
      });
    }

    const floatingPromise = new Promise<
      Result<AbortController, "connection-failed">
    >((resolve, rejects) => {
      this.connectRan = false;
      // Deal with error
      function onConnectError(err: Error) {
        this.connectRan = false;
        console.error(err);
        console.trace(err);

        rejects(
          new Failure({
            type: "connection-failed",
            message: err.message,
          })
        );
      }
      try {
        this.client.once("error", onConnectError);
        this.client.bind(this.responsePort);
        this.client.connect(this.remotePort, this.remoteAddress, () => {
          this.client.off("error", onConnectError);
          this.connectRan = true;
          console.log(this.client.address());
          resolve(this.cleanUpController);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          onConnectError(e);
        }
        onConnectError(new Error("Unknown connection error"));
      }
    });

    return floatingPromise;
  }

  /**
   * Respond with an encoded message.
   * Can only be called after calling `this.listen();`
   * Can't be called if `this.connect();` has been called.
   */
  async respond(params: {
    msg: string | NodeJS.ArrayBufferView;
    remotePort: number;
    remoteAddress: string;
  }): Promise<Result<"ok", "send-failure" | "aborted" | "not-listening">> {
    // Reject if we are not in a state to do so yet
    const connectedOrError = await this.isListeningOk();
    if (connectedOrError !== "ok") {
      return Promise.resolve(connectedOrError);
    }

    // Respond to a remote address & port.
    const { msg, remotePort, remoteAddress } = params;
    const floatingPromise = new Promise<Result<"ok", "send-failure">>(
      (resolve) => {
        this.client.send(
          msg,
          remotePort,
          remoteAddress,
          (err: Failure<"send-failure">) => {
            if (err !== null) {
              err.type = "send-failure";
              return resolve(err);
            }
            return resolve("ok");
          }
        );
      }
    );
    return floatingPromise;
  }

  /**
   * Send an encoded message.
   * Can only be called after calling `this.connect();`
   * Can't be called if `this.listen();` has been called.
   */
  async send(
    msg: string | NodeJS.ArrayBufferView
  ): Promise<Result<"ok", "send-failure" | "aborted" | "not-connected">> {
    const connectedOrError = await this.isConnectionOk();
    if (connectedOrError !== "ok") {
      return Promise.resolve(connectedOrError);
    }

    const floatingPromise = new Promise<Result<"ok", "send-failure">>(
      (resolve) => {
        this.client.send(msg, (err: Failure<"send-failure">) => {
          if (err !== null) {
            err.type = "send-failure";
            return resolve(err);
          }
          return resolve("ok");
        });
      }
    );
    return floatingPromise;
  }

  /** Adds a message listener & returns a function that can be used to clean up the listener. */
  onMessage(
    callBack: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
  ): ListenerCleanUpFunc {
    this.client.on("message", callBack);
    const cleanUp = () => {
      this.client.off("message", callBack);
    };
    return cleanUp;
  }

  /** Adds a once message listener & returns a function that can be used to clean up the listener. */
  onOnceMessage(
    callBack: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
  ): ListenerCleanUpFunc {
    this.client.once("message", callBack);
    const cleanUp = () => {
      this.client.off("message", callBack);
    };
    return cleanUp;
  }

  /** Adds a error listener & returns a function that can be used to clean up the error. */
  onError(callBack: (err: Failure<"on-error">) => void): ListenerCleanUpFunc {
    function errorWrapper(error: Failure<"on-error">) {
      error.type = "on-error";
      callBack(error);
    }

    this.client.on("error", errorWrapper);
    const cleanUp = () => {
      this.client.off("error", errorWrapper);
    };
    return cleanUp;
  }

  /** Adds a once error listener & returns a function that can be used to clean up the error. */
  onOnceError(
    callBack: (err: Failure<"on-error">) => void
  ): ListenerCleanUpFunc {
    function errorWrapper(error: Failure<"on-error">) {
      error.type = "on-error";
      callBack(error);
    }

    this.client.once("error", errorWrapper);
    const cleanUp = () => {
      this.client.off("error", errorWrapper);
    };
    return cleanUp;
  }
}
