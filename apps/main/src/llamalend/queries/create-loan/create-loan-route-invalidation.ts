import type { CreateLoanDebtParams } from '@/llamalend/features/borrow/types'
import {
  invalidateCreateLoanEstimateGasQuery,
  refetchCreateLoanEstimateGasQuery,
} from '@/llamalend/queries/create-loan/create-loan-approve-estimate-gas.query'
import {
  invalidateCreateLoanIsApproved,
  refetchCreateLoanIsApproved,
} from '@/llamalend/queries/create-loan/create-loan-approved.query'
import {
  invalidateCreateLoanBands,
  refetchCreateLoanBands,
} from '@/llamalend/queries/create-loan/create-loan-bands.query'
import {
  invalidateCreateLoanExpectedCollateral,
  refetchCreateLoanExpectedCollateral,
} from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import {
  invalidateCreateLoanHealth,
  refetchCreateLoanHealth,
} from '@/llamalend/queries/create-loan/create-loan-health.query'
import {
  invalidateCreateLoanMaxReceive,
  refetchCreateLoanMaxReceive,
} from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import {
  invalidateCreateLoanPriceImpact,
  refetchCreateLoanPriceImpact,
} from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import {
  invalidateCreateLoanPrices,
  refetchCreateLoanPrices,
} from '@/llamalend/queries/create-loan/create-loan-prices.query'

export const invalidateOrRefetchCreateLoanRouteQueries = async (
  isRouteIdChanged: boolean,
  params: CreateLoanDebtParams,
) =>
  await Promise.all(
    (isRouteIdChanged
      ? [
          invalidateCreateLoanExpectedCollateral,
          invalidateCreateLoanIsApproved,
          invalidateCreateLoanBands,
          invalidateCreateLoanHealth,
          invalidateCreateLoanMaxReceive,
          invalidateCreateLoanPriceImpact,
          invalidateCreateLoanPrices,
          invalidateCreateLoanEstimateGasQuery,
        ]
      : [
          refetchCreateLoanExpectedCollateral,
          refetchCreateLoanIsApproved,
          refetchCreateLoanBands,
          refetchCreateLoanHealth,
          refetchCreateLoanMaxReceive,
          refetchCreateLoanPriceImpact,
          refetchCreateLoanPrices,
          refetchCreateLoanEstimateGasQuery,
        ]
    ).map((run) => run(params)),
  )
