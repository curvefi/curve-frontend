import { RefObject, useCallback, useEffect, useState } from 'react'

interface Props extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
  refreshOnChange?: unknown
}

function useIntersectionObserver(elementRef: RefObject<Element>, options: Props = {}) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false, refreshOnChange } = options
  const [entry, setEntry] = useState<IntersectionObserverEntry | { isIntersecting: true }>()

  const frozen = freezeOnceVisible && entry?.isIntersecting
  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => setEntry(entry), [])

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
    return () => observer.disconnect();
  }, [elementRef, root, rootMargin, frozen, updateEntry, threshold, refreshOnChange])

  return entry;
}

export default useIntersectionObserver
