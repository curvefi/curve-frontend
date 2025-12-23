import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { LegendSet, type LegendSetType } from '@ui-kit/shared/ui/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ChartFooterProps = {
  legendSets: LegendSetType[]
  showSoftLiquidationText?: boolean
}

export const ChartFooter = ({ legendSets, showSoftLiquidationText = false }: ChartFooterProps) => (
  <Stack gap={Spacing.sm}>
    <Stack direction="row" alignItems="center" gap={Spacing.sm} flexWrap="wrap">
      {legendSets.map((legendSet) => (
        <LegendSet key={legendSet.label} label={legendSet.label} line={legendSet.line} box={legendSet.box} />
      ))}
    </Stack>
    {showSoftLiquidationText && (
      <Typography variant="bodySRegular">
        {t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`}
      </Typography>
    )}
  </Stack>
)
