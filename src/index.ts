import { unsubscribe } from "./_util"
import filter from "./filter"
import flatMap from "./flatMap"
import map from "./map"
import multicast from "./multicast"
import Observable, { ObservableLike, Subscription as SubscriptionClass } from "./observable"
import Subject from "./subject"

// TODO: function completion(observable: Observable<T>): Promise<void>

export {
  Observable,
  ObservableLike,
  Subject,
  filter,
  flatMap,
  map,
  multicast,
  unsubscribe
}

// Export only the type, not the class itself
export type Subscription<T> = SubscriptionClass<T>
