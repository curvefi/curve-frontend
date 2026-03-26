import { BigNumber } from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayFutureLeverage } from '@/llamalend/queries/repay/repay-future-leverage.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { useBorrowRates } from '@/llamalend/widgets/action-card/useBorrowRates'
import { useLeverageInfoFields } from '@/llamalend/widgets/action-card/useLeverageInfoFields'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/usePrevLoanState'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { constQ, mapQuery, q, type Query, type QueryProp, type Range } from '@ui-kit/types/util'
import { decimal, decimalMinus } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

const remainingDebt = (debt: Decimal, repayAmount: Decimal) => {
  const remaining = new BigNumber(debt).minus(repayAmount)
  return decimal(remaining.isNegative() ? 0 : remaining)!
}

function useRepayRemainingDebt<ChainId extends IChainId>(
  {
    params,
    leverageEnabled,
    prevDebt,
  }: {
    params: RepayParams<ChainId>
    leverageEnabled: boolean
    prevDebt: Query<Decimal | null>
  },
  { isFull, userBorrowed }: Pick<RepayForm, 'userBorrowed' | 'isFull'>,
  enabled: boolean,
) {
  const expectedBorrowedQuery = useRepayExpectedBorrowed(params, enabled && leverageEnabled)
  const prev = prevDebt.data
  const debt: QueryProp<Decimal | null> = isFull
    ? constQ('0')
    : leverageEnabled
      ? {
          data: prev && expectedBorrowedQuery.data && remainingDebt(prev, expectedBorrowedQuery.data.totalBorrowed),
          ...combineQueryState(prevDebt, expectedBorrowedQuery),
        }
      : mapQuery(prevDebt, () => prev && remainingDebt(prev, userBorrowed ?? '0'))
  return { debt, debtDelta: debt.data && prev && decimalMinus(debt.data, prev) }
}

export function RepayLoanInfoList<ChainId extends IChainId>({
  market,
  params,
  values: { slippage, stateCollateral, userCollateral, userBorrowed, isFull },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  hasLeverage,
  leverageEnabled,
  routes,
  form,
  prices,
  prevPrices,
}: {
  market: LlamaMarketTemplate | undefined
  params: RepayParams<ChainId>
  values: RepayForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  leverageEnabled: boolean
  routes: MarketRoutes | undefined
  form: UseFormReturn<RepayForm>
  prices?: QueryProp<Range<Decimal>>
  prevPrices?: QueryProp<Range<Decimal>>
}) {
  const isOpen = isFormTouched(form, 'stateCollateral', 'userCollateral', 'userBorrowed')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken, prevPrices }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState
  const { debt, debtDelta } = useRepayRemainingDebt(
    { params, leverageEnabled, prevDebt },
    { isFull, userBorrowed },
    isOpen,
  )
  const leverageValue = useRepayFutureLeverage(params, isOpen && leverageEnabled && !isFull)
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useRepayIsApproved(params, isOpen))}
      gas={q(useRepayEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getRepayHealthOptions({ ...params, isFull }, isOpen)))}
      prices={prices}
      isFullRepay={isFull}
      debt={q(debt)}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta: userCollateral && `${-+userCollateral}`,
            expectedBorrowed: debt?.data,
          },
          isOpen,
        ),
      )}
      {...useLeverageInfoFields({
        leverageEnabled,
        leverageValue: isFull ? constQ('1') : leverageValue,
        prevLeverageValue: useUserCurrentLeverage(params, isOpen && !!hasLeverage),
        prevCollateral,
        leverageTotalCollateral: mapQuery(prevCollateral, (prev) =>
          isFull ? decimal(0) : decimal(new BigNumber(prev).minus(stateCollateral ?? '0')),
        ),
        expected: useRepayExpectedBorrowed(params, isOpen && leverageEnabled),
        routes,
        // routeImage: useRepayRouteImage(params, isOpen),
        slippage,
        onSlippageChange,
        priceImpact: useRepayPriceImpact(params, isOpen && leverageEnabled),
        collateralDelta: userCollateral,
      })}
      {...useBorrowRates({ params, market, debtDelta }, isOpen)}
      {...prevLoanState}
    />
  )
}
