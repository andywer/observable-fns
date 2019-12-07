import { Observable, ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

/**
 * Creates an observable that emits the values emitted by any of its input
 * observables. It completes once all input observables completed.
 */
function merge<A>(
  first: ObservableLike<A>
): Observable<A>
function merge<A, B>(
  first: ObservableLike<A>,
  second: ObservableLike<B>
): Observable<A | B>
function merge<A, B, C>(
  first: ObservableLike<A>,
  second: ObservableLike<B>,
  third: ObservableLike<C>
): Observable<A | B | C>
function merge<A, B, C, D>(
  first: ObservableLike<A>,
  second: ObservableLike<B>,
  third: ObservableLike<C>,
  fourth: ObservableLike<D>
): Observable<A | B | C | D>
function merge<A, B, C, D, E>(
  first: ObservableLike<A>,
  second: ObservableLike<B>,
  third: ObservableLike<C>,
  fourth: ObservableLike<D>,
  fifth: ObservableLike<E>
): Observable<A | B | C | D | E>
function merge<T>(...observables: Array<ObservableLike<T>>) {
  if (observables.length === 0) {
    return Observable.from<T>([])
  }

  return new Observable<T>(observer => {
    let completed = 0

    const subscriptions = observables.map(input => {
      return input.subscribe({
        error(error) {
          observer.error(error)
          unsubscribeAll()
        },
        next(value) {
          observer.next(value)
        },
        complete() {
          if (++completed === observables.length) {
            observer.complete()
            unsubscribeAll()
          }
        }
      })
    })

    const unsubscribeAll = () => {
      subscriptions.forEach(subscription => unsubscribe(subscription))
    }
    return unsubscribeAll
  })
}

export default merge
