import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import type { MakeOptional } from '@ui-kit/types/util'

export type CompleteRepayForm = {
  userCollateral: Decimal
  stateCollateral: Decimal
  userBorrowed: Decimal
  slippage: Decimal
  routeId: string | undefined
}

type RepayCalculatedValues = {
  maxCollateral: Decimal
  maxBorrowed: Decimal
  maxStateCollateral: Decimal
  isFull: boolean
}

export type RepayFormData = MakeOptional<CompleteRepayForm, 'userCollateral' | 'userBorrowed' | 'stateCollateral'> &
  RepayCalculatedValues

export type RepayQuery = UserMarketQuery<IChainId> & CompleteRepayForm & RepayCalculatedValues

export type RepayParams = FieldsOf<RepayQuery>

export type RepayHealthQuery = RepayQuery & { isHealthFull: boolean }
export type RepayHealthParams = FieldsOf<RepayHealthQuery>
