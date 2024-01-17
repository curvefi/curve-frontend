import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'

import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  userBalancesMapper: UserBalancesMapper
  loading: boolean
}

const sliceKey = 'userBalances'

// prettier-ignore
export type UserBalancesSlice = {
  [sliceKey]: SliceState & {
    fetchUserBalancesByTokens(curve: CurveApi, addresses: string[]): Promise<UserBalancesMapper>
    fetchAllStoredBalances(curve: CurveApi): Promise<void>
    updateUserBalancesFromPool(tokens: UserBalancesMapper): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  userBalancesMapper: {},
  loading: false,
}

const createUserBalancesSlice = (set: SetState<State>, get: GetState<State>): UserBalancesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserBalancesByTokens: async (curve, tokensAddresses) => {
      const { chainId } = curve
      get()[sliceKey].setStateByKey('loading', true)

      // remove bad tokens
      const { excludeGetUserBalancesTokens } = networks[chainId]
      let filteredBadTokens = tokensAddresses
      if (excludeGetUserBalancesTokens.length) {
        filteredBadTokens = filter(tokensAddresses, (t) => excludeGetUserBalancesTokens.indexOf(t) === -1)
      }

      const results = await networks[chainId].api.wallet.fetchUserBalances(curve, filteredBadTokens)
      get()[sliceKey].setStateByKeys({
        userBalancesMapper: cloneDeep(mapUserBalances(results, get()[sliceKey].userBalancesMapper)),
        loading: false,
      })
      return results
    },
    fetchAllStoredBalances: async (curve) => {
      const tokenAddresses = Object.keys(get().userBalances.userBalancesMapper)
      await get().userBalances.fetchUserBalancesByTokens(curve, tokenAddresses)
    },
    updateUserBalancesFromPool: ({ gauge, lpToken, ...rest }) => {
      get().userBalances.setStateByKey('loading', true)

      let results: UserBalancesMapper = {}
      for (const tokenAddress in rest) {
        results[tokenAddress] = rest[tokenAddress]
      }

      get().userBalances.setStateByKeys({
        userBalancesMapper: cloneDeep(mapUserBalances(results, get().userBalances.userBalancesMapper)),
        loading: false,
      })
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

function mapUserBalances(updatedUserBalancesMapper: UserBalancesMapper, storedUserBalancesMapper: UserBalancesMapper) {
  let cUserBalancesMapper = cloneDeep(storedUserBalancesMapper)
  for (const tokenAddress in updatedUserBalancesMapper) {
    cUserBalancesMapper[tokenAddress] = updatedUserBalancesMapper[tokenAddress]
  }
  return cUserBalancesMapper
}

export function getUserBalancesStr(userBalancesMapper: UserBalancesMapper) {
  return Object.keys(userBalancesMapper)
    .filter((address) => +(userBalancesMapper[address] ?? '0') > 0)
    .reduce((str, address) => {
      const balance = userBalancesMapper[address] ?? ''
      str += balance.split('.')[0] ?? ''
      return str
    }, '')
}

export default createUserBalancesSlice
