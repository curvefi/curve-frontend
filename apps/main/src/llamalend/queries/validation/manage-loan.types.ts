import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'

export type CollateralQuery<T = IChainId> = UserMarketQuery<T> & {
  userCollateral: Decimal
  maxCollateral?: Decimal
}

type HealthQuery = { isFull: boolean }

export type CollateralHealthQuery<T = IChainId> = CollateralQuery<T> & HealthQuery

export type RepayFromCollateralQuery<T = IChainId> = CollateralQuery<T> & {
  stateCollateral: Decimal
  userBorrowed: Decimal
}

export type RepayFromCollateralHealthQuery<T = IChainId> = RepayFromCollateralQuery<T> & HealthQuery
export type RepayFromCollateralIsFullQuery<T = IChainId> = RepayFromCollateralQuery<T> & HealthQuery

export type RepayFromCollateralParams<T = IChainId> = FieldsOf<RepayFromCollateralQuery<T>>
export type RepayFromCollateralHealthParams<T = IChainId> = FieldsOf<RepayFromCollateralHealthQuery<T>>
export type RepayFromCollateralIsFullParams<T = IChainId> = FieldsOf<RepayFromCollateralIsFullQuery<T>>
export type CollateralParams<T = IChainId> = FieldsOf<CollateralQuery<T>>
export type CollateralHealthParams<T = IChainId> = FieldsOf<CollateralHealthQuery<T>>
