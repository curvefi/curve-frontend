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
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user-current-leverage.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/action-card/LoanInfoAccordion'
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
  leverageEnabled,
  health,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  leverageEnabled: boolean
  health: Query<Decimal | null>
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userState = useUserState(params, isOpen)
  const expectedCollateralQuery = q(useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled))

  const collateralDelta = expectedCollateralQuery.data?.totalCollateral ?? userCollateral
  const totalDebt = useMemo(
    () => debt && userState.data && decimal(new BigNumber(userState.data.debt).plus(debt).toString()),
    [debt, userState.data],
  )

  const prevHealth = useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      isApproved={q(useBorrowMoreIsApproved(params, isOpen))}
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
      loanToValue={useLoanToValueFromUserState(
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
      )}
      debt={mapQuery(
        userState,
        ({ debt: stateDebt }) =>
          debt && { value: decimal(new BigNumber(stateDebt).plus(debt))!, tokenSymbol: borrowToken?.symbol },
      )}
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
      leverageEnabled={leverageEnabled}
      leverageValue={mapQuery(
        expectedCollateralQuery,
        // todo: this might not be correct, use the llamalend-js calculation that's being implemented
        ({ collateralFromDebt, collateralFromUserBorrowed, userCollateral }) => {
          const base = new BigNumber(userCollateral).plus(collateralFromUserBorrowed)
          return decimal(base.isZero() ? 0 : new BigNumber(collateralFromDebt).plus(base).div(base))
        },
      )}
      prevLeverageValue={q(useUserCurrentLeverage(params, isOpen))}
      leverageTotalCollateral={mapQuery(expectedCollateralQuery, (d) => d.totalCollateral)}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      collateralSymbol={collateralToken?.symbol}
      priceImpact={useBorrowMorePriceImpact(params, isOpen && leverageEnabled)}
    />
  )
}
