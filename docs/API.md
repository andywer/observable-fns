# observable-fns – API

## filter(test): Pipeable

```ts
function filter(
  test: (input: In) => Promise<boolean> | boolean
): (input: ObservableLike<In>) => Observable<Out>
```

Filters the values emitted by another observable.
To be applied to an input observable using `pipe()`.

## flatMap(mapper): Pipeable

```ts
function flatMap(
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
): (input: ObservableLike<In>) => Observable<Out>
```

Maps the values emitted by another observable. In contrast to `map()`
the `mapper` function returns an array of values that will be emitted
separately.
Use `flatMap()` to map input values to zero, one or multiple output
values. To be applied to an input observable using `pipe()`.

## interval(period): Observable

```ts
function interval(period: number): Observable<number>
```

Creates an observable that yields a new value every `period` milliseconds.
The first value emitted is 0, then 1, 2, etc. The first value is not emitted
 * immediately, but after the first interval.

## map(mapper): Pipeable

```ts
function map(
  mapper: (input: In) => Promise<Out>| Out
): (input: ObservableLike<In>) => Observable<Out>
```

Maps the values emitted by another observable to different values.
To be applied to an input observable using `pipe()`.

## merge(...observables): Observable

```ts
function merge<T>(
  ...observables: ObservableLike<T>[]
): Observable<T>
```

Creates an observable that emits the values emitted by any of its input
observables. It completes once all input observables completed.

## multicast(observable): Observable

```ts
function multicast(observable: ObservableLike<T>): Observable<T>
```

Takes a "cold" observable and returns a wrapping "hot" observable that proxies the input observable's values and errors.

An observable is called "cold" when its initialization function is run for each new subscriber. This is how observable-fns's `Observable` implementation works.
A hot observable is an observable where new subscribers subscribe to the upcoming values of an already-initialiazed observable.

## new Observable(init)

```ts
class Observable<T> {
    private _subscriber
    constructor(subscriber: Subscriber<T>)
    subscribe(
      onNext: (value: T) => void,
      onError?: (error: any) => void,
      onComplete?: () => void
    ): Subscription<T>
    subscribe(observer: Observer<T>): Subscription<T>
    tap(
      onNext: (value: T) => void,
      onError?: (error: any) => void,
      onComplete?: () => void
    ): Observable<T>
    tap(observer: Observer<T>): Observable<T>
    forEach(fn: (value: T, done: UnsubscribeFn) => void): Promise<unknown>
    pipe<O>(...fns: Array<(input: ObservableLike<any>) => ObservableLike<O>>): ObservableLike<O>
    map<R>(fn: (value: T) => R): Observable<R>
    filter<R extends T>(fn: (value: T) => boolean): Observable<R>
    reduce<R>(fn: (accumulated: R | T, value: T) => R): Observable<R | T>
    reduce<R>(fn: (accumulated: R, value: T) => R, seed: R): Observable<R>
    concat<R>(...sources: Array<Observable<R>>): Observable<T | R>
    flatMap<R>(fn: (value: T) => ObservableLike<R>): Observable<R>
    static from<I>(x: Observable<I> | ObservableLike<I> | ArrayLike<I>): Observable<I>
    static of<I>(...items: I[]): Observable<I>
}
```

The basic Observable class. This primitive is used to wrap asynchronous
data streams in a common standardized data type that is interoperable
between libraries and can be composed to represent more complex processes.

## new Subject()

```ts
class Subject<T> extends Observable<T> {
    constructor()
    next(value: T): void
    error(error: any): void
    complete(): void
}
```

A subject is a "hot" observable (see `multicast`) that has its observer methods (`.next(value)`, `.error(error)`, `.complete()`) exposed.

Be careful, though! With great power comes great responsibility. Only use the `Subject` when you really need to trigger updates "from the outside" and try to keep the code that can access it to a minimum. Return `Observable.from(mySubject)` to return an observable that cannot easily be mutated.

## scan(accumulator, seed?): Pipeable

```ts
function scan<In, Out>(
  accumulator: (accumulated: Out, value: In, index: number) => Out,
  seed?: Out
): (input: ObservableLike<In>) => Observable<Out>
```

Applies an accumulator function over the source Observable, and returns
each intermediate result. It is basically the same as `.reduce()`, but
it continuously yields accumulated values, not just after the input
completed.

If no accumulator seed is supplied then the first input value will be used
as a seed. To be applied to an input observable using `pipe()`.

## unsubscribe(observableLike): void

```ts
function unsubscribe(
  subscription: (UnsubscribeFn | { unsubscribe: UnsubscribeFn } | void)
): void

type UnsubscribeFn = () => void
```

Unsubscribe from a subscription returned by something that looks like an observable, but is not necessarily our observable implementation.
