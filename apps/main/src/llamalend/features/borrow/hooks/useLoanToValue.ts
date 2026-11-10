import { getCollateralValue, getLoanToValue } from '@/llamalend/equity-leverage.utils'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { maybes } from '@primitives/objects.utils'
import { ZERO } from '@ui/lib/decimal'
import type { CreateLoanFormQueryParams } from '../types'

/**
 * Hook to calculate the Loan to Value (LTV) ratio in percentage points, at the oracle price.
 *
 * When leverage is enabled, it uses the expected total collateral after leverage
 * Otherwise, it uses the user's current collateral directly from the form params
 */
export const useLoanToValue = <ChainId extends IChainId>(
  { params }: { params: CreateLoanFormQueryParams<ChainId> },
  enabled: boolean,
) => {
  const { debt, userCollateral, leverageEnabled } = params
  const {
    data: expectedCollateral,
    isLoading: isExpectedCollateralLoading,
    error: expectCollateralError,
  } = useCreateLoanExpectedCollateral(params, enabled && (leverageEnabled ?? false))
  const {
    data: oraclePrice,
    error: oraclePriceError,
    isLoading: isOraclePriceLoading,
  } = useMarketOraclePrice(params, enabled)
  const collateral = leverageEnabled ? expectedCollateral?.totalCollateral : userCollateral
  return {
    data:
      maybes([debt, collateral, oraclePrice], (debt, collateral, oraclePrice) =>
        // A loan that is not open yet has no collateral converted to the borrowed token by soft liquidation
        getLoanToValue(debt, getCollateralValue({ collateral, convertedBorrowed: ZERO }, oraclePrice)),
      ) ?? null,
    isLoading: isOraclePriceLoading || isExpectedCollateralLoading,
    error: expectCollateralError ?? oraclePriceError ?? null,
  }
}
