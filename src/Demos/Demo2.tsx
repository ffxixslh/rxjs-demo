import { fromEvent, interval, Observable } from "@/rxjs/observable";
import { map } from "@/rxjs/operators";
import { useEffect, useRef, useState } from "react"

function Demo2() {
  const [logs, setlogs] = useState<string[]>([])
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const subscription = fromEvent<MouseEvent>(contentRef.current, 'click')
      .subscribe({
        next(event) {
          const log = JSON.stringify({
            x: event.pageX,
            y: event.pageY,
            time: Date.now()
          })
          console.log('My Observable:', log)
          setlogs(prev => prev.concat(log))
        },
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const subscription = interval(1000)
      .pipe(map(count => count * 2))
      .subscribe({
        next(time) {
          console.log('interval: ', time)
        }
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const observable = new Observable<number>(observer => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
      return () => {
        // TODO 没有打印
        console.log('succes')
      }
    });

    observable.subscribe({
      next: (value) => console.log('we got', value),
      complete: () => console.log('completed'),
    });
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
    }} ref={contentRef}>
      <h1>
        Click Me
      </h1>

      <ul>
        {logs.map((log) => {
          const item = JSON.parse(log) as { x: number, y: number }
          const size = 16
          return (
            <div key={log}>
              <div style={{
                position: 'absolute',
                top: item.y - size / 2,
                left: item.x - size / 2,
                width: size,
                height: size,
                borderRadius: size,
                background: '#1670ff'
              }}>
              </div>
              <li>{log}</li>
            </div>
          );
        })}
      </ul>
    </div>
  )
}

export default Demo2
