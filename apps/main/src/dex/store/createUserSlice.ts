import lodash from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import { Balances, CurveApi } from '@/dex/types/main.types'
import { fulfilledValue, isValidAddress } from '@/dex/utils'
import { shortenAccount } from '@ui/utils'
import { fetchPoolTokenBalances } from '../hooks/usePoolTokenBalances'
import { fetchPoolGaugeTokenBalance, fetchPoolLpTokenBalance } from '../hooks/usePoolTokenDepositBalances'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

type SliceState = {
  userCrvApy: { [userPoolActiveKey: string]: { crvApy: number; boostApy: string } }
  userLiquidityUsd: { [userPoolActiveKey: string]: string }
  userShare: { [userPoolActiveKey: string]: Balances | null }
  userWithdrawAmounts: { [userPoolActiveKey: string]: string[] }
  loaded: boolean
  loading: boolean
  error: string
}

const sliceKey = 'user'

export type UserSlice = {
  [sliceKey]: SliceState & {
    fetchUserPoolInfo(
      config: Config,
      curve: CurveApi,
      poolId: string,
      isFetchWalletBalancesOnly?: boolean,
    ): Promise<Balances | void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  // use pool state
  userCrvApy: {},
  userLiquidityUsd: {},
  userShare: {},
  userWithdrawAmounts: {},
  loaded: false,
  loading: false,
  error: '',
}

export const createUserSlice = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserPoolInfo: async (config, curve, poolId, isFetchWalletBalancesOnly) => {
      let fetchedWalletBalances: Balances = {}

      try {
        // stored values
        const chainId = curve.chainId
        const userPoolActiveKey = getUserPoolActiveKey(curve, poolId)
        const storedPoolData = get().pools.poolsMapper[chainId][poolId]
        fetchedWalletBalances = await fetchPoolTokenBalances(config, curve, poolId)

        if (isFetchWalletBalancesOnly) {
          return fetchedWalletBalances
        }

        // get user pool info
        let liquidityUsd = ''
        let crvApy = 0
        let boostApy = ''
        let userShare = null
        let userWithdrawAmounts = [] as string[]

        const lpTokenBalance = await fetchPoolLpTokenBalance(config, curve, poolId)
        const gaugeTokenBalance = await fetchPoolGaugeTokenBalance(config, curve, poolId)

        if (+gaugeTokenBalance > 0 || +lpTokenBalance > 0) {
          const pool = storedPoolData.pool
          const [userPoolWithdrawResult, liquidityUsdResult, userShareResult, userCrvApyResult, userPoolBoostResult] =
            await Promise.allSettled([
              curvejsApi.wallet.userPoolBalances(pool),
              curvejsApi.wallet.userPoolLiquidityUsd(pool, curve.signerAddress),
              curvejsApi.wallet.userPoolShare(pool),
              curvejsApi.wallet.userPoolRewardCrvApy(pool, curve.signerAddress),
              chainId === 1 && isValidAddress(pool.gauge.address)
                ? curvejsApi.wallet.userPoolBoost(pool, curve.signerAddress)
                : Promise.resolve(''),
            ])

          liquidityUsd = fulfilledValue(liquidityUsdResult) ?? ''
          crvApy = fulfilledValue(userCrvApyResult) ?? 0
          boostApy = fulfilledValue(userPoolBoostResult) ?? ''
          userShare = fulfilledValue(userShareResult) ?? null
          userWithdrawAmounts = fulfilledValue(userPoolWithdrawResult) ?? []
        }

        get()[sliceKey].setStateByActiveKey('userCrvApy', userPoolActiveKey, { crvApy, boostApy })
        get()[sliceKey].setStateByActiveKey('userWithdrawAmounts', userPoolActiveKey, userWithdrawAmounts)
        get()[sliceKey].setStateByActiveKey('userShare', userPoolActiveKey, userShare)
        get()[sliceKey].setStateByActiveKey('userLiquidityUsd', userPoolActiveKey, liquidityUsd)
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('error', 'error-get-pool-wallet-balances')
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function getUserPoolActiveKey(curve: CurveApi, poolId: string) {
  return `${curve.chainId}-${shortenAccount(curve.signerAddress).toLowerCase()}-${poolId}`
}
