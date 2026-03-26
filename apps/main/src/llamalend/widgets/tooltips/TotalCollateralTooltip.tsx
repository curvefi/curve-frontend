import { UnavailableNotation, formatMetricValue, formatPercentage } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { formatUsd } from '@ui-kit/utils'

type TotalCollateralTooltipProps = {
  collateralSymbol: string | null | undefined
  totalCollateral: number | null
  borrowedSymbol: string | null | undefined
  totalBorrowed: number | null
  combinedCollateralUsdValue: number | null
  collateralUsdRate: number | null
  borrowedUsdRate: number | null
}

export const TotalCollateralTooltip = ({
  collateralSymbol,
  totalCollateral,
  borrowedSymbol,
  totalBorrowed,
  combinedCollateralUsdValue,
  collateralUsdRate,
  borrowedUsdRate,
}: TotalCollateralTooltipProps) => {
  const collateralValueFormatted = formatMetricValue(totalCollateral)
  const collateralPercentage = formatPercentage(totalCollateral, combinedCollateralUsdValue, collateralUsdRate)

  const crvUSDValueFormatted = formatMetricValue(totalBorrowed)
  const crvUSDPercentage = formatPercentage(totalBorrowed, combinedCollateralUsdValue, borrowedUsdRate)

  const totalValueFormatted =
    combinedCollateralUsdValue != null
      ? formatUsd(combinedCollateralUsdValue, { abbreviate: false })
      : UnavailableNotation

  return (
    <TooltipWrapper>
      <TooltipDescription text={t`The total USD value of all collateral assets deposited in this market.`} />
      <TooltipDescription text={t`Used as backing for borrowed or minted debt (e.g., crvUSD).`} />
      <TooltipDescription
        text={t`This includes both active positions and collateral currently in the liquidation band (being gradually converted).`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Deposit token`} variant="independent">
            {`${collateralValueFormatted} ${collateralSymbol}`}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {`${crvUSDValueFormatted} ${borrowedSymbol}`}
            {crvUSDPercentage && ` (${crvUSDPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValueFormatted}
      </TooltipItem>
    </TooltipWrapper>
  )
}
