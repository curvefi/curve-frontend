import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { FieldValues, FormSubmitHandler, UseFormReturn, VisibleErrors } from '@ui/features/forms'
import type { FormButtonProps } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import type { PoolToken } from './PoolTokenInput'

export type PoolFormProps<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>
  tokens: QueryProp<PoolToken[]>
  onSubmit: FormSubmitHandler
  isPending: boolean
  isLoading: boolean
  isDisabled: boolean
  wallet: Pick<FormButtonProps, 'connect' | 'isConnected' | 'isConnecting'>
  userAddress: Address | undefined
  error: Error | Nullish
  formErrors: VisibleErrors<TValues>
  footer: ReactNode
  priceImpact: QueryProp<Decimal | null>
  slippage: Decimal
  onSlippageChange: (slippage: Decimal) => void
}
