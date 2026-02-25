import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model'

export type CollateralQuery<T = IChainId> = UserMarketQuery<T> & {
  userCollateral: Decimal
  maxCollateral?: Decimal
}

type HealthQuery = { isFull: boolean }

export type CollateralHealthQuery<T = IChainId> = CollateralQuery<T> & HealthQuery

export type RepayQuery<T = IChainId> = CollateralQuery<T> & {
  stateCollateral: Decimal
  userBorrowed: Decimal
  slippage: Decimal
}

export type RepayHealthQuery<T = IChainId> = RepayQuery<T> & HealthQuery
export type RepayIsFullQuery<T = IChainId> = RepayQuery<T> & HealthQuery

export type CloseLoanQuery<T = IChainId> = UserMarketQuery<T> & { slippage: Decimal }
export type CloseLoanHealthQuery<T = IChainId> = CloseLoanQuery<T> & HealthQuery

export type RepayParams<T = IChainId> = FieldsOf<RepayQuery<T>>
export type RepayHealthParams<T = IChainId> = FieldsOf<RepayHealthQuery<T>>
export type RepayIsFullParams<T = IChainId> = FieldsOf<RepayIsFullQuery<T>>
export type CollateralParams<T = IChainId> = FieldsOf<CollateralQuery<T>>
export type CollateralHealthParams<T = IChainId> = FieldsOf<CollateralHealthQuery<T>>
export type CloseLoanParams<T = IChainId> = FieldsOf<CloseLoanQuery<T>>
export type CloseLoanHealthParams<T = IChainId> = FieldsOf<CloseLoanHealthQuery<T>>
