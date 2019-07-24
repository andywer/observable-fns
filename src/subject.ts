import Observable, { SubscriptionObserver } from "./observable"

class Subject<T> extends Observable<T> {
  private observers: Set<SubscriptionObserver<T>> = new Set()

  constructor() {
    super(observer => {
      this.observers.add(observer)
      return () => this.observers.delete(observer)
    })
  }

  complete() {
    for (const observer of this.observers) {
      observer.complete()
    }
  }

  error(error: any) {
    for (const observer of this.observers) {
      observer.error(error)
    }
  }

  next(value: T) {
    for (const observer of this.observers) {
      observer.next(value)
    }
  }
}

export default Subject
