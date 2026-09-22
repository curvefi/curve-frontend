import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import type { PoolQuery, UserParams, UserQuery } from '@/stellar/queries/root-keys'
import type { QuoteQuery } from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues, WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type CompleteWithdrawForm = Omit<WithdrawFormValues, 'decimals'> &
  PoolTokenFields & { decimals: (number | undefined)[] | undefined; tokenCount: number | undefined; slippage: Decimal }

export type WithdrawFormQuery = PoolQuery & UserParams & CompleteWithdrawForm

type WithdrawQuery = PoolQuery & UserQuery & WithdrawMutation

export type WithdrawSimulationQuery = QuoteQuery &
  UserQuery & {
    lpAmount: Decimal
    maxLpAmount: Decimal
    seedLock: Decimal
    maxAmounts: (Decimal | undefined)[]
    quote: Decimal
    maximumBurn: Decimal
    slippage: Decimal
  }
export type WithdrawSimulationParams = FieldsOf<DeepPartial<WithdrawSimulationQuery>>
export type WithdrawMutationContext = Pick<WithdrawQuery, 'network' | 'pool' | 'account' | 'quote'> & {
  account: StellarAddress
  tokens: StellarContract[]
}

export type WithdrawMutationOptions = FieldsOf<WithdrawMutationContext> & { onReset: () => void }
