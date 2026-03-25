import { BigNumber } from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { isLeveragedPosition } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayFutureLeverage } from '@/llamalend/queries/repay/repay-future-leverage.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { useBorrowRates } from '@/llamalend/widgets/action-card/useBorrowRates'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/usePrevLoanState'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q, type Query, type QueryProp, Range } from '@ui-kit/types/util'
import { decimal, decimalMinus } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

const remainingDebt = (debt: Decimal, repayAmount: Decimal) => {
  const remaining = new BigNumber(debt).minus(repayAmount)
  return decimal(remaining.isNegative() ? 0 : remaining)!
}

function useRepayRemainingDebt<ChainId extends IChainId>(
  {
    params,
    borrowToken,
    swapRequired,
  }: {
    params: RepayParams<ChainId>
    swapRequired: boolean
    borrowToken: Token | undefined
  },
  { isFull, userBorrowed }: Pick<RepayForm, 'userBorrowed' | 'isFull'>,
  enabled: boolean,
): Query<{ value: Decimal; tokenSymbol: string | undefined } | null> {
  const userStateQuery = useUserState(params, enabled)
  const expectedBorrowedQuery = useRepayExpectedBorrowed(params, enabled && swapRequired)
  const tokenSymbol = borrowToken?.symbol
  return isFull
    ? { data: { value: '0', tokenSymbol }, isLoading: false, error: null }
    : swapRequired
      ? {
          data: userStateQuery.data &&
            expectedBorrowedQuery.data && {
              value: remainingDebt(userStateQuery.data.debt, expectedBorrowedQuery.data.totalBorrowed),
              tokenSymbol,
            },
          ...combineQueryState(userStateQuery, expectedBorrowedQuery),
        }
      : {
          data: userStateQuery.data && {
            value: remainingDebt(userStateQuery.data.debt, userBorrowed ?? '0'),
            tokenSymbol,
          },
          ...combineQueryState(userStateQuery, ...(swapRequired ? [expectedBorrowedQuery] : [])),
        }
}

export function RepayLoanInfoList<ChainId extends IChainId>({
  market,
  params,
  values: { slippage, stateCollateral, userCollateral, userBorrowed, isFull },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  hasLeverage,
  swapRequired,
  routes,
  form,
  prices,
  prevPrices,
  showFuturePrices = true,
}: {
  market: LlamaMarketTemplate | undefined
  params: RepayParams<ChainId>
  values: RepayForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  swapRequired: boolean
  routes: MarketRoutes | undefined
  form: UseFormReturn<RepayForm>
  prices?: QueryProp<Range<Decimal>>
  prevPrices?: QueryProp<Range<Decimal>>
  showFuturePrices?: boolean
}) {
  const isOpen = isFormTouched(form, 'stateCollateral', 'userCollateral', 'userBorrowed')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken, prevPrices }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState

  const priceImpact = useRepayPriceImpact(params, isOpen && swapRequired)
  const expectedBorrowed = useRepayExpectedBorrowed(params, isOpen && swapRequired)
  const debt = useRepayRemainingDebt({ params, swapRequired, borrowToken }, { isFull, userBorrowed }, isOpen)
  const prevLeverageValue = useUserCurrentLeverage(params, isOpen && !!hasLeverage)
  const leverageEnabled = isLeveragedPosition(prevLeverageValue.data)
  const futureLeverageQuery = useRepayFutureLeverage(params, isOpen && leverageEnabled && !isFull)

  const leverageValue = isFull ? { data: decimal(0), isLoading: false, error: null } : futureLeverageQuery
  const leverageTotalCollateral = {
    data: isFull
      ? decimal(0)
      : prevCollateral.data && decimal(new BigNumber(prevCollateral.data).minus(stateCollateral ?? '0')),
    ...combineQueryState(prevCollateral, leverageValue),
  }

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useRepayIsApproved(params, isOpen))}
      gas={q(useRepayEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getRepayHealthOptions({ ...params, isFull }, isOpen)))}
      prices={showFuturePrices ? prices : undefined}
      isFullRepay={isFull}
      debt={q(debt)}
      // routeImage={q(useRepayRouteImage(params, isOpen))}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta: userCollateral && `${-+userCollateral}`,
            expectedBorrowed: debt?.data?.value,
          },
          isOpen,
        ),
      )}
      routes={routes}
      {...(leverageEnabled
        ? {
            leverageEnabled,
            prevLeverageValue: q(prevLeverageValue),
            leverageValue: q(leverageValue),
            prevLeverageCollateral: {
              data: calculateLeverageCollateral(prevCollateral.data, prevLeverageValue.data),
              ...combineQueryState(prevCollateral, prevLeverageValue),
            },
            leverageCollateral: {
              data: calculateLeverageCollateral(leverageTotalCollateral.data, leverageValue.data),
              ...combineQueryState(leverageTotalCollateral, leverageValue),
            },
            prevLeverageTotalCollateral: {
              data: prevCollateral.data,
              ...combineQueryState(prevCollateral, prevLeverageValue),
            },
            leverageTotalCollateral,
          }
        : { prevCollateral })}
      {...(swapRequired && {
        exchangeRate: mapQuery(expectedBorrowed, (data) => data?.avgPrice ?? null),
        slippage,
        onSlippageChange,
        priceImpact: q(priceImpact),
      })}
      {...useBorrowRates({ params, market, futureDebt: decimalMinus(debt.data?.value, prevDebt.data) }, isOpen)}
      {...prevLoanState}
    />
  )
}
