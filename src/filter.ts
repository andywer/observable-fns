import { AsyncSerialScheduler } from "./_scheduler"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

function filter<Out, In extends Out>(
  observable: ObservableLike<In>,
  test: (input: In) => Promise<boolean> | boolean
): Observable<Out> {
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

export default filter
