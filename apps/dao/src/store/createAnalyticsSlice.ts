import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import produce from 'immer'
import { formatUnits, formatEther, Contract } from 'ethers'
import { contractVeCRV, contractCrv } from '@/store/contracts'
import { abiVeCrv } from '@/store/abis'
import { convertToLocaleTimestamp, formatDateFromTimestamp } from 'ui/src/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  veCrvFees: {
    fees: VeCrvFee[]
    veCrvTotalFees: number
    fetchStatus: FetchingState
  }
  veCrvLocks: {
    locks: VeCrvDailyLock[]
    fetchStatus: FetchingState
  }
  veCrvHolders: {
    topHolders: VeCrvHolder[]
    allHolders: { [userAddress: string]: VeCrvHolder }
    totalHolders: number
    canCreateVote: number
    totalValues: {
      weight: number
      locked: number
      weight_ratio: number
    }
    fetchStatus: FetchingState
  }
  topHoldersSortBy: TopHoldersSortBy
  allHoldersSortBy: {
    key: AllHoldersSortBy
    order: 'asc' | 'desc'
  }
  veCrvData: {
    totalVeCrv: number
    totalLockedCrv: number
    totalCrv: number
    lockedPercentage: number
    fetchStatus: FetchingState
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
    getVeCrvData(provider: any): Promise<void>
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
      weight: 0,
      locked: 0,
      weight_ratio: 0,
    },
    fetchStatus: 'LOADING',
  },
  topHoldersSortBy: 'weight_ratio',
  allHoldersSortBy: {
    key: 'weight_ratio',
    order: 'desc',
  },
  veCrvData: {
    totalVeCrv: 0,
    totalLockedCrv: 0,
    totalCrv: 0,
    lockedPercentage: 0,
    fetchStatus: 'LOADING',
  },
}

const createAnalyticsSlice = (set: SetState<State>, get: GetState<State>): AnalyticsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getVeCrvFees: async () => {
      get()[sliceKey].setStateByKey('veCrvFees', {
        fees: [],
        veCrvTotalFees: 0,
        fetchStatus: 'LOADING',
      })

      try {
        let page = 1
        const pagination = 100
        let results: VeCrvFeeRes[] = []

        while (true) {
          const veCrvFeesRes = await fetch(
            `https://prices.curve.fi/v1/dao/fees/distributions?page=${page}&per_page=${pagination}`
          )
          const data: VeCrvFeesRes = await veCrvFeesRes.json()
          results = results.concat(data.distributions)
          if (data.distributions.length < pagination) {
            break
          }
          page++
        }

        const feesFormatted: VeCrvFee[] = results.map((item) => ({
          ...item,
          timestamp: convertToLocaleTimestamp(new Date(item.timestamp).getTime() / 1000),
          date: formatDateFromTimestamp(convertToLocaleTimestamp(new Date(item.timestamp).getTime() / 1000)),
        }))
        const totalFees = feesFormatted.reduce((acc, item) => acc + item.fees_usd, 0)

        get()[sliceKey].setStateByKey('veCrvFees', {
          fees: feesFormatted,
          veCrvTotalFees: totalFees,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.log(error)
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
        const veCrvLocksRes = await fetch('https://prices.curve.fi/v1/dao/locks/daily/365')
        const data: VeCrvDailyLockRes = await veCrvLocksRes.json()

        const formattedData = data.locks.map((lock) => ({
          amount: Math.floor(+formatUnits(lock.amount, 18)),
          day: formatDateFromTimestamp(convertToLocaleTimestamp(new Date(lock.day).getTime() / 1000)),
        }))

        get()[sliceKey].setStateByKey('veCrvLocks', {
          locks: formattedData,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.log(error)
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
        const pagination = 1000
        let page = 1
        let allHolders: { [address: string]: VeCrvHolder } = {}

        while (true) {
          const veCrvHoldersRes = await fetch(
            `https://prices.curve.fi/v1/dao/lockers?pagination=${pagination}&page=${page}`
          )
          const data: VeCrvHoldersRes = await veCrvHoldersRes.json()

          data.locks.forEach((holder) => {
            allHolders[holder.user.toLowerCase()] = {
              ...holder,
              locked: +holder.locked / 10 ** 18,
              weight: +holder.weight / 10 ** 18,
              weight_ratio: Number(holder.weight_ratio.replace('%', '')),
            }
          })

          if (data.locks.length < pagination) {
            break
          }

          page++
        }

        const totalHolders = Object.keys(allHolders).length
        const canCreateVote = Object.values(allHolders).filter((holder) => holder.weight > 2500).length

        const topHolders = Object.values(allHolders)
          .sort((a, b) => b.weight_ratio - a.weight_ratio)
          .slice(0, 100)
          .filter((holder) => holder.weight_ratio > 0.3)

        const totalValues = topHolders.reduce(
          (acc, item) => ({
            weight: acc.weight + item.weight,
            locked: acc.locked + item.locked,
            weight_ratio: acc.weight_ratio + item.weight_ratio,
          }),
          { weight: 0, locked: 0, weight_ratio: 0 }
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
        console.log(error)
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
            (a: VeCrvHolder, b: VeCrvHolder) => b[sortBy] - a[sortBy]
          )
        })
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
          })
        )
      } else {
        const sortedEntries = Object.entries(allHolders).sort(([, a], [, b]) => {
          return b[sortBy] - a[sortBy]
        })

        set(
          produce((state) => {
            state[sliceKey].allHoldersSortBy.key = sortBy
            state[sliceKey].allHoldersSortBy.order = 'desc'
            state[sliceKey].veCrvHolders.allHolders = Object.fromEntries(sortedEntries)
          })
        )
      }
    },
    getVeCrvData: async (provider: any) => {
      get()[sliceKey].setStateByKey('veCrvData', {
        totalVeCrv: 0,
        totalLockedCrv: 0,
        totalCrv: 0,
        lockedPercentage: 0,
        fetchStatus: 'LOADING',
      })

      try {
        const veCrvContract = new Contract(contractVeCRV, abiVeCrv, provider)
        const crvContract = new Contract(contractCrv, abiVeCrv, provider)

        const [totalLockedCrv, totalCrv, totalVeCrv] = await Promise.all([
          veCrvContract.supply(),
          crvContract.totalSupply(),
          veCrvContract.totalSupply(),
        ])

        const formattedTotalLockedCrv = formatEther(totalLockedCrv)
        const formattedTotalCrv = formatEther(totalCrv)
        const formattedTotalVeCrv = formatEther(totalVeCrv)
        const lockedPercentage = (+formattedTotalLockedCrv / +formattedTotalCrv) * 100

        get()[sliceKey].setStateByKey('veCrvData', {
          totalVeCrv: formattedTotalVeCrv,
          totalLockedCrv: formattedTotalLockedCrv,
          totalCrv: formattedTotalCrv,
          lockedPercentage: lockedPercentage,
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('veCrvData', {
          totalVeCrv: 0,
          totalLockedCrv: 0,
          totalCrv: 0,
          lockedPercentage: 0,
          fetchStatus: 'ERROR',
        })
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

export default createAnalyticsSlice
