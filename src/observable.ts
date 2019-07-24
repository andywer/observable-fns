/**
 * Based on <https://raw.githubusercontent.com/zenparsing/zen-observable/master/src/Observable.js>
 * At commit: f63849a8c60af5d514efc8e9d6138d8273c49ad6
 */

import { getSymbol, hasSymbol, hasSymbols } from "./symbols"

export type UnsubscribeFn = () => void
export type Subscriber<T> = (observer: SubscriptionObserver<T>) => (UnsubscribeFn | Subscription<any> | void)

export interface ObservableLike<T> {
  subscribe?: Subscriber<T>;
  [Symbol.observable](): Observable<T> | ObservableLike<T>;
}

export interface Observer<T> {
  start?(subscription: Subscription<T>): any;
  next?(value: T): void;
  error?(errorValue: any): void;
  complete?(): void;
}

const SymbolIterator = getSymbol("iterator")
const SymbolObservable = getSymbol("observable")
const SymbolSpecies = getSymbol("species")

// === Abstract Operations ===

function getMethod<O extends {}>(obj: O, key: keyof O): Function | undefined {
  let value = obj[key];

  if (value == null)
    return undefined;

  if (typeof value !== 'function')
    throw new TypeError(value + ' is not a function');

  return value;
}

function getSpecies<O extends {}>(obj: O) {
  let ctor: Function | undefined = obj.constructor;
  if (ctor !== undefined) {
    ctor = (ctor as any)[SymbolSpecies];
    if (ctor === null) {
      ctor = undefined;
    }
  }
  return ctor !== undefined ? ctor : Observable;
}

function isObservable(x: any): x is Observable<any> {
  return x instanceof Observable; // SPEC: Brand check
}

function hostReportError(error: Error) {
  if ((hostReportError as any).log) {
    (hostReportError as any).log(error);
  } else {
    setTimeout(() => { throw error });
  }
}

function enqueue<Fn extends () => void>(fn: Fn) {
  Promise.resolve().then(() => {
    try { fn() }
    catch (e) { hostReportError(e) }
  });
}

function cleanupSubscription<T>(subscription: Subscription<T>) {
  const cleanup = subscription._cleanup;
  if (cleanup === undefined)
    return;

  subscription._cleanup = undefined;

  if (!cleanup) {
    return;
  }

  try {
    if (typeof cleanup === 'function') {
      cleanup();
    } else {
      const unsubscribe = getMethod(cleanup, 'unsubscribe');
      if (unsubscribe) {
        unsubscribe.call(cleanup);
      }
    }
  } catch (e) {
    hostReportError(e);
  }
}

function closeSubscription<T>(subscription: Subscription<T>) {
  subscription._observer = undefined;
  subscription._queue = undefined;
  subscription._state = 'closed';
}

function flushSubscription<T>(subscription: Subscription<T>) {
  let queue = subscription._queue;
  if (!queue) {
    return;
  }
  subscription._queue = undefined;
  subscription._state = 'ready';
  for (let i = 0; i < queue.length; ++i) {
    notifySubscription(subscription, queue[i].type, queue[i].value);
    if ((subscription._state as string) === 'closed')
      break;
  }
}

function notifySubscription<T>(subscription: Subscription<T>, type: "next" | "error" | "complete", value: T) {
  subscription._state = 'running';

  let observer = subscription._observer;

  try {
    let m = observer ? getMethod(observer, type) : undefined;
    switch (type) {
      case 'next':
        if (m) m.call(observer, value);
        break;
      case 'error':
        closeSubscription(subscription);
        if (m) m.call(observer, value);
        else throw value;
        break;
      case 'complete':
        closeSubscription(subscription);
        if (m) m.call(observer);
        break;
    }
  } catch (e) {
    hostReportError(e);
  }

  if ((subscription._state as string) === 'closed')
    cleanupSubscription(subscription);
  else if (subscription._state === 'running')
    subscription._state = 'ready';
}

function onNotify<T>(subscription: Subscription<T>, type: "next" | "error" | "complete", value?: T) {
  if (subscription._state === 'closed')
    return;

  if (subscription._state === 'buffering') {
    subscription._queue = subscription._queue || []
    subscription._queue.push({ type, value });
    return;
  }

  if (subscription._state !== 'ready') {
    subscription._state = 'buffering';
    subscription._queue = [{ type, value }];
    enqueue(() => flushSubscription(subscription));
    return;
  }

  notifySubscription(subscription, type, value);
}


class Subscription<T> {
  public _cleanup?: ReturnType<Subscriber<T>>
  public _observer?: Observer<T>
  public _queue?: Array<{ type: "next" | "error" | "complete", value: any }>
  public _state: "initializing" | "ready" | "buffering" | "running" | "closed"

  constructor(observer: Observer<T>, subscriber: Subscriber<T>) {
    // ASSERT: observer is an object
    // ASSERT: subscriber is callable

    this._cleanup = undefined;
    this._observer = observer;
    this._queue = undefined;
    this._state = 'initializing';

    let subscriptionObserver = new SubscriptionObserver(this);

    try {
      this._cleanup = subscriber.call(undefined, subscriptionObserver);
    } catch (e) {
      subscriptionObserver.error(e);
    }

    if (this._state === 'initializing')
      this._state = 'ready';
  }

  get closed() {
    return this._state === 'closed';
  }

  unsubscribe() {
    if (this._state !== 'closed') {
      closeSubscription(this);
      cleanupSubscription(this);
    }
  }
}

export class SubscriptionObserver<T> {
  public _subscription: Subscription<T>

  constructor(subscription: Subscription<T>) { this._subscription = subscription }
  get closed() { return this._subscription._state === 'closed' }
  next(value: T) { onNotify(this._subscription, 'next', value) }
  error(value: any) { onNotify(this._subscription, 'error', value) }
  complete() { onNotify(this._subscription, 'complete') }
}

export class Observable<T> {
  public [Symbol.observable]: () => this
  public _subscriber: Subscriber<T>

  constructor(subscriber: Subscriber<T>) {
    if (!(this instanceof Observable))
      throw new TypeError('Observable cannot be called as a function');

    if (typeof subscriber !== 'function')
      throw new TypeError('Observable initializer must be a function');

    this._subscriber = subscriber;
  }

  subscribe(onNext: (value: T) => void, onError?: (error: any) => void, onComplete?: () => void): Subscription<T>
  subscribe(observer: Observer<T>): Subscription<T>
  subscribe(observer: Observer<T> | ((value: T) => void), onError?: (error: any) => void, onComplete?: () => void): Subscription<T> {
    if (typeof observer !== 'object' || observer === null) {
      observer = {
        next: observer,
        error: arguments[1],
        complete: arguments[2],
      };
    }
    return new Subscription(observer, this._subscriber);
  }

  forEach(fn: (value: T, done: UnsubscribeFn) => void) {
    return new Promise((resolve, reject) => {
      if (typeof fn !== 'function') {
        reject(new TypeError(fn + ' is not a function'));
        return;
      }

      function done() {
        subscription.unsubscribe();
        resolve();
      }

      let subscription = this.subscribe({
        next(value: T) {
          try {
            fn(value, done);
          } catch (e) {
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve,
      });
    });
  }

  map<R>(fn: (value: T) => R) {
    if (typeof fn !== 'function')
      throw new TypeError(fn + ' is not a function');

    const C = getSpecies(this) as typeof Observable

    return new C<R>(observer => this.subscribe({
      next(value) {
        let propagatedValue: T | R = value
        try { propagatedValue = fn(value) }
        catch (e) { return observer.error(e) }
        observer.next(propagatedValue);
      },
      error(e) { observer.error(e) },
      complete() { observer.complete() },
    }));
  }

  filter<R extends T>(fn: (value: T) => value is R) {
    if (typeof fn !== 'function')
      throw new TypeError(fn + ' is not a function');

    const C = getSpecies(this) as typeof Observable

    return new C<R>(observer => this.subscribe({
      next(value) {
        try { if (!fn(value)) return; }
        catch (e) { return observer.error(e) }
        observer.next(value);
      },
      error(e) { observer.error(e) },
      complete() { observer.complete() },
    }));
  }

  reduce<R>(fn: (accumulated: R | T, value: T) => R): Observable<R | T>
  reduce<R>(fn: (accumulated: R, value: T) => R, seed: R): Observable<R>
  reduce<R>(fn: (accumulated: R | T, value: T) => R, seed?: R | T) {
    if (typeof fn !== 'function')
      throw new TypeError(fn + ' is not a function');

    const C = getSpecies(this) as typeof Observable
    const hasSeed = arguments.length > 1;
    let hasValue = false;
    let acc = seed;

    return new C<R>(observer => this.subscribe({
      next(value) {
        let first = !hasValue;
        hasValue = true;

        if (!first || hasSeed) {
          try { acc = fn(acc as R | T, value) }
          catch (e) { return observer.error(e) }
        } else {
          acc = value;
        }
      },

      error(e) { observer.error(e) },

      complete() {
        if (!hasValue && !hasSeed)
          return observer.error(new TypeError('Cannot reduce an empty sequence'));

        observer.next(acc as R);
        observer.complete();
      },

    }));
  }

  concat<R>(...sources: Array<Observable<R>>) {
    const C = getSpecies(this) as typeof Observable

    return new C<T | R>(observer => {
      let subscription: Subscription<T | R> | undefined;
      let index = 0;

      function startNext(next: Observable<any>) {
        subscription = next.subscribe({
          next(v) { observer.next(v) },
          error(e) { observer.error(e) },
          complete() {
            if (index === sources.length) {
              subscription = undefined;
              observer.complete();
            } else {
              startNext(C.from(sources[index++]));
            }
          },
        });
      }

      startNext(this);

      return () => {
        if (subscription) {
          subscription.unsubscribe();
          subscription = undefined;
        }
      };
    });
  }

  flatMap<R>(fn: (value: T) => ObservableLike<R>): Observable<R> {
    if (typeof fn !== 'function')
      throw new TypeError(fn + ' is not a function');

    const C = getSpecies(this) as typeof Observable

    return new C<R>(observer => {
      let subscriptions: Array<Subscription<R>> = [];

      const outer = this.subscribe({
        next(value) {
          let normalizedValue: ObservableLike<R> | T
          if (fn) {
            try { normalizedValue = fn(value) }
            catch (e) { return observer.error(e) }
          } else {
            normalizedValue = value
          }

          let inner = C.from<R>(normalizedValue as any).subscribe({
            next(value) { observer.next(value) },
            error(e) { observer.error(e) },
            complete() {
              let i = subscriptions.indexOf(inner);
              if (i >= 0) subscriptions.splice(i, 1);
              completeIfDone();
            },
          });

          subscriptions.push(inner);
        },
        error(e) { observer.error(e) },
        complete() { completeIfDone() },
      });

      function completeIfDone() {
        if (outer.closed && subscriptions.length === 0)
          observer.complete();
      }

      return () => {
        subscriptions.forEach(s => s.unsubscribe());
        outer.unsubscribe();
      };
    });
  }

  [SymbolObservable]() { return this }

  static from<I>(x: Observable<I> | ObservableLike<I> | ArrayLike<I>): Observable<I> {
    const C = (typeof this === 'function' ? this : Observable) as typeof Observable

    if (x == null)
      throw new TypeError(x + ' is not an object');

    const observableMethod = getMethod(x as any, SymbolObservable);
    if (observableMethod) {
      const observable = observableMethod.call(x);

      if (Object(observable) !== observable)
        throw new TypeError(observable + ' is not an object');

      if (isObservable(observable) && observable.constructor === C)
        return observable;

      return new C<I>(observer => observable.subscribe(observer));
    }

    if (hasSymbol('iterator')) {
      const iteratorMethod = getMethod(x as any, SymbolIterator);
      if (iteratorMethod) {
        return new C<I>(observer => {
          enqueue(() => {
            if (observer.closed) return;
            for (let item of iteratorMethod.call(x)) {
              observer.next(item);
              if (observer.closed) return;
            }
            observer.complete();
          });
        });
      }
    }

    if (Array.isArray(x)) {
      return new C<I>(observer => {
        enqueue(() => {
          if (observer.closed) return;
          for (let i = 0; i < x.length; ++i) {
            observer.next(x[i]);
            if (observer.closed) return;
          }
          observer.complete();
        });
      });
    }

    throw new TypeError(x + ' is not observable');
  }

  static of<I>(...items: I[]): Observable<I> {
    const C = (typeof this === 'function' ? this : Observable) as typeof Observable

    return new C<I>(observer => {
      enqueue(() => {
        if (observer.closed) return;
        for (let i = 0; i < items.length; ++i) {
          observer.next(items[i]);
          if (observer.closed) return;
        }
        observer.complete();
      });
    });
  }

  static get [SymbolSpecies]() { return this }

}

if (hasSymbols()) {
  Object.defineProperty(Observable, Symbol('extensions'), {
    value: {
      symbol: SymbolObservable,
      hostReportError,
    },
    configurable: true,
  });
}

export default Observable
