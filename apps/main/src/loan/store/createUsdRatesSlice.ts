import type { GetState, SetState } from 'zustand'
import type { State } from '@/loan/store/useStore'

import { PromisePool } from '@supercharge/promise-pool'
import cloneDeep from 'lodash/cloneDeep'

import { CRVUSD_ADDRESS } from '@/loan/constants'
import { log } from '@ui-kit/lib/logging'
import networks from '@/loan/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokens: UsdRate
  loading: boolean
}

const sliceKey = 'usdRates'

export type UsdRatesSlice = {
  [sliceKey]: SliceState & {
    fetchUsdRateByToken(curve: Curve, tokenAddress: string): Promise<void>
    fetchUsdRateByTokens(curve: Curve, tokenAddresses: string[]): Promise<void>
    fetchAllStoredUsdRates(curve: Curve): Promise<void>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  tokens: {
    [CRVUSD_ADDRESS]: '',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '',
  },
  loading: true,
}

const createUsdRatesSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUsdRateByToken: async (curve: Curve, tokenAddress: string) => {
      log('fetchUsdRateByToken', curve.chainId, tokenAddress)
      const chainId = curve.chainId
      const resp = await networks[chainId].api.helpers.getUsdRate(curve, tokenAddress)
      get()[sliceKey].setStateByActiveKey('tokens', tokenAddress, resp.usdRate)
    },
    fetchUsdRateByTokens: async (curve: Curve, tokenAddresses: string[]) => {
      log('fetchUsdRateByTokens', curve.chainId, tokenAddresses.join(','))
      get().usdRates.setStateByKey('loading', true)

      const chainId = curve.chainId
      const { results } = await PromisePool.for(tokenAddresses)
        .withConcurrency(5)
        .process(async (tokenAddress) => {
          const resp = await networks[chainId].api.helpers.getUsdRate(curve, tokenAddress)
          return { tokenAddress, usdRate: resp.usdRate }
        })

      const usdRatesTokens: UsdRate = cloneDeep(get()[sliceKey].tokens)
      for (const idx in results) {
        const { tokenAddress, usdRate } = results[idx]
        usdRatesTokens[tokenAddress] = usdRate
      }
      get()[sliceKey].setStateByKey('tokens', usdRatesTokens)
      get().usdRates.setStateByKey('loading', false)
    },
    fetchAllStoredUsdRates: async (curve: Curve) => {
      const tokenAddresses = Object.keys(get().usdRates.tokens)
      get()[sliceKey].fetchUsdRateByTokens(curve, tokenAddresses)
    },

    // slice helpers
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
