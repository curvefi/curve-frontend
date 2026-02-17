import lodash from 'lodash'
import { StoreApi } from 'zustand'
import { refetchLoanExists } from '@/llamalend/queries/user'
import { invalidateMarketRates } from '@/llamalend/queries/market-rates'
import { networks } from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import {
  type ChainId,
  LlamaApi,
  Llamma,
  LoanDetails,
  LoanPriceInfo,
  UserLoanDetails,
  UserWalletBalances,
} from '@/loan/types/loan.types'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { PromisePool } from '@supercharge/promise-pool'
import { log } from '@ui-kit/lib/logging'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  detailsMapper: { [collateralId: string]: Partial<LoanDetails> }
  priceInfoMapper: { [collateralId: string]: LoanPriceInfo }
  userDetailsMapper: { [collateralId: string]: UserLoanDetails }
  userWalletBalancesMapper: { [collateralId: string]: UserWalletBalances }
  userWalletBalancesLoading: boolean
}

const sliceKey = 'loans'

export type LoansSlice = {
  [sliceKey]: SliceState & {
    fetchLoansDetails(curve: LlamaApi, markets: MintMarketTemplate[]): Promise<void>
    fetchLoanDetails(curve: LlamaApi, llamma: Llamma): Promise<{ loanDetails: LoanDetails; loanExists: boolean }>
    fetchUserLoanWalletBalances(curve: LlamaApi, llamma: Llamma): Promise<UserWalletBalances>
    fetchUserLoanDetails(curve: LlamaApi, llamma: Llamma): Promise<UserLoanDetails>
    resetUserDetailsState(llamma: Llamma): void

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  detailsMapper: {},
  priceInfoMapper: {},
  userDetailsMapper: {},
  userWalletBalancesMapper: {},
  userWalletBalancesLoading: false,
}

export const createLoansSlice = (_: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchLoansDetails: async (curve: LlamaApi, markets: MintMarketTemplate[]) => {
      const chainId = curve.chainId as ChainId
      log('fetchLoansDetails', chainId, markets.map((market) => market.id).join(','))

      // TODO: handle errors
      const { results } = await PromisePool.for(markets)
        .handleError((error, market) => {
          log(`Unable to get details ${market.id}, ${error}`)
        })
        .process(async (market) => Promise.all([networks[chainId].api.detailInfo.loanPartialInfo(market)]))

      // mapper
      const loansDetailsMapper = lodash.cloneDeep(get()[sliceKey].detailsMapper ?? {})

      for (const idx in results) {
        const [{ collateralId, ...rest }] = results[idx]
        loansDetailsMapper[collateralId] = rest
      }

      get()[sliceKey].setStateByKey('detailsMapper', loansDetailsMapper)
    },
    fetchLoanDetails: async (curve: LlamaApi, llamma: Llamma) => {
      const chainId = curve.chainId as ChainId

      get()[sliceKey].setStateByActiveKey('detailsMapper', llamma.id, {
        ...get()[sliceKey].detailsMapper[llamma.id],
        loading: true,
      })

      const [{ collateralId, ...loanDetails }, priceInfo, loanExists] = await Promise.all([
        networks[chainId].api.detailInfo.loanInfo(llamma),
        networks[chainId].api.detailInfo.priceInfo(llamma),
        refetchLoanExists({ chainId, marketId: llamma.id, userAddress: curve.signerAddress }),
      ])

      // invalidate market rates in case the user is using legacy action info, to keep position detail and market detail components in sync
      await invalidateMarketRates({ chainId, marketId: llamma.id })

      const fetchedLoanDetails: LoanDetails = { ...loanDetails, priceInfo, loading: false }

      get()[sliceKey].setStateByActiveKey('detailsMapper', collateralId, fetchedLoanDetails)

      if (curve.signerAddress) {
        void get()[sliceKey].fetchUserLoanWalletBalances(curve, llamma)

        if (loanExists) {
          void get()[sliceKey].fetchUserLoanDetails(curve, llamma)
        }
      }

      return { loanDetails: fetchedLoanDetails, loanExists }
    },
    fetchUserLoanWalletBalances: async (curve: LlamaApi, llamma: Llamma) => {
      const chainId = curve.chainId as ChainId
      const resp = await networks[chainId].api.detailInfo.userBalances(llamma)

      get()[sliceKey].setStateByKey('userWalletBalancesLoading', true)
      get()[sliceKey].setStateByActiveKey('userWalletBalancesMapper', llamma.id, resp)
      get()[sliceKey].setStateByKey('userWalletBalancesLoading', false)
      return resp
    },
    fetchUserLoanDetails: async (curve: LlamaApi, llamma: Llamma) => {
      const chainId = curve.chainId as ChainId
      const userLoanDetailsFn = networks[chainId].api.detailInfo.userLoanInfo

      get()[sliceKey].setStateByActiveKey('userDetailsMapper', llamma.id, {
        ...get()[sliceKey].userDetailsMapper[llamma.id],
        loading: true,
      })

      const resp = await userLoanDetailsFn(llamma, curve.signerAddress)

      get()[sliceKey].setStateByActiveKey('userDetailsMapper', llamma.id, {
        ...resp,
        loading: false,
      })
      return { ...resp, loading: false }
    },
    resetUserDetailsState: (llamma: Llamma) => {
      const clonedUserDetailsMapper = lodash.cloneDeep(get()[sliceKey].userDetailsMapper)
      delete clonedUserDetailsMapper[llamma.id]
      get()[sliceKey].setStateByKey('userDetailsMapper', clonedUserDetailsMapper)
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, lodash.cloneDeep(DEFAULT_STATE))
    },
  },
})
