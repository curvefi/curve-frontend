import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn, FormSubmitHandler, VisibleErrors } from '@ui/features/forms'
import type { FormButtonProps } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import type { PoolForm } from './pool-form.utils'
import type { PoolToken } from './PoolTokenInput'

export type PoolFormProps<TValues extends PoolForm> = {
  form: UseFormReturn<TValues>
  tokens: QueryProp<PoolToken[]>
  onSubmit: FormSubmitHandler
  isPending: boolean
  isLoading: boolean
  isDisabled: boolean
  wallet: Pick<FormButtonProps, 'connect' | 'isConnected' | 'isConnecting'>
  userAddress: Address | undefined
  error: Error | null | undefined
  formErrors: VisibleErrors<TValues>
  footer: ReactNode
  priceImpact: QueryProp<Decimal | null>
}
