import Observable, { ObservableLike } from "./observable"
import Subject from "./subject"

// TODO: Subject already creates additional observables "under the hood",
//       now we introduce even more. A true native MulticastObservable
//       would be preferable.

/**
 * Takes a "cold" observable and returns a wrapping "hot" observable that
 * proxies the input observable's values and errors.
 *
 * An observable is called "cold" when its initialization function is run
 * for each new subscriber. This is how observable-fns's `Observable`
 * implementation works.
 *
 * A hot observable is an observable where new subscribers subscribe to
 * the upcoming values of an already-initialiazed observable.
 */
function multicast<T>(coldObservable: ObservableLike<T>): Observable<T> {
  const proxy = new Subject<T>()
  coldObservable.subscribe(proxy)
  return Observable.from(proxy)
}

export default multicast
