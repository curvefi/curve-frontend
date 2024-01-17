import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormStatus, FormValues, Order, SortKey } from '@/components/PageMarketList/types'

import Fuse from 'fuse.js'
import chunk from 'lodash/chunk'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import endsWith from 'lodash/endsWith'
import orderBy from 'lodash/orderBy'

import { isStartPartOrEnd, parsedSearchTextToList } from '@/components/PageMarketList/utils'
import { sleep } from '@/utils/helpers'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  filterKey: 'all',
  searchText: '',
  sortBy: 'totalBorrowed',
  sortByOrder: 'desc',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

type SliceState = {
  activeKey: string
  formValues: FormValues
  formStatus: FormStatus
  result: { [activeKey: string]: string[] }
  showHideSmallPools: boolean
}

const sliceKey = 'collateralList'

export type CollateralListSlice = {
  [sliceKey]: SliceState & {
    filterBySearchText(searchText: string, poolDatas: CollateralDataCacheOrApi[]): CollateralDataCacheOrApi[]
    sortFn(
      sortKey: SortKey,
      order: Order,
      collateralDataCacheOrApi: CollateralDataCacheOrApi[],
      loanDetailsMapper: LoanDetailsMapper
    ): CollateralDataCacheOrApi[]
    setFormValues(
      rChainId: ChainId,
      formValues: Partial<FormValues>,
      collateralDataCacheOrApi: CollateralDataCacheOrApi[],
      loansDetailsMapper: LoanDetailsMapper
    ): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formValues: DEFAULT_FORM_VALUES,
  formStatus: DEFAULT_FORM_STATUS,
  result: {},
  showHideSmallPools: false,
}

const createCollateralListSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterBySearchText: (searchText: string, collateralDatas: CollateralDataCacheOrApi[]) => {
      let parsedSearchText = searchText.toLowerCase().trim()

      let results: { searchTerm: string; results: CollateralDataCacheOrApi[] } = {
        searchTerm: '',
        results: [],
      }

      // search by tokens or token addresses
      const searchTextByList = parsedSearchTextToList(parsedSearchText)

      const filteredByTokensAndTokenAddresses = collateralDatas.filter(({ llamma }) => {
        return (
          differenceWith(searchTextByList, llamma.collateralSymbol.toLowerCase(), (parsedSearchText, token) =>
            isStartPartOrEnd(parsedSearchText, token)
          ).length === 0 ||
          differenceWith(searchTextByList, llamma.collateral, (parsedSearchText, tokenAddress) =>
            isStartPartOrEnd(parsedSearchText, tokenAddress)
          ).length === 0
        )
      })

      if (filteredByTokensAndTokenAddresses.length > 0) {
        results.searchTerm = parsedSearchText
        results.results = filteredByTokensAndTokenAddresses

        get()[sliceKey].setStateByKey('formValues', {
          ...get()[sliceKey].formValues,
          searchTextBy: 'tokens',
        })
      } else {
        // search by pool name, address, lpToken and gauge
        const fuse = new Fuse<CollateralDataCacheOrApi>(collateralDatas, {
          ignoreLocation: true,
          threshold: 0.01,
          keys: ['pool.address', 'pool.name', 'pool.gauge', 'pool.lpToken'],
        })
        const result = fuse.search(parsedSearchText)
        let filteredByOther = result.map((r) => r.item)

        if (result.length === 0) {
          filteredByOther = collateralDatas.filter((item) => {
            return endsWith(item.llamma.collateral, parsedSearchText)
          })

          if (filteredByOther.length === 0) {
            // increase threshold to allow more results
            const fuse = new Fuse<CollateralDataCacheOrApi>(collateralDatas, {
              ignoreLocation: true,
              threshold: 0.08,
              findAllMatches: true,
              useExtendedSearch: true,
              keys: ['pool.name', 'tokensAll'],
            })

            let extendedSearchText = ''
            const parsedSearchTextSplit = parsedSearchText.split(' ')
            for (const idx in parsedSearchTextSplit) {
              const word = parsedSearchTextSplit[idx]
              extendedSearchText = `${extendedSearchText} '${word}`
            }
            const result = fuse.search(extendedSearchText)
            if (result.length > 0) {
              filteredByOther = result.map((r) => r.item)
            }
          }
        }
        results.searchTerm = parsedSearchText
        results.results = filteredByOther
        get()[sliceKey].setStateByKey('formValues', {
          ...get()[sliceKey].formValues,
          searchTextBy: 'other',
        })
      }

      if (results.searchTerm === parsedSearchText) {
        return results.results
      } else {
        return [] as CollateralDataCacheOrApi[]
      }
    },
    sortFn: (
      sortKey: SortKey,
      order: Order,
      collateralDatas: CollateralDataCacheOrApi[],
      loanDetailsMapper: LoanDetailsMapper
    ) => {
      const userLoanDetailsMapper = get().loans.userDetailsMapper
      if (sortKey === 'name') {
        return orderBy(collateralDatas, ({ llamma }) => llamma.collateralSymbol.toLowerCase(), [order])
      } else if (sortKey === 'myHealth') {
        return orderBy(collateralDatas, ({ llamma }) => +(userLoanDetailsMapper[llamma.id]?.healthNotFull ?? '0'), [
          order,
        ])
      } else if (sortKey === 'myDebt') {
        return orderBy(collateralDatas, ({ llamma }) => +(userLoanDetailsMapper[llamma.id]?.userState?.debt ?? '0'), [
          order,
        ])
      } else if (sortKey === 'rate') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanDetailsMapper[llamma.id]?.parameters?.rate ?? '0'), [
          order,
        ])
      } else if (sortKey === 'totalBorrowed') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanDetailsMapper[llamma.id]?.totalDebt ?? '0'), [order])
      } else if (sortKey === 'cap') {
        return orderBy(collateralDatas, ({ llamma }) => +(loanDetailsMapper[llamma.id]?.capAndAvailable?.cap ?? '0'), [
          order,
        ])
      } else if (sortKey === 'available') {
        return orderBy(
          collateralDatas,
          ({ llamma }) => +(loanDetailsMapper[llamma.id]?.capAndAvailable?.available ?? '0'),
          [order]
        )
      } else if (sortKey === 'totalCollateral') {
        return orderBy(
          collateralDatas,
          ({ llamma }) => {
            const { totalCollateral, totalStablecoin } = loanDetailsMapper[llamma.id]
            const collateralUsdRate = get().usdRates.tokens[llamma.collateral]
            const totalCollateralUsd = Number(totalCollateral) * Number(collateralUsdRate)
            return totalCollateralUsd + Number(totalStablecoin) ?? 0
          },
          [order]
        )
      }

      return collateralDatas
    },
    setFormValues: async (
      rChainId: ChainId,
      formValues: Partial<FormValues>,
      collateralDataCacheOrApi: CollateralDataCacheOrApi[],
      loansDetailsMapper: { [collateralId: string]: LoanDetails }
    ) => {
      const storedActiveKey = get()[sliceKey].activeKey
      const storedFormValues = get()[sliceKey].formValues

      // update form values
      let clonedFormValues = { ...cloneDeep(storedFormValues), ...formValues }

      const activeKey = getActiveKey(rChainId, clonedFormValues)
      const storedActiveKeyChainId = storedActiveKey ? storedActiveKey.split('-')[0] : ''
      const chainIdSwitched = storedActiveKeyChainId !== rChainId.toString()

      if (chainIdSwitched) {
        clonedFormValues = cloneDeep(DEFAULT_FORM_VALUES)
      }

      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: clonedFormValues,
        formStatus: {
          ...get()[sliceKey].formStatus,
          noResult: false,
          isLoading: true,
        },
      })

      // set result value while getting new filter list
      let loadingResult: string[] = []
      if (get()[sliceKey].result[activeKey]) {
        loadingResult = get()[sliceKey].result[activeKey]
      }
      get()[sliceKey].setStateByActiveKey('result', activeKey, loadingResult.length ? loadingResult : undefined)

      // allow UI to update paint
      await sleep(100)

      const { searchText, sortBy } = clonedFormValues
      let tableCollateralDatas = cloneDeep(collateralDataCacheOrApi)

      // searchText
      if (searchText) {
        tableCollateralDatas = get()[sliceKey].filterBySearchText(searchText, tableCollateralDatas)
      }

      // sort by table labels 'markets, borrow rate, total borrowed, cap...'
      if (sortBy) {
        tableCollateralDatas = get()[sliceKey].sortFn(
          sortBy,
          clonedFormValues.sortByOrder,
          tableCollateralDatas,
          loansDetailsMapper
        )
      }

      // get collateral ids
      const result: string[] = []
      for (const idx in tableCollateralDatas) {
        const collateralData = tableCollateralDatas[idx]
        result.push(collateralData.llamma.id)
      }

      // set result
      get()[sliceKey].setStateByActiveKey('result', activeKey, result)
      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        noResult: chainIdSwitched ? false : result.length === 0,
        isLoading: chainIdSwitched,
      })
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
    resetState: (chainId: ChainId) => {
      const storedResult = get()[sliceKey].result
      const formValues = cloneDeep(DEFAULT_FORM_VALUES)
      const activeKey = getActiveKey(chainId, formValues)
      get().resetAppState(sliceKey, {
        ...get()[sliceKey],
        formValues,
        activeKey,
        result: {
          [activeKey]: storedResult[activeKey],
        },
      })
    },
  },
})

export function getCollateralDatasCached(collateralDatasMapperCached: CollateralDataCacheMapper | undefined) {
  const collateralDatasCached: CollateralDataCache[] = []

  if (collateralDatasMapperCached) {
    for (const key in collateralDatasMapperCached) {
      collateralDatasCached.push(collateralDatasMapperCached[key])
    }
  }

  return collateralDatasCached
}

function getActiveKey(chainId: ChainId, formValues: FormValues) {
  const { filterKey, searchText, sortBy, sortByOrder } = formValues
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${filterKey}-${parsedSearchText}-${sortBy}-${sortByOrder}`
}

export default createCollateralListSlice
