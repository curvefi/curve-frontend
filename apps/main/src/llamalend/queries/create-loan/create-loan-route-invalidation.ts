import type { CreateLoanDebtParams } from '@/llamalend/features/borrow/types'
import { invalidateCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanBands } from '@/llamalend/queries/create-loan/create-loan-bands.query'
import { invalidateCreateLoanEstimateGasQueries } from '@/llamalend/queries/create-loan/create-loan-estimate-gas.query'
import { invalidateCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { invalidateCreateLoanHealth } from '@/llamalend/queries/create-loan/create-loan-health.query'
import { invalidateCreateLoanMaxReceive } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { invalidateCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { invalidateCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import type { RouteResponse } from '@primitives/router.utils'

export const invalidateOrRefetchCreateLoanRouteQueries = async (
  route: RouteResponse | undefined,
  params: CreateLoanDebtParams,
) =>
  route &&
  (await Promise.all([
    invalidateCreateLoanExpectedCollateral(params),
    invalidateCreateLoanIsApproved(params),
    invalidateCreateLoanBands(params),
    invalidateCreateLoanHealth(params),
    invalidateCreateLoanMaxReceive(params),
    invalidateCreateLoanPriceImpact(params),
    invalidateCreateLoanPrices(params),
    invalidateCreateLoanEstimateGasQueries(params),
  ]))
