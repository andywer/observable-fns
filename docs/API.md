# observable-fns – API

## filter(test): Pipeable

```ts
function filter(
  test: (input: In) => Promise<boolean> | boolean
): (input: ObservableLike<In>) => Observable<Out>
```

## flatMap(mapper): Pipeable

```ts
function flatMap(
  mapper: (input: In) => Promise<Out[]> | AsyncIterableIterator<Out> | IterableIterator<Out> | Out[]
): (input: ObservableLike<In>) => Observable<Out>
```

## map(mapper): Pipeable

```ts
function map(
  mapper: (input: In) => Promise<Out>| Out
): (input: ObservableLike<In>) => Observable<Out>
```

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
