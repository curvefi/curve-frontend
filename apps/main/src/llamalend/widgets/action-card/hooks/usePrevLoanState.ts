import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getUserHealthOptions } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Token } from '@primitives/address.utils'
import { mapQuery, q } from '@ui/features/queries/util'

/**
 * Shared hook for the "prev" (before-action) loan state fields passed to LoanActionInfoList.
 * Encapsulates the identical logic across RemoveCollateral, AddCollateral, Repay, and BorrowMore.
 */
export function usePrevLoanState<ChainId extends IChainId>(
  {
    params,
    collateralToken,
    borrowToken,
  }: { params: UserMarketParams<ChainId>; collateralToken: Token | undefined; borrowToken: Token | undefined },
  enabled = true,
) {
  const userState = q(useUserState(params, enabled))
  const prevDebt = mapQuery(userState, ({ debt }) => debt)
  const prevCollateral = mapQuery(userState, ({ collateral }) => collateral)
  return {
    prevDebt,
    prevCollateral,
    prevHealth: q(useHealthQueries(isFull => getUserHealthOptions({ ...params, isFull }, enabled))),
    prevPrices: q(useUserPrices(params, enabled)),
    prevLoanToValue: q(
      useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          expectedBorrowed: prevDebt.data,
        },
        enabled,
      ),
    ),
    collateralSymbol: collateralToken?.symbol,
    borrowSymbol: borrowToken?.symbol,
  }
}
