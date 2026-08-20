import { useEffect, useRef } from 'react'
import { useLayoutStore } from '@evm-ui/features/layout'
import { useLocation, useNavigate } from '@evm-ui/hooks/router'
import { useResizeObserver } from '@evm-ui/hooks/useResizeObserver'
import { useRouterState } from '@tanstack/react-router'

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
  const { hash } = useLocation()
  const navigate = useNavigate()
  const navigationRef = useRef<HTMLElement>(null)
  // Coordinates URL-driven smooth scrolling with scroll-spy hash updates.
  const scrollSpyHashRef = useRef('')
  const isNavigating = useRouterState({ select: state => state.status === 'pending' })
  const globalNavHeight = useLayoutStore(state => state.navHeight)
  const [, sectionNavHeight = 0] = useResizeObserver(navigationRef, { threshold: 1 })
  // The activation band starts immediately below both stacked navigation bars.
  const activationTop = globalNavHeight + sectionNavHeight
  const activeSection = sections.find(({ value }) => value === hash)?.value ?? sections[0]?.value

  useEffect(() => {
    if (scrollSpyHashRef.current === hash) {
      scrollSpyHashRef.current = ''
      return
    }
    const section = sections.find(({ value }) => value === hash)
    // The target may render after TanStack Router's initial hash scroll attempt.
    const target = section && document.getElementById(section.value)
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (target && getActiveSection<T>(elements, activationTop) !== section.value) {
      scrollSpyHashRef.current = section.value
      target.scrollIntoView()
    }
  }, [activationTop, hash, sections])

  useEffect(() => {
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (!elements.length) return

    const updateActiveSection = () => {
      if (isNavigating) return
      const section = getActiveSection<T>(elements, activationTop)
      // Pause the scroll spy until the requested section becomes active.
      if (scrollSpyHashRef.current) {
        if (section === scrollSpyHashRef.current) scrollSpyHashRef.current = ''
        return
      }
      // Clear the hash at the top so the first section becomes active.
      if (!section && window.scrollY <= activationTop && hash) {
        navigate('.', { replace: true, resetScroll: false, hashScrollIntoView: false, hash: '' })
        return
      }
      if (section && section !== hash) {
        scrollSpyHashRef.current = section
        // Replace keeps scrolling out of browser history; disabling hash scrolling prevents a feedback loop.
        navigate(`#${section}`, { replace: true, resetScroll: false, hashScrollIntoView: false })
      }
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    updateActiveSection()

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [activationTop, hash, isNavigating, navigate, sections])

  return { activeSection, navigationRef }
}
