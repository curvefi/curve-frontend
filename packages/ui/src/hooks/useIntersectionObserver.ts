import { RefObject, useCallback, useEffect, useState } from 'react'

interface Props extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

function useIntersectionObserver(elementRef: RefObject<Element>, options: Props = {}) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options
  const [entry, setEntry] = useState<IntersectionObserverEntry | { isIntersecting: true }>()
  const [observer, setObserver] = useState<IntersectionObserver>()

  const frozen = entry?.isIntersecting && freezeOnceVisible
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
    setObserver(observer)
    return () => {
      observer.disconnect()
      setObserver(undefined)
    };
  }, [elementRef, root, rootMargin, frozen, updateEntry, threshold])

  return {
    isIntersecting: entry?.isIntersecting,
    refresh: () => observer && updateEntry(observer.takeRecords()),
  };
}

export default useIntersectionObserver
