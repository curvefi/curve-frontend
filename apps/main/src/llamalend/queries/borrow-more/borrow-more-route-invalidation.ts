import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { invalidateBorrowMoreExpectedCollateral } from './borrow-more-expected-collateral.query'
import {
  invalidateBorrowMoreApproveGasEstimateQuery,
  invalidateBorrowMoreGasEstimateQuery,
} from './borrow-more-gas-estimate.query'
import { invalidateBorrowMoreHealth } from './borrow-more-health.query'
import { invalidateBorrowMoreIsApproved } from './borrow-more-is-approved.query'
import { invalidateBorrowMoreMaxReceive } from './borrow-more-max-receive.query'
import { invalidateBorrowMorePriceImpact } from './borrow-more-price-impact.query'
import { invalidateBorrowMorePrices } from './borrow-more-prices.query'

export const invalidateBorrowMoreRouteQueries = async (params: BorrowMoreParams) => {
  await Promise.all([
    invalidateBorrowMoreExpectedCollateral(params),
    invalidateBorrowMoreApproveGasEstimateQuery(params),
    invalidateBorrowMoreGasEstimateQuery(params),
    invalidateBorrowMoreHealth(params),
    invalidateBorrowMoreIsApproved(params),
    invalidateBorrowMoreMaxReceive(params),
    invalidateBorrowMorePriceImpact(params),
    invalidateBorrowMorePrices(params),
  ])
}
