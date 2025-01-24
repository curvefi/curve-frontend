import type * as Responses from './responses'
import type * as Models from './models'

export const parseLoanDistribution = (x: Responses.GetLoanDistributionResponse): Models.LoanDistribution => ({
  stablecoin: x.stablecoin.map((x) => ({ value: x.value, label: x.label })),
  debt: x.debt.map((x) => ({ value: x.value, label: x.label })),
  collateral: x.collateral.map((x) => ({ value: x.value, label: x.label })),
})
