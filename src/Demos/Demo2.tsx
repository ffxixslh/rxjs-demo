import { fromEvent, interval } from "@/rxjs/observable";
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
