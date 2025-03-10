import { RefObject, useEffect, useState } from 'react'

/**
 * A hook that observes whether an element has a specific class.
 * Uses MutationObserver to track class changes in real-time.
 *
 * @param ref - React ref object pointing to the element to observe
 * @param className - The class name to check for
 * @returns Boolean indicating whether the element has the specified class
 *
 * @example
 * ```tsx
 * // Basic usage
 * const listItemRef = useRef<HTMLLIElement>(null);
 * const isActive = useClassObserver(listItemRef, 'active');
 *
 * // In a component
 * return (
 *   <li ref={listItemRef} className={someCondition ? 'active' : ''}>
 *     {isActive ? 'This item is active' : 'This item is not active'}
 *   </li>
 * );
 * ```
 */
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
