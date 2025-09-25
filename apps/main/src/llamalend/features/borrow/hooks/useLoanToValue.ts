import { BigNumber } from 'bignumber.js'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { multiplyPrecise, type PreciseNumber, stringNumber } from '@ui-kit/utils'
import type { Token } from '../types'

export const useLoanToValue = ({
  chainId,
  collateralToken,
  debt,
  userCollateral,
}: {
  chainId: IChainId
  debt: PreciseNumber | undefined
  userCollateral: PreciseNumber | undefined
  collateralToken: Token | undefined
}) => {
  const tokenAddress = collateralToken?.address
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress })
  const collateralValue = multiplyPrecise(collateralUsdRate, userCollateral)
  return collateralValue && debt != null
    ? { number: new BigNumber(stringNumber(debt)).div(collateralValue.number).times(100).toString() }
    : null
}
