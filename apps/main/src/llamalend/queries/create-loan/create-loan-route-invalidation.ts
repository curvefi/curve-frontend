import type { CreateLoanDebtParams } from '@/llamalend/features/borrow/types'
import { invalidateCreateLoanEstimateGasQuery } from '@/llamalend/queries/create-loan/create-loan-approve-estimate-gas.query'
import { invalidateCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanBands } from '@/llamalend/queries/create-loan/create-loan-bands.query'
import { invalidateCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { invalidateCreateLoanHealth } from '@/llamalend/queries/create-loan/create-loan-health.query'
import { invalidateCreateLoanMaxReceive } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { invalidateCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { invalidateCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'

export const invalidateCreateLoanRouteQueries = async (params: CreateLoanDebtParams) => {
  await Promise.all([
    invalidateCreateLoanExpectedCollateral(params),
    invalidateCreateLoanIsApproved(params),
    invalidateCreateLoanBands(params),
    invalidateCreateLoanHealth(params),
    invalidateCreateLoanMaxReceive(params),
    invalidateCreateLoanPriceImpact(params),
    invalidateCreateLoanPrices(params),
    invalidateCreateLoanEstimateGasQuery(params),
  ])
}
