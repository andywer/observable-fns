import { AsyncSerialScheduler } from "./_scheduler"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

/**
 * Maps the values emitted by another observable to different values.
 * To be applied to an input observable using `pipe()`.
 */
function map<In, Out>(
  mapper: (input: In) => Promise<Out> | Out
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
            const mapped = await mapper(input)
            next(mapped)
          })
        }
      })
      return () => unsubscribe(subscription)
    })
  }
}

export default map
