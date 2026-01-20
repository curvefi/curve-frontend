import type { FormDetailInfo, FormStatus, FormValues } from '@/loan/components/PageMintMarket/LoanDeleverage/types'
import {
  DEFAULT_DETAIL_INFO as DETAIL_INFO,
  DEFAULT_FORM_STATUS as FORM_STATUS,
} from '@/loan/components/PageMintMarket/utils'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
  isFullRepay: false,
}

export const DEFAULT_DETAIL_INFO: FormDetailInfo = {
  ...DETAIL_INFO,
  isAvailable: null,
  isFullRepayment: false,
  receiveStablecoin: '',
  routeName: '',
  priceImpact: '',
  isHighImpact: false,
  error: '',
}
