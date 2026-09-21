import { produce } from 'immer'
import { isEqual } from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import { fetchPoolIds } from '@/dex/lib/pool-ids'
import type { State } from '@/dex/store/useStore'
import { CurveApi, Wallet } from '@/dex/types/main.types'
import { isDexPoolListV2 } from '@evm-ui/hooks/useFeatureFlags'
import { notFalsy } from '@primitives/objects.utils'
import type { ReleaseChannel } from '@ui/lib/env'
import { log } from '@ui/lib/logging'
import { formatTimeDiff } from '@ui/lib/time'
import { refetchPoolTvls } from '../queries/pool-tvl.query'

export type SliceKey = keyof State | ''
export type StateKey = string

export type GlobalSlice = {
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
}

export const createGlobalSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): GlobalSlice => ({
  hydrate: async (_config, curveApi, prevCurveApi, _wallet, releaseChannel) => {
    if (!curveApi) return

    const state = get()
    const isNetworkSwitched = prevCurveApi?.chainId !== curveApi.chainId
    const isUserSwitched = prevCurveApi?.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    const start = new Date()
    log('Hydrating DEX', curveApi?.chainId, { isNetworkSwitched, isUserSwitched, hasRPC: !curveApi.isNoRPC })

    // reset store
    if (isNetworkSwitched) {
      state.pools.resetState()
      state.quickSwap.resetState()
      state.tokens.resetState()
      state.createPool.resetState()
      state.dashboard.resetState()
    }

    const isLegacy = isDexPoolListV2(releaseChannel)
    const poolIds = await fetchPoolIds(curveApi)

    // After pool bootstrap is completed above, any future query refactored
    // out of `fetchPools` that depends on all pool ids should be manually invalidated.
    // You could argue that hooks with 'isHydrated' in the `enabled` parameter would suffice,
    // but we're still encountering situations where not all data is properly loaded.
    await Promise.all([
      // Legacy TVL/gauge enrichment is skipped there because the v2 pool list uses backend data.
      ...notFalsy(isLegacy && refetchPoolTvls({ chainId })),
    ])
    await state.pools.fetchPools(curveApi, poolIds, { includeGaugeData: true })

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
