import { FormDetailInfo, FormEstGas, FormStatus } from '@lend/components/PageLoanManage/types'
import { HealthMode, MarketDetailsView } from '@lend/types/lend.types'

export const DEFAULT_HEALTH_MODE: HealthMode = {
  percent: '',
  colorKey: '',
  icon: null,
  message: null,
  warningTitle: '',
  warning: '',
}

export const DEFAULT_DETAIL_INFO: FormDetailInfo = {
  healthFull: '',
  healthNotFull: '',
  futureRates: null,
  bands: [0, 0],
  prices: [],
  loading: false,
  error: '',
}

export const DEFAULT_FORM_EST_GAS: FormEstGas = {
  estimatedGas: 0,
  loading: false,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  isApprovedCompleted: false,
  isComplete: false,
  isInProgress: false,
  error: '',
  stepError: '',
}

export const DEFAULT_CONFIRM_WARNING = {
  isConfirming: false,
  confirmedWarning: false,
}

export function _getSelectedTab(
  marketDetailsView: MarketDetailsView,
  signerAddress: string | undefined,
): MarketDetailsView {
  if (marketDetailsView === 'user') {
    return signerAddress ? 'user' : 'market'
  } else if (marketDetailsView) {
    return marketDetailsView
  } else {
    return 'market'
  }
}
