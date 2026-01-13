import type { StoreApi } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AppSlice, createAppSlice } from '@/lend/store/createAppSlice'
import { ChartBandsSlice, createChartBandsSlice } from '@/lend/store/createChartBandsStore'
import { LoanBorrowMoreSlice, createLoanBorrowMore as createLoanBorrowMoreSlice } from '@/lend/store/createLoanBorrowMoreSlice'
import { LoanCollateralAddSlice, createLoanCollateralAdd as createLoanCollateralAddSlice } from '@/lend/store/createLoanCollateralAddSlice'
import {
  LoanCollateralRemoveSlice, createLoanCollateralRemove as createLoanCollateralRemoveSlice } from '@/lend/store/createLoanCollateralRemoveSlice'
import { LoanCreateSlice, createLoanCreate } from '@/lend/store/createLoanCreateSlice'
import { LoanRepaySlice, createLoanRepaySlice } from '@/lend/store/createLoanRepaySlice'
import { LoanSelfLiquidationSlice, createLoanSelfLiquidationSlice } from '@/lend/store/createLoanSelfLiquidationSlice'
import { MarketsSlice, createMarketsSlice } from '@/lend/store/createMarketsSlice'
import { OhlcChartSlice, createOhlcChart as createOhlcChartSlice } from '@/lend/store/createOhlcChartSlice'
import { UserSlice, createUserSlice } from '@/lend/store/createUserSlice'
import { VaultClaimSlice, createVaultClaim as createVaultClaimSlice } from '@/lend/store/createVaultClaimSlice'
import { VaultDepositMintSlice, createVaultMint as createVaultDepositMintSlice } from '@/lend/store/createVaultDepositMintSlice'
import { VaultStakeSlice, createVaultStake as createVaultStakeSlice } from '@/lend/store/createVaultStakeSlice'
import { VaultUnstakeSlice, createVaultUnstake as createVaultUnstakeSlice } from '@/lend/store/createVaultUnstakeSlice'
import { VaultWithdrawRedeemSlice, createVaultWithdrawRedeem as createVaultWithdrawRedeemSlice } from '@/lend/store/createVaultWithdrawRedeemSlice'

export type State = AppSlice &
  ChartBandsSlice &
  UserSlice &
  MarketsSlice &
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
  OhlcChartSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createAppSlice(set, get),
  ...createChartBandsSlice(set, get),
  ...createMarketsSlice(set, get),
  ...createUserSlice(set, get),
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
  ...createVaultClaimSlice(set, get),
  ...createOhlcChartSlice(set, get),
})

export const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
