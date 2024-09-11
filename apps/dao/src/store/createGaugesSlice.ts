import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import produce from 'immer'

import { shortenTokenAddress } from '@/ui/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gaugesLoading: FetchingState
  filteringGaugesLoading: boolean
  gaugeListSortBy: SortByFilterGauges
  searchValue: string
  gaugeMapper: GaugeMapper
  gaugeVotesMapper: GaugeVotesMapper
  gaugeWeightHistoryMapper: { [address: string]: { loadingState: FetchingState; data: GaugeWeightHistoryData[] } }
  filteredGauges: GaugeFormattedData[]
  gaugeVotesSortBy: {
    key: GaugeVotesSortBy
    order: SortDirection
  }
  selectGaugeFilterValue: string
  selectGaugeListResult: GaugeFormattedData[]
  selectedGauge: GaugeFormattedData | null
}

type FilterOptions = {
  showSearch?: boolean
  endsWith(string: string, substring: string): boolean
}

const sliceKey = 'gauges'

// prettier-ignore
export type GaugesSlice = {
  [sliceKey]: SliceState & {
    getGauges(forceReload?: boolean): Promise<void>
    getGaugeVotes(gaugeAddress: string): Promise<void>
    getHistoricGaugeWeights(gaugeAddress: string): Promise<void>
    setSearchValue(searchValue: string): void
    setGaugeListSortBy(sortByKey: SortByFilterGaugesKeys): void
    selectFilteredSortedGauges(): GaugeFormattedData[]
    setGauges(searchValue: string): void
    setGaugeVotesSortBy(gaugeAddress: string, sortBy: GaugeVotesSortBy): void
    setSelectGaugeFilterValue(filterValue: string, gauges: GaugeFormattedData[], filterOptions: FilterOptions): void
    setSelectedGauge(gauge: GaugeFormattedData | null): void

    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gaugesLoading: 'LOADING',
  filteringGaugesLoading: true,
  gaugeListSortBy: {
    key: 'gauge_relative_weight',
    order: 'desc',
  },
  searchValue: '',
  gaugeMapper: {},
  gaugeVotesMapper: {},
  gaugeWeightHistoryMapper: {},
  filteredGauges: [],
  gaugeVotesSortBy: {
    key: 'timestamp',
    order: 'desc',
  },
  selectGaugeFilterValue: '',
  selectGaugeListResult: [],
  selectedGauge: null,
}

const createGaugesSlice = (set: SetState<State>, get: GetState<State>): GaugesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getGauges: async (forceReload: boolean = false) => {
      const { gaugeMapper } = get()[sliceKey]

      if (Object.keys(gaugeMapper).length === 0 || forceReload) {
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'LOADING')
      }

      try {
        const response = await fetch('https://prices.curve.fi/v1/dao/gauges/overview')
        const formattedGauges: PricesGaugeOverviewResponse = await response.json()

        const newGaugeMapper: GaugeMapper = {}

        formattedGauges.gauges.forEach((gauge) => {
          newGaugeMapper[gauge.address.toLowerCase()] = {
            ...gauge,
            platform: gauge.market !== null ? 'Lend' : gauge.pool !== null ? 'AMM' : '',
            title: formatGaugeTitle(gauge.pool?.name, gauge.market?.name ?? null, gauge.address),
            gauge_weight: +gauge.gauge_weight,
            gauge_relative_weight: +(gauge.gauge_relative_weight * 100).toFixed(4),
            gauge_relative_weight_7d_delta:
              gauge.gauge_relative_weight_7d_delta != null
                ? +(gauge.gauge_relative_weight_7d_delta * 100).toFixed(4)
                : null,
            gauge_relative_weight_60d_delta:
              gauge.gauge_relative_weight_60d_delta != null
                ? +(gauge.gauge_relative_weight_60d_delta * 100).toFixed(4)
                : null,
          }
        })

        get().setAppStateByKey(sliceKey, 'gaugeMapper', newGaugeMapper)
        get().storeCache.setStateByKey('cacheGaugeMapper', newGaugeMapper)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'SUCCESS')
      } catch (error) {
        console.error('Error fetching gauges:', error)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'ERROR')
      }
    },
    getGaugeVotes: async (gaugeAddress: string) => {
      const address = gaugeAddress.toLowerCase()

      set(
        produce(get(), (state) => {
          state[sliceKey].gaugeVotesMapper[gaugeAddress] = {
            fetchingState: 'LOADING',
            votes: [],
          }
        })
      )

      try {
        const response = await fetch(`https://prices.curve.fi/v1/dao/gauges/${address}/votes`)
        const data: GaugeVotesResponse = await response.json()

        const formattedData = data.votes.map((vote) => ({
          ...vote,
          timestamp: new Date(vote.timestamp).getTime(),
        }))

        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeVotesMapper[gaugeAddress] = {
              fetchingState: 'SUCCESS',
              votes: formattedData,
            }
          })
        )
      } catch (error) {
        console.error('Error fetching gauge votes:', error)
        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeVotesMapper[gaugeAddress].fetchingState = 'ERROR'
          })
        )
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
      const { gaugeMapper, gaugeListSortBy } = get()[sliceKey]
      const cacheGaugeMapper = get().storeCache.cacheGaugeMapper
      const gaugeData = gaugeMapper ?? cacheGaugeMapper
      const sortedGauges = sortGauges(gaugeData, gaugeListSortBy)
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
    setGaugeVotesSortBy: (gaugeAddress: string, sortBy: GaugeVotesSortBy) => {
      const address = gaugeAddress.toLowerCase()

      const {
        gaugeVotesMapper: {
          [address]: { votes },
        },
        gaugeVotesSortBy,
      } = get()[sliceKey]

      let order = gaugeVotesSortBy.order
      if (sortBy === gaugeVotesSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            const reversedEntries = [...votes].reverse()
            state[sliceKey].gaugeVotesMapper[address].votes = reversedEntries
            state[sliceKey].gaugeVotesSortBy.order = order
          })
        )
      } else {
        const sortedEntries = [...votes].sort((a, b) => {
          return b[sortBy] - a[sortBy]
        })

        set(
          produce((state) => {
            state[sliceKey].gaugeVotesSortBy.key = sortBy
            state[sliceKey].gaugeVotesSortBy.order = 'desc'
            state[sliceKey].gaugeVotesMapper[address].votes = sortedEntries
          })
        )
      }
    },
    setSearchValue: (filterValue) => {
      get()[sliceKey].setStateByKey('searchValue', filterValue)
    },
    setGaugeListSortBy: (sortByKey: SortByFilterGaugesKeys) => {
      if (sortByKey === get()[sliceKey].gaugeListSortBy.key) {
        get()[sliceKey].setStateByKey('gaugeListSortBy', {
          key: sortByKey,
          order: get()[sliceKey].gaugeListSortBy.order === 'asc' ? 'desc' : 'asc',
        })
      } else {
        get()[sliceKey].setStateByKey('gaugeListSortBy', {
          key: sortByKey,
          order: get()[sliceKey].gaugeListSortBy.order,
        })
      }
    },
    setSelectGaugeFilterValue: (filterValue, gauges, filterOptions) => {
      get()[sliceKey].setStateByKey('searchValue', filterValue)

      // filter result
      let result = gauges

      if (filterValue && filterOptions.showSearch) {
        result = selectGaugeFilterFn(filterValue, gauges, filterOptions)
      }
      get()[sliceKey].setStateByKey('selectGaugeListResult', result)
    },
    setSelectedGauge: (gauge) => {
      if (!gauge) {
        get()[sliceKey].setStateByKey('selectedGauge', null)
        return
      }

      get()[sliceKey].setStateByKey('selectedGauge', gauge)
    },

    // slice helpers
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

const selectGaugeFilterFn = (filterValue: string, gauges: GaugeFormattedData[], { endsWith }: FilterOptions) => {
  const fuse = new Fuse<GaugeFormattedData>(gauges, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: ['title', 'address'],
  })

  const result = fuse.search(filterValue)

  if (result.length > 0) {
    return result.map((r) => r.item)
  } else {
    return gauges.filter((item) => endsWith(item.address, filterValue))
  }
}

const sortGauges = (gauges: GaugeMapper, sortBy: SortByFilterGauges): GaugeFormattedData[] => {
  const gaugeArray = Object.values(gauges)

  const sortFn = (a: GaugeFormattedData, b: GaugeFormattedData): number => {
    if (sortBy.order === 'asc') {
      return (a[sortBy.key] ?? 0) - (b[sortBy.key] ?? 0)
    } else {
      return (b[sortBy.key] ?? 0) - (a[sortBy.key] ?? 0)
    }
  }

  return gaugeArray.sort(sortFn)
}

const formatGaugeTitle = (poolName: string | undefined, marketName: string | null, address: string): string => {
  if (poolName) {
    return (poolName.split(': ')[1] || poolName)
      .replace(/curve\.fi/i, '')
      .replace(/\(FRAXBP\)/i, '')
      .trim()
  }
  return marketName ?? shortenTokenAddress(address) ?? ''
}

export default createGaugesSlice
