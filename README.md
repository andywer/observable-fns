<h1 align="center">
  🕵️‍♀️ @andywer/observable-fns
</h1>

<p align="center">
  <a href="https://travis-ci.org/andywer/observable-fns" target="_blank"><img alt="Build status" src="https://img.shields.io/travis/andywer/observable-fns/master.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@andywer/observable-fns" target="_blank"><img alt="npm (tag)" src="https://img.shields.io/npm/v/@andywer/observable-fns.svg?style=flat-square"></a>
</p>

Light-weight observable implementation (< 7kB minified) and utils. Based on [`zen-observable`](https://github.com/zenparsing/zen-observable), re-implemented in TypeScript. Zero dependencies.

For a quick introduction on how to use observables, check out the [zen-observable readme](https://github.com/zenparsing/zen-observable).

```js
import { Observable, multicast } from "@andywer/observable-fns"

function subscribeToServerSentEvents(url) {
  // multicast() will make the observable "hot", so multiple
  // subscribers will share the same event source
  return multicast(new Observable(observer => {
    const eventStream = new EventSource(url)
    const handleError = observer.error.bind(observer)
    const handleMessage = observer.next.bind(observer)

    eventStream.addEventListener("message", handleMessage)
    eventStream.addEventListener("error", handleError)

    return () => {
      eventStream.removeEventListener("message", handleMessage)
      eventStream.removeEventListener("error", handleError)
      eventStream.close()
    }
  }))
}

subscribeToServerSentEvents("http://localhost:3000/events")
  .subscribe(event => console.log("Server sent event:", event))
```

### Philosophy

Keep the observable implementation itself minimal, ship the utility functions loosely coupled, so they can be imported as needed.

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

## API

See [docs/API.md](./docs/API.md) for an overview of the full API.

## License

MIT
