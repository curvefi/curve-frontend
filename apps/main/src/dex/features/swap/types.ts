import type { PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type SwapQuery = PoolQuery &
  Pick<SwapFormValues, 'fromIndex' | 'toIndex' | 'isWrapped' | 'slippage'> & {
    inputAmount: Decimal
    decimals: number[]
  }
export type SwapParams = FieldsOf<DeepPartial<SwapQuery>>
export type UserSwapParams = SwapParams & FieldsOf<UserQuery>

export type SwapQuoteQuery = Omit<SwapQuery, 'slippage'> &
  Pick<SwapFormValues, 'editedSide' | 'outputAmount' | 'maxOutput'>
export type SwapQuoteParams = FieldsOf<DeepPartial<SwapQuoteQuery>>

export type SwapMutation = SwapFormValues & {
  inputAmount: Decimal
  decimals: number[]
  maxAmount: Decimal
  expectedOutput: Decimal
}
