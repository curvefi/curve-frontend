import type { ExchangeRate, Route, RoutesAndOutputModal } from '@/dex/components/PageRouterSwap/types'

export type StepKey = 'APPROVAL' | 'SWAP' | ''

export type ExchangeOutput = {
  loading: boolean
  exchangeRates: ExchangeRate[]
  isExchangeRateLow: boolean
  priceImpact: number
  toAmount: string
  modal?: RoutesAndOutputModal | null
}

export type RouterSwapOutput = {
  isExchangeRateLow: boolean
  isHighSlippage: boolean
  priceImpact: number
  routes: Route[]
  toAmount: string
  toAmountOutput: string
  fromAmount: string
  error: string
  exchangeRates: {
    from: string
    to: string
    fromAddress: string
    value: string
    label: string
  }[]
  isApproved: boolean
}

export type FormValues = {
  isFrom: boolean | null
  isWrapped: boolean
  fromAmount: string
  fromAddress: string
  fromToken: string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  fromError: 'too-much' | string
  toAddress: string
  toAmount: string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  toError: 'too-much-reserves' | string
  toToken: string
}

export type FormStatus = {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: 'APPROVE' | 'SWAP' | ''
  step: StepKey | ''
  error: string
  warning: string
}
