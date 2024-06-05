import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  FilterTypeKey,
  FormStatus,
  MarketListItem,
  MarketListMapper,
  MarketListToken,
  Order,
  SearchParams,
  SortKey,
  TableRowSettings,
} from '@/components/PageMarketList/types'

import chunk from 'lodash/chunk'
import cloneDeep from 'lodash/cloneDeep'
import orderBy from 'lodash/orderBy'
import sortByFn from 'lodash/sortBy'

import { _searchByTokensAddresses } from '@/components/PageMarketList/utils'
import { helpers } from '@/lib/apiLending'
import { sleep } from '@/utils/helpers'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

// isTableRowOpen
type SliceState = {
  activeKey: string
  marketListMapper: { [chainId: string]: MarketListMapper }
  tableRowsSettings: { [tokenAddress: string]: TableRowSettings }
  formStatus: FormStatus
  searchTextByTokensAndAddresses: { [activeKey: string]: { [address: string]: boolean } }
  searchTextByOther: { [activeKey: string]: { [address: string]: boolean } }
  result: { [activeKey: string]: MarketListItem[] }
  resultTokenList: { [activeKey: string]: MarketListToken[] }
  showHideSmallPools: boolean
  tokenSearchParams: { [tableRowTokenAddress: string]: { sortBy: SortKey; sortByOrder: Order } }
  tokenResult: { [tableRowTokenAddress: string]: { long: string[]; short: string[] } }
}

const sliceKey = 'marketList'

// prettier-ignore
export type MarketListSlice = {
  [sliceKey]: SliceState & {
    filterSmallMarkets(api: Api, owmDatas: OWMData[]): OWMData[]
    filterBySearchText(searchText: string, owmDatas: OWMData[]): OWMData[]
    filterUserList(api: Api, owmDatas: OWMData[], filterTypeKey: FilterTypeKey): OWMData[]
    sortFn(api: Api, sortKey: SortKey, order: Order, owmDatas: OWMData[]): OWMData[]
    setFormValues(rChainId: ChainId, api: Api | null, searchParams: SearchParams, shouldRefetch?: boolean): Promise<void>
    sortTableRow(rChainId: ChainId, api: Api | null, searchParams: SearchParams, tableRowTokenAddress: string): Promise<void>
    updateTableRowSettings(rChainId: ChainId, api: Api | null, searchParams: SearchParams, tokenAddress: string, updatedSettings: Partial<TableRowSettings>): void
    updateTableRowsSettings(searchParams: Partial<SearchParams>): void

    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  marketListMapper: {},
  tableRowsSettings: {},
  formStatus: DEFAULT_FORM_STATUS,
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  result: {},
  resultTokenList: {},
  showHideSmallPools: false,
  tokenSearchParams: {},
  tokenResult: {},
}

const createMarketListSlice = (set: SetState<State>, get: GetState<State>): MarketListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterSmallMarkets: (api, owmDatas) => {
      const { chainId } = api
      const capAndAvailableMapper = get().markets.statsCapAndAvailableMapper[chainId] ?? {}
      const usdRatesMapper = get().usdRates.tokens
      const { smallMarketAmount, marketListShowOnlyInSmallMarkets } = networks[chainId]
      return owmDatas.filter(({ owm }) => {
        const { cap } = capAndAvailableMapper[owm.id] ?? {}
        const token = owm.borrowed_token
        const usdRate = usdRatesMapper[token.address]
        if (typeof usdRate === 'undefined') return true
        if (marketListShowOnlyInSmallMarkets[owm.id]) return false
        return +cap * +usdRate > smallMarketAmount
      })
    },
    filterBySearchText: (searchText, owmDatas) => {
      let parsedSearchText = searchText.toLowerCase().trim()

      let results: { searchTerm: string; results: OWMData[] } = {
        searchTerm: '',
        results: [],
      }

      const searchByTokensAddressesResult = _searchByTokensAddresses(parsedSearchText, searchText, owmDatas)
      results.searchTerm = parsedSearchText
      results.results = searchByTokensAddressesResult

      if (results.searchTerm !== parsedSearchText) {
        results.results = []
      }
      return results.results
    },
    sortFn: (api, sortKey, order, owmDatas) => {
      const { chainId } = api

      if (sortKey === 'name') {
        return orderBy(owmDatas, ({ owm }) => owm?.collateral_token.symbol.toLowerCase(), [order])
      } else if (sortKey === 'rateBorrow') {
        const ratesMapper = get().markets.ratesMapper[chainId] ?? {}
        return orderBy(owmDatas, ({ owm }) => +(ratesMapper?.[owm.id]?.rates?.borrowApy ?? '0'), [order])
      } else if (sortKey === 'rateLend') {
        const ratesMapper = get().markets.ratesMapper[chainId] ?? {}
        return orderBy(owmDatas, ({ owm }) => +(ratesMapper?.[owm.id]?.rates?.lendApy ?? '0'), [order])
      } else if (sortKey === 'available') {
        const statsCapAndAvailableMapper = get().markets.statsCapAndAvailableMapper[chainId] ?? {}
        return orderBy(owmDatas, ({ owm }) => +(statsCapAndAvailableMapper[owm.id]?.available ?? '0'), [order])
      } else if (sortKey.startsWith('my')) {
        return orderBy(
          owmDatas,
          (owmData) => {
            const userActiveKey = helpers.getUserActiveKey(api, owmData)
            const loanExits = get().user.loansExistsMapper[userActiveKey]?.loanExists ?? false
            const userLoanDetails = get().user.loansDetailsMapper[userActiveKey]?.details
            const userBalances = get().user.marketsBalancesMapper[userActiveKey]

            if (sortKey === 'myHealth') {
              return loanExits ? +(userLoanDetails?.healthNotFull ?? '0') : '0'
            } else if (sortKey === 'myDebt') {
              return loanExits ? +(userLoanDetails?.state?.debt ?? '0') : '0'
            } else if (sortKey === 'myVaultShares') {
              return +(userBalances?.vaultShares ?? '0')
            }
          },
          [order]
        )
      }

      return owmDatas
    },
    filterUserList: (api, owmDatas, filterTypeKey) => {
      const { loansExistsMapper, marketsBalancesMapper } = get().user

      return owmDatas.filter((owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        if (filterTypeKey === 'borrow') {
          return loansExistsMapper[userActiveKey].loanExists
        } else {
          const { vaultShares = '0', gauge = '0' } = marketsBalancesMapper[userActiveKey] ?? {}
          const totalVaultShares = +vaultShares + +gauge
          return totalVaultShares > 0
        }
      })
    },
    setFormValues: async (rChainId, api, searchParams, shouldRefetch) => {
      const storedOwmDatas = get().markets.owmDatas[rChainId]
      const storedOwmDatasMapper = get().markets.owmDatasMapper[rChainId]
      const storedMarketListMapper = get().marketList.marketListMapper[rChainId]
      const storedUsdRatesMapper = get().usdRates.tokens

      // update activeKey, formStatus
      const activeKey = _getActiveKey(rChainId, searchParams)
      get()[sliceKey].setStateByKeys({ activeKey, formStatus: { error: '', noResult: false, isLoading: true } })

      // allow UI to update paint
      await sleep(100)

      if (!api || !storedOwmDatasMapper || !storedMarketListMapper || !storedUsdRatesMapper) return

      const { chainId, signerAddress } = api
      const { filterKey, filterTypeKey, hideSmallMarkets, searchText } = searchParams

      // get market list for table
      let cMarketList = cloneDeep(sortByFn(Object.values(storedMarketListMapper), (l) => l.symbol))
      let cOwmDatas = _getOwmDatasFromMarketList(storedMarketListMapper, storedOwmDatasMapper)

      if (signerAddress) {
        if (filterTypeKey === 'borrow') {
          await get().user.fetchUsersLoansExists(api, cOwmDatas, shouldRefetch)
        }

        if (filterTypeKey === 'supply') {
          await get().user.fetchDatas('marketsBalancesMapper', api, cOwmDatas, shouldRefetch)
        }

        // update cOwmDatas if filter === 'user'
        if (filterKey === 'user') {
          cOwmDatas = get()[sliceKey].filterUserList(api, cOwmDatas, searchParams.filterTypeKey)
        }
      }

      // searchText
      if (searchText) {
        cOwmDatas = get()[sliceKey].filterBySearchText(searchText, cOwmDatas)
      }

      // hide small markets
      if (hideSmallMarkets) {
        await get().markets.fetchDatas('statsCapAndAvailableMapper', api, cOwmDatas, shouldRefetch)
        cOwmDatas = get()[sliceKey].filterSmallMarkets(api, cOwmDatas)
      }

      // update collapse list
      const cTableRowsSettings = cloneDeep(get()[sliceKey].tableRowsSettings)
      const isOpen = cOwmDatas.length <= 30 || filterKey === 'user'
      cMarketList.forEach(({ address }) => {
        if (isOpen) get()[sliceKey].sortTableRow(rChainId, api, searchParams, address)

        if (typeof cTableRowsSettings[address] === 'undefined') {
          cTableRowsSettings[address] = { isOpen }
        } else {
          cTableRowsSettings[address].isOpen = isOpen
        }
      })

      // set result
      cMarketList = _filterResult(cMarketList, cOwmDatas)
      get()[sliceKey].setStateByActiveKey('result', activeKey, cMarketList)
      get()[sliceKey].setStateByKeys({
        tableRowsSettings: cTableRowsSettings,
        formStatus: {
          error: '',
          noResult: cMarketList.length === 0,
          isLoading: false,
        },
      })

      // save to cache
      if (activeKey === `${chainId}-all-`) {
        get().storeCache.setStateByActiveKey('marketListResult', activeKey, cMarketList)
      }

      // api calls
      let fns =
        filterTypeKey === 'borrow'
          ? [
              { key: 'statsAmmBalancesMapper', fn: get().markets.fetchDatas },
              { key: 'statsCapAndAvailableMapper', fn: get().markets.fetchDatas },
              { key: 'statsParametersMapper', fn: get().markets.fetchDatas },
              { key: 'statsTotalsMapper', fn: get().markets.fetchDatas },
              { key: 'ratesMapper', fn: get().markets.fetchDatas },
            ]
          : [
              { key: 'statsTotalsMapper', fn: get().markets.fetchDatas },
              { key: 'ratesMapper', fn: get().markets.fetchDatas },
              { key: 'rewardsMapper', fn: get().markets.fetchDatas },
              { key: 'totalLiquidityMapper', fn: get().markets.fetchDatas },
            ]

      if (signerAddress) {
        fns = fns.concat([
          { key: 'marketsBalancesMapper', fn: get().user.fetchDatas },
          { key: 'loansHealthsMapper', fn: get().user.fetchLoanDatas },
          { key: 'loansStatesMapper', fn: get().user.fetchLoanDatas },
        ])
      }

      Promise.all(fns.map(({ fn, key }) => fn(key, api, storedOwmDatas, shouldRefetch)))
    },
    sortTableRow: async (rChainId, api, searchParams, tableRowTokenAddress) => {
      if (!api) return

      const cSettings = cloneDeep(get()[sliceKey].tableRowsSettings[tableRowTokenAddress] ?? {})

      const {
        borrowKey = searchParams?.borrowKey ?? 'long',
        sortBy = searchParams?.sortBy ?? cSettings.filterTypeKey === 'borrow' ? 'available' : 'totalLiquidity',
        sortByOrder = searchParams?.sortByOrder ?? 'desc',
      } = cSettings

      // update token table header sort icons
      get()[sliceKey].setStateByActiveKey('tokenSearchParams', tableRowTokenAddress, { sortBy, sortByOrder })

      // stored
      const storedMarketList = get()[sliceKey].marketListMapper[rChainId] ?? {}
      const storedOwmDatasMapper = get().markets.owmDatasMapper[rChainId]
      const storedTokenResult = get()[sliceKey].tokenResult[tableRowTokenAddress]

      // sort token table
      const marketListByTokenSelectTab = storedMarketList?.[tableRowTokenAddress]?.[borrowKey] ?? {}
      let owmDatas = Object.keys(marketListByTokenSelectTab).map((owmId) => storedOwmDatasMapper[owmId])

      owmDatas = searchParams.searchText
        ? get()[sliceKey].filterBySearchText(searchParams.searchText, owmDatas)
        : owmDatas
      owmDatas = get()[sliceKey].sortFn(api, sortBy, sortByOrder, owmDatas)

      let cTokenResult = cloneDeep(storedTokenResult ?? { long: [], short: [] })
      cTokenResult[borrowKey] = owmDatas.map(({ owm }) => owm.id)
      get()[sliceKey].setStateByActiveKey('tokenResult', tableRowTokenAddress, cTokenResult)
    },
    updateTableRowSettings: (rChainId, api, searchParams, tableRowTokenAddress, updatedSettings) => {
      let cSettings = cloneDeep(get()[sliceKey].tableRowsSettings[tableRowTokenAddress])

      if (typeof cSettings === 'undefined') {
        cSettings = updatedSettings
      } else {
        cSettings = { ...cSettings, ...updatedSettings }
      }
      get()[sliceKey].setStateByActiveKey('tableRowsSettings', tableRowTokenAddress, cSettings)
      get()[sliceKey].sortTableRow(rChainId, api, searchParams, tableRowTokenAddress)
    },
    updateTableRowsSettings: (updatedSearchParams) => {
      let cTableRowsSettings = cloneDeep(get()[sliceKey].tableRowsSettings)

      const { filterTypeKey, borrowKey, sortBy, sortByOrder } = updatedSearchParams

      Object.keys(cTableRowsSettings).forEach((address) => {
        let tableRowSettings = cTableRowsSettings[address]
        if (typeof filterTypeKey !== 'undefined') tableRowSettings['filterTypeKey'] = filterTypeKey
        if (typeof borrowKey !== 'undefined') tableRowSettings['borrowKey'] = borrowKey
        if (typeof sortBy !== 'undefined') tableRowSettings['sortBy'] = sortBy
        if (typeof sortByOrder !== 'undefined') tableRowSettings['sortByOrder'] = sortByOrder
      })
      get()[sliceKey].setStateByKey('tableRowsSettings', cTableRowsSettings)
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key] ?? {}).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
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

export function getCollateralDatasCached(owmDatasMapperCached: OWMDatasCacheMapper | undefined) {
  const owmDatasCached: OWMDataCache[] = []

  if (owmDatasMapperCached) {
    for (const key in owmDatasMapperCached) {
      owmDatasCached.push(owmDatasMapperCached[key])
    }
  }

  return owmDatasCached
}

export function _getActiveKey(chainId: ChainId, searchParams: SearchParams) {
  const { filterKey, searchText } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${filterKey}-${parsedSearchText}`
}

function _getOwmDatasFromMarketList(marketListMapper: MarketListMapper, owmDatasMapper: OWMDatasMapper) {
  let owmDatas: { [owmId: string]: OWMData } = {}

  // get all owmIds
  Object.keys(marketListMapper).forEach((tokenAddress) => {
    const { long, short } = marketListMapper[tokenAddress]
    Object.keys({ ...long, ...short }).forEach((owmId) => {
      owmDatas[owmId] = owmDatasMapper[owmId]
    })
  })
  return Object.values(owmDatas) ?? []
}

function _filterResult(marketList: MarketListItem[], owmDatas: OWMData[]) {
  const owmDatasMapper = owmDatas?.reduce((prev, { owm }) => {
    prev[owm.id] = true
    return prev
  }, {} as { [owmId: string]: boolean })

  return marketList
    .map((marketListItem) => {
      const { long, short } = marketListItem
      const filteredLong: { [owmId: string]: boolean } = {}
      const filteredLend: { [owmId: string]: boolean } = {}
      Object.keys(long).forEach((lendOwmId) => {
        if (owmDatasMapper[lendOwmId]) {
          filteredLong[lendOwmId] = true
        }
      })
      Object.keys(short).forEach((lendOwmId) => {
        if (owmDatasMapper[lendOwmId]) {
          filteredLend[lendOwmId] = true
        }
      })
      return { ...marketListItem, long: filteredLong, short: filteredLend }
    })
    .filter((marketListItem) => {
      const { long, short } = marketListItem
      return Object.keys(long).length > 0 || Object.keys(short).length > 0
    })
}

export default createMarketListSlice
