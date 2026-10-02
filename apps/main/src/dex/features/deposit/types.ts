import type { PoolQuery, UserPoolQuery } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolDepositForm, PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { MakeRequired } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type DepositFormValues = PoolDepositForm & { slippage: Decimal }

export type DepositQuery = PoolQuery & MakeRequired<DepositFormValues, 'decimals'>
export type UserDepositQuery = UserPoolQuery & MakeRequired<DepositFormValues, 'decimals'>

export type DepositParams = FieldsOf<DepositQuery>
export type UserDepositParams = FieldsOf<UserDepositQuery>

export type DepositMutation = Omit<DepositQuery, keyof PoolTokenFields> & { amounts: Decimal[] }
