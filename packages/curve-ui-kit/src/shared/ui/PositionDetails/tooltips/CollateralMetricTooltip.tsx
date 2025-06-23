import { Stack, Typography } from '@mui/material'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { CollateralValue } from '@ui-kit/shared/ui/PositionDetails'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type CollateralMetricTooltipProps = {
  collateralValue: CollateralValue | undefined | null
}

export const CollateralMetricTooltip = ({ collateralValue }: CollateralMetricTooltipProps) => {
  const collateralValueFormatted =
    collateralValue?.collateral?.value === 0
      ? '0'
      : collateralValue?.collateral?.value
        ? formatNumber(collateralValue.collateral.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '-'
  const collateralPercentage =
    collateralValue?.collateral?.value === 0
      ? '0.00%'
      : collateralValue?.collateral?.value && collateralValue?.totalValue && collateralValue?.collateral?.usdRate
        ? formatNumber(
            ((collateralValue.collateral.value * collateralValue.collateral.usdRate) / collateralValue.totalValue) *
              100,
            {
              ...FORMAT_OPTIONS.PERCENT,
            },
          )
        : null
  const crvUSDValueFormatted =
    collateralValue?.borrow?.value === 0
      ? '0'
      : collateralValue?.borrow?.value
        ? formatNumber(collateralValue.borrow.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '-'
  const crvUSDPercentage =
    collateralValue?.borrow?.value === 0
      ? '0.00%'
      : collateralValue?.borrow?.value && collateralValue?.totalValue && collateralValue?.borrow?.usdRate
        ? formatNumber(
            ((collateralValue.borrow.value * collateralValue.borrow.usdRate) / collateralValue.totalValue) * 100,
            { ...FORMAT_OPTIONS.PERCENT },
          )
        : null
  const totalValueFormatted = collateralValue?.totalValue
    ? formatNumber(collateralValue.totalValue, { ...FORMAT_OPTIONS.USD })
    : '-'

  return (
    <Stack gap={3} sx={{ maxWidth: '20rem' }}>
      <Typography variant="bodySRegular">{t`Collateral value is taken by multiplying tokens in collateral by the oracle price. In soft liquidation, it may include crvUSD due to liquidation protection.`}</Typography>

      <Stack gap={2} display="column" sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.sm }}>
        <Typography variant="bodySBold">{t`Breakdown`}</Typography>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{t`Deposit token`}</Typography>
          <Stack direction="row" gap={2}>
            <Typography variant="bodySBold">{`${collateralValueFormatted} ${collateralValue?.collateral?.symbol ?? '-'}`}</Typography>
            {collateralPercentage && <Typography variant="bodySRegular">{`(${collateralPercentage})`}</Typography>}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{collateralValue?.borrow?.symbol ?? '-'}</Typography>
          <Stack direction="row" gap={2}>
            <Typography variant="bodySBold">{`${crvUSDValueFormatted} ${collateralValue?.borrow?.symbol ?? '-'}`}</Typography>
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
