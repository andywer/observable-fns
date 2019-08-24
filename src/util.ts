import Observable from "./observable"
import Subject from "./subject"

// TODO: Subject already creates additional observables "under the hood",
//       now we introduce even more. A true native MulticastObservable
//       would be preferable.

export function multicast<T>(coldObservable: Observable<T>): Observable<T> {
  const proxy = new Subject<T>()
  coldObservable.subscribe(proxy)
  return Observable.from(proxy)
}

// TODO: function completion(observable: Observable<T>): Promise<void>
