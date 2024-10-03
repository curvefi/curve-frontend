import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import { PromisePool } from '@supercharge/promise-pool'
import cloneDeep from 'lodash/cloneDeep'

import { log } from '@/shared/lib/logging'
import { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokens: UsdRate
  loading: boolean
}

const sliceKey = 'usdRates'

// prettier-ignore
export type UsdRatesSlice = {
  [sliceKey]: SliceState & {
    fetchUsdRateByToken(api: Api, tokenAddress: string): Promise<void>
    fetchUsdRateByTokens(api: Api, tokenAddresses: string[]): Promise<void>
    fetchAllStoredUsdRates(api: Api): Promise<void>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  tokens: {
    // [CRVUSD_ADDRESS]: '',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '',
  },
  loading: true,
}

const createUsdRatesSlice = (set: SetState<State>, get: GetState<State>): UsdRatesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUsdRateByToken: async (api, tokenAddress) => {
      log('fetchUsdRateByToken', api.chainId, tokenAddress)
      const { chainId } = api
      const resp = await helpers.fetchUsdRate(api, tokenAddress)
      get()[sliceKey].setStateByActiveKey('tokens', tokenAddress, resp.usdRate)
    },
    fetchUsdRateByTokens: async (api, tokenAddresses) => {
      log('fetchUsdRateByTokens', api.chainId, tokenAddresses.join(','))
      get().usdRates.setStateByKey('loading', true)

      const { results } = await PromisePool.for(tokenAddresses)
        .withConcurrency(5)
        .process(async (tokenAddress) => {
          const resp = await helpers.fetchUsdRate(api, tokenAddress)
          return { tokenAddress, usdRate: resp.usdRate }
        })
      const { chainId } = api

      const usdRatesTokens: UsdRate = cloneDeep(get()[sliceKey].tokens)
      for (const idx in results) {
        const { tokenAddress, usdRate } = results[idx]
        usdRatesTokens[tokenAddress] = usdRate
      }
      get()[sliceKey].setStateByKey('tokens', usdRatesTokens)
      get().usdRates.setStateByKey('loading', false)
    },
    fetchAllStoredUsdRates: async (api) => {
      const tokenAddresses = Object.keys(get().usdRates.tokens)
      await get()[sliceKey].fetchUsdRateByTokens(api, tokenAddresses)
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
