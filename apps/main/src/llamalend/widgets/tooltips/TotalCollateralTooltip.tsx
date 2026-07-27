import { formatPercentage } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, formatToken } from '@ui-kit/utils'

type TotalCollateralTooltipProps = Partial<{
  collateralSymbol: string | null
  totalCollateral: Decimal
  borrowedSymbol: string | null
  totalBorrowed: Decimal
  combinedCollateralUsdValue: number | null
  collateralUsdRate: number | null
  borrowedUsdRate: number | null
}>

export const TotalCollateralTooltip = ({
  collateralSymbol,
  totalCollateral,
  borrowedSymbol,
  totalBorrowed,
  combinedCollateralUsdValue,
  collateralUsdRate,
  borrowedUsdRate,
}: TotalCollateralTooltipProps) => {
  const collateralPercentage = formatPercentage(totalCollateral, combinedCollateralUsdValue, collateralUsdRate)
  const borrowPercentage = formatPercentage(totalBorrowed, combinedCollateralUsdValue, borrowedUsdRate)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The total collateral deposited and converted in this market, all denominated in the collateral token.`}
      />
      <TooltipDescription text={t`Used as backing for borrowed or minted debt (e.g., crvUSD).`} />
      <TooltipDescription
        text={t`This includes both active positions and collateral currently in the liquidation band (being gradually converted).`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Deposit token`} variant="independent">
            {formatToken(totalCollateral, collateralSymbol)}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {formatToken(totalBorrowed, borrowedSymbol)}
            {borrowPercentage && ` (${borrowPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {formatNumber(combinedCollateralUsdValue, 'usd.amount')}
      </TooltipItem>
    </TooltipWrapper>
  )
}
