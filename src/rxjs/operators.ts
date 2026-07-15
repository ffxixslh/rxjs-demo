import { Observable, Observer } from "./observable";

export interface OperatorFn<T,> {
  (observable: Observable<T>): Observable<T>
}

export interface Operator<T> {
  call(observer?: Observer<T>, source?: Observable<T>): Observer<T>
}

export interface MapFn<T,> {
  (item: T): T
}

export function map<T,>(mapFn: MapFn<T>): OperatorFn<T> {
  return (observable: Observable<T>) => {
    return observable.lift(new MapOperator(mapFn))
  }
}

export class MapOperator<T> implements Operator<T> {
  private mapFn: MapFn<T>

  constructor(mapFn: MapFn<T>) {
    this.mapFn = mapFn
  }

  call(observer: Observer<T>, source: Observable<T>) {
    return source.subscribe(new MapObserver(observer, this.mapFn))
  }
}

export class MapObserver<T> extends Observer<T> {
  private destination: Observer<T>
  private mapFn: MapFn<T>

  constructor(destination: Observer<T>, mapFn: MapFn<T>) {
    super()
    this.destination = destination
    this.mapFn = mapFn
  }

  public next(value: T) {
    const result = this.mapFn(value)
    this.destination.next(result)
  }

  public complete() {
    this.destination.complete()
  }
}

