interface SubscriptionObserver<T> {
  next(value: T): void
  error(error: any): void
  complete(): void
}

export class AsyncSerialScheduler<T> {
  private _baseObserver: SubscriptionObserver<T>
  private _pendingPromises: Set<Promise<any>>

  constructor(observer: SubscriptionObserver<T>) {
    this._baseObserver = observer
    this._pendingPromises = new Set()
  }

  complete() {
    Promise.all(this._pendingPromises)
      .then(() => this._baseObserver.complete())
      .catch(error => this._baseObserver.error(error))
  }

  error(error: any) {
    this._baseObserver.error(error)
  }

  schedule(task: (next: (value: T) => void) => Promise<void>) {
    const prevPromisesCompletion = Promise.all(this._pendingPromises)
    const values: T[] = []

    const next = (value: T) => values.push(value)

    const promise = task(next)
      .then(async () => {
        await prevPromisesCompletion
        this._pendingPromises.delete(promise)

        for (const value of values) {
          this._baseObserver.next(value)
        }
      })
      .catch(error => {
        this._pendingPromises.delete(promise)
        this._baseObserver.error(error)
      })

    this._pendingPromises.add(promise)
  }
}
