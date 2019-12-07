import { AsyncSerialScheduler } from "./_scheduler"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

/**
 * Filters the values emitted by another observable.
 * To be applied to an input observable using `pipe()`.
 */
function filter<Out, In extends Out>(
  test: (input: In) => Promise<boolean> | boolean
) {
  return (observable: ObservableLike<In>): Observable<Out> => {
    return new Observable<Out>(observer => {
      const scheduler = new AsyncSerialScheduler(observer)

      const subscription = observable.subscribe({
        complete() {
          scheduler.complete()
        },
        error(error) {
          scheduler.error(error)
        },
        next(input) {
          scheduler.schedule(async next => {
            if (await test(input)) {
              next(input)
            }
          })
        }
      })
      return () => unsubscribe(subscription)
    })
  }
}

export default filter
