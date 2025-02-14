import { RefObject, useCallback, useEffect, useState } from 'react'

interface Props extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

function useIntersectionObserver(elementRef: RefObject<Element | null>, options: Props = {}) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options
  const [entry, setEntry] = useState<IntersectionObserverEntry | { isIntersecting: true }>()

  const frozen = freezeOnceVisible && entry?.isIntersecting

  // when contents move during render, multiple updates may be received. Always use the last one (i.e. most recent)
  const updateEntry = useCallback((entries: IntersectionObserverEntry[]) => setEntry(entries[entries.length - 1]), [])

  useEffect(() => {
    // show node if IO not supported
    if (!window.IntersectionObserver) {
      setEntry({ isIntersecting: true })
      return
    }

    const node = elementRef?.current
    if (frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)
    observer.observe(node)
    return () => observer.disconnect()
  }, [elementRef, root, rootMargin, frozen, updateEntry, threshold])

  return entry
}

export default useIntersectionObserver
