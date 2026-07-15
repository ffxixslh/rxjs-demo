import { Observable, Observer } from "./observable";

export interface UnaryFunction<T, U> {
  (source: T): U
}

export type OperatorFn<T, U> = UnaryFunction<Observable<T>, Observable<U>>

export interface Operator<T> {
  call(observer?: Observer<T>, source?: Observable<T>): Observer<T>
}

export interface MapFn<T, U> {
  (item: T): U
}

export function map<T, U>(mapFn: MapFn<T, U>): OperatorFn<T, U> {
  return (observable: Observable<T>) => {
    return observable.lift(new MapOperator<T, U>(mapFn)) as unknown as Observable<U>
  }
}

export class MapOperator<T, U> implements Operator<T> {
  private mapFn: MapFn<T, U>

  constructor(mapFn: MapFn<T, U>) {
    this.mapFn = mapFn
  }

  call(observer: Observer<T>, source: Observable<T>) {
    return source.subscribe(new MapObserver(observer, this.mapFn))
  }
}

export class MapObserver<T, U> extends Observer<T> {
  private destination: Observer<T>
  private mapFn: MapFn<T, U>

  constructor(destination: Observer<T>, mapFn: MapFn<T, U>) {
    super()
    this.destination = destination
    this.mapFn = mapFn
  }

  public next(value: T) {
    const result = this.mapFn(value)
    this.destination.next(result as unknown as T)
  }

  public complete() {
    this.destination.complete()
  }
}

