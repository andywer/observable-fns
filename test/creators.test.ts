import test from "ava"
import { interval, merge, Observable } from "../src/index"
import { completionWithValues, delay } from "./_helpers"

test("interval() works", async t => {
  const observable = interval(20)

  const values: number[] = []
  const subscription = observable.subscribe(value => values.push(value))

  await delay(139)

  subscription.unsubscribe()
  t.deepEqual(values, [0, 1, 2, 3, 4, 5])
})

test("merge() works", async t => {
  const observable1 = new Observable<number>(observer => {
    (async () => {
      for (let i = 0; i < 5; i++) {
        observer.next(i)
        await delay(40)
      }
      observer.complete()
    })().catch(error => observer.error(error))
  })
  const observable2 = new Observable<string>(observer => {
    (async () => {
      for (let i = 0; i < 3; i++) {
        await delay(70)
        observer.next(String(i))
      }
      observer.complete()
    })().catch(error => observer.error(error))
  })

  const values = await completionWithValues(merge(observable1, observable2))

  t.deepEqual(values, [0, 1, "0", 2, 3, "1", 4, "2"])
})
