import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import { PromisePool } from '@supercharge/promise-pool'
import cloneDeep from 'lodash/cloneDeep'

import { log } from '@ui-kit/lib/logging'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  detailsMapper: { [collateralId: string]: Partial<LoanDetails> }
  existsMapper: { [collateralId: string]: LoanExists }
  priceInfoMapper: { [collateralId: string]: LoanPriceInfo }
  userDetailsMapper: { [collateralId: string]: UserLoanDetails }
  userWalletBalancesMapper: { [collateralId: string]: UserWalletBalances }
  userWalletBalancesLoading: boolean
}

const sliceKey = 'loans'

export type LoansSlice = {
  [sliceKey]: SliceState & {
    fetchLoansDetails(curve: Curve, collateralDatas: CollateralData[]): Promise<void>
    fetchLoanDetails(curve: Curve, llamma: Llamma): Promise<{ loanDetails: LoanDetails; loanExists: LoanExists }>
    fetchUserLoanWalletBalances(curve: Curve, llamma: Llamma): Promise<UserWalletBalances>
    fetchUserLoanDetails(curve: Curve, llamma: Llamma): Promise<UserLoanDetails>
    fetchUserLoanPartialDetails(curve: Curve, llamma: Llamma): Promise<Partial<UserLoanDetails>>
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
  existsMapper: {},
  priceInfoMapper: {},
  userDetailsMapper: {},
  userWalletBalancesMapper: {},
  userWalletBalancesLoading: false,
}

const createLoansSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchLoansDetails: async (curve: Curve, collateralDatas: CollateralData[]) => {
      const chainId = curve.chainId
      log('fetchLoansDetails', chainId, collateralDatas.map(({ llamma }) => llamma.id).join(','))

      // TODO: handle errors
      const { results } = await PromisePool.for(collateralDatas)
        .handleError((error, { llamma }) => {
          log(`Unable to get details ${llamma.id}, ${error}`)
        })
        .process(async ({ llamma }) =>
          Promise.all([
            networks[chainId].api.detailInfo.loanPartialInfo(llamma),
            networks[chainId].api.loanCreate.exists(llamma, curve.signerAddress),
          ]),
        )

      // mapper
      const loansDetailsMapper = cloneDeep(get()[sliceKey].detailsMapper ?? {})
      const loansExistsMapper = cloneDeep(get()[sliceKey].existsMapper ?? {})

      for (const idx in results) {
        const [{ collateralId, ...rest }, loanExists] = results[idx]
        loansDetailsMapper[collateralId] = rest
        loansExistsMapper[collateralId] = loanExists
      }

      get()[sliceKey].setStateByKey('detailsMapper', loansDetailsMapper)
      get()[sliceKey].setStateByKey('existsMapper', loansExistsMapper)
    },
    fetchLoanDetails: async (curve: Curve, llamma: Llamma) => {
      const chainId = curve.chainId
      const [{ collateralId, ...loanDetails }, priceInfo, loanExists] = await Promise.all([
        networks[chainId].api.detailInfo.loanInfo(llamma),
        networks[chainId].api.detailInfo.priceInfo(llamma),
        networks[chainId].api.loanCreate.exists(llamma, curve.signerAddress),
      ])

      const fetchedLoanDetails: LoanDetails = { ...loanDetails, priceInfo }

      get()[sliceKey].setStateByActiveKey('detailsMapper', collateralId, fetchedLoanDetails)
      get()[sliceKey].setStateByActiveKey('existsMapper', collateralId, loanExists)

      if (curve.signerAddress) {
        get()[sliceKey].fetchUserLoanWalletBalances(curve, llamma)

        if (loanExists.loanExists) {
          get()[sliceKey].fetchUserLoanDetails(curve, llamma)
        }
      }

      return { loanDetails: fetchedLoanDetails, loanExists }
    },
    fetchUserLoanWalletBalances: async (curve: Curve, llamma: Llamma) => {
      const chainId = curve.chainId
      const resp = await networks[chainId].api.detailInfo.userBalances(llamma)

      get()[sliceKey].setStateByKey('userWalletBalancesLoading', true)
      get()[sliceKey].setStateByActiveKey('userWalletBalancesMapper', llamma.id, resp)
      get()[sliceKey].setStateByKey('userWalletBalancesLoading', false)
      return resp
    },
    fetchUserLoanDetails: async (curve: Curve, llamma: Llamma) => {
      const chainId = curve.chainId
      const userLoanDetailsFn = networks[chainId].api.detailInfo.userLoanInfo
      const resp = await userLoanDetailsFn(llamma, curve.signerAddress)

      get()[sliceKey].setStateByActiveKey('userDetailsMapper', llamma.id, resp)
      return resp
    },
    fetchUserLoanPartialDetails: async (curve: Curve, llamma: Llamma) => {
      const chainId = curve.chainId
      const userLoanPartialInfoFn = networks[chainId].api.detailInfo.userLoanPartialInfo
      const resp = await userLoanPartialInfoFn(llamma, curve.signerAddress)

      get()[sliceKey].setStateByActiveKey('userDetailsMapper', llamma.id, resp)
      return resp
    },
    resetUserDetailsState: (llamma: Llamma) => {
      const clonedUserDetailsMapper = cloneDeep(get()[sliceKey].userDetailsMapper)
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
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createLoansSlice
