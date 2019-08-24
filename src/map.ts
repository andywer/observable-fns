import Observable from "./observable"

function map<In, Out>(
  observable: Observable<In>,
  mapper: (input: In) => Promise<Out> | Out
): Observable<Out> {
  return new Observable<Out>(observer => {
    const handleValue = async (value: In) => {
      const mapped = await mapper(value)
      observer.next(mapped)
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

export default map
