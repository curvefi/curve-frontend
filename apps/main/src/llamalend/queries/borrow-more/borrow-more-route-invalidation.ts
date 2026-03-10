import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { RouteResponse } from '@primitives/router.utils'
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

const refetch = [
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
const invalidate = [
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
export const invalidateOrRefetchBorrowMoreRouteQueries = async (
  route: RouteResponse | undefined,
  params: BorrowMoreParams,
) => route && (await Promise.all((route.id == params.routeId ? refetch : invalidate).map((run) => run(params))))
