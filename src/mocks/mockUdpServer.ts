import { type RemoteInfo } from "node:dgram";
import { Failure, Result } from "fail-up";
import { UdpTransport } from "./../UdpTransport";
import { delay } from "../utils/delay";

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

    udpTransport: server,

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

    /**
     * Wait for any message.
     * Will return an error if does not get a message within 500 milliseconds.
     */
    waitForMessageOnServer: async (params?: {
      /** Set a custom wait time for a message in milliseconds.
       * @default 500
       */
      ms?: number;
    }) => {
      const { ms } = params;
      const rejectController = new AbortController();
      let cleanUp = () => {};

      const floatingPromise = new Promise<
        Result<
          {
            msg: Buffer;
            rinfo: RemoteInfo;
          },
          "time-out"
        >
      >((resolve) => {
        function callback(msg, rinfo) {
          {
            // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            rejectController.abort();
            cleanUp();
            resolve({ msg, rinfo });
          }
        }

        cleanUp = server.onMessage(callback);

        // Reject if we do not get a message.
        delay({ ms: ms || 500, cancelOnController: rejectController }).then(
          () => {
            cleanUp();
            resolve(
              new Failure({
                type: "time-out",
                message: "waitForMessageOnServer did not receive a message.",
              })
            );
          }
        );
      });

      return floatingPromise;
    },

    /**
     *  Wait for a specific message on that matches a buffer.
     * Will return an error if does not get a message within 500 milliseconds.
     */
    waitForSpecificMessageOnServer: (params: {
      matches: Buffer;
      /** Set a custom wait time for a message in milliseconds.
       * @default 500
       */
      ms?: number;
    }) => {
      const { ms, matches } = params;
      const rejectController = new AbortController();
      let cleanUp = () => {};

      const floatingPromise = new Promise<
        Result<
          {
            msg: Buffer;
            rinfo: RemoteInfo;
          },
          "time-out"
        >
      >((resolve) => {
        function callback(msg, rinfo) {
          {
            if (matches.equals(msg)) {
              // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
              rejectController.abort();
              cleanUp();
              resolve({ msg, rinfo });
            }
          }
        }

        cleanUp = server.onMessage(callback);

        // Reject if we do not get a message.
        delay({ ms: ms || 500, cancelOnController: rejectController }).then(
          () => {
            cleanUp();
            resolve(
              new Failure({
                type: "time-out",
                message: "waitForMessageOnServer did not receive a message.",
              })
            );
          }
        );
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
