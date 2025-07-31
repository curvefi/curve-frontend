import { Stack, Typography } from '@mui/material'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { CollateralValue } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type CollateralMetricTooltipProps = {
  collateralValue: CollateralValue | undefined | null
}

const UnavailableNotation = '-'

const formatMetricValue = (value?: number | null) => {
  if (value === 0) return '0'
  if (value) return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return UnavailableNotation
}

const formatPercentage = (
  value: number | undefined | null,
  totalValue: number | undefined | null,
  usdRate: number | undefined | null,
) => {
  if (value === 0) return '0.00%'
  if (value && totalValue && usdRate) {
    return formatNumber(((value * usdRate) / totalValue) * 100, {
      ...FORMAT_OPTIONS.PERCENT,
    })
  }
  return null
}

export const CollateralMetricTooltip = ({ collateralValue }: CollateralMetricTooltipProps) => {
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
    <Stack gap={3} sx={{ maxWidth: '20rem' }}>
      <Typography variant="bodySRegular">{t`Collateral value is taken by multiplying tokens in collateral by the oracle price. In soft liquidation, it may include crvUSD due to liquidation protection.`}</Typography>

      <Stack gap={2} display="column" sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.sm }}>
        <Typography variant="bodySBold">{t`Breakdown`}</Typography>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{t`Deposit token`}</Typography>
          <Stack direction="row" gap={2}>
            <Typography variant="bodySBold">{`${collateralValueFormatted} ${collateralValue?.collateral?.symbol ?? UnavailableNotation}`}</Typography>
            {collateralPercentage && <Typography variant="bodySRegular">{`(${collateralPercentage})`}</Typography>}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{collateralValue?.borrow?.symbol ?? UnavailableNotation}</Typography>
          <Stack direction="row" gap={2}>
            <Typography variant="bodySBold">{`${crvUSDValueFormatted} ${collateralValue?.borrow?.symbol ?? UnavailableNotation}`}</Typography>
            <Typography variant="bodySRegular">{`(${crvUSDPercentage})`}</Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySBold">{t`Total collateral value`}</Typography>
        <Typography variant="highlightS">{totalValueFormatted}</Typography>
      </Stack>
    </Stack>
  )
}
