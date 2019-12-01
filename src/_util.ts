/// <reference lib="es2018" />

import { hasSymbol } from "./_symbols"

export function isAsyncIterator(thing: any): thing is AsyncIterableIterator<any> {
  return thing && hasSymbol("asyncIterator") && thing[Symbol.asyncIterator]
}

export function isIterator(thing: any): thing is Iterator<any> {
  return thing && hasSymbol("iterator") && thing[Symbol.iterator]
}
