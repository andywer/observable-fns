import { AsyncSerialScheduler } from "./_scheduler"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

/**
 * Applies an accumulator function over the source Observable, and returns
 * each intermediate result. It is basically the same as `.reduce()`, but
 * it continuously yields accumulated values, not just after the input
 * completed.
 * If no accumulator seed is supplied then the first input value will be used
 * as a seed. To be applied to an input observable using `pipe()`.
 */
function scan<T>(
  accumulator: (accumulated: T, value: T, index: number) => Promise<T> | T
): (observable: ObservableLike<T>) => Observable<T>
function scan<In, Out>(
  accumulator: (accumulated: Out, value: In, index: number) => Promise<Out> | Out,
  seed?: Out
): (observable: ObservableLike<In>) => Observable<Out>
function scan<In, Out>(
  accumulator: (accumulated: In | Out, value: In, index: number) => Promise<Out> | Out,
  seed?: Out
) {
  return (observable: ObservableLike<In>): Observable<Out> => {
    return new Observable<Out>(observer => {
      let accumulated: In | Out
      let index = 0
      const scheduler = new AsyncSerialScheduler(observer)

      const subscription = observable.subscribe({
        complete() {
          scheduler.complete()
        },
        error(error) {
          scheduler.error(error)
        },
        next(value) {
          scheduler.schedule(async next => {
            const prevAcc = index === 0
              ? (typeof seed === "undefined" ? value : seed)
              : accumulated as Out

            accumulated = await accumulator(prevAcc, value, index++)
            next(accumulated)
          })
        }
      })
      return () => unsubscribe(subscription)
    })
  }
}

export default scan
