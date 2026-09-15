import { create, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CreatePoolSlice, createCreatePoolSlice } from '@/dex/store/createCreatePoolSlice'
import { DashboardSlice, createDashboardSlice } from '@/dex/store/createDashboardSlice'
import { DeployGaugeSlice, createDeployGaugeSlice } from '@/dex/store/createDeployGaugeSlice'
import { GlobalSlice, createGlobalSlice } from '@/dex/store/createGlobalSlice'
import { PoolDepositSlice, createPoolDepositSlice } from '@/dex/store/createPoolDepositSlice'
import { PoolsSlice, createPoolsSlice } from '@/dex/store/createPoolsSlice'
import { PoolSwapSlice, createPoolSwapSlice } from '@/dex/store/createPoolSwapSlice'
import { PoolWithdrawSlice, createPoolWithdrawSlice } from '@/dex/store/createPoolWithdrawSlice'
import { QuickSwapSlice, createQuickSwapSlice } from '@/dex/store/createQuickSwapSlice'
import { TokensSlice, createTokensSlice } from '@/dex/store/createTokensSlice'

export type State = GlobalSlice &
  PoolsSlice &
  PoolDepositSlice &
  PoolWithdrawSlice &
  PoolSwapSlice &
  QuickSwapSlice &
  DashboardSlice &
  TokensSlice &
  CreatePoolSlice &
  DeployGaugeSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createGlobalSlice(set, get),
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

export const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
