import type { StoreApi } from 'zustand'
import { invalidateMarketDetails } from '@/lend/entities/market-details'
import apiLending from '@/lend/lib/apiLending'
import type { State } from '@/lend/store/useStore'
import {
  Api,
  ChainId,
  MarketDetailsView,
  MarketsMaxLeverageMapper,
  MarketsPricesMapper,
  MarketsRatesMapper,
  MarketsRewardsMapper,
  MarketsStatsBandsMapper,
  MarketsStatsCapAndAvailableMapper,
  MarketsStatsParametersMapper,
  OneWayMarketTemplate,
} from '@/lend/types/lend.types'
import { getErrorMessage } from '@/lend/utils/helpers'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  statsParametersMapper: { [chainId: string]: MarketsStatsParametersMapper }
  statsBandsMapper: { [chainId: string]: MarketsStatsBandsMapper }
  statsCapAndAvailableMapper: { [chainId: string]: MarketsStatsCapAndAvailableMapper }
  maxLeverageMapper: { [chainId: string]: MarketsMaxLeverageMapper }
  pricesMapper: { [chainId: string]: MarketsPricesMapper }
  ratesMapper: { [chainId: string]: MarketsRatesMapper }
  rewardsMapper: { [chainId: string]: MarketsRewardsMapper }
  marketDetailsView: MarketDetailsView
  vaultPricePerShare: { [chainId: string]: { [owmId: string]: { pricePerShare: string; error: string } } }
}

const sliceKey = 'markets'

// prettier-ignore
export type MarketsSlice = {
  [sliceKey]: SliceState & {
    // grouped
    fetchDatas(key: string, api: Api, markets: OneWayMarketTemplate[], shouldRefetch?: boolean): Promise<void>

    // individual
    fetchAll(api: Api, OneWayMarketTemplate: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<void>
    fetchVaultPricePerShare(chainId: ChainId, OneWayMarketTemplate: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  statsParametersMapper: {},
  statsBandsMapper: {},
  statsCapAndAvailableMapper: {},
  maxLeverageMapper: {},
  pricesMapper: {},
  ratesMapper: {},
  rewardsMapper: {},
  marketDetailsView: '',
  vaultPricePerShare: {},
}

const createMarketsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): MarketsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    fetchDatas: async (key, api, markets, shouldRefetch) => {
      const { ...sliceState } = get()[sliceKey]

      const { chainId } = api

      const fnMapper = {
        statsParametersMapper: apiLending.market.fetchStatsParameters,
        statsBandsMapper: apiLending.market.fetchStatsBands,
        statsCapAndAvailableMapper: apiLending.market.fetchStatsCapAndAvailable,
        pricesMapper: apiLending.market.fetchMarketsPrices,
        ratesMapper: apiLending.market.fetchMarketsRates,
        rewardsMapper: apiLending.market.fetchMarketsVaultsRewards,
        maxLeverageMapper: apiLending.market.fetchMarketsMaxLeverage,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const storedMapper = get()[sliceKey][k][chainId] ?? {}
      const missing = markets.filter(({ id }) => typeof storedMapper[id] === 'undefined')

      if (missing.length === 0 && !shouldRefetch) return

      const resp = await fnMapper[k](shouldRefetch ? markets : missing)
      const cMapper = { ...storedMapper }
      Object.keys(resp).forEach((owmId) => {
        cMapper[owmId] = resp[owmId]
      })
      sliceState.setStateByActiveKey(k, chainId.toString(), cMapper)
    },

    fetchAll: async (api, OneWayMarketTemplate, shouldRefetch) => {
      const { ...sliceState } = get()[sliceKey]
      const chainId = api.chainId
      const marketId = OneWayMarketTemplate.id

      const keys = [
        'statsParametersMapper',
        'statsBandsMapper',
        'statsCapAndAvailableMapper',
        'pricesMapper',
        'ratesMapper',
        'rewardsMapper',
      ] as const

      // invalidate and refetch onchain data
      invalidateMarketDetails({ chainId, marketId })
      await Promise.all(keys.map((key) => sliceState.fetchDatas(key, api, [OneWayMarketTemplate], shouldRefetch)))
    },
    fetchVaultPricePerShare: async (chainId, owm, shouldRefetch) => {
      const sliceState = get()[sliceKey]
      const resp = { pricePerShare: '', error: '' }

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
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export default createMarketsSlice
