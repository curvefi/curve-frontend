import { useBorrowExpectedCollateral } from '@/llamalend/features/borrow/queries/borrow-expected-collateral.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { BorrowFormQueryParams, Token } from '../types'

/**
 * Hook to calculate Loan to Value (LTV) ratio in percentage
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
    : ((debt * borrowUsdRate) / (collateral * collateralUsdRate)) * 100
}
