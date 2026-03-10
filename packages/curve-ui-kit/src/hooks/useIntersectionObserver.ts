import { type RefObject, useCallback, useEffect, useState } from 'react'

interface Props extends IntersectionObserverInit {
  /** Once the element is visible, freeze that state and stop observing */
  freezeOnceVisible?: boolean
}

type IntersectionEntry = IntersectionObserverEntry | { isIntersecting: boolean }

export const observeNode = (
  node: Element,
  callback: (entries: IntersectionObserverEntry[]) => void,
  observerParams?: IntersectionObserverInit,
) => {
  const observer = new IntersectionObserver(callback, observerParams)
  observer.observe(node)
  return () => observer.disconnect()
}

/**
 * Hook that tracks when an element is visible in the viewport using the Intersection Observer API
 *
 * @param elementRef - React ref object for the element to observe
 * @param options - Configuration options for the Intersection Observer
 * @returns IntersectionObserverEntry or a simplified object with isIntersecting property
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const ref = useRef<HTMLDivElement>(null)
 *   const entry = useIntersectionObserver(ref, { threshold: 0.5 })
 *
 *   return (
 *     <div ref={ref}>
 *       {entry.isIntersecting ? 'Element is visible' : 'Element is not visible'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useIntersectionObserver(elementRef: RefObject<Element | null>, options: Props = {}) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options
  const [entry, setEntry] = useState<IntersectionEntry>({ isIntersecting: false })

  const frozen = freezeOnceVisible && entry.isIntersecting

  // when contents move during render, multiple updates may be received. Always use the last one (i.e. most recent)
  const updateEntry = useCallback((entries: IntersectionObserverEntry[]) => setEntry(entries[entries.length - 1]), [])

  useEffect(() => {
    // show node if IO not supported
    if (!window.IntersectionObserver) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntry({ isIntersecting: true })
      return
    }

    const node = elementRef?.current
    if (frozen || !node) return
    return observeNode(node, updateEntry, { threshold, root, rootMargin })
  }, [elementRef, root, rootMargin, frozen, updateEntry, threshold])

  return entry
}
