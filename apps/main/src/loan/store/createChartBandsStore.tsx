import type { StoreApi } from 'zustand'
import type { State } from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  xAxisDisplayType: 'price' | 'band'
}

const sliceKey = 'chartBands'

export type ChartBandsSlice = {
  [sliceKey]: SliceState & {
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  xAxisDisplayType: 'price',
}

const createChartBandsSlice = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setStateByActiveKey: <T,>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T,>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createChartBandsSlice
