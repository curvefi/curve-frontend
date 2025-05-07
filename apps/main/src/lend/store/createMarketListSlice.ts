import chunk from 'lodash/chunk'
import orderBy from 'lodash/orderBy'
import sortByFn from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import type { GetState, SetState } from 'zustand'
import type {
  FilterTypeKey,
  FormStatus,
  MarketListItemResult,
  SearchParams,
  SearchTermResult,
  TableSettings,
} from '@/lend/components/PageMarketList/types'
import { _getMarketList, DEFAULT_FORM_STATUS, parseSearchTermResults } from '@/lend/components/PageMarketList/utils'
import { TITLE } from '@/lend/constants'
import { getTokenUsdRateQueryData } from '@/lend/entities/token'
import { SEARCH_TERM } from '@/lend/hooks/useSearchTermMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import {
  Api,
  ChainId,
  MarketsRatesMapper,
  MarketsRewardsMapper,
  MarketsStatsCapAndAvailableMapper,
  MarketsStatsTotalsMapper,
  OneWayMarketTemplate,
  Order,
  TitleKey,
} from '@/lend/types/lend.types'
import { sleep } from '@/lend/utils/helpers'
import { getTotalApr } from '@/lend/utils/utilsRewards'
import { IDict } from '@curvefi/llamalend-api/lib/interfaces'
import { logQuery, logSuccess } from '@ui-kit/lib'
import { searchByText } from '@ui-kit/utils'

type StateKey = keyof typeof DEFAULT_STATE

// isTableRowOpen
type SliceState = {
  initialLoaded: boolean
  activeKey: string
  tableRowsSettings: { [tokenAddress: string]: TableSettings }
  formStatus: FormStatus
  searchTextByTokensAndAddresses: { [activeKey: string]: { [address: string]: boolean } }
  searchTextByOther: { [activeKey: string]: { [address: string]: boolean } }
  searchedByTokens: SearchTermResult
  searchedByAddresses: SearchTermResult
  result: { [activeKey: string]: MarketListItemResult[] }
}

const sliceKey = 'marketList'

// prettier-ignore
export type MarketListSlice = {
  [sliceKey]: SliceState & {
    filterSmallMarkets(api: Api, markets: OneWayMarketTemplate[]): OneWayMarketTemplate[]
    filterBySearchText(searchText: string, markets: OneWayMarketTemplate[]): OneWayMarketTemplate[]
    filterUserList(api: Api, markets: OneWayMarketTemplate[], filterTypeKey: FilterTypeKey): OneWayMarketTemplate[]
    filterLeverageMarkets(markets: OneWayMarketTemplate[]): OneWayMarketTemplate[]
    sortByUserData(api: Api, sortKey: TitleKey, market: OneWayMarketTemplate): number
    sortFn(api: Api, sortKey: TitleKey, order: Order, markets: OneWayMarketTemplate[]): OneWayMarketTemplate[]
    sortByCollateral(api: Api, searchParams: SearchParams, markets: OneWayMarketTemplate[], marketMapping: IDict<OneWayMarketTemplate>): { result: MarketListItemResult[], tableRowsSettings: { [tokenAddress:string]: TableSettings } }
    sortByAll(api: Api, markets: OneWayMarketTemplate[], sortBy: TitleKey, sortByOrder: Order): { result: MarketListItemResult[], tableRowsSettings: { [tokenAddress:string]: TableSettings } }
    setFormValues(rChainId: ChainId, api: Api | null, searchParams: SearchParams, marketMapping?: IDict<OneWayMarketTemplate>, shouldRefetch?: boolean): Promise<void>

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
  tableRowsSettings: {},
  formStatus: DEFAULT_FORM_STATUS,
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  searchedByTokens: {},
  searchedByAddresses: {},
  result: {},
}

const createMarketListSlice = (set: SetState<State>, get: GetState<State>): MarketListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterSmallMarkets: (api, markets) => {
      const { chainId } = api
      const capAndAvailableMapper = get().markets.statsCapAndAvailableMapper[chainId] ?? {}
      const { smallMarketAmount, marketListShowOnlyInSmallMarkets } = networks[chainId]
      return markets.filter((market) => {
        const { cap } = capAndAvailableMapper[market.id] ?? {}
        const usdRate = getTokenUsdRateQueryData({ chainId, tokenAddress: market.borrowed_token.address })
        if (typeof usdRate === 'undefined') return true
        if (marketListShowOnlyInSmallMarkets[market.id]) return false
        return +cap * usdRate > smallMarketAmount
      })
    },
    filterBySearchText: (searchText, markets) => {
      const { formStatus, ...sliceState } = get()[sliceKey]

      const { tokensResult, addressesResult } = searchByText(
        searchText,
        markets,
        [SEARCH_TERM['borrowed_token.symbol'], SEARCH_TERM['collateral_token.symbol']],
        {
          tokens: [SEARCH_TERM['borrowed_token.address'], SEARCH_TERM['collateral_token.address']],
          other: [
            SEARCH_TERM['addresses.controller'],
            SEARCH_TERM['addresses.amm'],
            SEARCH_TERM['addresses.vault'],
            SEARCH_TERM['addresses.gauge'],
          ],
        },
      )

      sliceState.setStateByKeys({
        searchedByTokens: parseSearchTermResults(tokensResult),
        searchedByAddresses: parseSearchTermResults(addressesResult),
      })

      return uniqBy([...tokensResult, ...addressesResult], (r) => r.item.id).map((r) => r.item)
    },
    sortByUserData: (api, sortKey, market) => {
      const { user } = get()

      const userActiveKey = helpers.getUserActiveKey(api, market)

      if (sortKey === 'myHealth') {
        return Number(user.loansHealthsMapper[userActiveKey]?.healthNotFull ?? 0)
      } else if (sortKey === 'myDebt') {
        return Number(user.loansStatesMapper[userActiveKey]?.debt ?? 0)
      } else if (sortKey === 'myVaultShares') {
        return Number(user.marketsBalancesMapper[userActiveKey]?.vaultShares ?? 0)
      }
      return 0
    },
    sortFn: (api, sortKey, order, markets) => {
      const { markets: marketSlice } = get()
      const { ...sliceState } = get()[sliceKey]

      const { chainId } = api
      const statsCapAndAvailableMapper = marketSlice.statsCapAndAvailableMapper[chainId] ?? {}
      const ratesMapper = marketSlice.ratesMapper[chainId] ?? {}
      const rewardsMapper = marketSlice.rewardsMapper[chainId] ?? {}
      const totalLiquidityMapper = marketSlice.totalLiquidityMapper[chainId] ?? {}
      const leverageMapper = marketSlice.maxLeverageMapper[chainId] ?? {}
      const statsTotalMapper = marketSlice.statsTotalsMapper[chainId] ?? {}
      const totalCollateralValuesMapper = marketSlice.totalCollateralValuesMapper[chainId] ?? {}

      if (sortKey === TITLE.tokenCollateral) {
        return orderBy(markets, (market) => market.collateral_token.symbol.toLowerCase(), [order])
      } else if (sortKey === TITLE.tokenBorrow || sortKey === TITLE.tokenSupply) {
        return orderBy(markets, (market) => market.borrowed_token.symbol.toLowerCase(), [order])
      } else if (sortKey === 'rateBorrow') {
        return orderBy(markets, (market) => +(ratesMapper?.[market.id]?.rates?.borrowApy ?? '0'), [order])
      } else if (sortKey === 'rateLend') {
        return orderBy(markets, (market) => +(ratesMapper?.[market.id]?.rates?.lendApy ?? '0'), [order])
      } else if (sortKey === 'available' || sortKey === 'cap') {
        return orderBy(markets, (market) => +(statsCapAndAvailableMapper[market.id]?.[sortKey] ?? '0'), [order])
      } else if (sortKey === 'leverage') {
        return orderBy(markets, (market) => +(leverageMapper[market.id]?.maxLeverage ?? '0'), [order])
      } else if (sortKey === 'totalApr') {
        return orderBy(markets, (market) => sortByRewards(market, rewardsMapper, ratesMapper), [order])
      } else if (sortKey === 'totalLiquidity') {
        return orderBy(markets, (market) => +(totalLiquidityMapper[market.id]?.totalLiquidity ?? '0'), [order])
      } else if (sortKey === 'totalDebt') {
        return orderBy(markets, (market) => +(statsTotalMapper[market.id]?.totalDebt ?? '0'), [order])
      } else if (sortKey === 'utilization') {
        return orderBy(markets, (market) => sortByUtilization(market, statsCapAndAvailableMapper, statsTotalMapper), [
          order,
        ])
      } else if (sortKey === 'totalCollateralValue') {
        return orderBy(markets, (market) => +(totalCollateralValuesMapper[market.id]?.total ?? '0'), [order])
      } else if (sortKey.startsWith('my')) {
        return orderBy(markets, (market) => sliceState.sortByUserData(api, sortKey, market), [order])
      }

      return markets
    },
    filterUserList: (api, markets, filterTypeKey) => {
      const { loansExistsMapper, marketsBalancesMapper } = get().user

      return markets.filter((market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        if (filterTypeKey === 'borrow') {
          return loansExistsMapper[userActiveKey].loanExists
        } else {
          const { vaultShares = '0', gauge = '0' } = marketsBalancesMapper[userActiveKey] ?? {}
          const totalVaultShares = +vaultShares + +gauge
          return totalVaultShares > 0
        }
      })
    },
    filterLeverageMarkets: (markets) => markets.filter((m) => m.leverage.hasLeverage()),
    sortByCollateral: (api, searchParams, markets, marketMapping) => {
      const { tableRowsSettings, ...sliceState } = get()[sliceKey]

      const parsedTableRowsSettings: { [tokenAddress: string]: TableSettings } = {}

      const { marketListMapper } = _getMarketList(markets)

      const marketsResult = sortByFn(Object.values(marketListMapper), (m) => m.symbol.toLowerCase()).map(
        (market, idx) => {
          // set table settings for each market
          parsedTableRowsSettings[market.address] = getTableRowSettings(
            market.address,
            searchParams,
            tableRowsSettings,
            idx !== 0,
          )

          const tokenOwmDatas = Object.keys(market.markets).map((k) => marketMapping[k])

          return {
            address: market.address,
            symbol: market.symbol,
            markets: sliceState
              .sortFn(
                api,
                searchParams.filterTypeKey === 'borrow' ? 'totalCollateralValue' : 'totalLiquidity',
                'desc',
                tokenOwmDatas,
              )
              .map((m) => m.id),
          }
        },
      )

      return { result: marketsResult, tableRowsSettings: parsedTableRowsSettings }
    },
    sortByAll: (api, markets, sortBy, sortByOrder) => ({
      result: [
        {
          address: 'all',
          symbol: 'all',
          markets: get()
            [sliceKey].sortFn(api, sortBy, sortByOrder, markets)
            .map((d) => d.id),
        },
      ],
      tableRowsSettings: { all: { isNotSortable: false, sortBy, sortByOrder } },
    }),
    setFormValues: async (rChainId, api, searchParams, marketMapping, shouldRefetch = true) => {
      const { markets, user } = get()
      const { activeKey: prevActiveKey, initialLoaded, tableRowsSettings, result, ...sliceState } = get()[sliceKey]

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
        formStatus: { ...DEFAULT_FORM_STATUS, isLoading: true },
        searchedByAddresses: {},
        searchedByTokens: {},
      })

      if (!api || !marketMapping) {
        logQuery(['market-list-slice', 'setFormValues'], { api: Boolean(api), marketMapping: Boolean(marketMapping) })
        return
      }

      // allow UI to update paint
      await sleep(100)

      const { signerAddress } = api
      const { filterKey, filterTypeKey, hideSmallMarkets, searchText, sortBy, sortByOrder } = searchParams

      // Get market list for table. The mapping has both address and IDs, so only use one of them
      const allMarkets = Object.entries(marketMapping)
        .filter(([key]) => !key.startsWith('0x'))
        .map(([, m]) => m)
      let cMarkets = [...allMarkets]

      if (signerAddress) {
        if (filterTypeKey === 'borrow') {
          await user.fetchUsersLoansExists(api, cMarkets, shouldRefetch)
        }

        if (filterTypeKey === 'supply') {
          await user.fetchDatas('marketsBalancesMapper', api, cMarkets, shouldRefetch)
        }
      }

      // hide small markets
      if (hideSmallMarkets) {
        await markets.fetchDatas('statsCapAndAvailableMapper', api, cMarkets, shouldRefetch)
        cMarkets = sliceState.filterSmallMarkets(api, cMarkets)
      }

      if (filterKey) {
        if (filterKey === 'user' && !!signerAddress) {
          cMarkets = sliceState.filterUserList(api, cMarkets, searchParams.filterTypeKey)
        } else if (filterKey === 'leverage') {
          cMarkets = sliceState.filterLeverageMarkets(cMarkets)
        }
      }

      // searchText
      if (searchText) {
        cMarkets = sliceState.filterBySearchText(searchText, cMarkets)
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

        await Promise.all(fns.map((k) => markets.fetchDatas(k, api, cMarkets, shouldRefetch)))
      }

      if (sortBy && sortBy.startsWith('my')) {
        await Promise.all(
          ['loansHealthsMapper', 'loansStatesMapper'].map((k) => user.fetchLoanDatas(k, api, cMarkets, shouldRefetch)),
        )
      }

      const sorted = sortBy
        ? sliceState.sortByAll(api, cMarkets, sortBy, sortByOrder)
        : sliceState.sortByCollateral(api, searchParams, cMarkets, marketMapping)

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

      await Promise.all(fns.map(({ fn, key, isTvl }) => fn(key, api, isTvl ? allMarkets : cMarkets, shouldRefetch)))
      if (!initialLoaded) sliceState.setStateByKey('initialLoaded', true)
      logSuccess(['market-list-slice', 'setFormValues'], { results: sorted.result.length, shouldRefetch })
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

function sortByRewards(
  market: OneWayMarketTemplate,
  rewardsMapper: MarketsRewardsMapper,
  ratesMapper: MarketsRatesMapper,
) {
  const rewards = rewardsMapper[market.id]?.rewards
  const rates = ratesMapper[market.id]?.rates

  if (!rewards || !rates) return 0

  const { other = [], crv = [0, 0] } = rewards
  const { lendApr } = rates

  return Number(getTotalApr(Number(lendApr), crv[0], crv[1], other)?.max ?? 0)
}

function sortByUtilization(
  market: OneWayMarketTemplate,
  statsCapAndAvailableMapper: MarketsStatsCapAndAvailableMapper,
  statsTotalsMapper: MarketsStatsTotalsMapper,
) {
  const statsCapAndAvailable = statsCapAndAvailableMapper[market.id]
  const statsTotals = statsTotalsMapper[market.id]

  if (!statsCapAndAvailable || !statsTotals) return 0

  return (+(statsTotals.totalDebt ?? '0') / +statsCapAndAvailable.cap) * 100
}

function getTableRowSettings(
  tokenAddress: string,
  { sortBy, sortByOrder, filterTypeKey }: SearchParams,
  tableSettingsMapper: { [tokenAddress: string]: TableSettings },
  isNotSortable: boolean,
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
