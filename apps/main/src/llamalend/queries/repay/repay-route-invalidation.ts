import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import type { RouteResponse } from '@primitives/router.utils'
import { invalidateRepayExpectedBorrowed } from './repay-expected-borrowed.query'
import { invalidateRepayFutureLeverage } from './repay-future-leverage.query'
import { invalidateRepayEstimateGasQueries } from './repay-gas-estimate.query'
import { invalidateRepayHealth } from './repay-health.query'
import { invalidateRepayIsApproved } from './repay-is-approved.query'
import { invalidateRepayIsAvailable } from './repay-is-available.query'
import { invalidateRepayIsFull } from './repay-is-full.query'
import { invalidateRepayPriceImpact } from './repay-price-impact.query'
import { invalidateRepayPrices } from './repay-prices.query'
import { invalidateRepayRouteImage } from './repay-route-image.query'

export const invalidateRepayRouteQueries = async (route: RouteResponse | undefined, params: RepayParams) =>
  route &&
  (await Promise.all([
    invalidateRepayExpectedBorrowed(params),
    invalidateRepayEstimateGasQueries(params),
    invalidateRepayHealth(params),
    invalidateRepayIsApproved(params),
    invalidateRepayIsAvailable(params),
    invalidateRepayIsFull(params),
    invalidateRepayPriceImpact(params),
    invalidateRepayPrices(params),
    invalidateRepayRouteImage(params),
    invalidateRepayFutureLeverage(params),
  ]))
