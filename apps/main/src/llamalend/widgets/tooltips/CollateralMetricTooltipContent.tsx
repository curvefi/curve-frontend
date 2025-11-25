import type {
  CollateralValue,
  CollateralLoss,
} from '@/llamalend/features/market-position-details/BorrowPositionDetails'
import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { formatPercent, formatNumber, formatUsd } from '@ui-kit/utils'

type CollateralMetricTooltipContentProps = {
  collateralValue: CollateralValue | undefined | null
  collateralLoss: CollateralLoss | undefined | null
}

const UnavailableNotation = '-'

const formatMetricValue = (value?: number | null) => {
  if (value === 0) return '0'
  if (value) return formatNumber(value, { abbreviate: true })
  return UnavailableNotation
}

const formatPercentage = (
  value: number | undefined | null,
  totalValue: number | undefined | null,
  usdRate: number | undefined | null,
) => {
  if (value === 0) return '0%'
  if (value && totalValue && usdRate) {
    return formatPercent(((value * usdRate) / totalValue) * 100)
  }
  return null
}

export const CollateralMetricTooltipContent = ({
  collateralValue,
  collateralLoss,
}: CollateralMetricTooltipContentProps) => {
  const collateralValueFormatted = formatMetricValue(collateralValue?.collateral?.value)
  const depositedCollateralFormatted = formatMetricValue(collateralLoss?.depositedCollateral)
  const collateralLossFormatted =
    collateralLoss?.amount && collateralLoss.amount < 0 ? 0 : formatMetricValue(collateralLoss?.amount)
  const collateralPercentage = formatPercentage(
    collateralValue?.collateral?.value,
    collateralValue?.totalValue,
    collateralValue?.collateral?.usdRate,
  )

  const crvUSDValueFormatted = formatMetricValue(collateralValue?.borrow?.value)
  const crvUSDPercentage = formatPercentage(
    collateralValue?.borrow?.value,
    collateralValue?.totalValue,
    collateralValue?.borrow?.usdRate,
  )

  const totalValueFormatted = collateralValue?.totalValue
    ? formatUsd(collateralValue.totalValue, { abbreviate: false })
    : UnavailableNotation

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Collateral value is taken by multiplying tokens in collateral by the oracle price. In soft liquidation, it may include crvUSD due to liquidation protection.`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Initial collateral`} variant="independent">
            {`${depositedCollateralFormatted} ${collateralValue?.collateral?.symbol}`}
          </TooltipItem>
        </TooltipItems>
        <TooltipItems secondary>
          <TooltipItem title={t`Deposit token`} variant="independent">
            {`${collateralValueFormatted} ${collateralValue?.collateral?.symbol ?? UnavailableNotation}`}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {`${crvUSDValueFormatted} ${collateralValue?.borrow?.symbol ?? UnavailableNotation}`}
            {crvUSDPercentage && ` (${crvUSDPercentage})`}
          </TooltipItem>
        </TooltipItems>
        <TooltipItems secondary>
          <TooltipItem title={t`Liquidation losses`} variant="independent">
            {`${collateralLossFormatted}${collateralLoss?.percentage && collateralLoss.percentage > 0 ? ` (${collateralLoss.percentage}%)` : ''}`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValueFormatted}
      </TooltipItem>
    </TooltipWrapper>
  )
}
