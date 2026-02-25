import type { RouteResponse } from '@primitives'
import { AlertFormErrorKey } from '@/dex/components/AlertFormError'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'

export type StepKey = 'APPROVAL' | 'SWAP'

export interface Route extends IRouteStep {
  name: string
  routeUrlId: string
}

export type ExchangeRate = {
  from: string
  to: string
  fromAddress: string
  value: string
  label: string
}

export type RoutesAndOutputModal = {
  [key: string]:
    | {
        lowExchangeRate: boolean
        title: string
        exchangeRate: string
      }
    | {
        priceImpact: boolean
        title: string
        value: string
      }
    | {
        priceImpactLowExchangeRate: boolean
        title: string
        value: string
        exchangeRate: string
      }
}

export type RoutesAndOutput = Pick<RouteResponse, 'router' | 'priceImpact'> & {
  loading: boolean
  exchangeRates: ExchangeRate[]
  isExchangeRateLow: boolean
  isHighSlippage: boolean
  isStableswapRoute: boolean
  routes: Route[]
  toAmount: string
  toAmountOutput: string
  fromAmount: string
  fetchedToAmount: string
  modal: RoutesAndOutputModal | null
}

export type FormEstGas = {
  estimatedGas: number
  loading: boolean
}

export type FormStatus = {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: 'APPROVE' | 'SWAP' | ''
  step: StepKey | ''
  error: AlertFormErrorKey | string
  swapError: string
}

export type FormValues = {
  isFrom: boolean | null
  fromAmount: string
  fromError: 'too-much' | ''
  toAmount: string
}

export type SearchedParams = {
  fromAddress: string
  toAddress: string
}
