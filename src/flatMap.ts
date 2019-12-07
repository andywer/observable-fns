import { AsyncSerialScheduler } from "./_scheduler"
import { isAsyncIterator, isIterator } from "./_util"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

/**
 * Maps the values emitted by another observable. In contrast to `map()`
 * the `mapper` function returns an array of values that will be emitted
 * separately.
 * Use `flatMap()` to map input values to zero, one or multiple output
 * values. To be applied to an input observable using `pipe()`.
 */
function flatMap<In, Out>(
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
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
          scheduler.schedule(async (next) => {
            const mapped = await mapper(input)
            if (isIterator(mapped) || isAsyncIterator(mapped)) {
              for await (const element of mapped) {
                next(element)
              }
            } else {
              mapped.map(output => next(output))
            }
          })
        }
      })
      return () => unsubscribe(subscription)
    })
  }
}

export default flatMap
