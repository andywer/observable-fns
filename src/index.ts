import { Subscription as SubscriptionClass } from "./observable"

export { default as filter } from "./filter"
export { default as flatMap } from "./flatMap"
export { default as interval } from "./interval"
export { default as map } from "./map"
export { default as multicast } from "./multicast"
export { default as Observable, ObservableLike } from "./observable"
export { default as Subject } from "./subject"
export { default as unsubscribe } from "./unsubscribe"

// TODO: function completion(observable: Observable<T>): Promise<void>

// Export only the type, not the class itself
export type Subscription<T> = SubscriptionClass<T>
