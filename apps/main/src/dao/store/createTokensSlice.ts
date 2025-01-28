import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokensImage: { [tokenAddress: string]: string | null }
  loading: boolean
}

const sliceKey = 'tokens'

// prettier-ignore
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
  loading: true,
}

const createTokensSlice = (set: SetState<State>, get: GetState<State>): TokensSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setTokenImage: (tokenAddress, src) => {
      get()[sliceKey].setStateByActiveKey('tokensImage', tokenAddress, src)
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

export default createTokensSlice
