import type { UserPoolQuery } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import type { PoolDepositForm, PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type DepositFormValues = PoolDepositForm & { slippage: Decimal }

export type DepositQuery = UserPoolQuery & DepositFormState

export type DepositParams = FieldsOf<DepositQuery>
export type DepositFormState = DepositFormValues & PoolTokenFields
export type DepositMutation = DepositQuery & { amounts: Decimal[] }
