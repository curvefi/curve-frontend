import { RefObject, useEffect, useState } from 'react'

interface Props extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

function useIntersectionObserver(elementRef: RefObject<Element>, options: Props) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options
  const [entry, setEntry] = useState<IntersectionObserverEntry | { isIntersecting: boolean }>()

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    // show node if IO not supported
    if (!hasIOSupport) {
      setEntry({ isIntersecting: true })
      return
    }

    if (frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => {
      observer?.disconnect()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, JSON.stringify(threshold), root, rootMargin, frozen])

  return entry
}

export default useIntersectionObserver
