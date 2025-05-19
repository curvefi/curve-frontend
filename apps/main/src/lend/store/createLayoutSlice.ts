import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type { LayoutHeight } from '@/lend/store/types'
import type { State } from '@/lend/store/useStore'
import { PageWidthClassName } from '@/lend/types/lend.types'

export type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  height: LayoutHeight
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

// prettier-ignore
export type AppLayoutSlice = {
  [sliceKey]: SliceState & {
    setLayoutWidth(pageWidthClassName: PageWidthClassName): void
    setLayoutHeight(key: keyof LayoutHeight, value: number | null): void

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_LAYOUT_HEIGHT: LayoutHeight = {
  globalAlert: 0,
}
export const layoutHeightKeys = Object.keys(DEFAULT_LAYOUT_HEIGHT) as (keyof LayoutHeight)[]

const DEFAULT_STATE: SliceState = {
  height: DEFAULT_LAYOUT_HEIGHT,
  isXLgUp: false,
  isLgUp: false,
  isMdUp: false,
  isSmUp: false,
  isXSmDown: false,
  isXXSm: false,
  pageWidth: null,
  scrollY: 0,
}

const createLayoutSlice = (set: SetState<State>, get: GetState<State>): AppLayoutSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setLayoutWidth: (pageWidthClassName) => {
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
    setLayoutHeight: (key, value) => {
      if (value === null) return
      get()[sliceKey].setStateByActiveKey('height', key, value)
    },

    // helpers
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
