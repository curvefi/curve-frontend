import { type RefObject, useEffect, useState } from 'react'

type Dimension = 'width' | 'height'

/** Options for the resize observer */
type ResizeObserverOptions = {
  threshold?: number
  enabled?: boolean
  /** Only changes to this dimension trigger updates. Watches both when omitted. */
  dimension?: Dimension
}

const DIMENSION_INDEX: Record<Dimension, number> = { width: 0, height: 1 }
const EMPTY_DIMENSIONS: readonly [] = []

/**
 * A hook that observes an element's dimension changes (including borders) and returns the current dimensions.
 * Only updates when the selected dimension changes beyond the threshold (both by default).
 * Returns both dimensions from the last accepted measurement, even when observing just one.
 *
 * @param elementRef - React ref object for the element to observe
 * @param options - Configuration options
 * @returns  The current width and height of the element or an empty array if not measured yet
 *
 * @example
 * // Basic usage
 * const elementRef = useRef<HTMLDivElement>(null);
 * const [width, height] = useResizeObserver(elementRef);
 *
 * // With custom threshold
 * const bannerRef = useRef<HTMLDivElement>(null);
 * const [,bannerHeight] = useResizeObserver(bannerRef, { threshold: 5 });
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
  { threshold = 10, enabled = true, dimension }: ResizeObserverOptions = {},
) {
  const [dimensions, setDimensions] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!enabled) return
    const node = elementRef.current
    if (!node) return console.warn(`Could not find the element to observe for resize`, elementRef)

    const { width, height } = node.getBoundingClientRect()
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setDimensions([width, height])

    const updateEntry = ([updatedEntry]: ResizeObserverEntry[]): void => {
      const { inlineSize: width, blockSize: height } = updatedEntry?.borderBoxSize[0] ?? {}
      const dimensions = [width, height].map(d => Math.round(d || 0)) as [number, number]
      // Allow the initial measurement to be set if prev is null
      setDimensions((prev): [number, number] =>
        prev == null
          ? dimensions
          : dimensions.some(
                (value, i) =>
                  (dimension == null || i === DIMENSION_INDEX[dimension]) && Math.abs(value - prev[i]) > threshold,
              )
            ? dimensions
            : prev,
      )
    }

    const observer = new ResizeObserver(updateEntry)
    observer.observe(node)

    return () => {
      observer?.disconnect()
    }
  }, [elementRef, threshold, enabled, dimension])

  return dimensions ?? EMPTY_DIMENSIONS
}
