import { useEffect, useState } from 'react'

// whether events will be dispatched to the listener before any EventTarget beneath it in the DOM tree
const useCapture = false
/**
 * Hook that returns the scroll sizes of the current window.
 * @returns the width of the vertical and height of the horizontal scrollbars
 */
export const useScrollbarDimensions = () => {
  const [dimension, setDimension] = useState<readonly [number, number]>()

  useEffect(() => {
    const { document, setInterval, clearInterval } = window

    const calculate = () => {
      const { clientHeight, clientWidth } = document.documentElement
      const { innerHeight, innerWidth } = window
      const newSizes = [innerWidth - clientWidth, innerHeight - clientHeight] as const
      setDimension((oldSizes) => (oldSizes?.every((val, index) => val === newSizes[index]) ? oldSizes : newSizes))
    }

    // recalculate on resize
    window.addEventListener('resize', calculate, useCapture)

    // recalculate on dom load
    document.addEventListener('DOMContentLoaded', calculate, useCapture)

    // recalculate on load (assets loaded as well)
    window.addEventListener('load', calculate)

    const interval = setInterval(calculate, 2000)

    return () => {
      window.removeEventListener('resize', calculate, useCapture)
      document.removeEventListener('DOMContentLoaded', calculate, useCapture)
      window.removeEventListener('load', calculate)
      clearInterval(interval)
    }
  }, [])

  return dimension || [undefined, undefined]
}
