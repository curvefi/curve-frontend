import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokensImage: { [tokenAddress: string]: string | null }
  tokensNameMapper: { [chainId: string]: TokensNameMapper }
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
  tokensNameMapper: {},
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

export function getTokensMapperStr(tokensMapper: TokensMapper | undefined) {
  return Object.keys(tokensMapper ?? {}).reduce((str, tokenAddress) => {
    str += tokenAddress.charAt(5)
    return str
  }, '')
}

export default createTokensSlice
