import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import { invalidateRepayExpectedBorrowed } from './repay-expected-borrowed.query'
import { invalidateRepayApproveGasEstimateQuery, invalidateRepayLoanEstimateGasQuery } from './repay-gas-estimate.query'
import { invalidateRepayHealth } from './repay-health.query'
import { invalidateRepayIsApproved } from './repay-is-approved.query'
import { invalidateRepayIsAvailable } from './repay-is-available.query'
import { invalidateRepayIsFull } from './repay-is-full.query'
import { invalidateRepayPriceImpact } from './repay-price-impact.query'
import { invalidateRepayPrices } from './repay-prices.query'
import { invalidateRepayRouteImage } from './repay-route-image.query'

export const invalidateRepayRouteQueries = async (params: RepayIsFullParams) => {
  await Promise.all([
    invalidateRepayExpectedBorrowed(params),
    invalidateRepayLoanEstimateGasQuery(params),
    invalidateRepayApproveGasEstimateQuery(params),
    invalidateRepayHealth(params),
    invalidateRepayIsApproved(params),
    invalidateRepayIsAvailable(params),
    invalidateRepayIsFull(params),
    invalidateRepayPriceImpact(params),
    invalidateRepayPrices(params),
    invalidateRepayRouteImage(params),
  ])
}
