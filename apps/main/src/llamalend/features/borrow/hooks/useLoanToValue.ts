import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { Token } from '../types'

export const useLoanToValue = ({
  chainId,
  collateralToken,
  debt,
  userCollateral,
}: {
  chainId: IChainId
  debt: number | undefined
  userCollateral: number | undefined
  collateralToken: Token | undefined
}) => {
  const tokenAddress = collateralToken?.address
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress })
  const collateralValue = collateralUsdRate != null && userCollateral != null && userCollateral * collateralUsdRate
  return collateralValue && debt != null ? (debt / collateralValue) * 100 : null
}
