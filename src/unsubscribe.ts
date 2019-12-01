type UnsubscribeFn = () => void

/**
 * Unsubscribe from a subscription returned by something that looks like an observable,
 * but is not necessarily our observable implementation.
 */
function unsubscribe(subscription: (UnsubscribeFn | { unsubscribe: UnsubscribeFn } | void)) {
  if (typeof subscription === "function") {
    subscription()
  } else if (subscription && typeof subscription.unsubscribe === "function") {
    subscription.unsubscribe()
  }
}

export default unsubscribe
