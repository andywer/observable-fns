import { isAsyncIterator, isIterator } from "./_util"
import Observable, { ObservableLike } from "./observable"
import unsubscribe from "./unsubscribe"

function flatMap<In, Out>(
  observable: ObservableLike<In>,
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
): Observable<Out> {
  return new Observable<Out>(observer => {
    const handleValue = async (input: In) => {
      const mapped = await mapper(input)
      if (isIterator(mapped) || isAsyncIterator(mapped)) {
        for await (const element of mapped) {
          observer.next(element)
        }
      } else {
        mapped.map(output => observer.next(output))
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

export default flatMap
