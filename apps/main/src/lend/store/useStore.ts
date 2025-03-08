import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PersistOptions } from 'zustand/middleware/persist'
import createAppSlice, { AppSlice } from '@/lend/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/lend/store/createCacheSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/lend/store/createCampaignRewardsSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/lend/store/createChartBandsStore'
import createGasSlice, { GasSlice } from '@/lend/store/createGasSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/lend/store/createIntegrationsSlice'
import createLayoutSlice, { AppLayoutSlice } from '@/lend/store/createLayoutSlice'
import createLoanBorrowMoreSlice, { LoanBorrowMoreSlice } from '@/lend/store/createLoanBorrowMoreSlice'
import createLoanCollateralAddSlice, { LoanCollateralAddSlice } from '@/lend/store/createLoanCollateralAddSlice'
import createLoanCollateralRemoveSlice, {
  LoanCollateralRemoveSlice,
} from '@/lend/store/createLoanCollateralRemoveSlice'
import createLoanCreate, { LoanCreateSlice } from '@/lend/store/createLoanCreateSlice'
import createLoanRepaySlice, { LoanRepaySlice } from '@/lend/store/createLoanRepaySlice'
import createLoanSelfLiquidationSlice, { LoanSelfLiquidationSlice } from '@/lend/store/createLoanSelfLiquidationSlice'
import createMarketListSlice, { MarketListSlice } from '@/lend/store/createMarketListSlice'
import createMarketsSlice, { MarketsSlice } from '@/lend/store/createMarketsSlice'
import createOhlcChartSlice, { OhlcChartSlice } from '@/lend/store/createOhlcChartSlice'
import createUserSlice, { UserSlice } from '@/lend/store/createUserSlice'
import createVaultClaimSlice, { VaultClaimSlice } from '@/lend/store/createVaultClaimSlice'
import createVaultDepositMintSlice, { VaultDepositMintSlice } from '@/lend/store/createVaultDepositMintSlice'
import createVaultStakeSlice, { VaultStakeSlice } from '@/lend/store/createVaultStakeSlice'
import createVaultUnstakeSlice, { VaultUnstakeSlice } from '@/lend/store/createVaultUnstakeSlice'
import createVaultWithdrawRedeemSlice, { VaultWithdrawRedeemSlice } from '@/lend/store/createVaultWithdrawRedeemSlice'

export type State = CacheSlice &
  AppSlice &
  AppLayoutSlice &
  GasSlice &
  IntegrationsSlice &
  ChartBandsSlice &
  UserSlice &
  MarketsSlice &
  MarketListSlice &
  LoanCreateSlice &
  LoanCollateralRemoveSlice &
  LoanCollateralAddSlice &
  LoanRepaySlice &
  LoanBorrowMoreSlice &
  LoanSelfLiquidationSlice &
  VaultDepositMintSlice &
  VaultStakeSlice &
  VaultWithdrawRedeemSlice &
  VaultUnstakeSlice &
  VaultClaimSlice &
  OhlcChartSlice &
  CampaignRewardsSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createCacheSlice(set, get),
  ...createAppSlice(set, get),
  ...createLayoutSlice(set, get),
  ...createGasSlice(set, get),
  ...createChartBandsSlice(set, get),
  ...createMarketsSlice(set, get),
  ...createUserSlice(set, get),
  ...createMarketListSlice(set, get),
  ...createLoanCreate(set, get),
  ...createLoanCollateralRemoveSlice(set, get),
  ...createLoanCollateralAddSlice(set, get),
  ...createLoanRepaySlice(set, get),
  ...createLoanBorrowMoreSlice(set, get),
  ...createLoanSelfLiquidationSlice(set, get),
  ...createVaultDepositMintSlice(set, get),
  ...createVaultWithdrawRedeemSlice(set, get),
  ...createVaultStakeSlice(set, get),
  ...createVaultUnstakeSlice(set, get),
  ...createIntegrationsSlice(set, get),
  ...createVaultClaimSlice(set, get),
  ...createOhlcChartSlice(set, get),
  ...createCampaignRewardsSlice(set, get),
})

// cache all items in CacheSlice store

const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'lending-app-store-cache',
  partialize: ({ storeCache }: State) => ({ storeCache }),
  // @ts-ignore
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 4, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useStore
