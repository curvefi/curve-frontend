import type { SetState, GetState } from 'zustand'

import { devtools, persist } from 'zustand/middleware'
import create from 'zustand'
import merge from 'lodash/merge'

import createCacheSlice, { CacheSlice } from '@/store/createCacheSlice'
import createAppSlice, { AppSlice } from '@/store/createAppSlice'
import createLayoutSlice, { AppLayoutSlice } from '@/store/createLayoutSlice'
import createWalletSlice, { WalletSlice } from '@/store/createWalletSlice'
import createGasSlice, { GasSlice } from '@/store/createGasSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@/store/createUsdRatesSlice'
import createTokensSlice, { TokensSlice } from '@/store/createTokensSlice'
import createMarketsSlice, { MarketsSlice } from '@/store/createMarketsSlice'
import createUserSlice, { UserSlice } from '@/store/createUserSlice'
import createMarketListSlice, { MarketListSlice } from '@/store/createMarketListSlice'
import createLoanCreate, { LoanCreateSlice } from '@/store/createLoanCreateSlice'
import createLoanCollateralRemoveSlice, { LoanCollateralRemoveSlice } from '@/store/createLoanCollateralRemoveSlice'
import createLoanCollateralAddSlice, { LoanCollateralAddSlice } from '@/store/createLoanCollateralAddSlice'
import createLoanRepaySlice, { LoanRepaySlice } from '@/store/createLoanRepaySlice'
import createLoanBorrowMoreSlice, { LoanBorrowMoreSlice } from '@/store/createLoanBorrowMoreSlice'
import createLoanSelfLiquidationSlice, { LoanSelfLiquidationSlice } from '@/store/createLoanSelfLiquidationSlice'
import createVaultDepositMintSlice, { VaultDepositMintSlice } from '@/store/createVaultDepositMintSlice'
import createVaultStakeSlice, { VaultStakeSlice } from '@/store/createVaultStakeSlice'
import createVaultWithdrawRedeemSlice, { VaultWithdrawRedeemSlice } from '@/store/createVaultWithdrawRedeemSlice'
import createVaultUnstakeSlice, { VaultUnstakeSlice } from '@/store/createVaultUnstakeSlice'
import createVaultClaimSlice, { VaultClaimSlice } from '@/store/createVaultClaimSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/store/createChartBandsStore'
import createIntegrationsSlice, { IntegrationsSlice } from '@/store/createIntegrationsSlice'
import createOhlcChartSlice, { OhlcChartSlice } from '@/store/createOhlcChartSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/store/createCampaignRewardsSlice'

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

const cache = {
  name: 'lending-app-store-cache',
  partialize: (state: State) => {
    return Object.fromEntries(
      Object.entries(state).filter(([key]) => {
        return ['storeCache'].includes(key)
      })
    )
  },
  // @ts-ignore
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 2, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create<State>(devtools(persist(store, cache)))
    : create<State>(persist(store, cache))

export default useStore
