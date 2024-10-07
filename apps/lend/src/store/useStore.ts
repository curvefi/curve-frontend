import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'

import { devtools, persist } from 'zustand/middleware'

import type { PersistOptions } from 'zustand/middleware/persist'
import createAppSlice, { AppSlice } from '@/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/store/createCacheSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/store/createCampaignRewardsSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/store/createChartBandsStore'
import createGasSlice, { GasSlice } from '@/store/createGasSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/store/createIntegrationsSlice'
import createLayoutSlice, { AppLayoutSlice } from '@/store/createLayoutSlice'
import createLoanBorrowMoreSlice, { LoanBorrowMoreSlice } from '@/store/createLoanBorrowMoreSlice'
import createLoanCollateralAddSlice, { LoanCollateralAddSlice } from '@/store/createLoanCollateralAddSlice'
import createLoanCollateralRemoveSlice, { LoanCollateralRemoveSlice } from '@/store/createLoanCollateralRemoveSlice'
import createLoanCreate, { LoanCreateSlice } from '@/store/createLoanCreateSlice'
import createLoanRepaySlice, { LoanRepaySlice } from '@/store/createLoanRepaySlice'
import createLoanSelfLiquidationSlice, { LoanSelfLiquidationSlice } from '@/store/createLoanSelfLiquidationSlice'
import createMarketListSlice, { MarketListSlice } from '@/store/createMarketListSlice'
import createMarketsSlice, { MarketsSlice } from '@/store/createMarketsSlice'
import createOhlcChartSlice, { OhlcChartSlice } from '@/store/createOhlcChartSlice'
import createTokensSlice, { TokensSlice } from '@/store/createTokensSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@/store/createUsdRatesSlice'
import createUserSlice, { UserSlice } from '@/store/createUserSlice'
import createVaultClaimSlice, { VaultClaimSlice } from '@/store/createVaultClaimSlice'
import createVaultDepositMintSlice, { VaultDepositMintSlice } from '@/store/createVaultDepositMintSlice'
import createVaultStakeSlice, { VaultStakeSlice } from '@/store/createVaultStakeSlice'
import createVaultUnstakeSlice, { VaultUnstakeSlice } from '@/store/createVaultUnstakeSlice'
import createVaultWithdrawRedeemSlice, { VaultWithdrawRedeemSlice } from '@/store/createVaultWithdrawRedeemSlice'
import createWalletSlice, { WalletSlice } from '@/store/createWalletSlice'

export type State = CacheSlice &
  AppSlice &
  AppLayoutSlice &
  WalletSlice &
  GasSlice &
  UsdRatesSlice &
  TokensSlice &
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
  ...createWalletSlice(set, get),
  ...createLayoutSlice(set, get),
  ...createGasSlice(set, get),
  ...createUsdRatesSlice(set, get),
  ...createTokensSlice(set, get),
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
