import type { GetState, SetState } from 'zustand'
import type { State } from '@/dex/store/useStore'

import { shortenAccount } from '@ui/utils'
import { t } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'

import { fulfilledValue, isValidAddress } from '@/dex/utils'
import curvejsApi from '@/dex/lib/curvejs'
import { Balances, CurveApi, ChainId, UserPoolListMapper } from '@/dex/types/main.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  poolList: { [userActiveKey: string]: UserPoolListMapper }
  poolListLoaded: boolean
  poolListError: string
  userCrvApy: { [userPoolActiveKey: string]: { crvApy: number; boostApy: string } }
  userLiquidityUsd: { [userPoolActiveKey: string]: string }
  userShare: { [userPoolActiveKey: string]: Balances | null }
  userWithdrawAmounts: { [userPoolActiveKey: string]: string[] }
  walletBalances: { [userPoolActiveKey: string]: Balances }
  walletBalancesLoading: boolean
  loaded: boolean
  loading: boolean
  error: string
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    fetchUserPoolList(curve: CurveApi): Promise<UserPoolListMapper>
    fetchUserPoolInfo(curve: CurveApi, poolId: string, isFetchWalletBalancesOnly?: boolean): Promise<Balances>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  poolList: {},
  poolListLoaded: false,
  poolListError: '',

  // use pool state
  userCrvApy: {},
  userLiquidityUsd: {},
  userShare: {},
  userWithdrawAmounts: {},
  walletBalances: {},
  walletBalancesLoading: false,
  loaded: false,
  loading: false,
  error: '',
}

const createUserSlice = (set: SetState<State>, get: GetState<State>): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserPoolList: async (curve) => {
      const chainId: ChainId = curve.chainId
      const userActiveKey = getUserActiveKey(curve)
      let parsedUserPoolList: { [poolId: string]: boolean } = {}

      try {
        get()[sliceKey].setStateByKeys({
          poolListLoaded: false,
          poolListError: '',
        })

        const { poolList } = await curvejsApi.wallet.getUserPoolList(curve, curve.signerAddress)

        // parse user pool list
        for (const poolId of poolList) {
          parsedUserPoolList[poolId] = true
        }

        get()[sliceKey].setStateByActiveKey('poolList', userActiveKey, parsedUserPoolList)
        get()[sliceKey].setStateByKey('poolListLoaded', true)
        return parsedUserPoolList
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByActiveKey('poolList', userActiveKey, {})
        get()[sliceKey].setStateByKeys({
          poolListLoaded: true,
          poolListError: t`Unable to get pools`,
        })
        return parsedUserPoolList
      }
    },
    fetchUserPoolInfo: async (curve, poolId, isFetchWalletBalancesOnly) => {
      let fetchedWalletBalances: Balances = {}

      try {
        // stored values
        const chainId = curve.chainId
        const userPoolActiveKey = getUserPoolActiveKey(curve, poolId)
        const storedPoolData = get().pools.poolsMapper[chainId][poolId]

        // get user wallet balances for pool
        get()[sliceKey].setStateByKey('walletBalancesLoading', true)
        fetchedWalletBalances = await curvejsApi.wallet.poolWalletBalances(curve, poolId)
        get()[sliceKey].setStateByActiveKey('walletBalances', userPoolActiveKey, fetchedWalletBalances)
        get()[sliceKey].setStateByKey('walletBalancesLoading', false)

        // set wallet balances into tokens state
        get().userBalances.updateUserBalancesFromPool(fetchedWalletBalances)

        if (isFetchWalletBalancesOnly) {
          return fetchedWalletBalances
        }

        // get user pool info
        let liquidityUsd = ''
        let crvApy = 0
        let boostApy = ''
        let userShare = null
        let userWithdrawAmounts = [] as string[]

        if (+fetchedWalletBalances.gauge > 0 || +fetchedWalletBalances.lpToken > 0) {
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

        return fetchedWalletBalances
      } catch (error) {
        get()[sliceKey].setStateByKey('error', 'error-get-pool-wallet-balances')
        return fetchedWalletBalances
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

export function getUserActiveKey(curve: CurveApi | undefined | null) {
  return curve ? `${curve.chainId}-${shortenAccount(curve.signerAddress).toLowerCase()}` : ''
}
export function getUserPoolActiveKey(curve: CurveApi, poolId: string) {
  return `${curve.chainId}-${shortenAccount(curve.signerAddress).toLowerCase()}-${poolId}`
}

export default createUserSlice
