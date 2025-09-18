import lodash from 'lodash'
import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import createAppSlice, { AppSlice } from '@/loan/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/loan/store/createCacheSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/loan/store/createCampaignRewardsSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/loan/store/createChartBandsStore'
import createCollateralsSlice, { CollateralsSlice } from '@/loan/store/createCollateralsSlice'
import createIntegrationsSlice, { IntegrationsSlice } from '@/loan/store/createIntegrationsSlice'
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
import createScrvUsdSlice, { ScrvUsdSlice } from '@/loan/store/createScrvUsdSlice'

export type State = CacheSlice &
  AppSlice &
  ChartBandsSlice &
  CollateralsSlice &
  LoansSlice &
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
  ScrvUsdSlice &
  CampaignRewardsSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createCacheSlice(set, get),
  ...createAppSlice(set, get),
  ...createChartBandsSlice(set, get),
  ...createCollateralsSlice(set, get),
  ...createLoansSlice(set, get),
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
  ...createScrvUsdSlice(set, get),
  ...createCampaignRewardsSlice(set, get),
})

// cache all items in CacheSlice store

const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'crvusd-app-store-cache',
  partialize: ({ storeCache }: State) => ({ storeCache }),
  // @ts-ignore
  merge: (persistedState, currentState) => lodash.merge(persistedState, currentState),
  version: 2, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useStore
