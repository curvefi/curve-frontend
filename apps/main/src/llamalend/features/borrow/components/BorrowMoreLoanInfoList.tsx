import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreFutureLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import { type BorrowMoreForm, type BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { useBorrowRates } from '@/llamalend/widgets/action-card/useBorrowRates'
import { useLeverageInfoFields } from '@/llamalend/widgets/action-card/useLeverageInfoFields'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/usePrevLoanState'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export function BorrowMoreLoanInfoList<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, debt },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  leverageEnabled,
  form,
  market,
  routes,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  market: LlamaMarketTemplate | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  leverageEnabled: boolean | undefined
  form: UseFormReturn<BorrowMoreForm>
  routes: MarketRoutes | undefined
}) {
  const isOpen = isFormTouched(form, 'userCollateral', 'userBorrowed', 'debt')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState

  const expectedCollateralQuery = useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled)
  const totalCollateral = expectedCollateralQuery.data?.totalCollateral
  const collateralDelta = leverageEnabled ? totalCollateral : userCollateral
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useBorrowMoreIsApproved(params, isOpen))}
      gas={q(useBorrowMoreEstimateGas(networks, params, isOpen))}
      health={q(useBorrowMoreHealth(params, isOpen && !!debt))}
      prices={q(useBorrowMorePrices(params, isOpen))}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta,
            expectedBorrowed: prevDebt.data && decimalSum(prevDebt.data, debt),
          },
          isOpen,
        ),
      )}
      debt={mapQuery(prevDebt, (stateDebt) => decimalSum(stateDebt, debt))}
      {...useLeverageInfoFields({
        leverageEnabled,
        leverageValue: useBorrowMoreFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen),
        prevCollateral,
        leverageTotalCollateral: {
          data: totalCollateral && prevCollateral.data && decimalSum(prevCollateral.data, totalCollateral),
          ...combineQueryState(prevCollateral, expectedCollateralQuery),
        },
        expected: expectedCollateralQuery,
        routes,
        slippage,
        onSlippageChange,
        priceImpact: useBorrowMorePriceImpact(params, isOpen),
        collateralDelta,
      })}
      {...useBorrowRates({ params, market, debtDelta: debt }, isOpen)}
      {...prevLoanState}
    />
  )
}
