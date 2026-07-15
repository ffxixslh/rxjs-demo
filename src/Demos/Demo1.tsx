import { useEffect, useState } from 'react'
import { fromEvent, interval, map, scan } from 'rxjs'

function Demo1() {
  const [count, setCount] = useState(0)
  const [axis, setAxis] = useState({
    x: 0,
    y: 0
  })

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>('#button')

    if (!button) {
      return;
    }

    const buttonClick$ = fromEvent(button, 'click')
      .pipe(
        scan((count) => count + 1, 0),
        map((count) => count * 2)
      )
      .subscribe((count) => {
        setCount(count)
      })

    const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        map((event) => ({
          x: event.clientX,
          y: event.clientY
        }))
      )
      .subscribe((axis) => {
        setAxis(axis)
      })

    const interval$ = interval(1000).subscribe((time) => {
      console.log('time', time);
    });

    return () => {
      buttonClick$.unsubscribe();
      mousemove$.unsubscribe();
      interval$.unsubscribe();
    }
  }, [])

  return (
    <section id='center'>
      <header>
        <button id='button'>click time: {count}</button>
      </header>

      <main>
        {JSON.stringify(axis)}
      </main>
    </section>
  )

}

export default Demo1
