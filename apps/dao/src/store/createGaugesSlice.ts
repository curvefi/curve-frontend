import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'

import { shortenTokenAddress } from '@/ui/utils'
import { platform } from 'os'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gaugesLoading: boolean
  filteringGaugesLoading: boolean
  activeSortBy: SortByFilterGauges
  activeSortDirection: ActiveSortDirection
  searchValue: string
  gaugeMapper: PricesGaugeOverviewData[]
  gaugeFormattedData: GaugeFormattedData[]
  filteredGauges: GaugeFormattedData[]
}

const sliceKey = 'gauges'

// prettier-ignore
export type GaugesSlice = {
  [sliceKey]: SliceState & {
    getGauges(curve: CurveApi): Promise<void>
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
  gaugesLoading: true,
  filteringGaugesLoading: true,
  activeSortBy: 'relativeWeight',
  activeSortDirection: 'desc',
  searchValue: '',
  gaugeMapper: [],
  gaugeFormattedData: [],
  filteredGauges: [],
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createGaugesSlice = (set: SetState<State>, get: GetState<State>): GaugesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getGauges: async (curve: CurveApi) => {
      try {
        get().setAppStateByKey(sliceKey, 'gaugesLoading', true)

        const gauges = await fetch('https://prices.curve.fi/v1/dao/gauges/overview')
        const formattedGauges: PricesGaugeOverviewResponse = await gauges.json()

        const gaugeFormattedData = formattedGauges.gauges
          .map((gauge) => ({
            ...gauge,
            // make dynamic
            platform: gauge.market !== null ? 'Lend' : 'AMM',
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
        get().setAppStateByKey(sliceKey, 'gaugeFormattedData', gaugeFormattedData)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', false)
      } catch (error) {
        console.log(error)
      }
    },
    selectFilteredSortedGauges: () => {
      const { gaugeFormattedData, activeSortBy, activeSortDirection } = get()[sliceKey]

      let gaugesCopy = [...gaugeFormattedData]

      if (activeSortBy === 'relativeWeight') {
        if (activeSortDirection === 'asc') {
          gaugesCopy = gaugesCopy.sort((a, b) => a.gauge_relative_weight - b.gauge_relative_weight)
        } else {
          gaugesCopy = gaugesCopy.sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
        }
      } else if (activeSortBy === '7dayWeight') {
        if (activeSortDirection === 'asc') {
          gaugesCopy = gaugesCopy.sort((a, b) => (a.gauge_weight_7d_delta ?? 0) - (b.gauge_weight_7d_delta ?? 0))
        } else {
          gaugesCopy = gaugesCopy.sort((a, b) => (b.gauge_weight_7d_delta ?? 0) - (a.gauge_weight_7d_delta ?? 0))
        }
      } else if (activeSortBy === '60dayWeight') {
        if (activeSortDirection === 'asc') {
          gaugesCopy = gaugesCopy.sort((a, b) => (a.gauge_weight_60d_delta ?? 0) - (b.gauge_weight_60d_delta ?? 0))
        } else {
          gaugesCopy = gaugesCopy.sort((a, b) => (b.gauge_weight_60d_delta ?? 0) - (a.gauge_weight_60d_delta ?? 0))
        }
      } else {
        gaugesCopy = orderBy(gaugesCopy, [activeSortBy], [activeSortDirection])
      }

      return gaugesCopy
    },
    setGauges: (searchValue: string) => {
      const { selectFilteredSortedGauges } = get()[sliceKey]
      get()[sliceKey].setStateByKey('filteringGaugesLoading', true)

      setTimeout(() => {
        const gauges = selectFilteredSortedGauges()

        if (searchValue !== '') {
          const searchFilteredProposals = searchFn(searchValue, gauges)
          get()[sliceKey].setStateByKeys({
            filteringGaugesLoading: false,
            filteredGauges: searchFilteredProposals,
          })
          return searchFilteredProposals
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

  const result = fuse.search(filterValue, { limit: 10 })

  return result.map((r) => r.item)
}

export default createGaugesSlice
