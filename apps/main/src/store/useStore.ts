// @ts-nocheck
import type { SetState, GetState } from 'zustand'

import { devtools, persist } from 'zustand/middleware'
import create from 'zustand'
import pick from 'lodash/pick'
import merge from 'lodash/merge'

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

// cache all items in CacheSlice store
const cache = {
  name: 'curve-app-store-cache',
  partialize: (state: State) => {
    try {
      const picked = pick(state, [
        'storeCache.hasDepositAndStake',
        'storeCache.hasRouter',
        'storeCache.poolsMapper',
        'storeCache.tvlMapper',
        'storeCache.volumeMapper',
      ])
      if (canAddToStorage(picked)) return picked
      return {}
    } catch (error) {
      console.error(error)
    }
  },
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 18, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create<State>(devtools(persist(store, cache)))
    : create<State>(persist(store, cache))
// const useStore = isDevelopment ? create(devtools(store)) : create(store)

// check if there are too much in storage
function canAddToStorage<T extends Object>(storageObj: T) {
  const maxSize = 5 * 1024 * 1024 // 5MB limit
  const itemSize = (JSON.stringify(storageObj)?.length ?? 0) * 2

  return maxSize >= itemSize
}

export default useStore
