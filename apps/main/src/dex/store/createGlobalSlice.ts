import { produce } from 'immer'
import lodash from 'lodash'
import type { Address } from 'viem'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, NetworkConfigFromApi, Wallet } from '@/dex/types/main.types'
import { prefetchTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { log } from '@ui-kit/lib/logging'
import { fetchNetworks } from '../entities/networks'

export type SliceKey = keyof State | ''
export type StateKey = string
const { isEqual } = lodash

type GlobalState = {
  hasDepositAndStake: { [chainId: string]: boolean | null }
  hasRouter: { [chainId: string]: boolean | null }
}

export interface GlobalSlice extends GlobalState {
  getNetworkConfigFromApi(chainId: ChainId | ''): NetworkConfigFromApi
  setNetworkConfigFromApi(curve: CurveApi): void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(
    config: Config,
    curveApi: CurveApi | undefined,
    prevCurveApi: CurveApi | undefined,
    wallet: Wallet | undefined,
  ): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  hasDepositAndStake: {},
  hasRouter: {},
} satisfies GlobalState

export const createGlobalSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): GlobalSlice => ({
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
  hydrate: async (config, curveApi, prevCurveApi) => {
    if (!curveApi) return

    const state = get()
    const isNetworkSwitched = prevCurveApi?.chainId !== curveApi.chainId
    const isUserSwitched = prevCurveApi?.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    log('Hydrating DEX', curveApi?.chainId, {
      isNetworkSwitched,
      isUserSwitched,
      hasRPC: !curveApi.isNoRPC,
    })

    // reset store
    if (isNetworkSwitched) {
      state.pools.resetState()
      state.quickSwap.resetState()
      state.tokens.resetState()
      state.user.resetState()
      state.createPool.resetState()
      state.dashboard.resetState()
    }

    if (isUserSwitched) {
      state.user.resetState()
    }

    // update network settings from api
    state.setNetworkConfigFromApi(curveApi)

    const networks = await fetchNetworks()
    const network = networks[chainId]
    const { excludePoolsMapper } = network

    // get poolList
    const poolIds = (await curvejsApi.network.fetchAllPoolsList(curveApi, network)).filter(
      (poolId) => !excludePoolsMapper[poolId],
    )

    // if no pools found for network, set tvl, volume and pools state to empty object
    if (!poolIds.length) {
      state.pools.setEmptyPoolListDefault(chainId)
      state.tokens.setEmptyPoolListDefault(curveApi)
      return
    }

    // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.finance/api/getFactoryAPYs-kava)
    const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
      chainId === 2222 ? await curvejsApi.network.getFailedFetching24hOldVprice() : {}

    const pools = await state.pools.fetchPools(curveApi, poolIds, failedFetching24hOldVprice)
    const userAddress = curveApi.signerAddress

    // Prefetch user balances for the tokens from all pools improving token selector UX.
    if (userAddress) {
      const tokenAddresses = pools?.poolDatas.flatMap((pool) => pool.tokenAddresses as Address[]) ?? []
      prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses })
    }

    if (isUserSwitched || isNetworkSwitched) {
      void state.pools.fetchPricesApiPools(chainId)
      void state.pools.fetchBasePools(curveApi)
    }

    if (userAddress) {
      void state.user.fetchUserPoolList(curveApi)
    }

    log('Hydrating DEX - Complete')
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
