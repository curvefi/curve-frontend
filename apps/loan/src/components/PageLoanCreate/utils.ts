import type { FormDetailInfoLeverage, FormStatus, FormValues } from '@loan/components/PageLoanCreate/types'

import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@loan/components/PageLoanManage/utils'
import { Llamma } from '@loan/types/loan.types'

export const DEFAULT_DETAIL_INFO_LEVERAGE: FormDetailInfoLeverage = {
  collateral: '',
  leverage: '',
  routeName: '',
  maxRange: null,
  healthFull: '',
  healthNotFull: '',
  bands: [0, 0],
  prices: [],
  priceImpact: '',
  isHighImpact: false,
  error: '',
  loading: false,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
  debt: '',
  debtError: '',
  liqRange: '',
  n: null,
}

export function hasLeverage(llamma: Llamma | null) {
  return !!llamma && llamma?.leverageZap !== '0x0000000000000000000000000000000000000000'
}
