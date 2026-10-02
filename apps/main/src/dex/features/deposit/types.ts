import type { PoolQuery, UserQuery } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolDepositForm, PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { MakeRequired } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type DepositFormValues = PoolDepositForm & { slippage: Decimal }

export type DepositQuery = PoolQuery & MakeRequired<Omit<DepositFormValues, 'isBalanced'>, 'decimals'>
export type UserDepositQuery = DepositQuery & UserQuery

export type DepositParams = FieldsOf<DepositQuery>
export type UserDepositParams = FieldsOf<UserDepositQuery>

export type DepositMutation = Omit<MakeRequired<DepositFormValues, 'decimals'>, keyof PoolTokenFields> & {
  amounts: Decimal[]
}
