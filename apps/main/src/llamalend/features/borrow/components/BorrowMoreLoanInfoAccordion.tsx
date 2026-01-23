import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanInfoAccordion, LoanLeverageExpectedCollateral } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q, type Query } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function BorrowMoreLoanInfoAccordion<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, debt },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  hasLeverage,
  health,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
  health: Query<Decimal | null>
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userState = useUserState(params, isOpen)
  const expectedCollateralQuery = q(useBorrowMoreExpectedCollateral(params, isOpen && !!hasLeverage))
  const leverageExpectedCollateral = mapQuery(
    expectedCollateralQuery,
    ({
      totalCollateral,
      collateralFromUserBorrowed,
      userCollateral,
      collateralFromDebt,
    }): LoanLeverageExpectedCollateral => {
      const base = new BigNumber(userCollateral).plus(collateralFromUserBorrowed)
      const leverage = base.isZero() ? ('0' as const) : decimal(new BigNumber(collateralFromDebt).plus(base).div(base))!
      return { totalCollateral, leverage }
    },
  )

  const collateralDelta = expectedCollateralQuery.data?.totalCollateral ?? userCollateral
  const totalDebt = useMemo(() => {
    const currentDebt = userState.data?.debt
    return debt && currentDebt ? decimal(new BigNumber(currentDebt).plus(debt).toString()) : undefined
  }, [debt, userState.data])

  const debtQuery = useMemo(
    () =>
      mapQuery(userState, (state) => {
        if (!debt || state.debt == null) return null
        const value = decimal(new BigNumber(state.debt).plus(debt))
        return value && { value, tokenSymbol: borrowToken?.symbol }
      }),
    [borrowToken?.symbol, debt, userState],
  )

  const loanToValue = useLoanToValueFromUserState(
    {
      chainId: params.chainId,
      marketId: params.marketId,
      userAddress: params.userAddress,
      collateralToken,
      borrowToken,
      collateralDelta,
      expectedBorrowed: totalDebt,
    },
    isOpen && !!totalDebt,
  )
  const prevHealth = useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))
  const leverageEnabled = !!hasLeverage
  const priceImpact = useBorrowMorePriceImpact(params, isOpen && leverageEnabled)
  const { data: isApproved } = useBorrowMoreIsApproved(params, isOpen)

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      isApproved={isApproved}
      gas={useBorrowMoreEstimateGas(networks, params, isOpen)}
      health={health}
      prevHealth={prevHealth}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(
        useMarketFutureRates(
          { chainId: params.chainId, marketId: params.marketId, debt: totalDebt },
          isOpen && !!totalDebt,
        ),
      )}
      loanToValue={loanToValue}
      debt={debtQuery}
      collateral={{
        data: collateralDelta &&
          userState.data && {
            value: decimal(new BigNumber(userState.data.collateral).plus(collateralDelta))!,
            tokenSymbol: collateralToken?.symbol,
          },
        isLoading: [userState, expectedCollateralQuery].some((q) => q.isLoading),
        error: [userState, expectedCollateralQuery].find((q) => q.error)?.error,
      }}
      userState={q(userState)}
      leverage={{
        enabled: leverageEnabled,
        expectedCollateral: leverageExpectedCollateral,
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
        ...(leverageEnabled && { priceImpact }),
      }}
    />
  )
}
