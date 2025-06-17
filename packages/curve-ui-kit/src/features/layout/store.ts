import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { LayoutHeight, PageWidthClassName } from './types'

interface LayoutState {
  // Layout heights
  height: LayoutHeight
  windowWidth: number
  navHeight: number

  // Page width and responsiveness. Prefer to use `useMediaQuery` hook instead of these flags.
  pageWidth: PageWidthClassName | null
  isLgUp: boolean
  isMdUp: boolean
  isSmUp: boolean
  isXSmDown: boolean
  isXXSm: boolean

  // Scroll state
  scrollY: number
  showScrollButton: boolean

  // Page visibility
  isPageVisible: boolean
}

interface LayoutActions {
  setLayoutWidth: (pageWidthClassName: PageWidthClassName) => void
  setLayoutHeight: (key: keyof LayoutHeight, value: number) => void
  updateShowScrollButton: (scrollY: number) => void
  setScrollY: (scrollY: number) => void
  setPageVisible: (visible: boolean) => void
}

const DEFAULT_LAYOUT_HEIGHT: LayoutHeight = {
  globalAlert: 0,
  mainNav: 0,
  secondaryNav: 0,
  footer: 0,
}

const DEFAULT_STATE: LayoutState = {
  height: DEFAULT_LAYOUT_HEIGHT,
  navHeight: 0,
  windowWidth: 0,
  pageWidth: null,
  isLgUp: false,
  isMdUp: false,
  isSmUp: false,
  isXSmDown: false,
  isXXSm: false,
  scrollY: 0,
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
  setLayoutHeight: (key: keyof LayoutHeight, value: number) =>
    set((state) => {
      state.height[key] = value
      state.navHeight = state.height.mainNav + state.height.secondaryNav
    }),
  updateShowScrollButton: (scrollY) =>
    set((state) => {
      state.scrollY = scrollY
      state.showScrollButton = scrollY > 30
    }),
  setScrollY: (scrollY) =>
    set((state) => {
      state.scrollY = scrollY
    }),
  setPageVisible: (visible) =>
    set((state) => {
      state.isPageVisible = visible
    }),
}))

export const useLayoutStore =
  process.env.NODE_ENV === 'development' ? create(devtools(layoutStore)) : create(layoutStore)
