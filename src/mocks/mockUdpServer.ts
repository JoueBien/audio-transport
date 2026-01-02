import { type RemoteInfo } from "node:dgram";

import { UdpTransport } from "./../UdpTransport";

export type MockUdpServer = Awaited<ReturnType<typeof mockUdpServer>>;

/** Create a mock UDP server to make it easy to write tests. */
export async function mockUdpServer(params?: {
  /** The port to listen for messages on. */
  responsePort?: number;
}) {
  const { responsePort } = params || {};

  const server = new UdpTransport({
    responsePort: responsePort || 9000,
  });

  const controller = await server.listen();

  function abort() {
    if (controller instanceof AbortController) {
      controller.abort();
    }
  }

  return {
    /**
     * A reference to the abort controllers abort function.
     * Call controller.abort(); to stop the server and to free the sockets.
     */
    controller: {
      /**
       * A reference to the abort controllers abort function.
       * Call controller.abort(); to stop the server and to free the sockets.
       */
      abort,
    },

    /**
     * Respond with an encoded message.
     */
    respond: async function respond(params: {
      msg: string | NodeJS.ArrayBufferView;
      remotePort: number;
      remoteAddress: string;
    }) {
      return server.respond(params);
    },

    /** Wait for any message. */
    waitForMessageOnServer: () => {
      let cleanUp = () => {};

      const floatingPromise = new Promise<{
        msg: Buffer;
        rinfo: RemoteInfo;
      }>((resolve) => {
        function callback(msg, rinfo) {
          {
            // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            resolve({ msg, rinfo });
          }
        }

        cleanUp = server.onMessage(callback);
      }).then((args) => {
        // Make sure we clean up after the listener is called
        cleanUp();
        return args;
      });
      return floatingPromise;
    },

    /** Wait for a specific message on that matches a buffer. */
    waitForSpecificMessageOnServer: (matches: Buffer) => {
      let cleanUp = () => {};

      const floatingPromise = new Promise<{
        msg: Buffer;
        rinfo: RemoteInfo;
      }>((resolve) => {
        function callback(msg, rinfo) {
          {
            if (matches.equals(msg)) {
              // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
              resolve({ msg, rinfo });
            }
          }
        }

        cleanUp = server.onMessage(callback);
      }).then((args) => {
        // Make sure we clean up after the listener is called
        cleanUp();
        return args;
      });

      return floatingPromise;
    },

    /** Adds a message listener & returns a function that can be used to clean up the listener.  */
    addMessageHandlerMock: (
      action: (msg: Buffer, rinfo: RemoteInfo) => void
    ) => {
      const cleanUp = server.onMessage(action);
      return cleanUp;
    },

    /** Adds a once message listener & returns a function that can be used to clean up the listener.  */
    addMessageHandlerMockOnce: (
      action: (msg: Buffer, rinfo: RemoteInfo) => void
    ) => {
      const cleanUp = server.onOnceMessage(action);
      return cleanUp;
    },
  };
}
