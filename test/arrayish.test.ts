import test from "ava"
import { Observable, filter, flatMap, map, scan } from "../src/index"
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

test("scan() with a seed works", async t => {
  const scanned = Observable.from(["a", "b", "c"]).pipe(
    scan(
      (array, value, index) => [...array, { index, value }],
      [] as Array<{ index: number, value: string }>
    )
  )
  t.deepEqual(await completionWithValues(scanned), [
    [{ index: 0, value: "a" }],
    [{ index: 0, value: "a" }, { index: 1, value: "b" }],
    [{ index: 0, value: "a" }, { index: 1, value: "b" }, { index: 2, value: "c" }]
  ])
})

test("scan() without a seed works", async t => {
  const maxObservable = Observable.from([2, 3, 1, 5, 4]).pipe(
    scan((max, value) => value > max ? value : max)
  )
  t.deepEqual(await completionWithValues(maxObservable), [2, 3, 3, 5, 5])
})
