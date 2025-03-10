import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import { NETWORK_TOKEN } from '@/dao/constants'
import curvejsApi from '@/dao/lib/curvejs'
import type { State } from '@/dao/store/useStore'
import { CurveApi, UsdRatesMapper } from '@/dao/types/dao.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  usdRatesMapper: UsdRatesMapper
  loading: boolean
}

const sliceKey = 'usdRates'

// prettier-ignore
export type UsdRatesSlice = {
  [sliceKey]: SliceState & {
    fetchUsdRateByToken(curve: CurveApi | null, tokenAddress: string): Promise<number | undefined>
    fetchUsdRateByTokens(curve: CurveApi | null, tokenAddresses: string[], shouldRefetch?: boolean): Promise<UsdRatesMapper>
    fetchAllStoredUsdRates(curve: CurveApi): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  usdRatesMapper: {
    [NETWORK_TOKEN]: 0,
    crv: 0,
  },
  loading: true,
}

const createUsdRatesSlice = (set: SetState<State>, get: GetState<State>): UsdRatesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUsdRateByToken: async (curve, tokenAddress) => {
      if (!curve) return undefined

      const resp = await get()[sliceKey].fetchUsdRateByTokens(curve, [tokenAddress], true)
      return resp[tokenAddress]
    },
    fetchUsdRateByTokens: async (curve, tokenAddresses, shouldRefetch) => {
      const state = get()
      const sliceState = state[sliceKey]

      const usdRatesMapper = sliceState.usdRatesMapper

      if (!curve) return usdRatesMapper

      const missing = shouldRefetch
        ? tokenAddresses
        : tokenAddresses.filter((t) => typeof usdRatesMapper[t] === 'undefined')

      if (missing.length > 0) {
        sliceState.setStateByKey('loading', true)
        const fetchedUsdRatesMapper = await curvejsApi.helpers.fetchUsdRates(curve, missing)
        sliceState.setStateByKeys({
          usdRatesMapper: { ...usdRatesMapper, ...fetchedUsdRatesMapper },
          loading: false,
        })
      }

      return get()[sliceKey].usdRatesMapper
    },
    fetchAllStoredUsdRates: async (curve) => {
      const tokenAddresses = Object.keys(get().usdRates.usdRatesMapper)
      await get().usdRates.fetchUsdRateByTokens(curve, tokenAddresses, true)
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

export default createUsdRatesSlice
