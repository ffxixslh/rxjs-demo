import type { Operator, OperatorFn } from "./operators"

interface NextFn<T> {
  (value: T): void
}
type NextObject<T> = {
  next?: NextFn<T>
  error?: ErrorFn
  complete?: CompleteFn
}
type NextObjectOrFn<T> = NextObject<T> | NextFn<T>
interface ErrorFn {
  (error: Error): void
}
interface CompleteFn {
  (): void
}
interface NoopFn {
  (): void
}
function noop() { }

interface ObserverObject<T> {
  next?: NextFn<T>
  error?: ErrorFn
  complete?: CompleteFn
}

type ObserverLike<T> = Observer<T> | ObserverObject<T>

export class Observer<T> {
  private _next?: NextFn<T>
  private _error?: ErrorFn
  private _complete?: CompleteFn
  private isStop: boolean = false
  private unsubscribeCB?: NoopFn

  constructor(
    nextObjectOfFn?: NextObjectOrFn<T>,
    error?: ErrorFn,
    complete?: CompleteFn
  ) {
    // is object
    if (nextObjectOfFn && 'next' in nextObjectOfFn) {
      this._next = nextObjectOfFn.next || noop
      this._error = nextObjectOfFn.error || noop
      this._complete = nextObjectOfFn.complete || noop
      return
    }
    // is function
    if (typeof nextObjectOfFn === 'function') {
      this._next = nextObjectOfFn || noop
      this._error = error || noop
      this._complete = complete || noop
      return
    }
  }

  public next(value: T) {
    if (this.isStop) {
      return
    }
    this._next?.(value)
  }

  public error(err: Error) {
    if (this.isStop) {
      return
    }
    this._error?.(err)
    this.unsubscribe()
  }

  public complete() {
    if (this.isStop) {
      return
    }
    this._complete?.()
    this.unsubscribe()
  }

  public onUnsubscribe(unsubscribeCB?: NoopFn) {
    this.unsubscribeCB = unsubscribeCB
  }

  public unsubscribe() {
    this.isStop = true
    this.unsubscribeCB?.()
  }
}

interface PublishFn<T,> {
  (observer: ObserverLike<T>): () => void
}

export class Observable<T> {
  private publish?: PublishFn<T>
  private source?: Observable<T>
  private operator?: Operator<T>

  constructor(publish?: PublishFn<T>) {
    if (!publish) {
      return;
    }
    this.publish = publish
  }

  public subscribe(
    observerLike: ObserverLike<T>,
    error?: ErrorFn,
    complete?: CompleteFn
  ) {
    let observer: Observer<T>
    if (observerLike instanceof Observer) {
      observer = observerLike
    } else if (typeof observerLike === 'function') {
      observer = new Observer(observerLike, error, complete)
    } else {
      observer = new Observer(
        observerLike.next,
        observerLike.error,
        observerLike.complete
      )
    }
    const unsubscribe = this.publish?.(observer)
    observer.onUnsubscribe(unsubscribe)

    if (this.operator) {
      return this.operator.call(observer, this.source)
    }

    return observer
  }

  public lift(operator: Operator<T>) {
    const observable = new Observable<T>()
    observable.source = this
    observable.operator = operator
    return observable
  }

  public pipe(...fns: OperatorFn<T>[]) {
    return fns.reduce((acc, fn) => fn(acc) as typeof this, this)
  }
}

export function fromEvent<T extends Event>(target: HTMLElement, eventName: string) {
  return new Observable<T>((observer) => {
    const handleEvent = (event: Event) => {
      observer.next?.(event as T)
    }

    target.addEventListener(eventName, handleEvent)

    return () => {
      target.removeEventListener(eventName, handleEvent)
    }
  })
}

export function interval(delay: number) {
  return new Observable<number>(observer => {
    let index = 0

    const id = window.setInterval(() => {
      observer.next?.(index++)
    }, delay)

    return () => {
      window.clearInterval(id)
    }
  })
}
