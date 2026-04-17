import type { StoreApi } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AppSlice, createAppSlice } from '@/lend/store/createAppSlice'
import { ChartBandsSlice, createChartBandsSlice } from '@/lend/store/createChartBandsStore'
import {
  createLoanBorrowMore as createLoanBorrowMoreSlice,
  LoanBorrowMoreSlice,
} from '@/lend/store/createLoanBorrowMoreSlice'
import {
  createLoanCollateralAdd as createLoanCollateralAddSlice,
  LoanCollateralAddSlice,
} from '@/lend/store/createLoanCollateralAddSlice'
import {
  createLoanCollateralRemove as createLoanCollateralRemoveSlice,
  LoanCollateralRemoveSlice,
} from '@/lend/store/createLoanCollateralRemoveSlice'
import { createLoanRepaySlice, LoanRepaySlice } from '@/lend/store/createLoanRepaySlice'
import { createLoanSelfLiquidationSlice, LoanSelfLiquidationSlice } from '@/lend/store/createLoanSelfLiquidationSlice'
import { createMarketsSlice, MarketsSlice } from '@/lend/store/createMarketsSlice'
import { createOhlcChart as createOhlcChartSlice, OhlcChartSlice } from '@/lend/store/createOhlcChartSlice'
import { createUserSlice, UserSlice } from '@/lend/store/createUserSlice'
import { createVaultClaim as createVaultClaimSlice, VaultClaimSlice } from '@/lend/store/createVaultClaimSlice'
import {
  createVaultMint as createVaultDepositMintSlice,
  VaultDepositMintSlice,
} from '@/lend/store/createVaultDepositMintSlice'
import { createVaultStake as createVaultStakeSlice, VaultStakeSlice } from '@/lend/store/createVaultStakeSlice'
import { createVaultUnstake as createVaultUnstakeSlice, VaultUnstakeSlice } from '@/lend/store/createVaultUnstakeSlice'
import {
  createVaultWithdrawRedeem as createVaultWithdrawRedeemSlice,
  VaultWithdrawRedeemSlice,
} from '@/lend/store/createVaultWithdrawRedeemSlice'

export type State = AppSlice &
  ChartBandsSlice &
  UserSlice &
  MarketsSlice &
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
