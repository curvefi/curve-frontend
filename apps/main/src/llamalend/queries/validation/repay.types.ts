import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { AllowUndefined } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type CompleteRepayForm = {
  stateCollateral: Decimal
  userBorrowed: Decimal
  slippage: Decimal
  routeId: string | undefined
}

export type RepayCalculatedValues = { maxBorrowed?: Decimal; maxStateCollateral?: Decimal; isFull?: boolean }

export type RepayFormValues = AllowUndefined<CompleteRepayForm, 'userBorrowed' | 'stateCollateral'>
export type RepayFormData = RepayFormValues & RepayCalculatedValues

export type RepayQuery = UserMarketQuery<IChainId> & CompleteRepayForm & RepayCalculatedValues
export type RepayParams = FieldsOf<RepayQuery>

export type RepayHealthQuery = RepayQuery & { isHealthFull: boolean }
export type RepayHealthParams = FieldsOf<RepayHealthQuery>
