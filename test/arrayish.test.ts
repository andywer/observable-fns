import test from "ava"
import { Observable, filter, flatMap, map } from "../src/index"
import { completionWithValues, delay } from "./_helpers"

test("filter() works", async t => {
  const odd = Observable.from([1, 2, 3, 4, 5]).pipe(filter(async value => {
    await delay (Math.round(Math.random() * 20))
    return value % 2 === 1
  }))
  t.deepEqual(await completionWithValues(odd), [1, 3, 5])
})

test("map() works", async t => {
  const doubled = Observable.from([1, 2, 3, 4, 5]).pipe(map(async value => {
    await delay(Math.round(Math.random() * 20))
    return value * 2
  }))
  t.deepEqual(await completionWithValues(doubled), [2, 4, 6, 8, 10])
})

test("flatMap() works", async t => {
  const twiceTheSize = Observable.from([1, 2, 3, 4, 5]).pipe(flatMap(async value => {
    await delay(Math.round(Math.random() * 20))
    return [value * 2 - 1, value * 2]
  }))
  t.deepEqual(await completionWithValues(twiceTheSize), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})
