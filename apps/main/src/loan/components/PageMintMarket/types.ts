import { ChainId, type CollateralUrlParams, LlamaApi, Llamma } from '@/loan/types/loan.types'
import { Decimal } from '@primitives/decimal.utils'
import { Range } from '@ui-kit/types/util'

export type LoanTabProps = {
  curve: LlamaApi | null
  market: Llamma | undefined
  params: CollateralUrlParams
  rChainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}
