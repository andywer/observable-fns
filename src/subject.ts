import Observable, { SubscriptionObserver } from "./observable"

// TODO: This observer iteration approach looks inelegant and expensive
// Idea: Come up with super class for Subscription that contains the
//       notify*, ... methods and use it here

class MulticastSubject<T> extends Observable<T> {
  private _observers: Set<SubscriptionObserver<T>> = new Set()

  constructor() {
    super(observer => {
      this._observers.add(observer)
      return () => this._observers.delete(observer)
    })
  }

  next(value: T) {
    for (const observer of this._observers) {
      observer.next(value)
    }
  }

  error(error: any) {
    for (const observer of this._observers) {
      observer.error(error)
    }
  }

  complete() {
    for (const observer of this._observers) {
      observer.complete()
    }
  }
}

export default MulticastSubject
