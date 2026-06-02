import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model'
import type { MakeOptional } from '@ui-kit/types/util'

export type CompleteRepayForm = {
  userCollateral: Decimal
  stateCollateral: Decimal
  userBorrowed: Decimal
  slippage: Decimal
  routeId: string | undefined
}

type RepayCalculatedValues = {
  maxCollateral: Decimal | undefined
  maxBorrowed: Decimal | undefined
  maxStateCollateral: Decimal | undefined
  isFull: boolean | undefined
}

export type RepayFormData = MakeOptional<CompleteRepayForm, 'userCollateral' | 'userBorrowed' | 'stateCollateral'> &
  RepayCalculatedValues
export type RepayFormParams = RepayFormData & UserMarketParams<IChainId>

export type RepayQuery = UserMarketQuery<IChainId> & CompleteRepayForm & RepayCalculatedValues
export type RepayParams = FieldsOf<RepayQuery>

export type RepayHealthQuery = RepayQuery & { isHealthFull: boolean }
export type RepayHealthParams = FieldsOf<RepayHealthQuery>
