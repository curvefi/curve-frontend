import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'

import { _getMarketList } from '@/components/PageMarketList/utils'
import { getErrorMessage } from '@/utils/helpers'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  owmDatas: { [chainId: string]: OWMData[] }
  owmDatasMapper: { [chainId: string]: OWMDatasMapper }
  statsParametersMapper: { [chainId: string]: MarketsStatsParametersMapper }
  statsBandsMapper: { [chainId: string]: MarketsStatsBandsMapper }
  statsTotalsMapper: { [chainId: string]: MarketsStatsTotalsMapper }
  statsAmmBalancesMapper: { [chainId: string]: MarketsStatsAMMBalancesMapper }
  statsCapAndAvailableMapper: { [chainId: string]: MarketsStatsCapAndAvailableMapper }
  maxLeverageMapper: { [chainId: string]: MarketsMaxLeverageMapper }
  pricesMapper: { [chainId: string]: MarketsPricesMapper }
  ratesMapper: { [chainId: string]: MarketsRatesMapper }
  rewardsMapper: { [chainId: string]: MarketsRewardsMapper }
  totalLiquidityMapper: { [chainId: string]: MarketsTotalLiquidityMapper }
  marketDetailsView: MarketDetailsView
  vaultPricePerShare: { [chainId: string]: { [owmId: string]: { pricePerShare: string; error: string } } }
  error: string
}

const sliceKey = 'markets'

// prettier-ignore
export type MarketsSlice = {
  [sliceKey]: SliceState & {
    // grouped
    fetchMarkets(api: Api): Promise<{ owmDatasMapper: OWMDatasMapper; owmDatas: OWMData[] }>
    fetchDatas(key: string, api: Api, owmDatas: OWMData[], shouldRefetch?: boolean): Promise<void>

    // individual
    fetchAll(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<void>
    fetchVaultPricePerShare(chainId: ChainId, owmData: OWMData, shouldRefetch?: boolean): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  owmDatas: {},
  owmDatasMapper: {},
  statsParametersMapper: {},
  statsBandsMapper: {},
  statsTotalsMapper: {},
  statsAmmBalancesMapper: {},
  statsCapAndAvailableMapper: {},
  maxLeverageMapper: {},
  pricesMapper: {},
  ratesMapper: {},
  rewardsMapper: {},
  totalLiquidityMapper: {},
  marketDetailsView: '',
  vaultPricePerShare: {},
  error: '',
}

const createMarketsSlice = (set: SetState<State>, get: GetState<State>): MarketsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMarkets: async (api) => {
      const { chainId } = api
      get()[sliceKey].setStateByKey('error', '')
      const { marketList: marketListNames, error } = await helpers.fetchMarkets(api)

      let cTokens = cloneDeep(get().usdRates.tokens)
      let owmDatas: OWMData[] = []
      let owmDatasMapper: OWMDatasMapper = {}
      let owmDatasCacheMapper: OWMDatasCacheMapper = {}
      let crvusdAddress = ''

      if (error) {
        get()[sliceKey].setStateByKey('error', error)
        get()[sliceKey].setStateByActiveKey('owmDatas', chainId.toString(), owmDatas)
        get()[sliceKey].setStateByActiveKey('owmDatasMapper', chainId.toString(), owmDatasMapper)
      } else {
        marketListNames.forEach((owmId) => {
          const owm = api.getOneWayMarket(owmId)
          const { owmData, owmDataCache } = getOWMData(owm)
          const { address: cAddress } = owm.collateral_token
          const { symbol: bSymbol, address: bAddress } = owm.borrowed_token

          if (typeof cTokens[cAddress] === 'undefined') cTokens[cAddress] = ''
          if (typeof cTokens[bAddress] === 'undefined') cTokens[bAddress] = ''
          owmDatas.push(owmData)
          owmDatasMapper[owm.id] = owmData
          owmDatasCacheMapper[owm.id] = owmDataCache

          if (bSymbol.toLowerCase() === 'crvusd') crvusdAddress = bAddress
        })

        get()[sliceKey].setStateByActiveKey('owmDatas', chainId.toString(), owmDatas)
        get()[sliceKey].setStateByActiveKey('owmDatasMapper', chainId.toString(), owmDatasMapper)
        get().usdRates.setStateByKey('tokens', cTokens)

        // update market list
        const { marketListMapper } = _getMarketList(owmDatas, crvusdAddress)
        get().marketList.setStateByKey('marketListMapper', { [chainId]: marketListMapper })

        // add to cache
        get().storeCache.setStateByActiveKey('owmDatasMapper', chainId.toString(), owmDatasCacheMapper)
        get().storeCache.setStateByActiveKey('marketListMapper', chainId.toString(), marketListMapper)
      }

      return { owmDatas, owmDatasMapper }
    },
    fetchDatas: async (key, api, owmDatas, shouldRefetch) => {
      const { chainId } = api

      const fnMapper = {
        statsParametersMapper: apiLending.market.fetchStatsParameters,
        statsBandsMapper: apiLending.market.fetchStatsBands,
        statsTotalsMapper: apiLending.market.fetchStatsTotals,
        statsAmmBalancesMapper: apiLending.market.fetchStatsAmmBalances,
        statsCapAndAvailableMapper: apiLending.market.fetchStatsCapAndAvailable,
        pricesMapper: apiLending.market.fetchMarketsPrices,
        ratesMapper: apiLending.market.fetchMarketsRates,
        rewardsMapper: apiLending.market.fetchMarketsVaultsRewards,
        totalLiquidityMapper: apiLending.market.fetchMarketsVaultsTotalLiquidity,
        maxLeverageMapper: apiLending.market.fetchMarketsMaxLeverage,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const storedMapper = get()[sliceKey][k][chainId] ?? {}
      const missing = owmDatas.filter(({ owm }) => {
        return typeof storedMapper[owm.id] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      const resp = await fnMapper[k](shouldRefetch ? owmDatas : missing)
      const cMapper = cloneDeep(storedMapper)
      Object.keys(resp).forEach((owmId) => {
        cMapper[owmId] = resp[owmId]
      })
      get()[sliceKey].setStateByActiveKey(k, chainId.toString(), cMapper)
    },

    fetchAll: async (api, owmData, shouldRefetch) => {
      const keys = [
        'statsParametersMapper',
        'statsBandsMapper',
        'statsTotalsMapper',
        'statsAmmBalancesMapper',
        'statsCapAndAvailableMapper',
        'pricesMapper',
        'ratesMapper',
        'rewardsMapper',
        'totalLiquidityMapper',
      ] as const

      await Promise.all(keys.map((key) => get()[sliceKey].fetchDatas(key, api, [owmData], shouldRefetch)))
    },
    fetchVaultPricePerShare: async (chainId, { owm }, shouldRefetch) => {
      const sliceState = get()[sliceKey]
      let resp = { pricePerShare: '', error: '' }

      const { pricePerShare: foundPricePerShare } = sliceState.vaultPricePerShare[chainId]?.[owm.id] ?? {}
      if (foundPricePerShare && +foundPricePerShare > 0 && !shouldRefetch) {
        resp.pricePerShare = foundPricePerShare
      } else {
        try {
          resp.pricePerShare = await owm.vault.previewRedeem(1)
        } catch (error) {
          console.error(error)
          resp.error = getErrorMessage(error, 'error-api')
        }

        sliceState.setStateByActiveKey('vaultPricePerShare', chainId.toString(), {
          ...(get()[sliceKey].vaultPricePerShare[chainId] ?? {}),
          [owm.id]: resp,
        })
      }
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

function getOWMData(owm: OWM) {
  const owmData: OWMData = {
    owm,
    hasLeverage: owm.leverage.hasLeverage(),
    displayName: owm.name,
  }

  const owmDataCache = pick(owmData, [
    'owm.id',
    'owm.addresses',
    'owm.borrowed_token',
    'owm.collateral_token',
    'displayName',
    'hasLeverage',
  ]) as OWMDataCache

  return { owmData, owmDataCache }
}

export default createMarketsSlice
