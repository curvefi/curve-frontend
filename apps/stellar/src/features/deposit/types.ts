import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { PoolQuery, UserParams, UserQuery } from '@/stellar/queries/root-keys'
import type { QuoteQuery } from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolForm, PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type DepositForm = PoolForm & { supply: Decimal | undefined; slippage: Decimal }

type CompleteDepositForm = DepositForm &
  PoolTokenFields & { maxAmounts: (Decimal | undefined)[] | undefined; tokenCount: number | undefined }

export type DepositFormQuery = PoolQuery & UserParams & CompleteDepositForm

export type DepositMutation = {
  amounts: (Decimal | undefined)[]
  maxAmounts: (Decimal | undefined)[]
  decimals: number[]
  supply: Decimal
  slippage: Decimal
}

export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal; maxAmounts: (Decimal | undefined)[] }
export type DepositParams = FieldsOf<DeepPartial<DepositQuery>>
export type DepositMutationContext = Pick<DepositQuery, 'network' | 'pool' | 'account' | 'minMint'> & {
  tokens: StellarContract[]
  quote: Decimal
}
export type DepositMutationParams = FieldsOf<DeepPartial<DepositMutationContext & DepositMutation>>
export type DepositMutationOptions = FieldsOf<DepositMutationContext> & { onReset: () => void }
