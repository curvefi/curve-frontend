import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import type { PoolQuery, UserParams, UserQuery } from '@/stellar/queries/query-types'
import type { QuoteQuery } from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { WithdrawMode, WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type WithdrawSimulationQuery = QuoteQuery & UserQuery & WithdrawMutation & { expected: Decimal }
export type WithdrawSimulationParams = FieldsOf<DeepPartial<WithdrawSimulationQuery>>
export type WithdrawQuoteParams = WithdrawSimulationParams &
  PoolQuery &
  UserParams & { mode: WithdrawMode; slippage: Decimal }
export type WithdrawMutationContext = PoolQuery & {
  account: StellarAddress
  expected: Decimal
  tokens: StellarContract[]
}
export type WithdrawMutationOptions = FieldsOf<WithdrawMutationContext> & { onReset: () => void }
