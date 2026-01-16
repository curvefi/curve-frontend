import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { Decimal } from '@ui-kit/utils'
import type { Token } from '../../borrow/types'

type Params<ChainId extends IChainId> = {
  chainId: ChainId | null | undefined
  marketId: string | null | undefined
  userAddress: Address | null | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  /**
   * Net change applied to on-chain collateral (positive = adding, negative = removing).
   * TODO: use expectedCollateral from llamalend-js, currently being implemented by @0xPearce
   * */
  collateralDelta?: Decimal | null
  /** Expected new borrowed amount after the loan is updated. */
  expectedBorrowed?: Decimal | null
}

/**
 * Computes current Loan-to-Value (LTV) ratio from the user's on-chain state:
 * LTV = (debt in USD) / (collateral in USD) * 100
 *
 * It uses the generic userState query so it can be reused across
 * add-collateral, remove-collateral and repay flows.
 */
export const useLoanToValueFromUserState = <ChainId extends IChainId>(
  { chainId, marketId, userAddress, collateralToken, borrowToken, collateralDelta, expectedBorrowed }: Params<ChainId>,
  enabled: boolean,
) => {
  const {
    data: userState,
    isLoading: isUserLoading,
    error: userError,
  } = useUserState({ chainId, marketId, userAddress }, enabled)

  const {
    data: collateralUsdRate,
    isLoading: isCollateralUsdRateLoading,
    error: collateralUsdRateError,
  } = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, enabled && !!collateralToken?.address)

  const {
    data: borrowUsdRate,
    isLoading: isBorrowUsdRateLoading,
    error: borrowUsdRateError,
  } = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address }, enabled && !!borrowToken?.address)

  const baseCollateral = userState?.collateral

  const debt = expectedBorrowed == null ? null : new BigNumber(expectedBorrowed)
  const collateral = baseCollateral == null ? null : new BigNumber(baseCollateral).plus(collateralDelta ?? '0')

  return {
    data:
      !enabled ||
      debt == null ||
      collateral == null ||
      collateralUsdRate == null ||
      !collateralUsdRate ||
      borrowUsdRate == null ||
      collateral.isZero()
        ? null
        : (debt.times(borrowUsdRate).div(collateral).div(collateralUsdRate).times(100).toString() as Decimal),
    isLoading: enabled && (isUserLoading || isCollateralUsdRateLoading || isBorrowUsdRateLoading),
    error: userError ?? collateralUsdRateError ?? borrowUsdRateError,
  }
}
