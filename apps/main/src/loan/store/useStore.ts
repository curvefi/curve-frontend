import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PersistOptions } from 'zustand/middleware/persist'
import createAppSlice, { AppSlice } from '@/loan/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/loan/store/createCacheSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/loan/store/createChartBandsStore'
import createCollateralListSlice, { CollateralListSlice } from '@/loan/store/createCollateralListSlice'
import createCollateralsSlice, { CollateralsSlice } from '@/loan/store/createCollateralsSlice'
import createGasSlice, { GasSlice } from '@/loan/store/createGasSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/loan/store/createIntegrationsSlice'
import createLayoutSlice, { AppLayoutSlice } from '@/loan/store/createLayoutSlice'
import createLoanCollateralDecrease, {
  LoanCollateralDecreaseSlice,
} from '@/loan/store/createLoanCollateralDecreaseSlice'
import createLoanCollateralIncrease, {
  LoanCollateralIncreaseSlice,
} from '@/loan/store/createLoanCollateralIncreaseSlice'
import createLoanCreate, { LoanCreateSlice } from '@/loan/store/createLoanCreateSlice'
import createLoanDecrease, { LoanDecreaseSlice } from '@/loan/store/createLoanDecreaseSlice'
import createLoanDeleverageSlice, { LoanDeleverageSlice } from '@/loan/store/createLoanDeleverageSlice'
import createLoanIncrease, { LoanIncreaseSlice } from '@/loan/store/createLoanIncreaseSlice'
import createLoanLiquidate, { LoanLiquidateSlice } from '@/loan/store/createLoanLiquidate'
import createLoansSlice, { LoansSlice } from '@/loan/store/createLoansSlice'
import createLoanSwap, { LoanSwapSlice } from '@/loan/store/createLoanSwap'
import createOhlcChartSlice, { OhlcChartSlice } from '@/loan/store/createOhlcChartSlice'
import createPegKeepersSlice, { PegKeepersSlice } from '@/loan/store/createPegKeepersSlice'
import createScrvUsdSlice, { ScrvUsdSlice } from '@/loan/store/createScrvUsdSlice'
import createUsdRatesSlice, { UsdRatesSlice } from '@/loan/store/createUsdRatesSlice'

export type State = CacheSlice &
  AppSlice &
  AppLayoutSlice &
  GasSlice &
  UsdRatesSlice &
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
  PegKeepersSlice &
  ScrvUsdSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createCacheSlice(set, get),
  ...createAppSlice(set, get),
  ...createLayoutSlice(set, get),
  ...createGasSlice(set, get),
  ...createUsdRatesSlice(set, get),
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
  ...createScrvUsdSlice(set, get),
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
