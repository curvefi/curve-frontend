import { type RefObject, useEffect, useState } from 'react'

/** Options for the height resize observer */
type ResizeObserverOptions = {
  threshold?: number
}

/**
 * A hook that observes an element's dimension changes and returns the current dimensions.
 * Only updates when dimensions change beyond the threshold.
 *
 * @param elementRef - React ref object for the element to observe
 * @param options - Configuration options
 * @returns  The current width and height of the element or null if not measured yet
 *
 * @example
 * // Basic usage
 * const elementRef = useRef<HTMLDivElement>(null);
 * const [width, height] = useResizeObserver(elementRef) ?? [];
 *
 * // With custom threshold
 * const bannerRef = useRef<HTMLDivElement>(null);
 * const [,bannerHeight] = useResizeObserver(bannerRef, { threshold: 5 }) ?? [];
 *
 * // Using the height in layout calculations
 * useEffect(() => {
 *   if (height !== null) {
 *     // Update layout based on height
 *     updateLayoutHeight('banner', height);
 *   }
 * }, [height]);
 */
export function useResizeObserver(
  elementRef: RefObject<Element | null>,
  { threshold = 10 }: ResizeObserverOptions = {},
) {
  const [dimensions, setDimensions] = useState<[number, number] | null>(null)

  useEffect(() => {
    const node = elementRef.current
    if (!node) {
      return console.warn(`Could not find the element to observe for resize: ${elementRef}`)
    }

    const { width, height } = node.getBoundingClientRect()
    setDimensions([width, height])

    const updateEntry = ([updatedEntry]: ResizeObserverEntry[]): void => {
      const { width, height } = updatedEntry?.contentRect ?? {}
      const dimensions = [width, height].map((d) => Math.round(d || 0)) as [number, number]
      // Allow initial height to be set if prev is null
      setDimensions((prev): [number, number] =>
        prev == null
          ? dimensions
          : dimensions.some((dimension, i) => Math.abs(dimension - prev[i]) > threshold)
            ? dimensions
            : prev,
      )
    }

    const observer = new ResizeObserver(updateEntry)
    observer.observe(node)

    return () => {
      observer?.disconnect()
    }
  }, [elementRef, threshold])

  return dimensions
}
