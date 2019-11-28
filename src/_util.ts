/// <reference lib="es2018" />

type UnsubscribeFn = () => void

export function isAsyncIterator(thing: any): thing is AsyncIterableIterator<any> {
  return thing && Symbol.asyncIterator && thing[Symbol.asyncIterator]
}

export function isIterator(thing: any): thing is Iterator<any> {
  return thing && thing[Symbol.iterator]
}

/**
 * Unsubscribe from a subscription returned by something that looks like an observable,
 * but is not necessarily our observable implementation.
 */
export function unsubscribe(subscription: (UnsubscribeFn | { unsubscribe: UnsubscribeFn } | void)) {
  if (typeof subscription === "function") {
    subscription()
  } else if (subscription && typeof subscription.unsubscribe === "function") {
    subscription.unsubscribe()
  }
}
