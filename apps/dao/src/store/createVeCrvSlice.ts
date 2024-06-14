import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { WalletState } from '@web3-onboard/core'

import { Contract, formatEther } from 'ethers'
import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  veCrvFees: VeCrvFee[]
  veCrvFetchStatus: FetchingState
}

const sliceKey = 'vecrv'

// prettier-ignore
export type VeCrvSlice = {
  [sliceKey]: SliceState & {
    getVeCrvFees(): Promise<void>
    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  veCrvFees: [],
  veCrvFetchStatus: 'LOADING',
}

const createVeCrvSlice = (set: SetState<State>, get: GetState<State>): VeCrvSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getVeCrvFees: async () => {
      if (get()[sliceKey].veCrvFees.length > 0) {
        get()[sliceKey].setStateByKey('veCrvFetchStatus', 'SUCCESS')
        return
      }

      get()[sliceKey].setStateByKey('veCrvFetchStatus', 'LOADING')

      try {
        let page = 1
        let results: VeCrvFee[] = []

        while (true) {
          const veCrvFeesRes = await fetch(
            `https://prices.curve.fi/v1/dao/fees/distributions?page=${page}&per_page=100`
          )
          const data: VeCrvFeesRes = await veCrvFeesRes.json()
          results = results.concat(data.distributions)
          if (data.distributions.length < 100) {
            break
          }
          page++
        }

        get()[sliceKey].setStateByKey('veCrvFees', results)
        get()[sliceKey].setStateByKey('veCrvFetchStatus', 'SUCCESS')
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('veCrvFetchStatus', 'ERROR')
      }
    },
    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createVeCrvSlice
