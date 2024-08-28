// @ts-nocheck
import { create, type GetState, type SetState } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { type PersistOptions } from 'zustand/middleware/persist'
import merge from 'lodash/merge'
import debounce from 'lodash/debounce'

import createGlobalSlice, { GlobalSlice } from '@/store/createGlobalSlice'
import createGasSlice, { GasSlice } from '@/store/createGasSlice'
import createWalletSlice, { WalletSlice } from '@/store/createWalletSlice'
import createPoolsSlice, { PoolsSlice } from '@/store/createPoolsSlice'
import createUserSlice, { UserSlice } from '@/store/createUserSlice'
import createPoolListSlice, { PoolListSlice } from '@/store/createPoolListSlice'
import createQuickSwapSlice, { QuickSwapSlice } from '@/store/createQuickSwapSlice'
import createCacheSlice, { CacheSlice } from '@/store/createCacheSlice'
import createUserBalancesSlice, { UserBalancesSlice } from '@/store/createUserBalancesSlice'
import createDashboardSlice, { DashboardSlice } from '@/store/createDashboardSlice'
import createTokensSlice, { TokensSlice } from '@/store/createTokensSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@/store/createUsdRatesSlice'
import createLockedCrvSlice, { LockedCrvSlice } from '@/store/createLockedCrvSlice'
import createPoolSwapSlice, { PoolSwapSlice } from '@/store/createPoolSwapSlice'
import createCreatePoolSlice, { CreatePoolSlice } from '@/store/createCreatePoolSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/store/createIntegrationsSlice'
import createSelectTokenSlice, { SelectTokenSlice } from '@/store/createSelectTokenSlice'
import createDeployGaugeSlice, { DeployGaugeSlice } from '@/store/createDeployGaugeSlice'
import createPoolDepositSlice, { PoolDepositSlice } from '@/store/createPoolDepositSlice'
import createPoolWithdrawSlice, { PoolWithdrawSlice } from '@/store/createPoolWithdrawSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/store/createCampaignRewardsSlice'

export type State = GlobalSlice &
  GasSlice &
  WalletSlice &
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
  UsdRatesSlice &
  LockedCrvSlice &
  CreatePoolSlice &
  IntegrationsSlice &
  SelectTokenSlice &
  DeployGaugeSlice &
  CampaignRewardsSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createGlobalSlice(set, get),
  ...createGasSlice(set, get),
  ...createCacheSlice(set, get),
  ...createWalletSlice(set, get),
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
  ...createUsdRatesSlice(set, get),
  ...createLockedCrvSlice(set, get),
  ...createCreatePoolSlice(set, get),
  ...createIntegrationsSlice(set, get),
  ...createSelectTokenSlice(set, get),
  ...createDeployGaugeSlice(set, get),
  ...createCampaignRewardsSlice(set, get),
})

// the storage crashes in some browsers if the size of the object is too big
const MAX_SIZE = 2.5 * 1024 * 1024 // 2.5MB limit

// cache all items in CacheSlice store
const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'curve-app-store-cache',
  partialize: ({ storeCache }: State) => ({  storeCache }),
  merge,
  storage: {
    getItem: name => JSON.parse(localStorage.getItem(name)),
    // debounce storage to avoid performance issues serializing too often. The item can be large.
    setItem: debounce((name, value) => {
      const json = JSON.stringify(value)
      return MAX_SIZE >= json.length ? localStorage.removeItem(name) : localStorage.setItem(name, json)
    }, 1000),
    removeItem: name => localStorage.removeItem(name),
  },
  version: 18, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create(devtools(persist(store, cache)))
    : create(persist(store, cache))

export default useStore
