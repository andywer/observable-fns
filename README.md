<h1 align="center">
  🕵️‍♀️ @andywer/observable-fns
</h1>

<p align="center">
  <a href="https://travis-ci.org/andywer/observable-fns" target="_blank"><img alt="Build status" src="https://img.shields.io/travis/andywer/observable-fns/master.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@andywer/observable-fns" target="_blank"><img alt="npm version" src="https://img.shields.io/npm/v/@andywer/observable-fns.svg?style=flat-square"></a>
  <a href="https://bundlephobia.com/result?p=@andywer/observable-fns" target="_blank"><img alt="Complete bundle size" src="https://badgen.net/bundlephobia/min/@andywer/observable-fns"></a>
</p>

Light-weight observable implementation (< 7kB minified) and utils. Based on [`zen-observable`](https://github.com/zenparsing/zen-observable), re-implemented in TypeScript including `.pipe()` and `.tap()`. Zero dependencies, [tree-shakeable](https://bitsofco.de/what-is-tree-shaking/).

An observable is basically a stream of asynchronously emitted values that you can subscribe to. In a sense it is to the event emitter what the promise is to the callback.

The main difference to a promise is that a promise only resolves once, whereas observables can yield different values repeatedly. They can also fail and yield an error, like a promise, and they come with a completion event to indicate that the last value has been sent.

For a quick introduction on how to use observables, check out the [zen-observable readme](https://github.com/zenparsing/zen-observable).

```js
import { Observable, multicast } from "@andywer/observable-fns"

function subscribeToServerSentEvents(url) {
  // multicast() will make the observable "hot", so multiple
  // subscribers will share the same event source
  return multicast(new Observable(observer => {
    const eventStream = new EventSource(url)

    eventStream.addEventListener("message", message => observer.next(message))
    eventStream.addEventListener("error", error => observer.error(error))

    return () => eventStream.close()
  }))
}

subscribeToServerSentEvents("http://localhost:3000/events")
  .subscribe(event => console.log("Server sent event:", event))
```

### Philosophy

Keep the observable implementation itself lean, ship the utility functions loosely coupled, so they can be imported as needed.

The aim is to provide a lean, friendly observable implementation with a small footprint that's fit to be used in libraries.

## Installation

```
npm install @andywer/observable-fns
```

## Usage

You can import whatever you need directly from the package:

```js
import { Observable, flatMap } from "@andywer/observable-fns"
```

If you write front-end code and care about bundle size, you can either depend on tree-shaking or explicitly import just the parts that you need:

```js
import Observable from "@andywer/observable-fns/observable"
import flatMap from "@andywer/observable-fns/flatMap"
```

Functions like `filter()`, `flatMap()`, `map()` accept asynchronous handlers – this can be a big win compared to the usual methods on `Observable.prototype` that only work with synchronous handlers.

Those functions will also make sure that the values are consistently emitted in the same order as the input observable emitted them.

```js
import { Observable, filter } from "@andywer/observable-fns"

const existingGitHubUsersObservable = Observable.from(["andywer", "bcdef", "charlie"])
  .pipe(
    filter(async name => {
      const response = await fetch(`https://github.com/${name}`)
      return response.status === 200
    })
  )
```

## API

See [docs/API.md](./docs/API.md) for an overview of the full API.

## License

MIT
