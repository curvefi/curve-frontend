import lodash from 'lodash'
import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getPageWidthClassName } from '@ui-kit/features/layout/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import type { PageWidthClassName } from './types'

const { delay } = lodash

interface LayoutState {
  windowWidth: number
  navHeight: number // size of the header plus the global banners, used for sticky elements below the header

  // Page width and responsiveness. Prefer to use `useMediaQuery` hook instead of these flags.
  pageWidth: PageWidthClassName | null
  isLgUp: boolean
  isMdUp: boolean
  isSmUp: boolean
  isXSmDown: boolean
  isXXSm: boolean

  // Scroll state
  showScrollButton: boolean

  // Page visibility
  isPageVisible: boolean
}

interface LayoutActions {
  setLayoutWidth: (pageWidthClassName: PageWidthClassName) => void
  setNavHeight: (value: number) => void
  updateShowScrollButton: (scrollY: number) => void
  setPageVisible: (visible: boolean) => void
}

const DEFAULT_STATE: LayoutState = {
  navHeight: 96, // Default height for desktop, will be updated on mount
  windowWidth: 0,
  pageWidth: null,
  isLgUp: false,
  isMdUp: false,
  isSmUp: false,
  isXSmDown: false,
  isXXSm: false,
  showScrollButton: false,
  isPageVisible: true,
}

const layoutStore = immer<LayoutState & LayoutActions>((set) => ({
  ...DEFAULT_STATE,
  setLayoutWidth: (pageWidthClassName: PageWidthClassName) => {
    const isLgUp = pageWidthClassName.startsWith('page-large') || pageWidthClassName.startsWith('page-wide')
    const isMd = pageWidthClassName.startsWith('page-medium')
    const isSmUp = pageWidthClassName === 'page-small'
    const isXSmDown = pageWidthClassName.startsWith('page-small-x')
    const isXXSm = pageWidthClassName === 'page-small-xx'
    set((state) => {
      state.windowWidth = window.innerWidth
      state.pageWidth = pageWidthClassName
      state.isXSmDown = isXSmDown
      state.isSmUp = isSmUp || isMd || isLgUp
      state.isMdUp = isMd || isLgUp
      state.isLgUp = isLgUp
      state.isXXSm = isXXSm
    })
  },
  setNavHeight: (value: number) =>
    set((state) => {
      state.navHeight = value
    }),
  updateShowScrollButton: (scrollY) =>
    set((state) => {
      state.showScrollButton = scrollY > 30
    }),
  setPageVisible: (visible) =>
    set((state) => {
      state.isPageVisible = visible
    }),
}))

export const useLayoutStoreResponsive = () => {
  const { document } = typeof window === 'undefined' ? {} : window
  const theme = useUserProfileStore((state) => state.theme)
  const pageWidth = useLayoutStore((state) => state.pageWidth)
  const setLayoutWidth = useLayoutStore((state) => state.setLayoutWidth)
  const setPageVisible = useLayoutStore((state) => state.setPageVisible)
  const updateShowScrollButton = useLayoutStore((state) => state.updateShowScrollButton)

  const handleResizeListener = useCallback(() => {
    if (window?.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth])

  useEffect(() => {
    if (!pageWidth || !document) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [document, pageWidth, theme])

  useEffect(() => {
    if (!window || !document) return
    const handleScrollListener = () => updateShowScrollButton(window.scrollY)
    const handleVisibilityChange = () => setPageVisible(!document.hidden)

    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', () => handleResizeListener())
    window.addEventListener('scroll', () => delay(handleScrollListener, 200))

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', () => handleResizeListener())
      window.removeEventListener('scroll', () => handleScrollListener())
    }
  }, [document, handleResizeListener, setPageVisible, updateShowScrollButton])
}

export const useLayoutStore =
  process.env.NODE_ENV === 'development' ? create(devtools(layoutStore)) : create(layoutStore)
