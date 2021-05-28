import { Observable } from "../src/index"

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export function completionWithValues<T>(observable: Observable<T>) {
  const values: T[] = []

  return new Promise<T[]>((resolve, reject) => {
    const subscription = observable.subscribe({
      next(value) {
        values.push(value)
      },
      error(error) {
        subscription.unsubscribe()
        reject(error)
      },
      complete() {
        subscription.unsubscribe()
        resolve(values)
      }
    })
  })
}
