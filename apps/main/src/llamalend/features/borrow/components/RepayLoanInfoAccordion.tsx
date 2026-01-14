import { BigNumber } from 'bignumber.js'
import { useNetBorrowApr } from '@/llamalend/features/borrow/hooks/useNetBorrowApr'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayBands } from '@/llamalend/queries/repay/repay-bands.query'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { useRepayHealth } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { q } from '@ui-kit/types/util'
import { Decimal, decimal } from '@ui-kit/utils'

const remainingDebt = (debt: Decimal, repayAmount: Decimal, stateBorrowed: Decimal) => {
  const repayTotal = new BigNumber(repayAmount).plus(stateBorrowed)
  const remaining = new BigNumber(debt).minus(repayTotal)
  return decimal(remaining.isNegative() ? 0 : remaining)!
}

const getNetBorrowApr = (borrowApr?: Decimal, rebasingYield?: number | null) =>
  borrowApr != null ? decimal(new BigNumber(borrowApr).minus(rebasingYield ?? 0)) : undefined

export function RepayLoanInfoAccordion<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, stateCollateral, userBorrowed, isFull },
  collateralToken,
  borrowToken,
  networks,
  onSlippageChange,
  hasLeverage,
  market,
}: {
  params: RepayParams<ChainId>
  values: RepayForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  market: LendMarketTemplate | MintMarketTemplate | undefined
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userStateQuery = useUserState(params, isOpen)
  const userState = q(userStateQuery)
  const swapRequired = +(stateCollateral ?? 0) > 0 || +(userCollateral ?? 0) > 0
  const expectedBorrowedQuery = useRepayExpectedBorrowed(params, isOpen && swapRequired)
  const borrowed = swapRequired ? expectedBorrowedQuery.data?.totalBorrowed : userBorrowed
  const debt = {
    data: isFull
      ? { value: '0' as const, tokenSymbol: borrowToken?.symbol }
      : userStateQuery.data &&
        borrowed && {
          value: remainingDebt(userStateQuery.data.debt, borrowed, userStateQuery.data.stablecoin),
          tokenSymbol: borrowToken?.symbol,
        },
    ...combineQueriesMeta([userStateQuery, ...(swapRequired ? [expectedBorrowedQuery] : [])]),
  }
  const { marketRates, marketFutureRates, netBorrowApr, prevNetBorrowApr } = useNetBorrowApr(
    market,
    networks,
    params,
    isOpen,
  )
  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      bands={q(useRepayBands(params, isOpen))}
      gas={useRepayEstimateGas(networks, params, isOpen)}
      health={q(useRepayHealth(params, isOpen))}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))}
      isFullRepay={isFull}
      prevRates={marketRates}
      rates={marketFutureRates}
      netBorrowApr={netBorrowApr}
      prevNetBorrowApr={prevNetBorrowApr}
      debt={debt}
      withdraw={stateCollateral && { value: stateCollateral, tokenSymbol: collateralToken?.symbol }}
      userState={userState}
      prices={q(useRepayPrices(params, isOpen))}
      // routeImage={q(useRepayRouteImage(params, isOpen))}
      loanToValue={useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          collateralToken,
          borrowToken,
          collateralDelta: userCollateral && `${-+userCollateral}`,
        },
        isOpen,
      )}
      leverage={{
        enabled: !!hasLeverage,
        priceImpact: useRepayPriceImpact(params, isOpen),
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      }}
    />
  )
}
