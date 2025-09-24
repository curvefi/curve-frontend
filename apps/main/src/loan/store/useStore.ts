import type { GetState, SetState } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import createAppSlice, { AppSlice } from '@/loan/store/createAppSlice'
import createCampaignRewardsSlice, { CampaignRewardsSlice } from '@/loan/store/createCampaignRewardsSlice'
import createChartBandsSlice, { ChartBandsSlice } from '@/loan/store/createChartBandsStore'
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
import createOhlcChartSlice, { OhlcChartSlice } from '@/loan/store/createOhlcChartSlice'
import createScrvUsdSlice, { ScrvUsdSlice } from '@/loan/store/createScrvUsdSlice'

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
  IntegrationsSlice &
  OhlcChartSlice &
  ScrvUsdSlice &
  CampaignRewardsSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
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
  ...createIntegrationsSlice(set, get),
  ...createOhlcChartSlice(set, get),
  ...createScrvUsdSlice(set, get),
  ...createCampaignRewardsSlice(set, get),
})

const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)

export default useStore
