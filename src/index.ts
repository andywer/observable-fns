import {
  Subscription as SubscriptionClass,
  SubscriptionObserver as SubscriptionObserverClass
} from "./observable"

export { default as filter } from "./filter"
export { default as flatMap } from "./flatMap"
export { default as interval } from "./interval"
export { default as map } from "./map"
export { default as merge } from "./merge"
export { default as multicast } from "./multicast"
export { default as Observable, ObservableLike } from "./observable"
export { default as scan } from "./scan"
export { default as Subject } from "./subject"
export { default as unsubscribe } from "./unsubscribe"

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

// Export only the type, not the class itself
export type Subscription<T> = SubscriptionClass<T>
export type SubscriptionObserver<T> = Omit<SubscriptionObserverClass<T>, "_subscription">
