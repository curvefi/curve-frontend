import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
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

export const invalidateOrRefetchRepayRouteQueries = async (isRouteIdChanged: boolean, params: RepayIsFullParams) =>
  await Promise.all(
    (isRouteIdChanged
      ? [
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
      : [
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
    ).map((run) => run(params)),
  )
