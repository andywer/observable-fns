import test from "ava"
import { interval } from "../src/index"
import { delay } from "./_helpers"

test("interval() works", async t => {
  const observable = interval(20)

  const values: number[] = []
  const subscription = observable.subscribe(value => values.push(value))

  await delay(139)

  subscription.unsubscribe()
  t.deepEqual(values, [0, 1, 2, 3, 4, 5])
})
