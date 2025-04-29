import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import type { GetState, SetState } from 'zustand'
import networks from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import {
  ChainId,
  Curve,
  Llamma,
  CollateralData,
  CollateralDatasMapper,
  CollateralDataCache,
  CollateralDataCacheMapper,
} from '@/loan/types/loan.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  collateralDatas: { [chainId: string]: CollateralData[] }
  collateralDatasMapper: { [chainId: string]: CollateralDatasMapper }
}

const sliceKey = 'collaterals'

// prettier-ignore
export type CollateralsSlice = {
  [sliceKey]: SliceState & {
    fetchCollaterals(curve: Curve): Promise<{ collateralDatasMapper: CollateralDatasMapper; collateralDatas: CollateralData[] }>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  collateralDatas: {},
  collateralDatasMapper: {},
}

const createCollateralsSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchCollaterals: async (curve: Curve) => {
      const chainId = curve.chainId
      const llammasMapper = networks[chainId].api.helpers.getLlammas(curve)

      // mapper
      const collateralDatasMapper: CollateralDatasMapper = {}
      const collateralDatasCacheMapper: CollateralDataCacheMapper = {}
      const collateralAddresses: string[] = []

      for (const key in llammasMapper) {
        const llamma = llammasMapper[key]
        const { collateralData, collateralDataCache } = getCollateralData(llamma)
        collateralAddresses.push(collateralData.llamma.collateral)
        collateralDatasMapper[key] = collateralData
        collateralDatasCacheMapper[key] = collateralDataCache
      }

      const collateralDatas = Object.entries(collateralDatasMapper).map(([_, v]) => v)
      get()[sliceKey].setStateByActiveKey('collateralDatas', chainId.toString(), collateralDatas)
      get()[sliceKey].setStateByActiveKey('collateralDatasMapper', chainId.toString(), collateralDatasMapper)

      // fetch collaterals USD rates
      void get().usdRates.fetchUsdRateByTokens(curve, collateralAddresses)

      // add to cache
      void get().storeCache.setStateByActiveKey('collateralDatasMapper', chainId.toString(), collateralDatasCacheMapper)

      return { collateralDatas, collateralDatasMapper }
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

function getCollateralData(llamma: Llamma) {
  const collateralData: CollateralData = {
    llamma,
    displayName: llamma.id === 'sfrxeth2' ? 'sfrxETH v2' : '',
  }

  const collateralDataCache = pick(collateralData, [
    'llamma.id',
    'llamma.address',
    'llamma.controller',
    'llamma.collateral',
    'llamma.collateralSymbol',
    'llamma.coins',
    'llamma.coinAddresses',
    'displayName',
  ]) as CollateralDataCache

  return { collateralData, collateralDataCache }
}

export default createCollateralsSlice
