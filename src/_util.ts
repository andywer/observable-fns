/// <reference lib="es2018" />

export function isAsyncIterator(thing: any): thing is AsyncIterableIterator<any> {
  return thing && Symbol.asyncIterator && thing[Symbol.asyncIterator]
}

export function isIterator(thing: any): thing is Iterator<any> {
  return thing && thing[Symbol.iterator]
}
