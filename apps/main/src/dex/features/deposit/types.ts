import type { PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolDepositForm } from '@ui/features/pool-forms/pool-form.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type DepositFormValues = PoolDepositForm & { slippage: Decimal }

export type DepositMutation = { amounts: Decimal[]; decimals: number[]; isWrapped: boolean; slippage: Decimal }

export type DepositQuery = PoolQuery & DepositMutation

export type UserDepositQuery = DepositQuery & UserQuery

export type DepositParams = FieldsOf<DepositQuery>
export type UserDepositParams = FieldsOf<UserDepositQuery>
