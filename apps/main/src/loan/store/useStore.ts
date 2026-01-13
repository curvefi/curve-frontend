import type { StoreApi } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AppSlice, createAppSlice } from '@/loan/store/createAppSlice'
import { ChartBandsSlice, createChartBandsSlice } from '@/loan/store/createChartBandsStore'
import {
  LoanCollateralDecreaseSlice,
  createLoanCollateralDecrease,
} from '@/loan/store/createLoanCollateralDecreaseSlice'
import {
  LoanCollateralIncreaseSlice,
  createLoanCollateralIncrease,
} from '@/loan/store/createLoanCollateralIncreaseSlice'
import { LoanCreateSlice, createLoanCreate } from '@/loan/store/createLoanCreateSlice'
import { LoanDecreaseSlice, createLoanDecrease } from '@/loan/store/createLoanDecreaseSlice'
import { LoanDeleverageSlice, createLoanDeleverageSlice } from '@/loan/store/createLoanDeleverageSlice'
import { LoanIncreaseSlice, createLoanIncrease } from '@/loan/store/createLoanIncreaseSlice'
import { LoanLiquidateSlice, createLoanLiquidate } from '@/loan/store/createLoanLiquidate'
import { LoansSlice, createLoansSlice } from '@/loan/store/createLoansSlice'
import { OhlcChartSlice, createOhlcChart as createOhlcChartSlice } from '@/loan/store/createOhlcChartSlice'
import { ScrvUsdSlice, createScrvUsdSlice } from '@/loan/store/createScrvUsdSlice'

export type State = AppSlice &
  ChartBandsSlice &
  LoansSlice &
  LoanCreateSlice &
  LoanCollateralDecreaseSlice &
  LoanCollateralIncreaseSlice &
  LoanDecreaseSlice &
  LoanDeleverageSlice &
  LoanIncreaseSlice &
  LoanLiquidateSlice &
  OhlcChartSlice &
  ScrvUsdSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createAppSlice(set, get),
  ...createChartBandsSlice(set, get),
  ...createLoansSlice(set, get),
  ...createLoanCreate(set, get),
  ...createLoanCollateralDecrease(set, get),
  ...createLoanCollateralIncrease(set, get),
  ...createLoanDecrease(set, get),
  ...createLoanDeleverageSlice(set, get),
  ...createLoanIncrease(set, get),
  ...createLoanLiquidate(set, get),
  ...createOhlcChartSlice(set, get),
  ...createScrvUsdSlice(set, get),
})

export const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
