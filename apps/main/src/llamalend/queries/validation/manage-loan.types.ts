import type { RouterMeta } from '@/llamalend/llamalend.types'
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

export type RepayQuery<T = IChainId> = CollateralQuery<T> & {
  stateCollateral: Decimal
  userBorrowed: Decimal
  slippage: Decimal
} & RouterMeta

export type RepayHealthQuery<T = IChainId> = RepayQuery<T> & HealthQuery
export type RepayIsFullQuery<T = IChainId> = RepayQuery<T> & HealthQuery

export type RepayParams<T = IChainId> = FieldsOf<RepayQuery<T>>
export type RepayHealthParams<T = IChainId> = FieldsOf<RepayHealthQuery<T>>
export type RepayIsFullParams<T = IChainId> = FieldsOf<RepayIsFullQuery<T>>
export type CollateralParams<T = IChainId> = FieldsOf<CollateralQuery<T>>
export type CollateralHealthParams<T = IChainId> = FieldsOf<CollateralHealthQuery<T>>
