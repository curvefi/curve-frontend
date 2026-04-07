import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model'

export type CollateralQuery<T = IChainId> = UserMarketQuery<T> & {
  userCollateral: Decimal
  maxCollateral?: Decimal
}

export type CollateralHealthQuery<T = IChainId> = CollateralQuery<T> & { isFull: boolean }

export type CloseLoanQuery<T = IChainId> = UserMarketQuery<T> & { slippage: Decimal }

export type CollateralParams<T = IChainId> = FieldsOf<CollateralQuery<T>>
export type CollateralHealthParams<T = IChainId> = FieldsOf<CollateralHealthQuery<T>>
export type CloseLoanParams<T = IChainId> = FieldsOf<CloseLoanQuery<T>>
