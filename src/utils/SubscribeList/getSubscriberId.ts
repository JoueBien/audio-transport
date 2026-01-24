import { Subscriber, SubscriberAndExpireListner, SubscriberId } from "./types";

/** Get a look up key for an item in the SubscriberList */
export function getSubscriberId(
  params: Subscriber | SubscriberAndExpireListner,
): SubscriberId {
  const { remotePort, remoteAddress, reason } = params;
  return `${remoteAddress}:${remotePort}:${reason}`;
}
