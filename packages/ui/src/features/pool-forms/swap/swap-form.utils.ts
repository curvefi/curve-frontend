import type { Decimal } from '@primitives/decimal.utils'
import type { AllowUndefined } from '@ui/features/queries/util'

/** Defines which field is being edited and which is being calculated. */
export type SwapSide = 'pay' | 'receive'

export type SwapMutation = {
  fromIndex: number
  toIndex: number
  inputAmount: Decimal
  decimals: number[]
  maxAmount: Decimal
  minimum: Decimal
}

export type SwapFormValues = AllowUndefined<Omit<SwapMutation, 'decimals'>, 'inputAmount' | 'maxAmount' | 'minimum'> & {
  editedSide: SwapSide
  decimals: (number | undefined)[] | undefined
  maxOutput: Decimal | undefined
  outputAmount: Decimal | undefined
  slippage: Decimal
}

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

export const reverseSwap = ({
  fromIndex,
  toIndex,
  inputAmount,
  outputAmount,
}: Pick<SwapFormValues, 'fromIndex' | 'toIndex' | 'inputAmount' | 'outputAmount'>) => ({
  fromIndex: toIndex,
  toIndex: fromIndex,
  inputAmount: outputAmount,
  outputAmount: inputAmount,
  editedSide: 'pay' as const,
})
