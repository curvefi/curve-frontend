import { useEffect, useState, RefObject } from 'react'

export function useClassObserver(ref: RefObject<HTMLLIElement | null>, className: string): boolean {
  const [hasClass, setHasClass] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check initial state
    setHasClass(element.classList.contains(className))

    // Set up mutation observer to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setHasClass(element.classList.contains(className))
        }
      })
    })

    observer.observe(element, { attributes: true })

    return () => {
      observer.disconnect()
    }
  }, [ref, className])

  return hasClass
}
