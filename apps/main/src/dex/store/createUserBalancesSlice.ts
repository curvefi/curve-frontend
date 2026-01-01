import type { Address } from 'viem'
import type { Config } from 'wagmi'
import { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { CurveApi, UserBalancesMapper } from '@/dex/types/main.types'
import { fetchTokenBalance } from '@ui-kit/hooks/useTokenBalance'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  userBalancesMapper: UserBalancesMapper
  loading: boolean
}

const sliceKey = 'userBalances'

// prettier-ignore
export type UserBalancesSlice = {
  [sliceKey]: SliceState & {
    fetchUserBalancesByTokens(config: Config, curve: CurveApi, addresses: string[]): Promise<UserBalancesMapper>

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

export const createUserBalancesSlice = (
  _: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): UserBalancesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserBalancesByTokens: async (config, curve, tokensAddresses) => {
      const state = get()
      const sliceState = state[sliceKey]

      const storedUserBalancesMapper = sliceState.userBalancesMapper

      const { chainId, signerAddress } = curve

      if (!signerAddress) return {}

      sliceState.setStateByKey('loading', true)

      // This gets multicall batched by Wagmi and Viem internally
      const balances = await Promise.allSettled(
        tokensAddresses.map((token) =>
          fetchTokenBalance(config, {
            chainId,
            userAddress: signerAddress,
            tokenAddress: token as Address,
          }).then((balance) => [token, balance] as const),
        ),
      )

      balances.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Failed to fetch balance for token ${tokensAddresses[index]}:`, result.reason)
        }
      })

      const userBalancesMapper = Object.fromEntries(
        balances.filter((x) => x.status === 'fulfilled').map((x) => x.value),
      )

      sliceState.setStateByKeys({
        userBalancesMapper: { ...storedUserBalancesMapper, ...userBalancesMapper },
        loading: false,
      })

      return get()[sliceKey].userBalancesMapper
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
