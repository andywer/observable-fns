import Observable, { SubscriptionObserver } from "./observable"

// TODO: This observer iteration approach looks inelegant and expensive
// Idea: Come up with super class for Subscription that contains the
//       notify*, ... methods and use it here

/**
 * A subject is a "hot" observable (see `multicast`) that has its observer
 * methods (`.next(value)`, `.error(error)`, `.complete()`) exposed.
 *
 * Be careful, though! With great power comes great responsibility. Only use
 * the `Subject` when you really need to trigger updates "from the outside" and
 * try to keep the code that can access it to a minimum. Return
 * `Observable.from(mySubject)` to not allow other code to mutate.
 */
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
