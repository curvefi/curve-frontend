import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUserCurrentLeverage } from '@/llamalend/queries/user-current-leverage.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function BorrowMoreLoanInfoList<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, userBorrowed, debt },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  leverageEnabled,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  leverageEnabled: boolean
}) {
  const isOpen = !!(userCollateral || userBorrowed || debt)
  const userState = useUserState(params, isOpen)
  const expectedCollateralQuery = q(useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled))

  const collateralDelta = expectedCollateralQuery.data?.totalCollateral ?? userCollateral
  const totalDebt = useMemo(
    () => debt && userState.data && decimal(new BigNumber(userState.data.debt).plus(debt).toString()),
    [debt, userState.data],
  )

  const prevHealth = useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }), isOpen)

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useBorrowMoreIsApproved(params, isOpen))}
      gas={useBorrowMoreEstimateGas(networks, params, isOpen)}
      health={q(useBorrowMoreHealth(params, isOpen && !!debt))}
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
