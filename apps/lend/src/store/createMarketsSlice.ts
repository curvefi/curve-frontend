import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import pick from 'lodash/pick'

import { _getMarketList } from '@/components/PageMarketList/utils'
import { getErrorMessage } from '@/utils/helpers'
import apiLending, { helpers } from '@/lib/apiLending'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  crvusdAddress: { [chainId: string]: string }
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
  totalCollateralValuesMapper: { [chainId: string]: MarketsTotalCollateralValueMapper }
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
    fetchTotalCollateralValue(chainId: ChainId, owmData: OWMData, shouldRefetch?: boolean): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  crvusdAddress: {},
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
  totalCollateralValuesMapper: {},
  error: '',
}

const createMarketsSlice = (set: SetState<State>, get: GetState<State>): MarketsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMarkets: async (api) => {
      const { marketList, usdRates, storeCache } = get()
      const { ...sliceState } = get()[sliceKey]

      const { chainId } = api
      sliceState.setStateByKey('error', '')
      const { marketList: marketListNames, error } = await helpers.fetchMarkets(api)

      const chainIdStr = chainId.toString()
      let cTokens = { ...usdRates.tokens }
      let owmDatas: OWMData[] = []
      let owmDatasMapper: OWMDatasMapper = {}
      let owmDatasCacheMapper: OWMDatasCacheMapper = {}
      let crvusdAddress = ''

      if (error) {
        sliceState.setStateByKey('error', error)
        sliceState.setStateByActiveKey('owmDatas', chainIdStr, owmDatas)
        sliceState.setStateByActiveKey('owmDatasMapper', chainIdStr, owmDatasMapper)
      } else {
        marketListNames.forEach((owmId) => {
          if (networks[chainId].hideMarketsInUI[owmId]) return

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

        sliceState.setStateByActiveKey('crvusdAddress', chainIdStr, crvusdAddress)
        sliceState.setStateByActiveKey('owmDatas', chainIdStr, owmDatas)
        sliceState.setStateByActiveKey('owmDatasMapper', chainIdStr, owmDatasMapper)
        usdRates.setStateByKey('tokens', cTokens)

        // update market list
        const { marketListMapper } = _getMarketList(owmDatas, crvusdAddress)
        marketList.setStateByKey('marketListMapper', { [chainId]: marketListMapper })

        // add to cache
        storeCache.setStateByActiveKey('owmDatasMapper', chainIdStr, owmDatasCacheMapper)
        storeCache.setStateByActiveKey('marketListMapper', chainIdStr, marketListMapper)
      }

      return { owmDatas, owmDatasMapper }
    },
    fetchDatas: async (key, api, owmDatas, shouldRefetch) => {
      const { ...sliceState } = get()[sliceKey]

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
        totalCollateralValuesMapper: apiLending.market.fetchMarketsTotalCollateralValue,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const storedMapper = get()[sliceKey][k][chainId] ?? {}
      const missing = owmDatas.filter(({ owm }) => {
        return typeof storedMapper[owm.id] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      const resp =
        k === 'totalCollateralValuesMapper'
          ? await fnMapper[k](api, shouldRefetch ? owmDatas : missing)
          : await fnMapper[k](shouldRefetch ? owmDatas : missing)
      const cMapper = { ...storedMapper }
      Object.keys(resp).forEach((owmId) => {
        cMapper[owmId] = resp[owmId]
      })
      sliceState.setStateByActiveKey(k, chainId.toString(), cMapper)
    },

    fetchAll: async (api, owmData, shouldRefetch) => {
      const { ...sliceState } = get()[sliceKey]

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

      await Promise.all(keys.map((key) => sliceState.fetchDatas(key, api, [owmData], shouldRefetch)))
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
    fetchTotalCollateralValue: async (chainId, owmData, shouldRefetch) => {
      const { api } = get()
      const { totalCollateralValuesMapper, ...sliceState } = get()[sliceKey]

      const totalCollateralValue = totalCollateralValuesMapper[chainId]?.[owmData.owm.id]

      if (!api || (typeof totalCollateralValue !== 'undefined' && !shouldRefetch)) return

      const { owm } = owmData

      const resp = (await apiLending.market.fetchMarketsTotalCollateralValue(api, [owmData]))[owm.id]

      sliceState.setStateByActiveKey('totalCollateralValuesMapper', `${chainId}`, {
        ...(get()[sliceKey].totalCollateralValuesMapper[chainId] ?? {}),
        [owm.id]: resp,
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
    resetState: () => {
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
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
