import { BigNumber } from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserPnl } from '@/llamalend/queries/user-pnl.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { mapQuery, q, type Query } from '@ui-kit/types/util'
import { Decimal, decimal } from '@ui-kit/utils'

const remainingDebt = (debt: Decimal, repayAmount: Decimal, stateBorrowed: Decimal) => {
  const repayTotal = new BigNumber(repayAmount).plus(stateBorrowed)
  const remaining = new BigNumber(debt).minus(repayTotal)
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
      ? mapQuery(expectedBorrowedQuery, (d) => ({ value: d.totalBorrowed, tokenSymbol }))
      : {
          data: userStateQuery.data && {
            value: remainingDebt(userStateQuery.data.debt, userBorrowed ?? '0', userStateQuery.data.stablecoin),
            tokenSymbol,
          },
          ...combineQueriesMeta([userStateQuery, ...(swapRequired ? [expectedBorrowedQuery] : [])]),
        }
}

export function RepayLoanInfoAccordion<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, userBorrowed, isFull },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  hasLeverage,
  swapRequired,
}: {
  params: RepayParams<ChainId>
  values: RepayForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  swapRequired: boolean
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userStateQuery = useUserState(params, isOpen)
  const userState = q(userStateQuery)
  const priceImpact = useRepayPriceImpact(params, isOpen && swapRequired)
  const debt = useRepayRemainingDebt({ params, swapRequired, borrowToken }, { isFull, userBorrowed }, isOpen)
  const pnlQuery = useUserPnl({ ...params, loanExists: true, hasV2Leverage: swapRequired }, isOpen)
  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      isApproved={q(useRepayIsApproved(params, isOpen && typeof isFull === 'boolean'))}
      gas={useRepayEstimateGas(networks, params, isOpen)}
      health={useHealthQueries((isFull) => getRepayHealthOptions({ ...params, isFull }))}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))}
      isFullRepay={isFull}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(useMarketFutureRates(params, isOpen))}
      debt={debt}
      userState={userState}
      prices={q(useRepayPrices(params, isOpen))}
      pnl={mapQuery(pnlQuery, (data) => data.currentProfit)}
      // routeImage={q(useRepayRouteImage(params, isOpen))}
      loanToValue={useLoanToValueFromUserState(
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
      )}
      collateralSymbol={collateralToken?.symbol}
      leverageEnabled={hasLeverage}
      {...(hasLeverage &&
        swapRequired && {
          slippage,
          onSlippageChange,
          priceImpact,
        })}
    />
  )
}
