import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import {
  invalidateBorrowMoreExpectedCollateral,
  refetchBorrowMoreExpectedCollateral,
} from './borrow-more-expected-collateral.query'
import {
  invalidateBorrowMoreFutureLeverage,
  refetchBorrowMoreFutureLeverage,
} from './borrow-more-future-leverage.query'
import {
  invalidateBorrowMoreApproveGasEstimateQuery,
  invalidateBorrowMoreGasEstimateQuery,
  refetchBorrowMoreApproveGasEstimateQuery,
  refetchBorrowMoreGasEstimateQuery,
} from './borrow-more-gas-estimate.query'
import { invalidateBorrowMoreHealth, refetchBorrowMoreHealth } from './borrow-more-health.query'
import { invalidateBorrowMoreIsApproved, refetchBorrowMoreIsApproved } from './borrow-more-is-approved.query'
import { invalidateBorrowMoreMaxReceive, refetchBorrowMoreMaxReceive } from './borrow-more-max-receive.query'
import { invalidateBorrowMorePriceImpact, refetchBorrowMorePriceImpact } from './borrow-more-price-impact.query'
import { invalidateBorrowMorePrices, refetchBorrowMorePrices } from './borrow-more-prices.query'

export const invalidateOrRefetchBorrowMoreRouteQueries = async (isRouteIdChanged: boolean, params: BorrowMoreParams) =>
  await Promise.all(
    (isRouteIdChanged
      ? [
          invalidateBorrowMoreExpectedCollateral,
          invalidateBorrowMoreFutureLeverage,
          invalidateBorrowMoreApproveGasEstimateQuery,
          invalidateBorrowMoreGasEstimateQuery,
          invalidateBorrowMoreHealth,
          invalidateBorrowMoreIsApproved,
          invalidateBorrowMoreMaxReceive,
          invalidateBorrowMorePriceImpact,
          invalidateBorrowMorePrices,
        ]
      : [
          refetchBorrowMoreExpectedCollateral,
          refetchBorrowMoreFutureLeverage,
          refetchBorrowMoreApproveGasEstimateQuery,
          refetchBorrowMoreGasEstimateQuery,
          refetchBorrowMoreHealth,
          refetchBorrowMoreIsApproved,
          refetchBorrowMoreMaxReceive,
          refetchBorrowMorePriceImpact,
          refetchBorrowMorePrices,
        ]
    ).map((run) => run(params)),
  )
