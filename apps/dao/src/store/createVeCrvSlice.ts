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
  veCrvTopLockers: {
    topLockers: VeCrvTopLocker[]
    fetchStatus: FetchingState
  }
  topLockerFilter: TopLockerFilter
  veCrvData: {
    totalVeCrv: number
    totalLockedCrv: number
    totalCrv: number
    lockedPercentage: number
    fetchStatus: FetchingState
  }
}

const sliceKey = 'vecrv'

// prettier-ignore
export type VeCrvSlice = {
  [sliceKey]: SliceState & {
    getVeCrvFees(): Promise<void>
    getVeCrvLocks(): Promise<void>
    getVeCrvTopLockers(): Promise<void>
    setTopLockerFilter(filter: 'weight' | 'locked' | 'weight_ratio'): void
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
  veCrvTopLockers: {
    topLockers: [],
    fetchStatus: 'LOADING',
  },
  topLockerFilter: 'weight',
  veCrvData: {
    totalVeCrv: 0,
    totalLockedCrv: 0,
    totalCrv: 0,
    lockedPercentage: 0,
    fetchStatus: 'LOADING',
  },
}

const createVeCrvSlice = (set: SetState<State>, get: GetState<State>): VeCrvSlice => ({
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
        let results: VeCrvFee[] = []

        while (true) {
          const veCrvFeesRes = await fetch(
            `https://prices.curve.fi/v1/dao/fees/distributions?page=${page}&per_page=100`
          )
          const data: VeCrvFeesRes = await veCrvFeesRes.json()
          results = results.concat(data.distributions)
          if (data.distributions.length < 100) {
            break
          }
          page++
        }

        const feesFormatted = results.map((item) => ({
          ...item,
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
    getVeCrvTopLockers: async () => {
      get()[sliceKey].setStateByKey('veCrvTopLockers', {
        topLockers: [],
        fetchStatus: 'LOADING',
      })
      const filter = get()[sliceKey].topLockerFilter

      try {
        const veCrvTopLockersRes = await fetch('https://prices.curve.fi/v1/dao/lockers/50')
        const data: VeCrvTopLockersRes = await veCrvTopLockersRes.json()

        const formattedData = data.users
          .map((locker) => ({
            ...locker,
            locked: Math.floor(+locker.locked / 10 ** 18),
            weight: Math.floor(+locker.weight / 10 ** 18),
            weight_ratio: Number(locker.weight_ratio.replace('%', '')),
            unlock_time: formatDateFromTimestamp(convertToLocaleTimestamp(new Date(locker.unlock_time).getTime())),
          }))
          .sort((a, b) => b[filter] - a[filter])

        get()[sliceKey].setStateByKey('veCrvTopLockers', {
          topLockers: formattedData,
          filter: 'weight',
          fetchStatus: 'SUCCESS',
        })
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('veCrvTopLockers', {
          topLockers: [],
          filter: 'weight',
          fetchStatus: 'ERROR',
        })
      }
    },
    setTopLockerFilter: (filter: TopLockerFilter) => {
      const { topLockers } = get()[sliceKey].veCrvTopLockers

      set(
        produce((state) => {
          state[sliceKey].topLockerFilter = filter
          state[sliceKey].veCrvTopLockers.topLockers = [...topLockers].sort(
            (a: VeCrvTopLocker, b: VeCrvTopLocker) => b[filter] - a[filter]
          )
        })
      )
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

export default createVeCrvSlice
