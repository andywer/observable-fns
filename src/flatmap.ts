import Observable from "./observable"
import { isAsyncIterator, isIterator } from "./util"

function flatMap<In, Out>(
  observable: Observable<In>,
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
): Observable<Out> {
  return new Observable<Out>(observer => {
    const handleValue = async (input: In) => {
      let mapped = await mapper(input)
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
    return () => subscription.unsubscribe()
  })
}

export default flatMap
