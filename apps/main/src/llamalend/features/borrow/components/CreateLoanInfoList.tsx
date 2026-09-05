import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { MarketType } from '@evm-ui/types/market'
import { type Address, type Token } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { constQ, mapQuery, q } from '@ui/features/queries/util'
import { useCreateLoanEstimateGas } from '../../../queries/create-loan/create-loan-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanHealth } from '../../../queries/create-loan/create-loan-health.query'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import { getLeverageInfoFields } from '../../../widgets/action-card/hooks/getLeverageInfoFields'
import { useBorrowRates } from '../../../widgets/action-card/hooks/useBorrowRates'
import { LoanActionInfoList } from '../../../widgets/action-card/LoanActionInfoList'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { type CreateLoanForm, type CreateLoanFormQueryParams } from '../types'

export const CreateLoanInfoList = <ChainId extends IChainId>({
  marketType,
  controllerAddress,
  params,
  values: { leverageEnabled, userCollateral, debt },
  collateralToken,
  borrowToken,
  form,
}: {
  marketType: MarketType
  controllerAddress: Address | undefined
  params: CreateLoanFormQueryParams<ChainId>
  values: CreateLoanForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  form: UseFormReturn<CreateLoanForm>
}) => {
  const isOpen = form.isTouched('userCollateral', 'debt')
  const expectedCollateral = useCreateLoanExpectedCollateral(params, isOpen)
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useCreateLoanIsApproved(params))}
      health={q(useCreateLoanHealth(params, isOpen))}
      prices={q(useCreateLoanPrices(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
      loanToValue={q(useLoanToValue({ params, collateralToken, borrowToken }, isOpen))}
      prevLoanToValue={constQ('0')}
      oraclePrice={q(useMarketOraclePrice(params, isOpen))}
      gas={q(useCreateLoanEstimateGas(params, isOpen))}
      leverageEnabled={leverageEnabled}
      prevCollateral={constQ('0')}
      debt={constQ(debt)}
      prevDebt={constQ('0')}
      {...getLeverageInfoFields({
        leverageEnabled,
        collateralDelta: userCollateral,
        leverageValue: mapQuery(expectedCollateral, data => data.leverage),
        prevLeverageValue: constQ('0'),
        prevCollateral: constQ('0'),
        leverageTotalCollateral: mapQuery(expectedCollateral, data => data.totalCollateral),
      })}
      {...useBorrowRates({ params, marketType, controllerAddress, debtDelta: debt }, isOpen)}
    />
  )
}
