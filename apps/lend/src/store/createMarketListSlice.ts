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
  initialLoaded: boolean
  activeKey: string
  marketListMapper: { [chainId: string]: MarketListMapper }
  tableRowsSettings: { [tokenAddress: string]: TableRowSettings }
  formStatus: FormStatus
  searchParams: SearchParams
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
    filterLeverageMarkets(owmDatas: OWMData[]): OWMData[]
    sortFn(api: Api, sortKey: SortKey, order: Order, owmDatas: OWMData[]): OWMData[]
    setFormValues(rChainId: ChainId, api: Api | null, shouldRefetch?: boolean): Promise<void>
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
  initialLoaded: false,
  activeKey: '',
  marketListMapper: {},
  tableRowsSettings: {},
  formStatus: DEFAULT_FORM_STATUS,
  searchParams: {
    filterKey: 'all',
    filterTypeKey: 'borrow',
    hideSmallMarkets: true,
    sortBy: 'available',
    sortByOrder: 'desc',
    searchText: '',
    borrowKey: 'long',
  },
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
    filterLeverageMarkets: (owmDatas) => {
      return owmDatas.filter(({ hasLeverage }) => hasLeverage)
    },
    setFormValues: async (rChainId, api, shouldRefetch) => {
      const { markets, storeCache, usdRates, user } = get()
      const { initialLoaded, marketListMapper, searchParams, tableRowsSettings, ...sliceState } = get()[sliceKey]
      const storedOwmDatas = markets.owmDatas[rChainId]
      const storedOwmDatasMapper = markets.owmDatasMapper[rChainId]
      const storedMarketListMapper = marketListMapper[rChainId]
      const storedUsdRatesMapper = usdRates.tokens

      // update activeKey, formStatus
      const activeKey = _getActiveKey(rChainId, searchParams)
      sliceState.setStateByKeys({ activeKey, formStatus: { error: '', noResult: false, isLoading: true } })

      // allow UI to update paint
      await sleep(100)

      if (!api || !storedOwmDatasMapper || !storedMarketListMapper || !storedUsdRatesMapper) return

      const { chainId, signerAddress } = api
      const { filterKey, filterTypeKey, hideSmallMarkets, searchText } = searchParams

      // get market list for table
      let cMarketList = sortByFn(Object.values(storedMarketListMapper), (l) => l.symbol)
      let cOwmDatas = _getOwmDatasFromMarketList(storedMarketListMapper, storedOwmDatasMapper)

      if (signerAddress) {
        if (filterTypeKey === 'borrow') {
          await user.fetchUsersLoansExists(api, cOwmDatas, shouldRefetch)
        }

        if (filterTypeKey === 'supply') {
          await user.fetchDatas('marketsBalancesMapper', api, cOwmDatas, shouldRefetch)
        }
      }

      if (filterKey) {
        if (filterKey === 'user' && !!signerAddress) {
          cOwmDatas = sliceState.filterUserList(api, cOwmDatas, searchParams.filterTypeKey)
        } else if (filterKey === 'leverage') {
          cOwmDatas = sliceState.filterLeverageMarkets(cOwmDatas)
        }
      }

      // searchText
      if (searchText) {
        cOwmDatas = sliceState.filterBySearchText(searchText, cOwmDatas)
      }

      // hide small markets
      if (hideSmallMarkets) {
        await markets.fetchDatas('statsCapAndAvailableMapper', api, cOwmDatas, shouldRefetch)
        cOwmDatas = sliceState.filterSmallMarkets(api, cOwmDatas)
      }

      // update collapse list
      const cTableRowsSettings: { [address: string]: TableRowSettings } = {}
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
      sliceState.setStateByActiveKey('result', activeKey, cMarketList)
      sliceState.setStateByKeys({
        tableRowsSettings: { ...tableRowsSettings, ...cTableRowsSettings },
        formStatus: {
          error: '',
          noResult: cMarketList.length === 0,
          isLoading: false,
        },
      })

      // save to cache
      if (activeKey === `${chainId}-all-`) {
        storeCache.setStateByActiveKey('marketListResult', activeKey, cMarketList)
      }

      // api calls
      // isTvl: set to true if needed to calculate total tvl for header
      let fns = [
        { key: 'statsAmmBalancesMapper', fn: markets.fetchDatas, isTvl: true },
        { key: 'statsCapAndAvailableMapper', fn: markets.fetchDatas },
        { key: 'statsParametersMapper', fn: markets.fetchDatas },
        { key: 'statsTotalsMapper', fn: markets.fetchDatas, isTvl: true },
        { key: 'ratesMapper', fn: markets.fetchDatas },
        { key: 'totalLiquidityMapper', fn: markets.fetchDatas, isTvl: true },
        { key: 'maxLeverageMapper', fn: markets.fetchDatas },
      ]

      // TODO: rewards call Public RPC frequently returns 429. Only call this when on Supply view.
      if (filterTypeKey === 'supply') {
        fns = fns.concat([{ key: 'rewardsMapper', fn: markets.fetchDatas }])
      }

      if (signerAddress) {
        fns = fns.concat([
          { key: 'marketsBalancesMapper', fn: user.fetchDatas },
          { key: 'loansHealthsMapper', fn: user.fetchLoanDatas },
          { key: 'loansStatesMapper', fn: user.fetchLoanDatas },
        ])
      }

      await Promise.all(
        fns.map(({ fn, key, isTvl }) => {
          const datas = isTvl ? storedOwmDatas : cOwmDatas
          return fn(key, api, datas, shouldRefetch)
        })
      )
      if (!initialLoaded) sliceState.setStateByKey('initialLoaded', true)
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
