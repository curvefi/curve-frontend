import lodash from 'lodash'
import { create, StoreApi } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import { CacheSlice, createCacheSlice } from '@/dex/store/createCacheSlice'
import { CreatePoolSlice, createCreatePoolSlice } from '@/dex/store/createCreatePoolSlice'
import { DashboardSlice, createDashboardSlice } from '@/dex/store/createDashboardSlice'
import { DeployGaugeSlice, createDeployGaugeSlice } from '@/dex/store/createDeployGaugeSlice'
import { GlobalSlice, createGlobalSlice } from '@/dex/store/createGlobalSlice'
import { PoolDepositSlice, createPoolDepositSlice } from '@/dex/store/createPoolDepositSlice'
import { PoolListSlice, createPoolListSlice } from '@/dex/store/createPoolListSlice'
import { PoolsSlice, createPoolsSlice } from '@/dex/store/createPoolsSlice'
import { PoolSwapSlice, createPoolSwapSlice } from '@/dex/store/createPoolSwapSlice'
import { PoolWithdrawSlice, createPoolWithdrawSlice } from '@/dex/store/createPoolWithdrawSlice'
import { QuickSwapSlice, createQuickSwapSlice } from '@/dex/store/createQuickSwapSlice'
import { TokensSlice, createTokensSlice } from '@/dex/store/createTokensSlice'

const { debounce, merge } = lodash

export type State = GlobalSlice &
  CacheSlice &
  PoolsSlice &
  PoolDepositSlice &
  PoolWithdrawSlice &
  PoolSwapSlice &
  PoolListSlice &
  QuickSwapSlice &
  DashboardSlice &
  TokensSlice &
  CreatePoolSlice &
  DeployGaugeSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createGlobalSlice(set, get),
  ...createCacheSlice(set, get),
  ...createPoolListSlice(set, get),
  ...createPoolsSlice(set, get),
  ...createPoolDepositSlice(set, get),
  ...createPoolWithdrawSlice(set, get),
  ...createPoolSwapSlice(set, get),
  ...createDashboardSlice(set, get),
  ...createQuickSwapSlice(set, get),
  ...createTokensSlice(set, get),
  ...createCreatePoolSlice(set, get),
  ...createDeployGaugeSlice(set, get),
})

// the storage crashes in some browsers if the size of the object is too big
const MAX_SIZE = 2.5 * 1024 * 1024 // 2.5MB limit

// cache all items in CacheSlice store
const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'curve-app-store-cache',
  partialize: ({ storeCache }: State) => ({ storeCache }),
  merge: merge,
  storage: {
    getItem: (name) => JSON.parse(localStorage.getItem(name)!),
    // debounce storage to avoid performance issues serializing too often. The item can be large.
    setItem: debounce((name, value) => {
      const json = JSON.stringify(value)
      if (json.length > MAX_SIZE) {
        console.warn(`Cache item ${name} is too big (${json.length} bytes), removing it.`)
        return localStorage.removeItem(name)
      }
      return localStorage.setItem(name, json)
    }, 1000),
    removeItem: (name) => localStorage.removeItem(name),
  },
  version: 19, // update version number to prevent UI from using cache
}

export const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))
