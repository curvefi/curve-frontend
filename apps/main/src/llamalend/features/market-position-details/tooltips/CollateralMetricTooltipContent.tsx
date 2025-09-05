import { Stack } from '@mui/material'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import type { CollateralValue } from '../BorrowPositionDetails'

type CollateralMetricTooltipContentProps = {
  collateralValue: CollateralValue | undefined | null
}

const UnavailableNotation = '-'

const formatMetricValue = (value?: number | null) => {
  if (value === 0) return '0'
  if (value) return formatNumber(value, { notation: 'compact' })
  return UnavailableNotation
}

const formatPercentage = (
  value: number | undefined | null,
  totalValue: number | undefined | null,
  usdRate: number | undefined | null,
) => {
  if (value === 0) return '0%'
  if (value && totalValue && usdRate) {
    return formatNumber(((value * usdRate) / totalValue) * 100, {
      ...FORMAT_OPTIONS.PERCENT,
    })
  }
  return null
}

export const CollateralMetricTooltipContent = ({ collateralValue }: CollateralMetricTooltipContentProps) => {
  const collateralValueFormatted = formatMetricValue(collateralValue?.collateral?.value)
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
    ? formatNumber(collateralValue.totalValue, { ...FORMAT_OPTIONS.USD })
    : UnavailableNotation

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Collateral value is taken by multiplying tokens in collateral by the oracle price. In soft liquidation, it may include crvUSD due to liquidation protection.`}
      />

      <Stack>
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
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValueFormatted}
      </TooltipItem>
    </TooltipWrapper>
  )
}
