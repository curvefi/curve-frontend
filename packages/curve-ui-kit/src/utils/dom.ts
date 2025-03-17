import { useEffect } from 'react'
import { isCypress } from '@ui-kit/utils/index'

/**
 * Check if the target has a parent with the given class name.
 * Optionally, you can specify a tag name to stop the search at.
 * @param target The target element to start the search from.
 * @param className The class name to search for.
 * @param untilTag The tag name to stop the search at.
 */
export function hasParentWithClass(target: EventTarget, className: string, { untilTag }: { untilTag?: string } = {}) {
  let element = target as HTMLElement
  while (element && element.tagName != untilTag?.toUpperCase()) {
    if (element.classList.contains(className)) {
      return true
    }
    element = element.parentElement as HTMLElement
  }
  return false
}

export const classNames = (...items: (string | false | undefined | null)[]): string => items.filter(Boolean).join(' ')

/**
 * Unfortunately cypress is unable to reproduce the :hover pseudo-class, we use this class to simulate it.
 */
export const CypressHoverClass = isCypress && 'cypress-hover'

/**
 * A hook that listens to a native event only when running in Cypress.
 * This is necessary because Cypress does not support react synthetic events.
 * I tried the plugin `cypress-real-events` but it did not work.
 */
export function useNativeEventInCypress<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
  element: T | null,
  event: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
) {
  useEffect(() => {
    if (isCypress && element) {
      element.addEventListener(event, listener)
      return () => element.removeEventListener(event, listener)
    }
  }, [element, event, listener])
}
