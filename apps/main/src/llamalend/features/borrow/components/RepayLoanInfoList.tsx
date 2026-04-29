import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { calculateReturnToWallet } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayFutureLeverage } from '@/llamalend/queries/repay/repay-future-leverage.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
import type { RepayFormData, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { useBorrowRates } from '@/llamalend/widgets/action-card/hooks/useBorrowRates'
import { useLeverageInfoFields } from '@/llamalend/widgets/action-card/hooks/useLeverageInfoFields'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { constQ, mapQuery, q, type Query, type QueryProp, type Range } from '@ui-kit/types/util'
import { decimal, decimalMinus, decimalNegate } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

const remainingDebt = (debt: Decimal, repayAmount: Decimal) => {
  const remaining = new BigNumber(debt).minus(repayAmount)
  return decimal(remaining.isNegative() ? 0 : remaining)!
}

function useRepayRemainingDebt(
  {
    params,
    swapRequired,
    prevDebt,
  }: {
    params: RepayParams
    swapRequired: boolean
    prevDebt: Query<Decimal | null>
  },
  { isFull, userBorrowed }: Pick<RepayFormData, 'userBorrowed' | 'isFull'>,
  enabled: boolean,
) {
  const expectedBorrowedQuery = useRepayExpectedBorrowed(params, enabled)
  const prev = prevDebt.data
  const debt: QueryProp<Decimal | null> = isFull
    ? constQ('0')
    : swapRequired
      ? {
          data: prev && expectedBorrowedQuery.data && remainingDebt(prev, expectedBorrowedQuery.data.totalBorrowed),
          ...combineQueryState(prevDebt, expectedBorrowedQuery),
        }
      : mapQuery(prevDebt, () => prev && remainingDebt(prev, userBorrowed ?? '0'))
  return { debt, debtDelta: debt.data && prev && decimalMinus(debt.data, prev) }
}

function useReturnToWallet(
  {
    params,
    collateralSymbol,
    borrowedSymbol,
  }: { params: RepayParams; collateralSymbol: string; borrowedSymbol: string },
  enabled: boolean,
) {
  const userState = useUserState(params, enabled)
  const userBorrowed = useRepayExpectedBorrowed(params, enabled)
  const data = useMemo(
    () =>
      calculateReturnToWallet({
        totalBorrowed: userBorrowed.data?.totalBorrowed,
        userState: userState.data,
        stateCollateralDelta: params.stateCollateral ?? undefined,
        collateralSymbol,
        borrowedSymbol,
      }),
    [collateralSymbol, params.stateCollateral, borrowedSymbol, userState.data, userBorrowed.data],
  )
  return enabled ? { data, ...combineQueryState(userBorrowed, userState) } : undefined
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
}: {
  market: LlamaMarketTemplate | undefined
  params: RepayParams
  values: RepayFormData
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  swapRequired: boolean
  routes: MarketRoutes | undefined
  form: UseFormReturn<RepayFormData>
  prices?: QueryProp<Range<Decimal> | null>
  prevPrices?: QueryProp<Range<Decimal>>
}) {
  const isOpen = isFormTouched(form, 'stateCollateral', 'userCollateral', 'userBorrowed')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken, prevPrices }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState
  const { debt, debtDelta } = useRepayRemainingDebt(
    { params, swapRequired, prevDebt },
    { isFull, userBorrowed },
    isOpen,
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useRepayIsApproved(params, isOpen))}
      gas={q(useRepayEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries(isHealthFull => getRepayHealthOptions({ ...params, isHealthFull }, isOpen)))}
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
            collateralDelta: userCollateral && decimalNegate(userCollateral),
            expectedBorrowed: debt?.data,
          },
          isOpen,
        ),
      )}
      returnToWallet={useReturnToWallet(
        {
          params,
          collateralSymbol: collateralToken?.symbol ?? '',
          borrowedSymbol: borrowToken?.symbol ?? '',
        },
        isOpen && isFull,
      )}
      {...useLeverageInfoFields({
        leverageEnabled: swapRequired, // in llamalend.js we need to use the leverage implementations to do any swap
        leverageValue: useRepayFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen && !!hasLeverage),
        prevCollateral,
        leverageTotalCollateral: mapQuery(prevCollateral, prev =>
          isFull ? decimal(0) : decimal(new BigNumber(prev).minus(stateCollateral ?? '0')),
        ),
        expected: useRepayExpectedBorrowed(params, isOpen),
        routes,
        // routeImage: useRepayRouteImage(params, isOpen),
        slippage,
        onSlippageChange,
        priceImpact: useRepayPriceImpact(params, isOpen),
        collateralDelta: userCollateral,
      })}
      {...useBorrowRates({ params, market, debtDelta }, isOpen)}
      {...prevLoanState}
    />
  )
}
