import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserPoolQuery } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'

export type CollateralQuery<T = IChainId> = UserPoolQuery<T> & { userCollateral: Decimal }

export type CollateralHealthQuery<T = IChainId> = CollateralQuery<T> & { isFull: boolean }

export type RepayFromCollateralQuery<T = IChainId> = CollateralQuery<T> & {
  stateCollateral: Decimal
  userBorrowed: Decimal
}

export type RepayFromCollateralHealthQuery<T = IChainId> = RepayFromCollateralQuery<T> & { isFull: boolean }

export type RepayFromCollateralParams<T = IChainId> = FieldsOf<RepayFromCollateralQuery<T>>
export type RepayFromCollateralHealthParams<T = IChainId> = FieldsOf<RepayFromCollateralHealthQuery<T>>
export type CollateralParams<T = IChainId> = FieldsOf<CollateralQuery<T>>
export type CollateralHealthParams<T = IChainId> = FieldsOf<CollateralHealthQuery<T>>
