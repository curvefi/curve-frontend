import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormStatus, Order, SearchParams, SearchTermsResult } from '@/components/PageMarketList/types'

import chunk from 'lodash/chunk'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { DEFAULT_SEARCH_PARAMS, parseSearchTermResults } from '@/components/PageMarketList/utils'
import { SEARCH_TERM } from '@/hooks/useSearchTermMapper'
import { TITLE } from '@/constants'
import { searchByText } from '@/shared/curve-lib'
import { sleep } from '@/utils/helpers'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

type SliceState = {
  activeKey: string
  initialLoaded: false
  formStatus: FormStatus
  searchParams: SearchParams
  searchedByTokens: SearchTermsResult
  searchedByAddresses: SearchTermsResult
  result: { [activeKey: string]: string[] }
  showHideSmallPools: boolean
}

const sliceKey = 'collateralList'

// prettier-ignore
export type CollateralListSlice = {
  [sliceKey]: SliceState & {
    filterBySearchText(searchText: string, collateralData: CollateralData[]): CollateralData[]
    sortFn(rChainId: ChainId, sortKey: TitleKey, order: Order, collateralData: CollateralData[]): CollateralData[]
    setFormValues(rChainId: ChainId, curve: Curve | null, shouldRefetch?: boolean): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  initialLoaded: false,
  formStatus: DEFAULT_FORM_STATUS,
  searchParams: DEFAULT_SEARCH_PARAMS,
  searchedByTokens: {},
  searchedByAddresses: {},
  result: {},
  showHideSmallPools: false,
}

const createCollateralListSlice = (set: SetState<State>, get: GetState<State>): CollateralListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterBySearchText: (searchTerm, collateralDatas) => {
      const { ...sliceState } = get()[sliceKey]

      const { addressesResult, tokensResult } = searchByText(
        searchTerm,
        collateralDatas,
        [SEARCH_TERM['llamma.coins']],
        {
          tokens: [SEARCH_TERM['llamma.coinAddresses']],
          other: [SEARCH_TERM['llamma.address'], SEARCH_TERM['llamma.controller']],
        }
      )

      sliceState.setStateByKeys({
        searchedByTokens: parseSearchTermResults(tokensResult),
        searchedByAddresses: parseSearchTermResults(addressesResult),
      })

      return uniqBy([...tokensResult, ...addressesResult], (o) => o.item.llamma.id).map((r) => r.item)
    },
    sortFn: (rChainId, sortKey, order, collateralDatas) => {
      const { loans } = get()
      const loanMapper = loans.detailsMapper
      const userMapper = loans.userDetailsMapper

      if (sortKey === 'name') {
        return orderBy(collateralDatas, ({ llamma }) => llamma.collateralSymbol.toLowerCase(), [order])
      } else if (sortKey === 'myHealth') {
        return orderBy(collateralDatas, ({ llamma }) => +(userMapper[llamma.id]?.healthNotFull ?? '0'), [order])
      } else if (sortKey === 'myDebt') {
        return orderBy(collateralDatas, ({ llamma }) => +(userMapper[llamma.id]?.userState?.debt ?? '0'), [order])
      } else if (sortKey === 'rate') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanMapper[llamma.id]?.parameters?.rate ?? '0'), [order])
      } else if (sortKey === 'totalBorrowed') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanMapper[llamma.id]?.totalDebt ?? '0'), [order])
      } else if (sortKey === 'cap') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanMapper[llamma.id]?.capAndAvailable?.cap ?? '0'), [order])
      } else if (sortKey === 'available') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanMapper[llamma.id]?.capAndAvailable?.available ?? '0'), [
          order,
        ])
      } else if (sortKey === 'totalCollateral') {
        return orderBy(
          collateralDatas,
          ({ llamma }) => {
            const { totalCollateral, totalStablecoin } = loanMapper[llamma.id]
            const collateralUsdRate = get().usdRates.tokens[llamma.collateral]
            const totalCollateralUsd = Number(totalCollateral) * Number(collateralUsdRate)
            return totalCollateralUsd + Number(totalStablecoin ?? 0)  
          },
          [order]
        )
      }

      return collateralDatas
    },
    setFormValues: async (rChainId, curve) => {
      const { collaterals, storeCache } = get()
      let { formStatus, initialLoaded, result, searchParams, ...sliceState } = get()[sliceKey]

      let activeKey = getActiveKey(rChainId, searchParams)
      sliceState.setStateByKeys({
        activeKey,
        formStatus: { ...formStatus, noResult: false, isLoading: true },
        searchedByTokens: {},
        searchedByAddresses: {},
      })

      const collateralDatas = collaterals.collateralDatas[rChainId]

      if (!curve || !collateralDatas || (collateralDatas && collateralDatas?.length === 0)) return

      // allow UI to update paint
      await sleep(100)

      const { searchText, sortBy, sortByOrder } = searchParams
      let cCollateralDatas = [...collateralDatas]

      // searchText
      if (searchText) {
        cCollateralDatas = sliceState.filterBySearchText(searchText, cCollateralDatas)
      }

      // sort by table labels 'markets, borrow rate, total borrowed, cap...'
      if (sortBy) {
        cCollateralDatas = sliceState.sortFn(rChainId, sortBy, sortByOrder, cCollateralDatas)
      }

      // get collateral ids
      const newResult = cCollateralDatas.map((d) => d.llamma.id)

      // set result
      sliceState.setStateByActiveKey('result', activeKey, newResult)
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        noResult: newResult.length === 0,
        isLoading: false,
      })

      if (activeKey === `${rChainId}-${TITLE.totalBorrowed}-desc`) {
        storeCache.setStateByActiveKey('collateralList', activeKey, newResult)
      }

      if (!initialLoaded) sliceState.setStateByKey('initialLoaded', true)
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
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export function getActiveKey(chainId: ChainId, searchParams: SearchParams) {
  const { searchText, sortBy, sortByOrder } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${sortBy}-${sortByOrder}-${parsedSearchText}`
}

export default createCollateralListSlice
