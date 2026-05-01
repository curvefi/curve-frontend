import type { CreateLoanDebtParams } from '@/llamalend/features/borrow/types'
import {
  invalidateCreateLoanIsApproved,
  refetchCreateLoanIsApproved,
} from '@/llamalend/queries/create-loan/create-loan-approved.query'
import {
  invalidateCreateLoanBands,
  refetchCreateLoanBands,
} from '@/llamalend/queries/create-loan/create-loan-bands.query'
import {
  invalidateCreateLoanEstimateGasQueries,
  refetchCreateLoanEstimateGasQueries,
} from '@/llamalend/queries/create-loan/create-loan-estimate-gas.query'
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
import type { RouteResponse } from '@primitives/router.utils'

const invalidate = [
  invalidateCreateLoanExpectedCollateral,
  invalidateCreateLoanIsApproved,
  invalidateCreateLoanBands,
  invalidateCreateLoanHealth,
  invalidateCreateLoanMaxReceive,
  invalidateCreateLoanPriceImpact,
  invalidateCreateLoanPrices,
  invalidateCreateLoanEstimateGasQueries,
]

const refetch = [
  refetchCreateLoanExpectedCollateral,
  refetchCreateLoanIsApproved,
  refetchCreateLoanBands,
  refetchCreateLoanHealth,
  refetchCreateLoanMaxReceive,
  refetchCreateLoanPriceImpact,
  refetchCreateLoanPrices,
  refetchCreateLoanEstimateGasQueries,
]

export const invalidateOrRefetchCreateLoanRouteQueries = async (
  route: RouteResponse | undefined,
  params: CreateLoanDebtParams,
) => route && (await Promise.all((route.id == params.routeId ? refetch : invalidate).map(run => run(params))))
