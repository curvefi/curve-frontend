import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import curvejsApi from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, NetworkConfigFromApi, Wallet } from '@/dex/types/main.types'
import { log } from '@ui-kit/lib/logging'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type GlobalState = {
  hasDepositAndStake: { [chainId: string]: boolean | null }
  hasRouter: { [chainId: string]: boolean | null }
}

export interface GlobalSlice extends GlobalState {
  getNetworkConfigFromApi(chainId: ChainId | ''): NetworkConfigFromApi
  setNetworkConfigFromApi(curve: CurveApi): void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(curveApi: CurveApi | undefined, prevCurveApi: CurveApi | undefined, wallet: Wallet | undefined): Promise<void>

  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  hasDepositAndStake: {},
  hasRouter: {},
} satisfies GlobalState

const createGlobalSlice = (set: SetState<State>, get: GetState<State>): GlobalSlice => ({
  ...DEFAULT_STATE,

  getNetworkConfigFromApi: (chainId: ChainId | '') => {
    const resp: NetworkConfigFromApi = {
      hasDepositAndStake: undefined,
      hasRouter: undefined,
    }
    if (chainId) {
      resp.hasDepositAndStake = get().hasDepositAndStake[chainId] ?? get().storeCache.hasDepositAndStake[chainId]
      resp.hasRouter = get().hasRouter[chainId] ?? get().storeCache.hasRouter[chainId]
    }
    return resp
  },
  setNetworkConfigFromApi: (curve: CurveApi) => {
    const { chainId } = curve
    const { hasDepositAndStake, hasRouter } = curvejsApi.network.fetchNetworkConfig(curve)
    set(
      produce((state: State) => {
        state.hasDepositAndStake[chainId] = hasDepositAndStake
        state.storeCache.hasDepositAndStake[chainId] = hasDepositAndStake
        state.hasRouter[chainId] = hasRouter
        state.storeCache.hasRouter[chainId] = hasRouter
      }),
    )
  },
  hydrate: async (curveApi, prevCurveApi, wallet) => {
    if (!curveApi) return

    const state = get()
    const isNetworkSwitched = prevCurveApi?.chainId !== curveApi.chainId
    const isUserSwitched = prevCurveApi?.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    log('Hydrating DEX', curveApi?.chainId, {
      wallet: wallet?.chainId ?? '',
      isNetworkSwitched,
      isUserSwitched,
      hasRPC: !curveApi.isNoRPC,
    })

    // reset store
    if (isNetworkSwitched) {
      state.gas.resetState()
      state.pools.resetState()
      state.quickSwap.resetState()
      state.tokens.resetState()
      state.usdRates.resetState()
      state.userBalances.resetState()
      state.user.resetState()
      state.userBalances.resetState()
      state.lockedCrv.resetState()
      state.createPool.resetState()
      state.campaigns.resetState()
      state.dashboard.resetState()
    }

    if (isUserSwitched) {
      state.user.resetState()
      state.userBalances.resetState()
    }

    // update network settings from api
    state.setNetworkConfigFromApi(curveApi)
    state.networks.setNetworkConfigs(curveApi)

    const network = state.networks.networks[chainId]
    const { excludePoolsMapper } = network

    // get poolList
    const poolIds = (await curvejsApi.network.fetchAllPoolsList(curveApi, network)).filter(
      (poolId) => !excludePoolsMapper[poolId],
    )

    // if no pools found for network, set tvl, volume and pools state to empty object
    if (!poolIds.length) {
      state.pools.setEmptyPoolListDefault(chainId)
      state.tokens.setEmptyPoolListDefault(chainId)
      return
    }

    // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.finance/api/getFactoryAPYs-kava)
    const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
      chainId === 2222 ? await curvejsApi.network.getFailedFetching24hOldVprice() : {}

    await state.pools.fetchPools(curveApi, poolIds, failedFetching24hOldVprice)

    if (isUserSwitched || isNetworkSwitched) {
      void state.gas.fetchGasInfo(curveApi)
      void state.pools.fetchPricesApiPools(chainId)
      void state.pools.fetchBasePools(curveApi)

      // pull all api calls before isLoadingApi if it is not needed for initial load
      void state.usdRates.fetchAllStoredUsdRates(curveApi)
    }

    if (curveApi.signerAddress) {
      void state.user.fetchUserPoolList(curveApi)
    }

    log('Hydrating DEX - Complete')
  },
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      }),
    )
  },

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey] // todo: this means the following branch is unreachable?
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
          }
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce((state) => {
          const storedValue = state[sliceKey][key]
          if (!isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
            }
            state[sliceKey][key] = value
          }
        }),
      )
    }
  },
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => {
    set(
      produce((state) => {
        state[sliceKey] = {
          ...state[sliceKey],
          ...defaultState,
        }
      }),
    )
  },
})

export default createGlobalSlice
