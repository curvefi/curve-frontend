import lodash from 'lodash'
import { create, StoreApi } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import createCacheSlice, { CacheSlice } from '@/dex/store/createCacheSlice'
import createCreatePoolSlice, { CreatePoolSlice } from '@/dex/store/createCreatePoolSlice'
import createDashboardSlice, { DashboardSlice } from '@/dex/store/createDashboardSlice'
import createDeployGaugeSlice, { DeployGaugeSlice } from '@/dex/store/createDeployGaugeSlice'
import createGlobalSlice, { GlobalSlice } from '@/dex/store/createGlobalSlice'
import createPoolDepositSlice, { PoolDepositSlice } from '@/dex/store/createPoolDepositSlice'
import createPoolListSlice, { PoolListSlice } from '@/dex/store/createPoolListSlice'
import createPoolsSlice, { PoolsSlice } from '@/dex/store/createPoolsSlice'
import createPoolSwapSlice, { PoolSwapSlice } from '@/dex/store/createPoolSwapSlice'
import createPoolWithdrawSlice, { PoolWithdrawSlice } from '@/dex/store/createPoolWithdrawSlice'
import createQuickSwapSlice, { QuickSwapSlice } from '@/dex/store/createQuickSwapSlice'
import createTokensSlice, { TokensSlice } from '@/dex/store/createTokensSlice'
import createUserBalancesSlice, { UserBalancesSlice } from '@/dex/store/createUserBalancesSlice'
import createUserSlice, { UserSlice } from '@/dex/store/createUserSlice'

const { debounce, merge } = lodash

export type State = GlobalSlice &
  CacheSlice &
  PoolsSlice &
  PoolDepositSlice &
  PoolWithdrawSlice &
  PoolSwapSlice &
  UserSlice &
  PoolListSlice &
  QuickSwapSlice &
  UserBalancesSlice &
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
  ...createUserSlice(set, get),
  ...createDashboardSlice(set, get),
  ...createQuickSwapSlice(set, get),
  ...createUserBalancesSlice(set, get),
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

const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useStore
