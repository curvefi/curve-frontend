import type { ExchangeOutput, FormStatus, FormValues } from '@/dex/components/PagePool/Swap/types'
import type { EstimatedGas as FormEstGas } from '@/dex/components/PagePool/types'

export const DEFAULT_EST_GAS: FormEstGas = { estimatedGas: 0, loading: false }

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
  warning: '',
}

export const DEFAULT_EXCHANGE_OUTPUT: ExchangeOutput = {
  loading: false,
  exchangeRates: [],
  isExchangeRateLow: false,
  priceImpact: 0,
  toAmount: '',
  modal: null,
}

export const DEFAULT_FORM_VALUES: FormValues = {
  isFrom: null,
  isWrapped: false,
  fromAddress: '',
  fromToken: '',
  fromAmount: '',
  fromError: '',
  toAddress: '',
  toAmount: '',
  toError: '',
  toToken: '',
}
