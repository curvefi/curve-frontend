import BigNumber from 'bignumber.js'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Decimal } from '@ui-kit/utils'
import type { CreateLoanFormQueryParams, Token } from '../types'

/**
 * Hook to calculate the Loan to Value (LTV) ratio in percentage points.
 * LTV = (debt in USD) / (collateral in USD) * 100
 *
 * It fetches the USD rates for both the collateral and borrow tokens.
 * When leverage is enabled, it uses the expected total collateral after leverage
 * Otherwise, it uses the user's current collateral directly from the form params
 */
export const useLoanToValue = <ChainId extends IChainId>(
  {
    params,
    collateralToken,
    borrowToken,
  }: {
    params: CreateLoanFormQueryParams<ChainId>
    collateralToken: Token | undefined
    borrowToken: Token | undefined
  },
  enabled: boolean,
) => {
  const { debt, userCollateral, leverageEnabled, chainId } = params
  const {
    data: expectedCollateral,
    isLoading: isExpectedCollateralLoading,
    error: expectCollateralError,
  } = useCreateLoanExpectedCollateral(params, enabled && (leverageEnabled ?? false))
  const {
    data: collateralUsdRate,
    error: collateralUsdRateError,
    isLoading: isCollateralUsdRateLoading,
  } = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, enabled)
  const {
    data: borrowUsdRate = 1,
    isLoading: isBorrowUsdRateLoading,
    error: borrowUsdRateError,
  } = useTokenUsdRate(
    {
      chainId,
      tokenAddress: borrowToken?.address,
    },
    enabled,
  )
  const collateral = leverageEnabled ? expectedCollateral?.totalCollateral : userCollateral
  return {
    data:
      debt == null || !collateral || !collateralUsdRate || borrowUsdRate == null
        ? null
        : (new BigNumber(debt)
            .times(borrowUsdRate)
            .div(collateral)
            .div(collateralUsdRate)
            .times(100)
            .toFixed() as Decimal),
    isLoading: [isCollateralUsdRateLoading, isBorrowUsdRateLoading, isExpectedCollateralLoading].some(Boolean),
    error: [expectCollateralError, collateralUsdRateError, borrowUsdRateError].find(Boolean) ?? null,
  }
}
