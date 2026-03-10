import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RouteResponse } from '@primitives/router.utils'
import { invalidateRepayExpectedBorrowed, refetchRepayExpectedBorrowed } from './repay-expected-borrowed.query'
import {
  invalidateRepayApproveGasEstimateQuery,
  invalidateRepayLoanEstimateGasQuery,
  refetchRepayApproveGasEstimateQuery,
  refetchRepayLoanEstimateGasQuery,
} from './repay-gas-estimate.query'
import { invalidateRepayHealth, refetchRepayHealth } from './repay-health.query'
import { invalidateRepayIsApproved, refetchRepayIsApproved } from './repay-is-approved.query'
import { invalidateRepayIsAvailable, refetchRepayIsAvailable } from './repay-is-available.query'
import { invalidateRepayIsFull, refetchRepayIsFull } from './repay-is-full.query'
import { invalidateRepayPriceImpact, refetchRepayPriceImpact } from './repay-price-impact.query'
import { invalidateRepayPrices, refetchRepayPrices } from './repay-prices.query'
import { invalidateRepayRouteImage, refetchRepayRouteImage } from './repay-route-image.query'

const refetch = [
  refetchRepayExpectedBorrowed,
  refetchRepayLoanEstimateGasQuery,
  refetchRepayApproveGasEstimateQuery,
  refetchRepayHealth,
  refetchRepayIsApproved,
  refetchRepayIsAvailable,
  refetchRepayIsFull,
  refetchRepayPriceImpact,
  refetchRepayPrices,
  refetchRepayRouteImage,
]
const invalidate = [
  invalidateRepayExpectedBorrowed,
  invalidateRepayLoanEstimateGasQuery,
  invalidateRepayApproveGasEstimateQuery,
  invalidateRepayHealth,
  invalidateRepayIsApproved,
  invalidateRepayIsAvailable,
  invalidateRepayIsFull,
  invalidateRepayPriceImpact,
  invalidateRepayPrices,
  invalidateRepayRouteImage,
]
export const invalidateOrRefetchRepayRouteQueries = async (
  route: RouteResponse | undefined,
  params: RepayIsFullParams,
) => route && (await Promise.all((route.id == params.routeId ? refetch : invalidate).map((run) => run(params))))
