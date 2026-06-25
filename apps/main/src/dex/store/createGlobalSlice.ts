import { produce } from 'immer'
import { isEqual } from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import { fetchPoolIds } from '@/dex/lib/pool-ids'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, NetworkConfigFromApi, Wallet } from '@/dex/types/main.types'
import { notFalsy } from '@primitives/objects.utils'
import { isDexPoolListV2Enabled } from '@ui-kit/hooks/useFeatureFlags'
import { log } from '@ui-kit/lib/logging'
import type { ReleaseChannel } from '@ui-kit/utils'
import { formatTimeDiff } from '@ui-kit/utils/time.utils'
import { fetchNetworks } from '../entities/networks'
import { refetchPoolTvls } from '../queries/pool-tvl.query'
import { refetchPoolVolumes } from '../queries/pool-volume.query'

export type SliceKey = keyof State | ''
export type StateKey = string

type GlobalState = {
  hasDepositAndStake: Record<string, boolean | null>
  hasRouter: Record<string, boolean | null>
}

export type GlobalSlice = {
  getNetworkConfigFromApi: (chainId: ChainId | '') => NetworkConfigFromApi
  setNetworkConfigFromApi: (curve: CurveApi) => void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate: (
    config: Config,
    curveApi: CurveApi | undefined,
    prevCurveApi: CurveApi | undefined,
    wallet: Wallet | undefined,
    releaseChannel: ReleaseChannel,
  ) => Promise<void>

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => void
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => void
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean) => void
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean) => void
} & GlobalState

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
  hydrate: async (_config, curveApi, prevCurveApi, _wallet, releaseChannel) => {
    if (!curveApi) return
    const isLegacyDexList = !isDexPoolListV2Enabled(releaseChannel)

    const state = get()
    const isNetworkSwitched = prevCurveApi?.chainId !== curveApi.chainId
    const isUserSwitched = prevCurveApi?.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    const start = new Date()
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
      state.createPool.resetState()
      state.dashboard.resetState()
    }

    // update network settings from api
    state.setNetworkConfigFromApi(curveApi)

    await fetchNetworks() // Pool ids have a dependency on networks
    const poolIds = await fetchPoolIds(curveApi, { chainId })

    // After pool bootstrap is completed above, any future query refactored
    // out of `fetchPools` that depends on all pool ids should be manually invalidated.
    // You could argue that hooks with 'isHydrated' in the `enabled` parameter would suffice,
    // but we're still encountering situations where not all data is properly loaded.
    const [poolVolumes] = await Promise.all([
      // Pool volumes are still needed in beta to preserve volume-based token sorting.
      refetchPoolVolumes({ chainId }),
      // Legacy TVL/gauge enrichment is skipped there because the v2 pool list uses backend data.
      ...notFalsy(isLegacyDexList && refetchPoolTvls({ chainId })),
    ])
    await state.pools.fetchPools(curveApi, poolIds, poolVolumes, isLegacyDexList)

    log(`Hydrated DEX - Complete in ${formatTimeDiff(start)}`)
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValues = state[sliceKey][key]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedActiveKeyValues = storedValues[activeKey] // todo: this means the following branch is unreachable?
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce(state => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          const storedValue = state[sliceKey][key]
          if (!isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = value
          }
        }),
      )
    }
  },
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        state[sliceKey] = { ...state[sliceKey], ...defaultState }
      }),
    )
  },
})
