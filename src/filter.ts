import Observable from "./observable"

function filter<Out, In extends Out>(
  observable: Observable<In>,
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
    return () => subscription.unsubscribe()
  })
}

export default filter
