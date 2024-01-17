import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'

import { NETWORK_TOKEN } from '@/constants'
import networks from '@/networks'

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
    fetchUsdRateByTokens(curve: CurveApi | null, tokenAddresses: string[]): Promise<UsdRatesMapper>
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
    CRV: 0,
  },
  loading: true,
}

const createUsdRatesSlice = (set: SetState<State>, get: GetState<State>): UsdRatesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUsdRateByToken: async (curve, tokenAddress) => {
      if (!curve) return undefined

      const resp = await get()[sliceKey].fetchUsdRateByTokens(curve, [tokenAddress])
      return resp[tokenAddress]
    },
    fetchUsdRateByTokens: async (curve, tokenAddresses) => {
      if (!curve) return {}

      get()[sliceKey].setStateByKey('loading', true)
      const { chainId } = curve
      const usdRatesMapper = await networks[chainId].api.helpers.fetchUsdRates(curve, tokenAddresses)
      get()[sliceKey].setStateByKeys({
        usdRatesMapper: cloneDeep(mapUsdRates(usdRatesMapper, get()[sliceKey].usdRatesMapper)),
        loading: false,
      })
      return usdRatesMapper
    },
    fetchAllStoredUsdRates: async (curve) => {
      const tokenAddresses = Object.keys(get().usdRates.usdRatesMapper)
      await get().usdRates.fetchUsdRateByTokens(curve, tokenAddresses)
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

function mapUsdRates(updatedUsdRatesMapper: UsdRatesMapper, storedUsdRatesMapper: UsdRatesMapper) {
  let cUsdRatesMapper = cloneDeep(storedUsdRatesMapper)
  for (const tokenAddress in updatedUsdRatesMapper) {
    cUsdRatesMapper[tokenAddress] = updatedUsdRatesMapper[tokenAddress]
  }
  return cUsdRatesMapper
}

export function getUsdRatesStr(usdRatesMapper: UsdRatesMapper) {
  return Object.keys(usdRatesMapper)
    .filter((tokenAddress) => {
      const usdRate = usdRatesMapper[tokenAddress]
      return !isUndefined(usdRate) && usdRate > 0
    })
    .reduce((str, address) => {
      str += address.charAt(5)
      return str
    }, '')
}

export default createUsdRatesSlice
