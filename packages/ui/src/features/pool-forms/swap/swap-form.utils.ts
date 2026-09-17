import type { Decimal } from '@primitives/decimal.utils'
import type { MakeOptional } from '@ui/features/queries/util'

/** Defines which field is being edited and which is being calculated. */
export type SwapSide = 'pay' | 'receive'

export type SwapMutation = {
  fromIndex: number
  toIndex: number
  inputAmount: Decimal
  decimals: number[]
  maxAmount: Decimal
  outputAmount: Decimal
  minimum: Decimal
  slippage: Decimal
}

export type SwapFormValues = MakeOptional<
  Omit<SwapMutation, 'decimals'>,
  'inputAmount' | 'maxAmount' | 'outputAmount' | 'minimum'
> & { editedSide: SwapSide; decimals: (number | undefined)[] | undefined; maxOutput: Decimal | undefined }

export type SwapAmountField = 'inputAmount' | 'outputAmount'

export const SWAP_FIELDS = {
  pay: {
    amountField: 'inputAmount',
    calculatedField: 'outputAmount',
    amountIndexField: 'fromIndex',
    calculatedIndexField: 'toIndex',
  },
  receive: {
    amountField: 'outputAmount',
    calculatedField: 'inputAmount',
    amountIndexField: 'toIndex',
    calculatedIndexField: 'fromIndex',
  },
} as const
