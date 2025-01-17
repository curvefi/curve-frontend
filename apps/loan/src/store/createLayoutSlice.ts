import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { LayoutHeight } from '@/store/types'

import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import { PageWidthClassName } from '@/types/loan.types'

export type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  height: LayoutHeight
  navHeight: number
  isXLgUp: boolean
  isLgUp: boolean
  isMdUp: boolean
  isSmUp: boolean
  isXSmDown: boolean
  isXXSm: boolean
  pageWidth: PageWidthClassName | null
  scrollY: number
}

const sliceKey = 'layout'

export type AppLayoutSlice = {
  [sliceKey]: SliceState & {
    setLayoutWidth(pageWidthClassName: PageWidthClassName): void
    setLayoutHeight(key: keyof LayoutHeight, value: number): void

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_LAYOUT_HEIGHT: LayoutHeight = {
  globalAlert: 0,
  mainNav: 0,
  secondaryNav: 0,
  footer: 0,
}
export const layoutHeightKeys = ['globalAlert', 'mainNav', 'secondaryNav', 'footer'] as const

const DEFAULT_STATE: SliceState = {
  height: DEFAULT_LAYOUT_HEIGHT,
  navHeight: 0,
  isXLgUp: false,
  isLgUp: false,
  isMdUp: false,
  isSmUp: false,
  isXSmDown: false,
  isXXSm: false,
  pageWidth: null,
  scrollY: 0,
}

const createLayoutSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setLayoutWidth: (pageWidthClassName: PageWidthClassName) => {
      const isXLgUp = pageWidthClassName.startsWith('page-wide')
      const isLgUp = pageWidthClassName.startsWith('page-large') || pageWidthClassName.startsWith('page-wide')
      const isMd = pageWidthClassName.startsWith('page-medium')
      const isSmUp = pageWidthClassName === 'page-small'
      const isXSmDown = pageWidthClassName.startsWith('page-small-x')
      const isXXSm = pageWidthClassName === 'page-small-xx'

      set(
        produce((state: State) => {
          state.layout.pageWidth = pageWidthClassName
          state.layout.isXSmDown = isXSmDown
          state.layout.isSmUp = isSmUp || isMd || isLgUp
          state.layout.isMdUp = isMd || isLgUp
          state.layout.isLgUp = isLgUp
          state.layout.isXLgUp = isXLgUp
          state.layout.isXXSm = isXXSm
        }),
      )
    },
    setLayoutHeight: (key: keyof LayoutHeight, value: number) => {
      get()[sliceKey].setStateByActiveKey('height', key, value)

      const storedMainNavHeight = get()[sliceKey].height.mainNav
      const storedSecondaryNavHeight = get()[sliceKey].height.secondaryNav

      let navHeight = storedMainNavHeight + storedSecondaryNavHeight
      if (key === 'mainNav') {
        navHeight = value + storedSecondaryNavHeight
      } else if (key === 'secondaryNav') {
        navHeight = value + storedMainNavHeight
      }
      get()[sliceKey].setStateByKey('navHeight', navHeight)
    },

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createLayoutSlice

export function getPageWidthClassName(pageWidth: number) {
  if (pageWidth > 1920) {
    return 'page-wide'
  } else if (pageWidth > 1280 && pageWidth <= 1920) {
    return 'page-large'
  } else if (pageWidth > 960 && pageWidth <= 1280) {
    return 'page-medium'
  } else if (pageWidth > 450 && pageWidth <= 960) {
    return 'page-small'
  } else if (pageWidth > 321 && pageWidth <= 450) {
    return 'page-small-x'
  } else {
    return 'page-small-xx'
  }
}
