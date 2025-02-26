import type { GetState, SetState } from 'zustand'
import type { State } from '@/loan/store/useStore'
import { CONNECT_STAGE, ConnectState } from '@ui/utils'
import produce from 'immer'
import { ethers, Contract, ContractRunner } from 'ethers'
import { Interface } from '@ethersproject/abi'
import { log } from '@/loan/utils/helpers'
import isEqual from 'lodash/isEqual'
import { Curve, LendApi, Wallet } from '@/loan/types/loan.types'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type SliceState = {
  curve: Curve | null
  connectState: ConnectState
  lendApi: LendApi | null
  isLoadingApi: false
  isLoadingLendApi: false
  isLoadingCurve: true
  isMobile: boolean
  isPageVisible: boolean
  scrollY: number
}

// prettier-ignore
export interface AppSlice extends SliceState {
  getContract(jsonModuleName: string, contractAddress: string, provider: ContractRunner): Promise<ethers.Contract | null>
  updateConnectState(status?: ConnectState['status'], stage?: ConnectState['stage'], options?: ConnectState['options']): void
  updateCurveJs(curve: Curve, prevCurveApi: Curve | null, wallet: Wallet | null): Promise<void>
  updateLendApi(lendApi: LendApi, prevLendApi: LendApi | null, wallet: Wallet | null): Promise<void>
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  curve: null,
  connectState: { status: '', stage: '' },
  lendApi: null,
  isLoadingApi: false,
  isLoadingCurve: true,
  isLoadingLendApi: false,
  isMobile: false,
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
  updateConnectState: (status = 'loading', stage = CONNECT_STAGE.CONNECT_WALLET, options = ['']) => {
    set({ connectState: { status, stage, ...(options && { options }) } })
  },
  updateCurveJs: async (curveApi: Curve, prevCurveApi: Curve | null, wallet: Wallet | null) => {
    const { gas, loans, usdRates, ...state } = get()

    const isNetworkSwitched = !!prevCurveApi?.chainId && prevCurveApi.chainId !== curveApi.chainId
    const isUserSwitched = !!prevCurveApi?.signerAddress && prevCurveApi.signerAddress !== curveApi.signerAddress
    log('updateCurveJs', curveApi?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isUserSwitched || !curveApi.signerAddress) {
      loans.setStateByKey('userWalletBalancesMapper', {})
      loans.setStateByKey('userDetailsMapper', {})
    }

    // update network settings from api
    state.updateGlobalStoreByKey('curve', curveApi)
    state.updateGlobalStoreByKey('isLoadingCurve', false)

    // get collateral list
    const { collateralDatas } = await get().collaterals.fetchCollaterals(curveApi)
    await loans.fetchLoansDetails(curveApi, collateralDatas)

    if (!prevCurveApi || isNetworkSwitched) {
      usdRates.fetchAllStoredUsdRates(curveApi)
    }

    state.updateGlobalStoreByKey('isLoadingApi', false)
  },
  updateLendApi: async (lendApi: LendApi, prevLendApi: LendApi | null, wallet: Wallet | null) => {
    const { gas, loans, usdRates, ...state } = get()

    const isNetworkSwitched = !!prevLendApi?.chainId && prevLendApi.chainId !== lendApi.chainId
    const isUserSwitched = !!prevLendApi?.signerAddress && prevLendApi.signerAddress !== lendApi.signerAddress
    log('updateLendApi', lendApi?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isUserSwitched || !lendApi.signerAddress) {
      loans.setStateByKey('userWalletBalancesMapper', {})
      loans.setStateByKey('userDetailsMapper', {})
    }

    // update network settings from api
    state.updateGlobalStoreByKey('lendApi', lendApi)
    state.updateGlobalStoreByKey('isLoadingLendApi', false)
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
