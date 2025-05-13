import { Contract, ContractRunner, ethers } from 'ethers'
import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import { type State } from '@/loan/store/useStore'
import { type LlamaApi, Wallet } from '@/loan/types/loan.types'
import { log } from '@/loan/utils/helpers'
import { Interface } from '@ethersproject/abi'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type SliceState = {
  isPageVisible: boolean
  scrollY: number
}

// prettier-ignore
export interface AppSlice extends SliceState {
  getContract(jsonModuleName: string, contractAddress: string, provider: ContractRunner): Promise<ethers.Contract | null>
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(curve: LlamaApi | null, prevCurveApi: LlamaApi | null, wallet: Wallet | null): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  isPageVisible: true,
  scrollY: 0,
}

const createAppSlice = (set: SetState<State>, get: GetState<State>): AppSlice => ({
  ...DEFAULT_STATE,

  getContract: async (jsonModuleName, contractAddress, provider) => {
    try {
      const abi = await import(`@/loan/abis/${jsonModuleName}.json`).then((module) => module.default)

      if (!abi) throw new Error(`Unable to get abi ${jsonModuleName}`)

      const iface = new Interface(abi)
      return new Contract(contractAddress, iface.format(), provider)
    } catch (error) {
      console.error(error)
      return null
    }
  },
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      }),
    )
  },

  hydrate: async (curveApi, prevCurveApi, wallet) => {
    if (!curveApi) return

    const { loans, usdRates, campaigns, collaterals } = get()

    const isNetworkSwitched = !!prevCurveApi?.chainId && prevCurveApi.chainId !== curveApi.chainId
    const isUserSwitched = !!prevCurveApi?.signerAddress && prevCurveApi.signerAddress !== curveApi.signerAddress
    log('Hydrate crvUSD', curveApi?.chainId, {
      wallet: wallet?.chainId ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset stores
    if (isUserSwitched || !curveApi.signerAddress) {
      loans.setStateByKey('userWalletBalancesMapper', {})
      loans.setStateByKey('userDetailsMapper', {})
    }

    // Check if curveApi is actually a Curve instance and not a LendingApi
    const { collateralDatas } = await collaterals.fetchCollaterals(curveApi)
    await loans.fetchLoansDetails(curveApi, collateralDatas)

    if (!prevCurveApi || isNetworkSwitched) {
      campaigns.initCampaignRewards(curveApi.chainId)
      void usdRates.fetchAllStoredUsdRates(curveApi)
    }

    log('Hydrate crvUSD - Complete')
  },

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
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
            log(`%c state: ${key}`, 'background: #222; color: #d4d700', value)
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
              log(`%c state: ${key}`, 'background: #222; color: #55a630', value)
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

export default createAppSlice

// HELPERS
