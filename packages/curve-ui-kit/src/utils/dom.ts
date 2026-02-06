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
