import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  FilterTypeKey,
  FormStatus,
  MarketListItemResult,
  MarketListMapper,
  SearchParams,
  TableSettings
} from '@/components/PageMarketList/types'

import chunk from 'lodash/chunk'
import orderBy from 'lodash/orderBy'
import sortByFn from 'lodash/sortBy'

import { _getMarketList, _searchByTokensAddresses, DEFAULT_FORM_STATUS } from '@/components/PageMarketList/utils'
import { TITLE } from '@/constants'
import { getTotalApr } from '@/utils/utilsRewards'
import { helpers } from '@/lib/apiLending'
import { sleep } from '@/utils/helpers'
import networks from '@/networks'
import { queryClient } from '@/shared/api/query-client'
import { tokenKeys } from '@/entities/token/model'

type StateKey = keyof typeof DEFAULT_STATE

// isTableRowOpen
type SliceState = {
  initialLoaded: boolean
  activeKey: string
  marketListMapper: { [chainId: string]: MarketListMapper }
  tableRowsSettings: { [tokenAddress: string]: TableSettings }
  formStatus: FormStatus
  searchParams: SearchParams
  searchTextByTokensAndAddresses: { [activeKey: string]: { [address: string]: boolean } }
  searchTextByOther: { [activeKey: string]: { [address: string]: boolean } }
  result: { [activeKey: string]: MarketListItemResult[] }
  showHideSmallPools: boolean
}

const sliceKey = 'marketList'

// prettier-ignore
export type MarketListSlice = {
  [sliceKey]: SliceState & {
    filterSmallMarkets(api: Api, owmDatas: OWMData[]): OWMData[]
    filterBySearchText(searchText: string, owmDatas: OWMData[]): OWMData[]
    filterUserList(api: Api, owmDatas: OWMData[], filterTypeKey: FilterTypeKey): OWMData[]
    filterLeverageMarkets(owmDatas: OWMData[]): OWMData[]
    sortByUserData(api: Api, sortKey: TitleKey, owmData: OWMData): number
    sortFn(api: Api, sortKey: TitleKey, order: Order, owmDatas: OWMData[]): OWMData[]
    sortByCollateral(api: Api, owmDatas: OWMData[]): { result: MarketListItemResult[], tableRowsSettings: { [tokenAddress:string]: TableSettings } }
    sortByAll(api: Api, owmDatas: OWMData[], sortBy: TitleKey, sortByOrder: Order): { result: MarketListItemResult[], tableRowsSettings: { [tokenAddress:string]: TableSettings } }
    setFormValues(rChainId: ChainId, api: Api | null, shouldRefetch?: boolean): Promise<void>

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
    sortBy: '',
    sortByOrder: 'desc',
    searchText: '',
  },
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  result: {},
  showHideSmallPools: false,
}

const createMarketListSlice = (set: SetState<State>, get: GetState<State>): MarketListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterSmallMarkets: (api, owmDatas) => {
      const { chainId } = api
      const capAndAvailableMapper = get().markets.statsCapAndAvailableMapper[chainId] ?? {}
      const { smallMarketAmount, marketListShowOnlyInSmallMarkets } = networks[chainId]
      return owmDatas.filter(({ owm }) => {
        const { cap } = capAndAvailableMapper[owm.id] ?? {}
        const usdRate = queryClient.getQueryData<number>(
          tokenKeys.usdRate({
            chainId,
            tokenAddress: owm.borrowed_token.address,
          }),
        )
        if (typeof usdRate === 'undefined') return true
        if (marketListShowOnlyInSmallMarkets[owm.id]) return false
        return +cap * usdRate > smallMarketAmount
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
    sortByUserData: (api, sortKey, owmData) => {
      const { user } = get()

      const userActiveKey = helpers.getUserActiveKey(api, owmData)

      if (sortKey === 'myHealth') {
        return Number(user.loansHealthsMapper[userActiveKey]?.healthNotFull ?? 0)
      } else if (sortKey === 'myDebt') {
        return Number(user.loansStatesMapper[userActiveKey]?.debt ?? 0)
      } else if (sortKey === 'myVaultShares') {
        return Number(user.marketsBalancesMapper[userActiveKey]?.vaultShares ?? 0)
      }
      return 0
    },
    sortFn: (api, sortKey, order, owmDatas) => {
      const { markets } = get()
      const { ...sliceState } = get()[sliceKey]

      const { chainId } = api
      const statsCapAndAvailableMapper = markets.statsCapAndAvailableMapper[chainId] ?? {}
      const ratesMapper = markets.ratesMapper[chainId] ?? {}
      const rewardsMapper = markets.rewardsMapper[chainId] ?? {}
      const totalLiquidityMapper = markets.totalLiquidityMapper[chainId] ?? {}
      const leverageMapper = markets.maxLeverageMapper[chainId] ?? {}
      const statsTotalMapper = markets.statsTotalsMapper[chainId] ?? {}
      const totalCollateralValuesMapper = markets.totalCollateralValuesMapper[chainId] ?? {}

      if (sortKey === TITLE.tokenCollateral) {
        return orderBy(owmDatas, ({ owm }) => owm.collateral_token.symbol.toLowerCase(), [order])
      } else if (sortKey === TITLE.tokenBorrow || sortKey === TITLE.tokenSupply) {
        return orderBy(owmDatas, ({ owm }) => owm.borrowed_token.symbol.toLowerCase(), [order])
      } else if (sortKey === 'rateBorrow') {
        return orderBy(owmDatas, ({ owm }) => +(ratesMapper?.[owm.id]?.rates?.borrowApy ?? '0'), [order])
      } else if (sortKey === 'rateLend') {
        return orderBy(owmDatas, ({ owm }) => +(ratesMapper?.[owm.id]?.rates?.lendApy ?? '0'), [order])
      } else if (sortKey === 'available' || sortKey === 'cap') {
        return orderBy(owmDatas, ({ owm }) => +(statsCapAndAvailableMapper[owm.id]?.[sortKey] ?? '0'), [order])
      } else if (sortKey === 'leverage') {
        return orderBy(owmDatas, ({ owm }) => +(leverageMapper[owm.id]?.maxLeverage ?? '0'), [order])
      } else if (sortKey === 'totalApr') {
        return orderBy(owmDatas, ({ owm }) => sortByRewards(owm, rewardsMapper, ratesMapper), [order])
      } else if (sortKey === 'totalLiquidity') {
        return orderBy(owmDatas, ({ owm }) => +(totalLiquidityMapper[owm.id]?.totalLiquidity ?? '0'), [order])
      } else if (sortKey === 'totalDebt') {
        return orderBy(owmDatas, ({ owm }) => +(statsTotalMapper[owm.id]?.totalDebt ?? '0'), [order])
      } else if (sortKey === 'utilization') {
        return orderBy(owmDatas, ({ owm }) => sortByUtilization(owm, statsCapAndAvailableMapper, statsTotalMapper), [
          order,
        ])
      } else if (sortKey === 'totalCollateralValue') {
        return orderBy(owmDatas, ({ owm }) => +(totalCollateralValuesMapper[owm.id]?.total ?? '0'), [order])
      } else if (sortKey.startsWith('my')) {
        return orderBy(owmDatas, (owmData) => sliceState.sortByUserData(api, sortKey, owmData), [order])
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
    sortByCollateral: (api, owmDatas) => {
      const { markets } = get()
      let { searchParams, tableRowsSettings, ...sliceState } = get()[sliceKey]

      const { chainId } = api
      const owmDatasMapper = markets.owmDatasMapper[chainId]
      const parsedTableRowsSettings: { [tokenAddress: string]: TableSettings } = {}

      const { marketListMapper } = _getMarketList(owmDatas, markets.crvusdAddress[chainId])

      const marketsResult = sortByFn(Object.values(marketListMapper), (m) => m.symbol.toLowerCase()).map((m, idx) => {
        // set table settings for each market
        parsedTableRowsSettings[m.address] = getTableRowSettings(m.address, searchParams, tableRowsSettings, idx !== 0)

        const tokenOwmDatas = Object.keys(m.markets).map((k) => owmDatasMapper[k])

        return {
          address: m.address,
          symbol: m.symbol,
          markets: sliceState
            .sortFn(
              api,
              searchParams.filterTypeKey === 'borrow' ? 'totalCollateralValue' : 'totalLiquidity',
              'desc',
              tokenOwmDatas
            )
            .map((m) => m.owm.id),
        }
      })

      return { result: marketsResult, tableRowsSettings: parsedTableRowsSettings }
    },
    sortByAll: (api, owmDatas, sortBy, sortByOrder) => {
      const { marketListMapper, searchParams, ...sliceState } = get()[sliceKey]

      const marketResult = sliceState.sortFn(api, sortBy, sortByOrder, owmDatas).map((d) => d.owm.id)

      return {
        result: [{ address: 'all', symbol: 'all', markets: marketResult }],
        tableRowsSettings: { all: { isNotSortable: false, sortBy, sortByOrder } },
      }
    },
    setFormValues: async (rChainId, api, shouldRefetch) => {
      const { markets, storeCache, user } = get()
      let {
        activeKey: prevActiveKey,
        initialLoaded,
        marketListMapper,
        searchParams,
        tableRowsSettings,
        result,
        ...sliceState
      } = get()[sliceKey]
      const storedOwmDatas = markets.owmDatas[rChainId]
      const storedOwmDatasMapper = markets.owmDatasMapper[rChainId]
      const storedMarketListMapper = marketListMapper[rChainId]

      // update activeKey, formStatus
      const activeKey = _getActiveKey(rChainId, searchParams)

      // pending results
      let pendingIsReset
      let pendingMarkets: { address: string; symbol: string; markets: string[] }[] = []
      if (!activeKey.charAt(0).startsWith(prevActiveKey.charAt(0))) {
        pendingIsReset = true
      } else if (activeKey.endsWith('--')) {
        pendingIsReset = false
        pendingMarkets = result[activeKey] ?? []
      } else {
        pendingIsReset = false
        pendingMarkets = result[activeKey] ?? result[prevActiveKey] ?? { address: 'all', symbol: 'all', markets: [] }
      }

      if (pendingIsReset) {
        sliceState.setStateByKey('result', { [activeKey]: [] })
      } else {
        sliceState.setStateByActiveKey('result', activeKey, pendingMarkets)
      }

      sliceState.setStateByKeys({
        activeKey,
        formStatus: { error: '', noResult: false, isLoading: true },
      })

      // allow UI to update paint
      await sleep(100)

      if (!api || !storedOwmDatasMapper || !storedMarketListMapper) return

      const { chainId, signerAddress } = api
      const { filterKey, filterTypeKey, hideSmallMarkets, searchText, sortBy, sortByOrder } = searchParams

      // get market list for table
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

      // api calls
      // wait for api to finish if sortBy key exists
      if (sortBy && !sortBy.startsWith('my')) {
        let fns: string[] = []

        switch (sortBy) {
          case 'leverage':
            fns = ['maxLeverageMapper']
            break
          case 'rateBorrow':
            fns = ['ratesMapper']
            break
          case 'available':
          case 'cap':
          case 'totalDebt':
          case 'utilization':
            fns = ['statsCapAndAvailableMapper', 'statsTotalsMapper']
            break
          case 'totalCollateralValue':
            fns = ['totalCollateralValuesMapper']
            break
          case 'totalApr':
            fns = ['rewardsMapper', 'ratesMapper']
            break
          case 'totalLiquidity':
            fns = ['totalLiquidityMapper']
            break
        }

        await Promise.all(fns.map((k) => markets.fetchDatas(k, api, cOwmDatas, shouldRefetch)))
      }

      if (sortBy && sortBy.startsWith('my')) {
        await Promise.all(
          ['loansHealthsMapper', 'loansStatesMapper'].map((k) => user.fetchLoanDatas(k, api, cOwmDatas, shouldRefetch))
        )
      }

      const sorted = sortBy
        ? sliceState.sortByAll(api, cOwmDatas, sortBy, sortByOrder)
        : sliceState.sortByCollateral(api, cOwmDatas)

      // set result
      sliceState.setStateByKeys({
        tableRowsSettings: sorted.tableRowsSettings,
        formStatus: {
          error: '',
          noResult: sorted.result.length === 0,
          isLoading: false,
        },
      })
      sliceState.setStateByActiveKey('result', activeKey, sorted.result)

      // save to cache
      if (activeKey === `${chainId}-borrow-all-`) {
        storeCache.setStateByActiveKey('marketListResult', activeKey, sorted.result)
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
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export function _getActiveKey(chainId: ChainId, searchParams: SearchParams) {
  const { filterKey, filterTypeKey, searchText, sortBy, sortByOrder } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  const sortByStr = sortBy ? `-${sortBy}-${sortByOrder}` : ''
  return `${chainId}-${filterTypeKey}-${filterKey}-${parsedSearchText}${sortByStr}`
}

function _getOwmDatasFromMarketList(marketListMapper: MarketListMapper, owmDatasMapper: OWMDatasMapper) {
  let owmDatas: { [owmId: string]: OWMData } = {}

  // get all owmIds
  Object.keys(marketListMapper).forEach((tokenAddress) => {
    const { markets } = marketListMapper[tokenAddress]
    Object.keys(markets).forEach((owmId) => {
      owmDatas[owmId] = owmDatasMapper[owmId]
    })
  })
  return Object.values(owmDatas) ?? []
}

function sortByRewards(owm: OWM, rewardsMapper: MarketsRewardsMapper, ratesMapper: MarketsRatesMapper) {
  const rewards = rewardsMapper[owm.id]?.rewards
  const rates = ratesMapper[owm.id]?.rates

  if (!rewards || !rates) return 0

  const { other = [], crv = [0, 0] } = rewards
  const { lendApr } = rates

  return Number(getTotalApr(Number(lendApr), crv[0], crv[1], other)?.max ?? 0)
}

function sortByUtilization(
  owm: OWM,
  statsCapAndAvailableMapper: MarketsStatsCapAndAvailableMapper,
  statsTotalsMapper: MarketsStatsTotalsMapper
) {
  const statsCapAndAvailable = statsCapAndAvailableMapper[owm.id]
  const statsTotals = statsTotalsMapper[owm.id]

  if (!statsCapAndAvailable || !statsTotals) return 0

  return (+(statsTotals.totalDebt ?? '0') / +statsCapAndAvailable.cap) * 100
}

function getTableRowSettings(
  tokenAddress: string,
  { sortBy, sortByOrder, filterTypeKey }: SearchParams,
  tableSettingsMapper: { [tokenAddress: string]: TableSettings },
  isNotSortable: boolean
) {
  const prevTableSettings = tableSettingsMapper[tokenAddress] ?? {}

  return {
    ...prevTableSettings,
    sortBy: sortBy || filterTypeKey === 'borrow' ? TITLE.totalCollateralValue : TITLE.totalLiquidity,
    sortByOrder: sortByOrder || 'desc',
    isNotSortable: isNotSortable,
  }
}

export default createMarketListSlice
