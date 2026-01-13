import Fuse from 'fuse.js'
import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import { invalidateUserGaugeVoteNextTimeQuery } from '@/dao/entities/user-gauge-vote-next-time'
import { invalidateUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import type { State } from '@/dao/store/useStore'
import {
  CurveGaugeResponse,
  FetchingState,
  GaugeCurveApiDataMapper,
  GaugeFormattedData,
  GaugeMapper,
  GaugeVotesMapper,
  GaugeVotesResponse,
  GaugeVotesSortBy,
  GaugeWeightHistoryData,
  PricesGaugeOverviewResponse,
  SortByFilterGauges,
  SortByFilterGaugesKeys,
  SortDirection,
  TransactionState,
} from '@/dao/types/dao.types'
import { getLib, notify, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'
import { helpers } from '../lib/curvejs'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gaugesLoading: FetchingState | null
  txCastVoteState: {
    state: TransactionState
    hash: string
    errorMessage: string
  } | null
  filteringGaugesLoading: boolean
  gaugeListSortBy: SortByFilterGauges
  searchValue: string
  gaugeMapper: GaugeMapper
  gaugeCurveApiData: {
    fetchingState: FetchingState
    data: GaugeCurveApiDataMapper
  }
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
    getGaugesData(): Promise<void>
    getGaugeVotes(gaugeAddress: string): Promise<void>
    getHistoricGaugeWeights(gaugeAddress: string): Promise<void>

    setSearchValue(searchValue: string): void
    setGaugeListSortBy(sortByKey: SortByFilterGaugesKeys): void
    selectFilteredSortedGauges(): GaugeFormattedData[]
    setGauges(searchValue: string): void
    setGaugeVotesSortBy(gaugeAddress: string, sortBy: GaugeVotesSortBy): void
    setSelectGaugeFilterValue(filterValue: string, gauges: GaugeFormattedData[], filterOptions: FilterOptions): void
    setSelectedGauge(gauge: GaugeFormattedData | null): void

    castVote(userAddress: string, gaugeAddress: string, voteWeight: number): Promise<void>

    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gaugesLoading: null,
  txCastVoteState: null,
  filteringGaugesLoading: true,
  gaugeListSortBy: {
    key: 'gauge_relative_weight',
    order: 'desc',
  },
  searchValue: '',
  gaugeMapper: {},
  gaugeCurveApiData: {
    fetchingState: 'LOADING',
    data: {},
  },
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

export const createGaugesSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): GaugesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getGauges: async (forceReload: boolean = false) => {
      const { gaugeMapper } = get()[sliceKey]

      if (Object.keys(gaugeMapper).length === 0 || forceReload) {
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'LOADING')
      }

      try {
        const response = await fetch('https://prices.curve.finance/v1/dao/gauges/overview')
        const formattedGauges: PricesGaugeOverviewResponse = await response.json()

        const newGaugeMapper: GaugeMapper = {}

        formattedGauges.gauges.forEach((gauge) => {
          // effective_address is the sidechain gauge address
          newGaugeMapper[gauge.effective_address?.toLowerCase() ?? gauge.address.toLowerCase()] = {
            ...gauge,
            platform: gauge.market !== null ? 'Lend' : gauge.pool !== null ? 'AMM' : '',
            title: formatGaugeTitle(gauge.pool?.name, gauge.market?.name ?? null, gauge.address),
            gauge_weight: +gauge.gauge_weight,
            gauge_relative_weight: +(gauge.gauge_relative_weight * 100),
            gauge_relative_weight_7d_delta:
              gauge.gauge_relative_weight_7d_delta != null ? +(gauge.gauge_relative_weight_7d_delta * 100) : null,
            gauge_relative_weight_60d_delta:
              gauge.gauge_relative_weight_60d_delta != null ? +(gauge.gauge_relative_weight_60d_delta * 100) : null,
          }
        })

        get().setAppStateByKey(sliceKey, 'gaugeMapper', newGaugeMapper)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'SUCCESS')
      } catch (error) {
        console.error('Error fetching gauges:', error)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', 'ERROR')
      }
    },
    getGaugesData: async () => {
      set(
        produce(get(), (state) => {
          state[sliceKey].gaugeCurveApiData = {
            fetchingState: 'LOADING',
            data: {},
          }
        }),
      )

      try {
        const response = await fetch(`https://api.curve.finance/v1/getAllGauges`)
        const data: CurveGaugeResponse = await response.json()

        const gaugeDataMapper: GaugeCurveApiDataMapper = Object.values(data.data).reduce((acc, gaugeData) => {
          if (gaugeData.gauge) {
            acc[gaugeData.gauge.toLowerCase()] = gaugeData
          }
          return acc
        }, {} as GaugeCurveApiDataMapper)

        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeCurveApiData = {
              fetchingState: 'SUCCESS',
              data: gaugeDataMapper,
            }
          }),
        )
      } catch (error) {
        console.error('Error fetching gauges data:', error)
        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeCurveApiData.fetchingState = 'ERROR'
          }),
        )
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
        }),
      )

      try {
        const response = await fetch(`https://prices.curve.finance/v1/dao/gauges/${address}/votes`)
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
          }),
        )
      } catch (error) {
        console.error('Error fetching gauge votes:', error)
        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeVotesMapper[gaugeAddress].fetchingState = 'ERROR'
          }),
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
        }),
      )

      try {
        const weights = await fetch(`https://prices.curve.finance/v1/dao/gauges/${gaugeAddress}/weight_history`)
        const weightsData = await weights.json()

        const formattedWeightsData = weightsData.data
          .map((weight: GaugeWeightHistoryData) => ({
            ...weight,
            gauge_weight: +weight.gauge_weight / 1e18,
            gauge_relative_weight: (+weight.gauge_relative_weight / 1e18) * 100,
            emissions: +weight.emissions,
          }))
          .sort((a: GaugeWeightHistoryData, b: GaugeWeightHistoryData) => a.epoch - b.epoch)

        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeWeightHistoryMapper[gaugeAddress] = {
              loadingState: 'SUCCESS',
              data: formattedWeightsData,
            }
          }),
        )
      } catch (error) {
        set(
          produce(get(), (state) => {
            state[sliceKey].gaugeWeightHistoryMapper[gaugeAddress].loadingState = 'ERROR'
          }),
        )
        console.warn(error)
      }
    },

    selectFilteredSortedGauges: () => {
      const { gaugeMapper, gaugeListSortBy } = get()[sliceKey]
      return sortGauges(gaugeMapper, gaugeListSortBy)
    },
    setGauges: (searchValue: string) => {
      const { selectFilteredSortedGauges } = get()[sliceKey]
      const gauges = selectFilteredSortedGauges()

      if (searchValue !== '') {
        const searchFilteredGauges = searchFn(searchValue, gauges)
        get()[sliceKey].setStateByKeys({
          filteredGauges: searchFilteredGauges,
          filteringGaugesLoading: true,
        })
      } else {
        get()[sliceKey].setStateByKeys({
          filteredGauges: gauges,
          filteringGaugesLoading: true,
        })
      }

      setTimeout(() => {
        get()[sliceKey].setStateByKey('filteringGaugesLoading', false)
      }, 100)
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
            state[sliceKey].gaugeVotesMapper[address].votes = [...votes].reverse()
            state[sliceKey].gaugeVotesSortBy.order = order
          }),
        )
      } else {
        const sortedEntries = [...votes].sort((a, b) => b[sortBy] - a[sortBy])

        set(
          produce((state) => {
            state[sliceKey].gaugeVotesSortBy.key = sortBy
            state[sliceKey].gaugeVotesSortBy.order = 'desc'
            state[sliceKey].gaugeVotesMapper[address].votes = sortedEntries
          }),
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

    castVote: async (userAddress: string, gaugeAddress: string, voteWeight: number) => {
      const curve = getLib('curveApi')
      const { provider } = useWallet.getState()
      const address = get().gauges.gaugeMapper[gaugeAddress].address

      if (!curve) return

      const { dismiss: dismissConfirm } = notify(t`Please confirm cast vote.`, 'pending')

      set(
        produce(get(), (state) => {
          state[sliceKey].txCastVoteState = {
            state: 'CONFIRMING',
            hash: '',
            errorMessage: '',
          }
        }),
      )

      try {
        const res = await curve.dao.voteForGauge(address, voteWeight * 100)

        set(
          produce(get(), (state) => {
            state[sliceKey].txCastVoteState = {
              state: 'LOADING',
              hash: '',
              errorMessage: '',
            }
          }),
        )
        dismissConfirm()

        const loadingNotificationMessage = t`Casting vote...`
        const { dismiss: dismissLoading } = notify(loadingNotificationMessage, 'pending')

        await helpers.waitForTransaction(res, provider!)

        set(
          produce(get(), (state) => {
            state[sliceKey].txCastVoteState = {
              state: 'SUCCESS',
              hash: res,
              errorMessage: '',
            }
          }),
        )
        dismissLoading()
        const successNotificationMessage = t`Succesfully cast vote!`
        notify(successNotificationMessage, 'success', 15000)

        invalidateUserGaugeWeightVotesQuery({
          chainId: Chain.Ethereum,
          userAddress,
        })
        invalidateUserGaugeVoteNextTimeQuery({
          chainId: Chain.Ethereum,
          gaugeAddress,
          userAddress,
        })

        set(
          produce(get(), (state) => {
            state[sliceKey].selectedGauge = null
          }),
        )

        setTimeout(() => {
          set(
            produce(get(), (state) => {
              state[sliceKey].txCastVoteState = null
            }),
          )
        }, 5000)
      } catch (error) {
        dismissConfirm()
        console.error('Error casting vote:', error)
        set(
          produce(get(), (state) => {
            state[sliceKey].txCastVoteState = {
              state: 'ERROR',
              hash: '',
              errorMessage: 'Error casting vote',
            }
          }),
        )
      }
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
    threshold: 0.01,
    keys: ['address', 'effective_address', 'title', 'platform', 'pool.chain', 'market.chain'],
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
  return marketName ?? shortenAddress(address) ?? ''
}
