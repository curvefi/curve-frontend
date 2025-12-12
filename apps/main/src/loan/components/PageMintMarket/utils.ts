import {
  type CreateFormStatus,
  FormDetailInfo,
  type FormDetailInfoLeverage,
  FormEstGas,
  FormStatus,
  type FormValues,
} from '@/loan/components/PageMintMarket/types'
import { UserWalletBalances } from '@/loan/types/loan.types'

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

export const DEFAULT_CREATE_FORM_STATUS: CreateFormStatus = {
  ...DEFAULT_FORM_STATUS,
  warning: '',
  step: '',
}

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
export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
  debt: '',
  debtError: '',
  n: null,
}
