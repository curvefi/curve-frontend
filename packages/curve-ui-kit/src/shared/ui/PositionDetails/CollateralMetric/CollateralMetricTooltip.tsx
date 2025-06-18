import { Stack, Typography } from '@mui/material'
import { formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { CollateralValue } from '@ui-kit/shared/ui/PositionDetails'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type CollateralMetricTooltipProps = {
  collateralValue: CollateralValue | undefined | null
}

export const CollateralMetricTooltip = ({ collateralValue }: CollateralMetricTooltipProps) => {
  const collateralValueFormatted = collateralValue?.collateral?.value
    ? formatNumber(collateralValue.collateral.value)
    : '-'
  const collateralPercentage =
    collateralValue?.collateral?.value && collateralValue?.totalValue
      ? formatNumber((collateralValue.collateral.value / collateralValue.totalValue) * 100)
      : null
  const crvUSDValueFormatted = collateralValue?.borrow?.value ? formatNumber(collateralValue.borrow.value) : '-'
  const crvUSDPercentage =
    collateralValue?.borrow?.value && collateralValue?.totalValue
      ? formatNumber((collateralValue.borrow.value / collateralValue.totalValue) * 100)
      : null
  const totalValueFormatted =
    collateralValue?.totalValue && collateralValue?.borrow?.value ? formatNumber(collateralValue.totalValue) : '-'

  return (
    <Stack gap={2}>
      <Typography variant="bodySRegular">{t`Collateral value is taken by multiplying tokens in collateral by the oracle price. If in soft liquidation, collateral could be a mix of collateral + crvUSD due to the liquidation protection mechanism.`}</Typography>

      <Stack gap={2} display="column" sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.sm }}>
        <Typography variant="bodySBold">{t`Breakdown`}</Typography>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{t`Deposit token`}</Typography>
          <Stack direction="row" justifyContent="space-between" gap={5}>
            <Typography variant="bodySBold">{`${collateralValueFormatted} ${collateralValue?.collateral?.symbol ?? '-'}`}</Typography>
            {collateralPercentage && <Typography variant="bodySRegular">{`(${collateralPercentage}%)`}</Typography>}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Typography variant="bodySRegular">{collateralValue?.borrow?.symbol ?? '-'}</Typography>
          <Stack direction="row" justifyContent="space-between" gap={5}>
            <Typography variant="bodySBold">{`${crvUSDValueFormatted} ${collateralValue?.borrow?.symbol ?? '-'}`}</Typography>
            {crvUSDPercentage && <Typography variant="bodySRegular">{`(${crvUSDPercentage}%)`}</Typography>}
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
