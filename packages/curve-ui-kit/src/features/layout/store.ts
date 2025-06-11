import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { LayoutHeight, PageWidthClassName } from './types'
import { getPageWidthClassName } from './utils'

interface LayoutState {
  // Layout heights
  height: LayoutHeight
  navHeight: number
  
  // Page width and responsiveness
  pageWidthPx: number | null
  pageWidth: PageWidthClassName | null
  isXLgUp: boolean
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
  setPageWidth: (pageWidth: number) => void
  setLayoutHeight: (key: keyof LayoutHeight, value: number) => void
  updateShowScrollButton: (scrollY: number) => void
  setScrollY: (scrollY: number) => void
  setPageVisible: (visible: boolean) => void
  resetState: () => void
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
  pageWidthPx: null,
  pageWidth: null,
  isXLgUp: false,
  isLgUp: false,
  isMdUp: false,
  isSmUp: false,
  isXSmDown: false,
  isXXSm: false,
  scrollY: 0,
  showScrollButton: false,
  isPageVisible: true,
}

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  immer((set, get) => ({
    ...DEFAULT_STATE,

    setLayoutWidth: (pageWidthClassName: PageWidthClassName) => {
      const isXLgUp = pageWidthClassName.startsWith('page-wide')
      const isLgUp = pageWidthClassName.startsWith('page-large') || pageWidthClassName.startsWith('page-wide')
      const isMd = pageWidthClassName.startsWith('page-medium')
      const isSmUp = pageWidthClassName === 'page-small'
      const isXSmDown = pageWidthClassName.startsWith('page-small-x')
      const isXXSm = pageWidthClassName === 'page-small-xx'

      set((state) => {
        state.pageWidth = pageWidthClassName
        state.isXSmDown = isXSmDown
        state.isSmUp = isSmUp || isMd || isLgUp
        state.isMdUp = isMd || isLgUp
        state.isLgUp = isLgUp
        state.isXLgUp = isXLgUp
        state.isXXSm = isXXSm
      })
    },

    setPageWidth: (pageWidth: number) => {
      const pageWidthClassName = getPageWidthClassName(pageWidth)
      const isXLgUp = pageWidthClassName.startsWith('page-wide')
      const isLgUp = pageWidthClassName.startsWith('page-large') || pageWidthClassName.startsWith('page-wide')
      const isMd = pageWidthClassName.startsWith('page-medium')
      const isSmUp = pageWidthClassName === 'page-small'
      const isXSmDown = pageWidthClassName.startsWith('page-small-x')
      const isXXSm = pageWidthClassName === 'page-small-xx'

      set((state) => {
        state.pageWidthPx = pageWidth
        state.pageWidth = pageWidthClassName
        state.isXSmDown = isXSmDown
        state.isSmUp = isSmUp || isMd || isLgUp
        state.isMdUp = isMd || isLgUp
        state.isLgUp = isLgUp
        state.isXLgUp = isXLgUp
        state.isXXSm = isXXSm
      })
    },

    setLayoutHeight: (key: keyof LayoutHeight, value: number) => {
      set((state) => {
        state.height[key] = value
        
        // Calculate navHeight based on mainNav and secondaryNav
        state.navHeight = state.height.mainNav + state.height.secondaryNav
      })
    },

    updateShowScrollButton: (scrollY: number) => {
      const showScrollButton = scrollY > 30
      set((state) => {
        state.scrollY = scrollY
        state.showScrollButton = showScrollButton
      })
    },

    setScrollY: (scrollY: number) => {
      set((state) => {
        state.scrollY = scrollY
      })
    },

    setPageVisible: (visible: boolean) => {
      set((state) => {
        state.isPageVisible = visible
      })
    },

    resetState: () => {
      set(() => DEFAULT_STATE)
    },
  }))
)