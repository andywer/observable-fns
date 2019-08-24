/// <reference lib="es2018" />
import Observable from "./observable"

function isAsyncIterator(thing: any): thing is AsyncIterableIterator<any> {
  return thing && Symbol.asyncIterator && thing[Symbol.asyncIterator]
}
function isIterator(thing: any): thing is Iterator<any> {
  return thing && thing[Symbol.iterator]
}

function flatmap<In, Out>(
  observable: Observable<In>,
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
): Observable<Out> {
  return new Observable<Out>(observer => {
    const subscription = observable.subscribe({
      complete() {
        observer.complete()
      },
      error(error) {
        observer.error(error)
      },
      next(input) {
        (async () => {
          let mapped = await mapper(input)
          if (isIterator(mapped) || isAsyncIterator(mapped)) {
            for await (const element of mapped) {
              observer.next(element)
            }
          } else {
            mapped.map(output => observer.next(output))
          }
        })().catch(observer.error.bind(observer))
      }
    })
    return () => subscription.unsubscribe()
  })
}

export default flatmap
