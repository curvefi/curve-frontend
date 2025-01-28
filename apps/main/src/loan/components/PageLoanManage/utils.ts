import { FormDetailInfo, FormEstGas, FormStatus } from '@/loan/components/PageLoanManage/types'
import { INVALID_ADDRESS } from '@/loan/constants'
import { Llamma, HealthMode, UserWalletBalances } from '@/loan/types/loan.types'

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
  bands: [0, 0],
  prices: [],
  loading: false,
}

export const DEFAULT_FORM_EST_GAS: FormEstGas = {
  estimatedGas: 0,
  loading: false,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  isComplete: false,
  isInProgress: false,
  error: '',
}

export const DEFAULT_USER_WALLET_BALANCES: UserWalletBalances = {
  collateral: '0',
  stablecoin: '0',
  error: '',
}

export function hasDeleverage(llamma: Llamma | null) {
  return !!llamma && llamma?.deleverageZap !== INVALID_ADDRESS
}
