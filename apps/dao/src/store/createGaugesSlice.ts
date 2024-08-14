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
  gaugeMapper: GaugeMapper
  gaugeVotesMapper: GaugeVotesMapper
  gaugeWeightHistoryMapper: { [address: string]: { loadingState: FetchingState; data: GaugeWeightHistoryData[] } }
  filteredGauges: GaugeFormattedData[]
  gaugeVotesSortBy: {
    key: GaugeVotesSortBy
    order: 'asc' | 'desc'
  }
}

const sliceKey = 'gauges'

// prettier-ignore
export type GaugesSlice = {
  [sliceKey]: SliceState & {
    getGauges(forceReload?: boolean): Promise<void>
    getGaugeVotes(gaugeAddress: string): Promise<void>
    getHistoricGaugeWeights(gaugeAddress: string): Promise<void>
    setSearchValue(searchValue: string): void
    setActiveSortBy(sortBy: SortByFilterGauges): void
    setActiveSortDirection(direction: ActiveSortDirection): void
    selectFilteredSortedGauges(): GaugeFormattedData[]
    setGauges(searchValue: string): void
    setGaugeVotesSortBy(gaugeAddress: string, sortBy: GaugeVotesSortBy): void
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
  gaugeMapper: {},
  gaugeVotesMapper: {},
  gaugeWeightHistoryMapper: {},
  filteredGauges: [],
  gaugeVotesSortBy: {
    key: 'timestamp',
    order: 'desc',
  },
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
            title: gauge.pool?.name
              ? (gauge.pool.name.split(': ')[1] || gauge.pool.name).replace(/curve\.fi/i, '').trim()
              : gauge.market?.name ?? shortenTokenAddress(gauge.address) ?? '',
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
      const { gaugeMapper, activeSortBy, activeSortDirection } = get()[sliceKey]
      const cacheGaugeMapper = get().storeCache.cacheGaugeMapper
      const gaugeData = gaugeMapper ?? cacheGaugeMapper
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
            state[sliceKey].userGaugeVotesMapper[address].votes = reversedEntries
            state[sliceKey].userGaugeVotesSortBy.order = order
          })
        )
      } else {
        const sortedEntries = [...votes].sort((a, b) => {
          return b[sortBy] - a[sortBy]
        })

        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesSortBy.key = sortBy
            state[sliceKey].userGaugeVotesSortBy.order = 'desc'
            state[sliceKey].userGaugeVotesMapper[address].votes = sortedEntries
          })
        )
      }
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

const sortGauges = (
  gauges: GaugeMapper,
  sortBy: SortByFilterGauges,
  sortDirection: ActiveSortDirection
): GaugeFormattedData[] => {
  const gaugeArray = Object.values(gauges)

  const sortFn = (a: GaugeFormattedData, b: GaugeFormattedData): number => {
    switch (sortBy) {
      case 'relativeWeight':
        return (b.gauge_relative_weight - a.gauge_relative_weight) * (sortDirection === 'asc' ? -1 : 1)
      case '7dayWeight':
        return (
          ((b.gauge_relative_weight_7d_delta ?? 0) - (a.gauge_relative_weight_7d_delta ?? 0)) *
          (sortDirection === 'asc' ? -1 : 1)
        )
      case '60dayWeight':
        return (
          ((b.gauge_relative_weight_60d_delta ?? 0) - (a.gauge_relative_weight_60d_delta ?? 0)) *
          (sortDirection === 'asc' ? -1 : 1)
        )
      default:
        return sortDirection === 'asc'
          ? (a[sortBy] as string).localeCompare(b[sortBy] as string)
          : (b[sortBy] as string).localeCompare(a[sortBy] as string)
    }
  }

  return gaugeArray.sort(sortFn)
}

export default createGaugesSlice
