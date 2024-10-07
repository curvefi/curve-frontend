import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'


type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokensImage: { [tokenAddress: string]: string | null }
}

const sliceKey = 'tokens'

export type TokensSlice = {
  [sliceKey]: SliceState & {
    setTokenImage: (tokenAddress: string, src: string | null) => void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  tokensImage: {},
}

const createTokensSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setTokenImage: (tokenAddress: string, src: string | null) => {
      get()[sliceKey].setStateByActiveKey('tokensImage', tokenAddress, src)
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

export default createTokensSlice
