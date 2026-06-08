import { ChainId, type CollateralUrlParams, LlamaApi, Llamma } from '@/loan/types/loan.types'

export type ManageLoanProps = {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export type PageLoanCreateProps = {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}
