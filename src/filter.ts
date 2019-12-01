import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

function filter<Out, In extends Out>(
  observable: ObservableLike<In>,
  test: (input: In) => Promise<boolean> | boolean
): Observable<Out> {
  return new Observable<Out>(observer => {
    const handleValue = async (value: In) => {
      if (await test(value)) {
        observer.next(value)
      }
    }
    const handleError = observer.error.bind(observer)
    const subscription = observable.subscribe({
      complete() {
        observer.complete()
      },
      error(error) {
        observer.error(error)
      },
      next(input) {
        handleValue(input).catch(handleError)
      }
    })
    return () => unsubscribe(subscription)
  })
}

export default filter
