import { getCollateralValue, getLoanToValue } from '@/llamalend/equity-leverage.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybes } from '@primitives/objects.utils'
import { decimalSum } from '@ui/lib/decimal'

type Params<ChainId extends IChainId> = {
  chainId: ChainId | Nullish
  marketId: string | Nullish
  userAddress: Address | Nullish
  /**
   * Net change applied to on-chain collateral (positive = adding, negative = removing).
   * TODO: use expectedCollateral from llamalend-js, currently being implemented by @0xPearce
   * */
  collateralDelta?: Decimal | null
  /** Expected new borrowed amount after the loan is updated. */
  expectedBorrowed: Decimal | Nullish
  /** Borrowed tokens left in the AMM after the loan is updated, the current ones when not given. */
  expectedStablecoin?: Decimal
}

/**
 * Computes current Loan-to-Value (LTV) ratio from the user's on-chain state, at the oracle price.
 *
 * It uses the generic userState query so it can be reused across
 * add-collateral, remove-collateral and repay flows.
 */
export const useLoanToValueFromUserState = <ChainId extends IChainId>(
  { chainId, marketId, userAddress, collateralDelta, expectedBorrowed, expectedStablecoin }: Params<ChainId>,
  enabled = true,
) => {
  enabled &&= !!expectedBorrowed
  const {
    data: userState,
    isLoading: isUserLoading,
    error: userError,
  } = useUserState({ chainId, marketId, userAddress }, enabled)
  const {
    data: oraclePrice,
    isLoading: isOraclePriceLoading,
    error: oraclePriceError,
  } = useMarketOraclePrice({ chainId, marketId }, enabled)

  return {
    data:
      maybes([expectedBorrowed, userState, oraclePrice], (debt, { collateral, stablecoin }, oraclePrice) =>
        getLoanToValue(
          debt,
          getCollateralValue(
            {
              collateral: decimalSum(collateral, collateralDelta ?? undefined),
              stablecoin: expectedStablecoin ?? stablecoin,
            },
            oraclePrice,
          ),
        ),
      ) ?? null,
    isLoading: enabled && (isUserLoading || isOraclePriceLoading),
    error: userError ?? oraclePriceError,
  }
}
