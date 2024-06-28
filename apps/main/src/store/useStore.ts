// @ts-nocheck
import type { SetState, GetState } from 'zustand'

import { devtools, persist } from 'zustand/middleware'
import create from 'zustand'
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
import createRewardsSlice, { RewardsSlice } from '@/store/createRewardsSlice'

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
  RewardsSlice

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
  ...createRewardsSlice(set, get),
})

// cache all items in CacheSlice store
const cache = {
  name: 'curve-app-store-cache',
  partialize: (state: State) => {
    return Object.fromEntries(
      Object.entries(state).filter(([key]) => {
        return ['storeCache'].includes(key)
      })
    )
  },
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 16, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create<State>(devtools(persist(store, cache)))
    : create<State>(persist(store, cache))
// const useStore = isDevelopment ? create(devtools(store)) : create(store)

export default useStore
