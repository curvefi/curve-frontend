import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'

import { devtools, persist } from 'zustand/middleware'

import type { PersistOptions } from 'zustand/middleware/persist'
import createAppSlice, { AppSlice } from '@/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/store/createCacheSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/store/createChartBandsStore'
import createCollateralListSlice, { CollateralListSlice } from '@/store/createCollateralListSlice'
import createCollateralsSlice, { CollateralsSlice } from '@/store/createCollateralsSlice'
import createGasSlice, { GasSlice } from '@/store/createGasSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/store/createIntegrationsSlice'
import createLayoutSlice, { AppLayoutSlice } from '@/store/createLayoutSlice'
import createLoanCollateralDecrease, { LoanCollateralDecreaseSlice } from '@/store/createLoanCollateralDecreaseSlice'
import createLoanCollateralIncrease, { LoanCollateralIncreaseSlice } from '@/store/createLoanCollateralIncreaseSlice'
import createLoanCreate, { LoanCreateSlice } from '@/store/createLoanCreateSlice'
import createLoanDecrease, { LoanDecreaseSlice } from '@/store/createLoanDecreaseSlice'
import createLoanDeleverageSlice, { LoanDeleverageSlice } from '@/store/createLoanDeleverageSlice'
import createLoanIncrease, { LoanIncreaseSlice } from '@/store/createLoanIncreaseSlice'
import createLoanLiquidate, { LoanLiquidateSlice } from '@/store/createLoanLiquidate'
import createLoansSlice, { LoansSlice } from '@/store/createLoansSlice'
import createLoanSwap, { LoanSwapSlice } from '@/store/createLoanSwap'
import createOhlcChartSlice, { OhlcChartSlice } from '@/store/createOhlcChartSlice'
import createPegKeepersSlice, { PegKeepersSlice } from '@/store/createPegKeepersSlice'
import createTokensSlice, { TokensSlice } from '@/store/createTokensSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@/store/createUsdRatesSlice'
import createWalletSlice, { WalletSlice } from '@/store/createWalletSlice'

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

const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'crvusd-app-store-cache',
  partialize: ({ storeCache }: State) => ({ storeCache }),
  // @ts-ignore
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 2, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useStore
