// @ts-nocheck
import { create, type GetState, type SetState } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { type PersistOptions } from 'zustand/middleware/persist'
import merge from 'lodash/merge'
import debounce from 'lodash/debounce'

import createGlobalSlice, { GlobalSlice } from '@main/store/createGlobalSlice'
import createNetworksSlice, { NetworksSlice } from '@main/store/createNetworksSlice'
import createGasSlice, { GasSlice } from '@main/store/createGasSlice'
import createWalletSlice, { WalletSlice } from '@main/store/createWalletSlice'
import createPoolsSlice, { PoolsSlice } from '@main/store/createPoolsSlice'
import createUserSlice, { UserSlice } from '@main/store/createUserSlice'
import createPoolListSlice, { PoolListSlice } from '@main/store/createPoolListSlice'
import createQuickSwapSlice, { QuickSwapSlice } from '@main/store/createQuickSwapSlice'
import createCacheSlice, { CacheSlice } from '@main/store/createCacheSlice'
import createUserBalancesSlice, { UserBalancesSlice } from '@main/store/createUserBalancesSlice'
import createDashboardSlice, { DashboardSlice } from '@main/store/createDashboardSlice'
import createTokensSlice, { TokensSlice } from '@main/store/createTokensSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@main/store/createUsdRatesSlice'
import createLockedCrvSlice, { LockedCrvSlice } from '@main/store/createLockedCrvSlice'
import createPoolSwapSlice, { PoolSwapSlice } from '@main/store/createPoolSwapSlice'
import createCreatePoolSlice, { CreatePoolSlice } from '@main/store/createCreatePoolSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@main/store/createIntegrationsSlice'
import createSelectTokenSlice, { SelectTokenSlice } from '@main/store/createSelectTokenSlice'
import createDeployGaugeSlice, { DeployGaugeSlice } from '@main/store/createDeployGaugeSlice'
import createPoolDepositSlice, { PoolDepositSlice } from '@main/store/createPoolDepositSlice'
import createPoolWithdrawSlice, { PoolWithdrawSlice } from '@main/store/createPoolWithdrawSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@main/store/createCampaignRewardsSlice'

export type State = GlobalSlice &
  NetworksSlice &
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
  ...createNetworksSlice(set, get),
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
  partialize: ({ storeCache }: State) => ({ storeCache }),
  merge,
  storage: {
    getItem: (name) => JSON.parse(localStorage.getItem(name)),
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
