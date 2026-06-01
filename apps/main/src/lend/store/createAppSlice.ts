import { produce } from 'immer'
import lodash from 'lodash'
import type { Config } from 'wagmi'
import { StoreApi } from 'zustand'
import type { State } from '@/lend/store/useStore'
import { Api, Wallet } from '@/lend/types/lend.types'
import { recordEntries } from '@primitives/objects.utils'
import { log } from '@ui-kit/lib/logging'
import { ReleaseChannel } from '@ui-kit/utils'
import { formatTimeDiff } from '@ui-kit/utils/time.utils'

export type SliceKey = keyof State | ''
export type StateKey = string

// prettier-ignore
export interface AppSlice {
  /** Hydrate resets states and refreshes store data from the API */
  hydrate: (config: Config, api: Api | undefined, prevApi: Api | undefined, wallet: Wallet | undefined, releaseChannel: ReleaseChannel) => Promise<void>

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => void
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => void
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean) => void
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => void
}

export const createAppSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): AppSlice => ({
  hydrate: async (_config, api, prevApi, _wallet) => {
    if (!api) return

    const { lendMarkets, signerAddress, chainId } = api
    const isNetworkSwitched = !!prevApi?.chainId && prevApi.chainId !== chainId
    const isUserSwitched = !!prevApi?.signerAddress && prevApi.signerAddress !== signerAddress
    const state = get()

    const start = new Date()
    log('Hydrating Lend', chainId, {
      chainId: [prevApi?.chainId, chainId],
      signerAddress: [prevApi?.signerAddress, signerAddress],
    })

    // reset store
    if (isNetworkSwitched) {
      recordEntries(get())
        .filter(([stateKey]) => stateKey.startsWith('loan') || stateKey.startsWith('user') || stateKey === 'chartBands')
        .filter(([, state]) => 'resetState' in state)
        .forEach(([, state]) => (state as { resetState: () => void }).resetState())
    }

    if (isUserSwitched || !signerAddress) {
      state.user.resetState()
    }
    await lendMarkets.fetchMarkets({ useApi: false })

    log(`Hydrated Lend - Complete in ${formatTimeDiff(start)}`)
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValues = state[sliceKey][key]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
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
        if (!lodash.isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #d4d700', value)
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
          if (!lodash.isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #55a630', value)
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
// HELPERS
