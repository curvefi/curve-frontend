import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getUserHealthOptions, useUserPrices, useUserState } from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { mapQuery, q, type QueryProp, type Range } from '@ui-kit/types/util'

/**
 * Shared hook for the "prev" (before-action) loan state fields passed to LoanActionInfoList.
 * Encapsulates the identical logic across RemoveCollateral, AddCollateral, Repay, and BorrowMore.
 */
export function usePrevLoanState<ChainId extends IChainId>(
  {
    params,
    collateralToken,
    borrowToken,
    prevPrices,
  }: {
    params: UserMarketParams<ChainId>
    collateralToken: Token | undefined
    borrowToken: Token | undefined
    prevPrices?: QueryProp<Range<Decimal>>
  },
  enabled = true,
) {
  const userState = q(useUserState(params, enabled))
  const prevDebt = mapQuery(userState, ({ debt }) => debt)
  const prevCollateral = mapQuery(userState, ({ collateral }) => collateral)
  const userPrevPrices = q(useUserPrices(params, enabled && !prevPrices))
  return {
    prevDebt,
    prevCollateral,
    prevHealth: q(useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, enabled))),
    prevPrices: prevPrices ?? userPrevPrices,
    prevLoanToValue: q(
      useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          collateralToken,
          borrowToken,
          expectedBorrowed: prevDebt.data,
        },
        enabled,
      ),
    ),
    collateralSymbol: collateralToken?.symbol,
    borrowSymbol: borrowToken?.symbol,
  }
}
