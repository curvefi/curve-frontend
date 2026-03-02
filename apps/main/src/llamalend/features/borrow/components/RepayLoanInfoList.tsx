import { BigNumber } from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketFutureRates, useMarketRates } from '@/llamalend/queries/market'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getUserHealthOptions, useUserState } from '@/llamalend/queries/user'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { mapQuery, q, type Query } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
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
  return isFull && userBorrowed // when userBorrowed isn't set, the isFull query is disabled
    ? { data: { value: '0', tokenSymbol }, isLoading: false, error: null }
    : swapRequired
      ? mapQuery(expectedBorrowedQuery, (d) => ({ value: d.totalBorrowed, tokenSymbol }))
      : {
          data: userStateQuery.data && {
            value: remainingDebt(userStateQuery.data.debt, userBorrowed ?? '0'),
            tokenSymbol,
          },
          ...combineQueriesMeta([userStateQuery, ...(swapRequired ? [expectedBorrowedQuery] : [])]),
        }
}

export function RepayLoanInfoList<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, userBorrowed, isFull },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  hasLeverage,
  swapRequired,
  routes,
  form,
}: {
  params: RepayParams<ChainId>
  values: RepayForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  swapRequired: boolean
  routes: MarketRoutes | undefined
  form: UseFormReturn<RepayForm>
}) {
  const isOpen = isFormTouched(form, 'stateCollateral', 'userCollateral', 'userBorrowed')
  const userState = useUserState(params, isOpen)
  const priceImpact = useRepayPriceImpact(params, isOpen && swapRequired)
  const debt = useRepayRemainingDebt({ params, swapRequired, borrowToken }, { isFull, userBorrowed }, isOpen)
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useRepayIsApproved(params, isOpen))}
      gas={q(useRepayEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getRepayHealthOptions({ ...params, isFull }, isOpen)))}
      prevHealth={q(useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, isOpen)))}
      isFullRepay={isFull}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(useMarketFutureRates(params, isOpen))}
      debt={q(debt)}
      userState={q(userState)}
      prices={q(useRepayPrices(params, isOpen))}
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
      collateralSymbol={collateralToken?.symbol}
      leverageEnabled={hasLeverage}
      routes={routes}
      {...(hasLeverage &&
        swapRequired && {
          leverageEnabled: true,
          slippage,
          onSlippageChange,
          priceImpact: q(priceImpact),
        })}
    />
  )
}
