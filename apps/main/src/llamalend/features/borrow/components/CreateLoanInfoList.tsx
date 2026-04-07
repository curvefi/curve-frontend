import type { UseFormReturn } from 'react-hook-form'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useLeverageInfoFields } from '@/llamalend/widgets/action-card/hooks/useLeverageInfoFields'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ, mapQuery, q } from '@ui-kit/types/util'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useCreateLoanEstimateGas } from '../../../queries/create-loan/create-loan-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanHealth } from '../../../queries/create-loan/create-loan-health.query'
import { useCreateLoanPriceImpact } from '../../../queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import { LoanActionInfoList } from '../../../widgets/action-card/LoanActionInfoList'
import { useBorrowRates } from '../../../widgets/action-card/hooks/useBorrowRates'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { type CreateLoanForm, type CreateLoanFormQueryParams } from '../types'

export const CreateLoanInfoList = <ChainId extends IChainId>({
  market,
  params,
  values: { slippage, leverageEnabled, userCollateral, debt },
  collateralToken,
  borrowToken,
  networks,
  routes,
  onSlippageChange,
  form,
}: {
  market: LlamaMarketTemplate | undefined
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
  const expectedCollateral = useCreateLoanExpectedCollateral(params, isOpen)
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useCreateLoanIsApproved(params))}
      health={q(useCreateLoanHealth(params, isOpen))}
      prevHealth={constQ(null)}
      prices={q(useCreateLoanPrices(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
      loanToValue={q(useLoanToValue({ params, collateralToken, borrowToken }, isOpen))}
      prevLoanToValue={constQ('0')}
      gas={q(useCreateLoanEstimateGas(networks, params, isOpen))}
      leverageEnabled={leverageEnabled}
      prevCollateral={constQ('0')}
      debt={constQ(debt)}
      prevDebt={constQ('0')}
      {...useLeverageInfoFields({
        leverageEnabled,
        routes,
        collateralDelta: userCollateral,
        slippage,
        onSlippageChange,
        priceImpact: q(useCreateLoanPriceImpact(params, isOpen)),
        leverageValue: mapQuery(expectedCollateral, (data) => data.leverage),
        prevLeverageValue: constQ('0'),
        prevCollateral: constQ('0'),
        leverageTotalCollateral: mapQuery(expectedCollateral, (data) => data.totalCollateral),
        expected: expectedCollateral,
      })}
      {...useBorrowRates({ params, market, debtDelta: debt }, isOpen)}
    />
  )
}
