import type { RouteResponse } from '@evm-ui/entities/router-api'
import { invalidateBorrowMoreExpectedCollateral } from './borrow-more-expected-collateral.query'
import { invalidateBorrowMoreFutureLeverage } from './borrow-more-future-leverage.query'
import { invalidateBorrowMoreEstimateGasQueries } from './borrow-more-gas-estimate.query'
import { invalidateBorrowMoreHealth } from './borrow-more-health.query'
import { invalidateBorrowMoreIsApproved } from './borrow-more-is-approved.query'
import { type BorrowMoreMaxReceiveParams, invalidateBorrowMoreMaxReceive } from './borrow-more-max-receive.query'
import { invalidateBorrowMorePriceImpact } from './borrow-more-price-impact.query'
import { invalidateBorrowMorePrices } from './borrow-more-prices.query'

export const invalidateBorrowMoreRouteQueries = async (
  route: RouteResponse | undefined,
  params: BorrowMoreMaxReceiveParams,
) =>
  route &&
  (await Promise.all([
    invalidateBorrowMoreExpectedCollateral(params),
    invalidateBorrowMoreFutureLeverage(params),
    invalidateBorrowMoreEstimateGasQueries(params),
    invalidateBorrowMoreHealth(params),
    invalidateBorrowMoreIsApproved(params),
    invalidateBorrowMoreMaxReceive(params),
    invalidateBorrowMorePriceImpact(params),
    invalidateBorrowMorePrices(params),
  ]))
