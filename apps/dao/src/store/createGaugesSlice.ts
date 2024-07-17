import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'

import { shortenTokenAddress } from '@/ui/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gaugesLoading: FetchingState
  filteringGaugesLoading: boolean
  activeSortBy: SortByFilterGauges
  activeSortDirection: ActiveSortDirection
  searchValue: string
  gaugeMapper: PricesGaugeOverviewData[]
  gaugeWeightHistoryMapper: { [address: string]: { loadingState: FetchingState; data: GaugeWeightHistoryData[] } }
  gaugeFormattedData: GaugeFormattedData[]
  filteredGauges: GaugeFormattedData[]
}

const sliceKey = 'gauges'

// prettier-ignore
export type GaugesSlice = {
  [sliceKey]: SliceState & {
    getGauges(forceReload?: boolean): Promise<void>
    getHistoricGaugeWeights(gaugeAddress: string): Promise<void>
    setSearchValue(searchValue: string): void
    setActiveSortBy(sortBy: SortByFilterGauges): void
    setActiveSortDirection(direction: ActiveSortDirection): void
    selectFilteredSortedGauges(): GaugeFormattedData[]
    setGauges(searchValue: string): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gaugesLoading: 'LOADING',
  filteringGaugesLoading: true,
  activeSortBy: 'relativeWeight',
  activeSortDirection: 'desc',
  searchValue: '',
  gaugeMapper: [],
  gaugeWeightHistoryMapper: {},
  gaugeFormattedData: [],
  filteredGauges: [],
}

const createGaugesSlice = (set: SetState<State>, get: GetState<State>): GaugesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getGauges: async (forceReload: boolean = false) => {
      const { gaugeMapper } = get()[sliceKey]

      if (gaugeMapper.length === 0 || forceReload) {
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'LOADING')
      }

      try {
        const gauges = await fetch('https://prices.curve.fi/v1/dao/gauges/overview')
        const formattedGauges: PricesGaugeOverviewResponse = await gauges.json()

        const gaugeFormattedData = formattedGauges.gauges
          .map((gauge) => ({
            ...gauge,
            platform: gauge.market !== null ? 'Lend' : gauge.pool !== null ? 'AMM' : null,
            title: gauge.pool?.name
              ? // remove extras like "Factory Pool" etc
                (gauge.pool.name.split(': ')[1] || gauge.pool.name).replace(/curve\.fi/i, '').trim()
              : gauge.market?.name
              ? gauge.market.name
              : shortenTokenAddress(gauge.address),
            gauge_relative_weight: +(gauge.gauge_relative_weight * 100).toFixed(4),
            gauge_relative_weight_7d_delta:
              gauge.gauge_relative_weight_7d_delta != null
                ? +(gauge.gauge_relative_weight_7d_delta * 100).toFixed(4)
                : null,
            gauge_relative_weight_60d_delta:
              gauge.gauge_relative_weight_60d_delta != null
                ? +(gauge.gauge_relative_weight_60d_delta * 100).toFixed(4)
                : null,
          }))
          .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)

        get().setAppStateByKey(sliceKey, 'gaugeMapper', formattedGauges.gauges)
        get().storeCache.setStateByKey('cacheGaugeMapper', gaugeFormattedData)
        get().setAppStateByKey(sliceKey, 'gaugeFormattedData', gaugeFormattedData)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'SUCCESS')
      } catch (error) {
        console.log(error)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'ERROR')
      }
    },
    getHistoricGaugeWeights: async (gaugeAddress: string) => {
      set(
        produce(get(), (state) => {
          state[sliceKey].gaugeWeightHistoryMapper[gaugeAddress] = {
            loadingState: 'LOADING',
            data: [],
          }
        })
      )

      try {
        const weights = await fetch(`https://prices.curve.fi/v1/dao/gauges/${gaugeAddress}/weight_history`)
        const weightsData = await weights.json()

        const formattedWeightsData = weightsData.data
          .map((weight: GaugeWeightHistoryData) => ({
            ...weight,
            gauge_weight: +weight.gauge_weight / 1e18,
            gauge_relative_weight: ((+weight.gauge_relative_weight / 1e18) * 100).toFixed(2),
            emissions: +weight.emissions,
          }))
          .sort((a: GaugeWeightHistoryData, b: GaugeWeightHistoryData) => a.epoch - b.epoch)

        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeWeightHistoryMapper[gaugeAddress] = {
              loadingState: 'SUCCESS',
              data: formattedWeightsData,
            }
            state.storeCache.cacheGaugeWeightHistoryMapper[gaugeAddress] = formattedWeightsData
          })
        )
      } catch (error) {
        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeWeightHistoryMapper[gaugeAddress].loadingState = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    selectFilteredSortedGauges: () => {
      const { gaugeFormattedData, activeSortBy, activeSortDirection } = get()[sliceKey]
      const cacheGaugeMapper = get().storeCache.cacheGaugeMapper
      const gaugeData = gaugeFormattedData ?? cacheGaugeMapper
      const sortedGauges = sortGauges(gaugeData, activeSortBy, activeSortDirection)
      return sortedGauges
    },
    setGauges: (searchValue: string) => {
      const { selectFilteredSortedGauges } = get()[sliceKey]
      get()[sliceKey].setStateByKey('filteringGaugesLoading', true)

      setTimeout(() => {
        const gauges = selectFilteredSortedGauges()

        if (searchValue !== '') {
          const searchFilteredGauges = searchFn(searchValue, gauges)
          get()[sliceKey].setStateByKeys({
            filteringGaugesLoading: false,
            filteredGauges: searchFilteredGauges,
          })
          return searchFilteredGauges
        }

        get()[sliceKey].setStateByKeys({
          filteringGaugesLoading: false,
          filteredGauges: gauges,
        })
      }, 500)
    },
    setSearchValue: (filterValue) => {
      get()[sliceKey].setStateByKey('searchValue', filterValue)
    },
    setActiveSortDirection: (direction: ActiveSortDirection) => {
      get()[sliceKey].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilterGauges) => {
      get()[sliceKey].setStateByKey('activeSortBy', sortBy)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

const convertNumber = (number: number) => {
  return number / 10 ** 18
}

const searchFn = (filterValue: string, gauges: GaugeFormattedData[]) => {
  const fuse = new Fuse<GaugeFormattedData>(gauges, {
    ignoreLocation: true,
    threshold: 0.3,
    includeScore: true,
    keys: [
      'address',
      'lp_token',
      'name',
      'platform',
      'pool.chain',
      'market.chain',
      // {
      //   name: 'metaData',
      //   getFn: (proposal) => {
      //     // Preprocess the metaData field
      //     const metaData = proposal.metadata || ''
      //     return metaData.toLowerCase()
      //   },
      // },
    ],
  })

  const result = fuse.search(filterValue)

  return result.map((r) => r.item)
}

const sortGauges = (gauges: GaugeFormattedData[], sortBy: SortByFilterGauges, sortDirection: ActiveSortDirection) => {
  let gaugesCopy = [...gauges]

  if (sortBy === 'relativeWeight') {
    if (sortDirection === 'asc') {
      gaugesCopy = gaugesCopy.sort((a, b) => a.gauge_relative_weight - b.gauge_relative_weight)
    } else {
      gaugesCopy = gaugesCopy.sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
    }
  } else if (sortBy === '7dayWeight') {
    if (sortDirection === 'asc') {
      gaugesCopy = gaugesCopy.sort((a, b) => (a.gauge_weight_7d_delta ?? 0) - (b.gauge_weight_7d_delta ?? 0))
    } else {
      gaugesCopy = gaugesCopy.sort((a, b) => (b.gauge_weight_7d_delta ?? 0) - (a.gauge_weight_7d_delta ?? 0))
    }
  } else if (sortBy === '60dayWeight') {
    if (sortDirection === 'asc') {
      gaugesCopy = gaugesCopy.sort((a, b) => (a.gauge_weight_60d_delta ?? 0) - (b.gauge_weight_60d_delta ?? 0))
    } else {
      gaugesCopy = gaugesCopy.sort((a, b) => (b.gauge_weight_60d_delta ?? 0) - (a.gauge_weight_60d_delta ?? 0))
    }
  } else {
    gaugesCopy = orderBy(gaugesCopy, [sortBy], [sortDirection])
  }

  return gaugesCopy
}

export default createGaugesSlice
