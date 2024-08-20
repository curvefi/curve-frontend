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
import createCollateralsSlice, { CollateralsSlice } from '@/store/createCollateralsSlice'
import createLoansSlice, { LoansSlice } from '@/store/createLoansSlice'
import createCollateralListSlice, { CollateralListSlice } from '@/store/createCollateralListSlice'
import createLoanCreate, { LoanCreateSlice } from '@/store/createLoanCreateSlice'
import createLoanCollateralDecrease, { LoanCollateralDecreaseSlice } from '@/store/createLoanCollateralDecreaseSlice'
import createLoanCollateralIncrease, { LoanCollateralIncreaseSlice } from '@/store/createLoanCollateralIncreaseSlice'
import createLoanDecrease, { LoanDecreaseSlice } from '@/store/createLoanDecreaseSlice'
import createLoanIncrease, { LoanIncreaseSlice } from '@/store/createLoanIncreaseSlice'
import createLoanSwap, { LoanSwapSlice } from '@/store/createLoanSwap'
import createLoanLiquidate, { LoanLiquidateSlice } from '@/store/createLoanLiquidate'
import createChartBandsSlice, { ChartBandsSlice } from '@/store/createChartBandsStore'
import createIntegrationsSlice, { IntegrationsSlice } from '@/store/createIntegrationsSlice'
import createLoanDeleverageSlice, { LoanDeleverageSlice } from '@/store/createLoanDeleverageSlice'
import createOhlcChartSlice, { OhlcChartSlice } from '@/store/createOhlcChartSlice'
import createPegKeepersSlice, { PegKeepersSlice } from '@/store/createPegKeepersSlice'

export type State = CacheSlice &
  AppSlice &
  AppLayoutSlice &
  WalletSlice &
  GasSlice &
  UsdRatesSlice &
  TokensSlice &
  ChartBandsSlice &
  CollateralsSlice &
  LoansSlice &
  CollateralListSlice &
  LoanCreateSlice &
  LoanCollateralDecreaseSlice &
  LoanCollateralIncreaseSlice &
  LoanDecreaseSlice &
  LoanDeleverageSlice &
  LoanIncreaseSlice &
  LoanSwapSlice &
  LoanLiquidateSlice &
  IntegrationsSlice &
  OhlcChartSlice &
  PegKeepersSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createCacheSlice(set, get),
  ...createAppSlice(set, get),
  ...createWalletSlice(set, get),
  ...createLayoutSlice(set, get),
  ...createGasSlice(set, get),
  ...createUsdRatesSlice(set, get),
  ...createTokensSlice(set, get),
  ...createChartBandsSlice(set, get),
  ...createCollateralsSlice(set, get),
  ...createLoansSlice(set, get),
  ...createCollateralListSlice(set, get),
  ...createLoanCreate(set, get),
  ...createLoanCollateralDecrease(set, get),
  ...createLoanCollateralIncrease(set, get),
  ...createLoanDecrease(set, get),
  ...createLoanDeleverageSlice(set, get),
  ...createLoanIncrease(set, get),
  ...createLoanSwap(set, get),
  ...createLoanLiquidate(set, get),
  ...createIntegrationsSlice(set, get),
  ...createOhlcChartSlice(set, get),
  ...createPegKeepersSlice(set, get),
})

// cache all items in CacheSlice store

const cache = {
  name: 'crvusd-app-store-cache',
  partialize: (state: State) => {
    return Object.fromEntries(
      Object.entries(state).filter(([key]) => {
        return ['storeCache'].includes(key)
      })
    )
  },
  // @ts-ignore
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 1, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create<State>(devtools(persist(store, cache)))
    : create<State>(persist(store, cache))

export default useStore
