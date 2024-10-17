import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import cloneDeep from 'lodash/cloneDeep'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  estGas: {
    gas: number
    loading: boolean
  }
}

const sliceKey = 'scrvusd'

export type ScrvUsdSlice = {
  [sliceKey]: SliceState & {
    checkApproval: {
      depositApprove: (chainId: ChainId, amount: number) => void
    }
    estimateGas: {
      depositApprove: (amount: number) => void
    }

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  estGas: {
    gas: 0,
    loading: true,
  },
}

const createScrvUsdSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    estimateGas: {
      depositApprove: async (amount: number) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, loading: true })

        const lendApi = get().lendApi
        const curve = get().curve
        const fetchGasInfo = get().gas.fetchGasInfo

        if (!curve) return

        await fetchGasInfo(curve)

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.depositApprove(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, loading: false })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, loading: false })
        }
      },
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

export default createScrvUsdSlice
