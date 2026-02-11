import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'
import {
  MarketTypeSuffix,
  MaxLeverageTooltip,
  TotalCollateralTooltip,
  UtilizationTooltip,
  TooltipOptions,
  type AdvancedDetailsProps,
} from './'

const { Spacing } = SizesAndSpaces

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

export const AdvancedDetails = ({ collateral, availableLiquidity, maxLeverage, marketType }: AdvancedDetailsProps) => {
  const utilization =
    availableLiquidity?.value != null && availableLiquidity.max
      ? ((availableLiquidity.max - availableLiquidity.value) / availableLiquidity.max) * 100
      : undefined
  const utilizationBreakdown =
    availableLiquidity?.value != null && availableLiquidity.max
      ? `${formatLiquidity(availableLiquidity.max - availableLiquidity.value)}/${formatLiquidity(availableLiquidity.max)}`
      : undefined

  return (
    <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <CardHeader title={t`Advanced Details`} size={'small'} />
      <Box
        display="grid"
        gap={3}
        sx={{
          padding: Spacing.md,
          gridTemplateColumns: '1fr 1fr',
          // 550px
          '@media (min-width: 33.125rem)': {
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          },
        }}
      >
        <Metric
          size="small"
          label={t`Utilization`}
          value={utilization}
          loading={availableLiquidity?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={utilization ? utilizationBreakdown : undefined}
          valueTooltip={{
            title: t`Utilization ${MarketTypeSuffix[marketType]}`,
            body: <UtilizationTooltip marketType={marketType} />,
            ...TooltipOptions,
          }}
        />
        <Metric
          size="small"
          label={t`Total collateral`}
          value={collateral?.total}
          loading={collateral?.loading}
          valueOptions={{ unit: { symbol: collateral?.symbol ?? '', position: 'suffix' } }}
          notional={
            collateral?.totalUsdValue
              ? {
                  value: collateral.totalUsdValue,
                  unit: 'dollar',
                }
              : undefined
          }
          valueTooltip={{
            title: t`Total Collateral`,
            body: <TotalCollateralTooltip />,
            ...TooltipOptions,
          }}
        />
        {maxLeverage && (
          <Metric
            size="small"
            label={t`Max leverage`}
            value={maxLeverage?.value}
            loading={maxLeverage?.loading}
            valueOptions={{ unit: 'multiplier' }}
            valueTooltip={{
              title: t`Maximum Leverage`,
              body: <MaxLeverageTooltip />,
              ...TooltipOptions,
            }}
          />
        )}
      </Box>
    </Box>
  )
}
