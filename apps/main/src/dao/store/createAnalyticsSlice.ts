import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import type { State } from '@/dao/store/useStore'
import { FetchingState, TopHoldersSortBy, AllHoldersSortBy } from '@/dao/types/dao.types'
import { type Locker, type LocksDaily, getLocksDaily, getLockers } from '@curvefi/prices-api/dao'
import { type Distribution, getDistributions } from '@curvefi/prices-api/revenue'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  veCrvFees: {
    fees: Distribution[]
    veCrvTotalFees: number
    fetchStatus: FetchingState
  }
  veCrvLocks: {
    locks: LocksDaily[]
    fetchStatus: FetchingState
  }
  veCrvHolders: {
    topHolders: Locker[]
    allHolders: { [userAddress: string]: Locker }
    totalHolders: number
    canCreateVote: number
    totalValues: {
      weight: bigint
      locked: bigint
      weightRatio: number
    }
    fetchStatus: FetchingState
  }
  topHoldersSortBy: TopHoldersSortBy
  allHoldersSortBy: {
    key: AllHoldersSortBy
    order: 'asc' | 'desc'
  }
}

const sliceKey = 'analytics'

// prettier-ignore
export type AnalyticsSlice = {
  [sliceKey]: SliceState & {
    getVeCrvFees(): Promise<void>
    getVeCrvLocks(): Promise<void>
    getVeCrvHolders(): Promise<void>
    setTopHoldersSortBy(sortBy: TopHoldersSortBy): void
    setAllHoldersSortBy(sortBy: AllHoldersSortBy): void
    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  veCrvFees: {
    fees: [],
    veCrvTotalFees: 0,
    fetchStatus: 'LOADING',
  },
  veCrvLocks: {
    locks: [],
    fetchStatus: 'LOADING',
  },
  veCrvHolders: {
    topHolders: [],
    allHolders: {},
    totalHolders: 0,
    canCreateVote: 0,
    totalValues: {
      weight: 0n,
      locked: 0n,
      weightRatio: 0,
    },
    fetchStatus: 'LOADING',
  },
  topHoldersSortBy: 'weightRatio',
  allHoldersSortBy: {
    key: 'weightRatio',
    order: 'desc',
  },
}

export const createAnalyticsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): AnalyticsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getVeCrvFees: async () => {
      get()[sliceKey].setStateByKey('veCrvFees', {
        fees: [],
        veCrvTotalFees: 0,
        fetchStatus: 'LOADING',
      })

      try {
        const distributions = await getDistributions()
        const totalFees = distributions.reduce((acc, item) => acc + item.feesUsd, 0)

        get()[sliceKey].setStateByKey('veCrvFees', {
          fees: distributions,
          veCrvTotalFees: totalFees,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.warn(error)
        get()[sliceKey].setStateByKey('veCrvFees', {
          fees: [],
          veCrvTotalFees: 0,
          fetchStatus: 'ERROR',
        })
      }
    },
    getVeCrvLocks: async () => {
      get()[sliceKey].setStateByKey('veCrvLocks', {
        locks: [],
        fetchStatus: 'LOADING',
      })

      try {
        const locks = await getLocksDaily(365)

        get()[sliceKey].setStateByKey('veCrvLocks', {
          locks,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.warn(error)
        get()[sliceKey].setStateByKey('veCrvLocks', {
          locks: [],
          fetchStatus: 'ERROR',
        })
      }
    },
    getVeCrvHolders: async () => {
      get()[sliceKey].setStateByKey('veCrvHolders', {
        topHolders: [],
        allHolders: {},
        totalValues: {
          weight: 0,
          locked: 0,
          weight_ratio: 0,
        },
        fetchStatus: 'LOADING',
      })

      try {
        const lockers = await getLockers()
        const allHolders = Object.fromEntries(lockers.map((holder) => [holder.user.toLowerCase(), holder]))

        const totalHolders = Object.keys(allHolders).length
        const canCreateVote = Object.values(allHolders).filter((holder) => holder.weight > 2500).length

        const topHolders = Object.values(allHolders)
          .sort((a, b) => b.weightRatio - a.weightRatio)
          .slice(0, 100)
          .filter((holder) => holder.weightRatio > 0.3)

        const totalValues = topHolders.reduce(
          (acc, item) => ({
            weight: acc.weight + item.weight,
            locked: acc.locked + item.locked,
            weightRatio: acc.weightRatio + item.weightRatio,
          }),
          { weight: 0n, locked: 0n, weightRatio: 0 },
        )

        get()[sliceKey].setStateByKey('veCrvHolders', {
          topHolders,
          allHolders,
          totalHolders,
          canCreateVote,
          totalValues,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.warn(error)
        get()[sliceKey].setStateByKey('veCrvHolders', {
          topHolders: [],
          allHolders: {},
          totalHolders: 0,
          canCreateVote: 0,
          totalValues: {
            weight: 0,
            locked: 0,
            weight_ratio: 0,
          },
          fetchStatus: 'ERROR',
        })
      }
    },
    setTopHoldersSortBy: (sortBy: TopHoldersSortBy) => {
      const { topHolders } = get()[sliceKey].veCrvHolders

      set(
        produce((state) => {
          state[sliceKey].topHoldersSortBy = sortBy
          state[sliceKey].veCrvHolders.topHolders = [...topHolders].sort(
            (a, b) => Number(b[sortBy]) - Number(a[sortBy]),
          )
        }),
      )
    },
    setAllHoldersSortBy: (sortBy: AllHoldersSortBy) => {
      const {
        veCrvHolders: { allHolders },
        allHoldersSortBy,
      } = get()[sliceKey]

      let order = allHoldersSortBy.order
      if (sortBy === allHoldersSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            const reversedEntries = Object.entries(allHolders).reverse()
            state[sliceKey].veCrvHolders.allHolders = Object.fromEntries(reversedEntries)
            state[sliceKey].allHoldersSortBy.order = order
          }),
        )
      } else {
        const sortedEntries = Object.entries(allHolders).sort(([, a], [, b]) => Number(b[sortBy]) - Number(a[sortBy]))

        set(
          produce((state) => {
            state[sliceKey].allHoldersSortBy.key = sortBy
            state[sliceKey].allHoldersSortBy.order = 'desc'
            state[sliceKey].veCrvHolders.allHolders = Object.fromEntries(sortedEntries)
          }),
        )
      }
    },
    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
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
