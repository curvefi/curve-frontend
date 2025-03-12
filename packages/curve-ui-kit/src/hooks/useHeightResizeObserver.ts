import { useEffect, useState, type RefObject } from 'react'

/** Options for the height resize observer */
type HeightResizeOptions = {
  threshold?: number
}

/**
 * A hook that observes an element's height changes and returns the current height.
 * Only updates when height increases beyond the threshold.
 *
 * @param elementRef - React ref object for the element to observe
 * @param options - Configuration options
 * @returns  The current height of the element or null if not measured yet
 *
 * @example
 * // Basic usage
 * const elementRef = useRef<HTMLDivElement>(null);
 * const height = useHeightResizeObserver(elementRef);
 *
 * // With custom threshold
 * const bannerRef = useRef<HTMLDivElement>(null);
 * const bannerHeight = useHeightResizeObserver(bannerRef, { threshold: 5 });
 *
 * // Using the height in layout calculations
 * useEffect(() => {
 *   if (height !== null) {
 *     // Update layout based on height
 *     updateLayoutHeight('banner', height);
 *   }
 * }, [height]);
 */
export default function useHeightResizeObserver(
  elementRef: RefObject<Element | null>,
  options: HeightResizeOptions = {},
) {
  const { threshold = 10 } = options
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const node = elementRef?.current

    if (!node) return

    const domRect = node.getBoundingClientRect()
    setHeight(domRect.height)

    const updateEntry = ([updatedEntry]: ResizeObserverEntry[]): void => {
      const updatedHeight = Math.round(updatedEntry?.contentRect.height || 0)

      // Allow initial height to be set if prev is null
      setHeight((prev) => (prev === null ? updatedHeight : updatedHeight > prev + threshold ? updatedHeight : prev))
    }

    const observer = new ResizeObserver(updateEntry)
    observer.observe(node)

    return () => {
      observer?.disconnect()
    }
  }, [elementRef, threshold])

  return height
}
