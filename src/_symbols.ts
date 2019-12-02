export const hasSymbols = (): boolean => typeof Symbol === "function"
export const hasSymbol = (name: string): boolean => hasSymbols() && Boolean((Symbol as any)[name])
export const getSymbol = (name: string): symbol | string => hasSymbol(name) ? (Symbol as any)[name] : "@@" + name

export function registerObservableSymbol() {
  if (hasSymbols() && !hasSymbol("observable")) {
    (Symbol as any).observable = Symbol("observable")
  }
}

if (!hasSymbol("asyncIterator")) {
  (Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator")
}
