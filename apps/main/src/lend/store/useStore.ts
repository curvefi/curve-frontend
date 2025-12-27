import type { StoreApi } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import createAppSlice, { AppSlice } from '@/lend/store/createAppSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/lend/store/createChartBandsStore'
import createLoanBorrowMoreSlice, { LoanBorrowMoreSlice } from '@/lend/store/createLoanBorrowMoreSlice'
import createLoanCollateralAddSlice, { LoanCollateralAddSlice } from '@/lend/store/createLoanCollateralAddSlice'
import createLoanCollateralRemoveSlice, {
  LoanCollateralRemoveSlice,
} from '@/lend/store/createLoanCollateralRemoveSlice'
import createLoanCreate, { LoanCreateSlice } from '@/lend/store/createLoanCreateSlice'
import createLoanRepaySlice, { LoanRepaySlice } from '@/lend/store/createLoanRepaySlice'
import createLoanSelfLiquidationSlice, { LoanSelfLiquidationSlice } from '@/lend/store/createLoanSelfLiquidationSlice'
import createMarketsSlice, { MarketsSlice } from '@/lend/store/createMarketsSlice'
import createOhlcChartSlice, { OhlcChartSlice } from '@/lend/store/createOhlcChartSlice'
import createUserSlice, { UserSlice } from '@/lend/store/createUserSlice'
import createVaultClaimSlice, { VaultClaimSlice } from '@/lend/store/createVaultClaimSlice'
import createVaultDepositMintSlice, { VaultDepositMintSlice } from '@/lend/store/createVaultDepositMintSlice'
import createVaultStakeSlice, { VaultStakeSlice } from '@/lend/store/createVaultStakeSlice'
import createVaultUnstakeSlice, { VaultUnstakeSlice } from '@/lend/store/createVaultUnstakeSlice'
import createVaultWithdrawRedeemSlice, { VaultWithdrawRedeemSlice } from '@/lend/store/createVaultWithdrawRedeemSlice'

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

const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)

export default useStore
