import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'

/** Height in pixels of the viewport band used to determine the active section. */
const ACTIVE_SECTION_HEIGHT = 100

type Section<T extends string> = { value: T }

/** Returns the section covering the largest part of the activation band below the sticky navigation. */
const getActiveSection = <T extends string>(elements: readonly HTMLElement[], activationTop: number) => {
  const activationBottom = activationTop + ACTIVE_SECTION_HEIGHT
  // Adjacent sections can both cross the band, so compare their overlap and choose the largest.
  const activeElement = elements
    .map(element => {
      const rect = element.getBoundingClientRect()
      return {
        element,
        overlap: Math.max(0, Math.min(rect.bottom, activationBottom) - Math.max(rect.top, activationTop)),
      }
    })
    .toSorted((a, b) => b.overlap - a.overlap)[0]

  return activeElement?.overlap > 0 ? (activeElement.element.id as T) : undefined
}

const useHash = () => {
  const HASH_CHANGE_EVENT = 'active-section-hashchange'

  const getHash = () => window.location.hash.replace(/^#/, '')
  const getServerHash = () => '' // The server has no URL fragment, so render with no selected hash until hydration.
  const subscribeHash = (onStoreChange: () => void) => {
    window.addEventListener('hashchange', onStoreChange)
    window.addEventListener('popstate', onStoreChange)
    window.addEventListener(HASH_CHANGE_EVENT, onStoreChange)
    return () => {
      window.removeEventListener('hashchange', onStoreChange)
      window.removeEventListener('popstate', onStoreChange)
      window.removeEventListener(HASH_CHANGE_EVENT, onStoreChange)
    }
  }

  /**
   * Updates scroll-spy hashes without notifying TanStack Router.
   * TanStack patches `window.history.replaceState`; using the native prototype keeps wallet/provider state stable.
   */
  const replaceHash = (hash: string) => {
    const { pathname, search } = window.location
    History.prototype.replaceState.call(
      window.history,
      window.history.state,
      '',
      `${pathname}${search}${hash ? `#${hash}` : ''}`,
    )
    window.dispatchEvent(new Event(HASH_CHANGE_EVENT))
  }

  return { hash: useSyncExternalStore(subscribeHash, getHash, getServerHash), replaceHash }
}

/**
 * Synchronizes in-page section navigation with the URL hash and the user's scroll position.
 *
 * The URL hash is the source of truth for `activeSection`. A hash navigation, such as clicking a section link or using
 * browser history, scrolls the matching element into view. Scrolling or resizing determines which section occupies the
 * activation band immediately below the global and section navigation, then replaces the hash without adding a browser
 * history entry or triggering another hash scroll.
 *
 * Each section value must match the `id` of its rendered section element. Attach the returned `navigationRef` to the
 * sticky section navigation so its measured height is included in the activation offset.
 *
 * @param sections Ordered section values matching element IDs and URL hashes.
 * @returns The URL-selected section and the ref used to measure the section navigation.
 */
export const useActiveSection = <T extends string>(sections: readonly Section<T>[]) => {
  const navigationRef = useRef<HTMLElement>(null)
  const globalNavHeight = useLayoutStore(state => state.navHeight)
  const [, sectionNavHeight = 0] = useResizeObserver(navigationRef, { threshold: 1 })
  // The activation band starts immediately below both stacked navigation bars.
  const activationTop = globalNavHeight + sectionNavHeight
  const { hash, replaceHash } = useHash()
  const activeSection = sections.find(({ value }) => value === hash)?.value ?? sections[0]?.value

  useEffect(() => {
    const section = sections.find(({ value }) => value === hash)
    // The target may render after TanStack Router's initial hash scroll attempt.
    const target = section && document.getElementById(section.value)
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (target && getActiveSection<T>(elements, activationTop) !== section.value) {
      target.scrollIntoView()
    }
  }, [activationTop, activeSection, hash, sections])

  useEffect(() => {
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (!elements.length) return

    const updateActiveSection = () => {
      const section = getActiveSection<T>(elements, activationTop)
      // Clear the hash at the top so the first section becomes active.
      if (!section && window.scrollY <= activationTop && window.location.hash) {
        replaceHash('')
        return
      }
      if (section && section !== window.location.hash.replace(/^#/, '')) {
        // Replace keeps scrolling out of browser history.
        replaceHash(section)
      }
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    updateActiveSection()

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [activationTop, replaceHash, sections])

  return { activeSection, navigationRef }
}
