import type { CollateralValue } from '@/llamalend/features/market-position-details/BorrowPositionDetails'
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

type CollateralMetricTooltipContentProps = {
  collateralValue: CollateralValue | undefined | null
}

export const CollateralMetricTooltipContent = ({ collateralValue }: CollateralMetricTooltipContentProps) => {
  const collateralValueFormatted = formatMetricValue(collateralValue?.collateral?.value)
  const collateralPercentage = formatPercentage(
    collateralValue?.collateral?.value,
    collateralValue?.totalValue,
    collateralValue?.collateral?.usdRate,
  )

  const borrowValueFormatted = formatMetricValue(collateralValue?.borrow?.value)
  const borrowPercentage = formatPercentage(
    collateralValue?.borrow?.value,
    collateralValue?.totalValue,
    collateralValue?.borrow?.usdRate,
  )

  const totalValueFormatted =
    collateralValue?.totalValue != null
      ? formatUsd(collateralValue.totalValue, { abbreviate: false })
      : UnavailableNotation

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Collateral value is taken by multiplying tokens in collateral by the oracle price. In soft liquidation, it may include ${collateralValue?.borrow.symbol} due to liquidation protection.`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Deposit token`} variant="independent">
            {`${collateralValueFormatted} ${collateralValue?.collateral?.symbol}`}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {`${borrowValueFormatted} ${collateralValue?.borrow?.symbol}`}
            {borrowPercentage && ` (${borrowPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValueFormatted}
      </TooltipItem>
    </TooltipWrapper>
  )
}
