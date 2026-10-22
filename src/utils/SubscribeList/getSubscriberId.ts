import {
  type Subscriber,
  type SubscriberAndExpireListner,
  type SubscriberId,
} from "./types.ts";

/** Get a look up key for an item in the SubscriberList */
export function getSubscriberId(
  params: Subscriber | SubscriberAndExpireListner,
): SubscriberId {
  const { remotePort, remoteAddress, reason } = params;
  return `${remoteAddress}:${remotePort}:${reason}`;
}
