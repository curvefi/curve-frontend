import type { UseFormReturn } from 'react-hook-form'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useCreateLoanEstimateGas } from '../../../queries/create-loan/create-loan-approve-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanHealth } from '../../../queries/create-loan/create-loan-health.query'
import { useCreateLoanPriceImpact } from '../../../queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import { useMarketFutureRates } from '../../../queries/market-future-rates.query'
import { LoanActionInfoList } from '../../../widgets/action-card/LoanActionInfoList'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { type CreateLoanForm, type CreateLoanFormQueryParams, type Token } from '../types'

export const CreateLoanInfoList = <ChainId extends IChainId>({
  params,
  values: { slippage, leverageEnabled },
  collateralToken,
  borrowToken,
  networks,
  routes,
  onSlippageChange,
  form,
}: {
  params: CreateLoanFormQueryParams<ChainId>
  values: CreateLoanForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  routes: MarketRoutes | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  form: UseFormReturn<CreateLoanForm>
}) => {
  const isOpen = isFormTouched(form, 'userCollateral', 'debt')
  const expectedCollateral = q(useCreateLoanExpectedCollateral(params, isOpen))
  const leverageValue = mapQuery(expectedCollateral, (data) => data?.leverage)
  const leverageTotalCollateral = mapQuery(expectedCollateral, (data) => data?.totalCollateral)
  const priceImpact = q(useCreateLoanPriceImpact(params, isOpen))

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useCreateLoanIsApproved(params))}
      health={q(useCreateLoanHealth(params, isOpen))}
      prices={q(useCreateLoanPrices(params, isOpen))}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(useMarketFutureRates(params, isOpen))}
      loanToValue={useLoanToValue(
        {
          params,
          collateralToken,
          borrowToken,
        },
        isOpen,
      )}
      gas={useCreateLoanEstimateGas(networks, params, isOpen)}
      leverageEnabled={leverageEnabled}
      {...(leverageEnabled && {
        routes,
        leverageValue,
        leverageTotalCollateral,
        priceImpact,
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      })}
    />
  )
}
