import BigNumber from 'bignumber.js'
import { useBorrowExpectedCollateral } from '@/llamalend/features/borrow/queries/borrow-expected-collateral.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Decimal } from '@ui-kit/utils'
import type { BorrowFormQueryParams, Token } from '../types'

/**
 * Hook to calculate the Loan to Value (LTV) ratio in percentage points.
 * LTV = (debt in USD) / (collateral in USD) * 100
 *
 * It fetches the USD rates for both the collateral and borrow tokens.
 * When leverage is enabled, it uses the expected total collateral after leverage
 * Otherwise, it uses the user's current collateral directly from the form params
 */
export const useLoanToValue = <ChainId extends IChainId>({
  params,
  collateralToken,
  borrowToken,
}: {
  params: BorrowFormQueryParams<ChainId>
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const { debt, userCollateral, leverageEnabled = false, chainId } = params
  const { data: expectedCollateral } = useBorrowExpectedCollateral(params, leverageEnabled ?? false)
  const { data: collateralUsdRate } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: collateralToken?.address,
  })
  const { data: borrowUsdRate = 1 } = useTokenUsdRate({ chainId: chainId, tokenAddress: borrowToken?.address })
  const collateral = leverageEnabled ? expectedCollateral?.totalCollateral : userCollateral
  return debt == null || !collateral || !collateralUsdRate
    ? null
    : (new BigNumber(debt).times(borrowUsdRate).div(collateral).div(collateralUsdRate).times(100).toString() as Decimal)
}
