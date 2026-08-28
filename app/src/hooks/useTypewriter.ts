import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Reveals `text` one character at a time after `startDelay`. Skipped under
 * prefers-reduced-motion, where the full string renders immediately instead.
 */
export function useTypewriter(text: string, speed = 32, startDelay = 500) {
  const prefersReducedMotion = useReducedMotion()
  const [displayed, setDisplayed] = useState(prefersReducedMotion ? text : '')
  const [done, setDone] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed('')
    setDone(false)

    let i = 0
    let intervalId: number

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          window.clearInterval(intervalId)
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [text, speed, startDelay, prefersReducedMotion])

  return { displayed, done }
}
