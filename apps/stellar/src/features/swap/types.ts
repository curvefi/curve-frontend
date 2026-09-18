import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import type { PoolQuery, UserParams, UserQuery } from '@/stellar/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import type { SwapFormValues, SwapMutation } from '@ui/features/pool-forms/swap/swap-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type CompleteSwapForm = Omit<SwapFormValues, 'minimum'> & UserParams

export type SwapFormQuery = PoolQuery & CompleteSwapForm
export type { SwapMutation }
export type SwapQuoteQuery = PoolQuery &
  Pick<SwapMutation, 'fromIndex' | 'toIndex' | 'decimals' | 'inputAmount'> &
  Pick<SwapFormValues, 'maxOutput' | 'editedSide'> & { outputAmount: Decimal }
export type SwapQuoteParams = FieldsOf<DeepPartial<SwapQuoteQuery>>
export type SwapQuery = PoolQuery & UserQuery & SwapMutation
export type SwapParams = FieldsOf<DeepPartial<SwapQuery>>
export type SwapMutationOptions = PoolQuery & {
  account: StellarAddress | undefined
  tokens: StellarContract[]
  onReset: () => void
}
