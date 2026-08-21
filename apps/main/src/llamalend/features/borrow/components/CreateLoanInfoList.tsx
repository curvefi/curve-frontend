import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UseFormReturn } from '@evm-ui/features/forms'
import type { MarketType } from '@evm-ui/types/market'
import { constQ, mapQuery, q, type QueryProp } from '@evm-ui/types/util'
import type { PriceImpact } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import { type Address, type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
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
  values: { slippage, leverageEnabled, userCollateral, debt },
  collateralToken,
  borrowToken,
  networks,
  form,
  priceImpact,
}: {
  marketType: MarketType
  controllerAddress: Address | undefined
  params: CreateLoanFormQueryParams<ChainId>
  values: CreateLoanForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  form: UseFormReturn<CreateLoanForm>
  priceImpact: QueryProp<PriceImpact | Decimal | null>
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
      gas={q(useCreateLoanEstimateGas(networks, params, isOpen))}
      leverageEnabled={leverageEnabled}
      prevCollateral={constQ('0')}
      debt={constQ(debt)}
      prevDebt={constQ('0')}
      {...getLeverageInfoFields({
        leverageEnabled,
        collateralDelta: userCollateral,
        slippage,
        priceImpact,
        leverageValue: mapQuery(expectedCollateral, data => data.leverage),
        prevLeverageValue: constQ('0'),
        prevCollateral: constQ('0'),
        leverageTotalCollateral: mapQuery(expectedCollateral, data => data.totalCollateral),
        expected: expectedCollateral,
      })}
      {...useBorrowRates({ params, marketType, controllerAddress, debtDelta: debt }, isOpen)}
    />
  )
}
