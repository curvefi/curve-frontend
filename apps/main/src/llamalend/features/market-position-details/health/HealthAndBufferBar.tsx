import { Stack, type SxProps, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, formatNumber } from '@ui-kit/utils'
import {
  getHealthColor,
  getHealthPercent,
  getLiquidationBufferColor,
  getLiquidationBufferPercent,
  getState,
  HealthAndBufferState,
} from './utils'

const { Spacing, Height } = SizesAndSpaces

type SegmentType = 'liquidationBuffer' | 'health'

const DIVIDER_SPACING = Spacing.xxs

const SEGMENT_CONFIG: Record<SegmentType, { title: string; withDivider?: boolean }> = {
  health: { title: t`Health`, withDivider: true },
  liquidationBuffer: { title: t`Buffer` },
}

const STATE_LABEL: Record<HealthAndBufferState, string> = {
  pristine: t`Pristine`,
  good: t`Good`,
  tight: t`Tight`,
  softLiquidation: t`Soft Liquidation`,
  risky: t`At risk`,
  critical: t`Critical`,
  hardLiquidation: t`Hard liquidation`,
}

const DashedDivider = () => (
  <Box
    component="span"
    sx={{
      alignSelf: 'stretch',
      borderRight: theme => `2px dashed ${theme.design.Color.Neutral[400]}`,
      pointerEvents: 'none',
    }}
  />
)

const GridSegment = ({
  percent,
  fillColor,
  isActive,
  type,
  value,
  label,
}: {
  isActive?: boolean // wether the segment is active. This control the widths of the segment (larger when active)
  type: SegmentType
  percent: number
  fillColor: (theme: Theme) => string | undefined
  value: Decimal | null | undefined
  label?: string
}) => {
  const { title, withDivider } = SEGMENT_CONFIG[type]
  return (
    <Grid size={isActive ? 9 : 3}>
      <WithWrapper
        shouldWrap={withDivider}
        Wrapper={Stack}
        sx={{ flex: 1, alignItems: 'stretch' }}
        spacing={DIVIDER_SPACING}
        direction="row"
      >
        {withDivider && <DashedDivider />}
        <Stack sx={{ flex: 1 }}>
          <Typography variant="bodyXsRegular" color="textTertiary">
            {/* TODO: add the parenthesis as a number unit? */}
            {title} {maybe(value, v => '(' + formatNumber(v, 'number.compact') + ')')}
          </Typography>
          <Stack
            sx={{
              position: 'relative',
              justifyContent: 'center',
              height: Height.healthBar.new,
              backgroundColor: theme => theme.design.Color.Neutral[300],
              overflow: 'hidden',
            }}
          >
            {isActive && label && (
              <Box
                sx={{
                  position: 'absolute',
                  left: Spacing.xs,
                  paddingInline: Spacing.xxs,
                  backgroundColor: theme => theme.design.Layer[3].Fill,
                  border: theme => `1px solid ${theme.design.Layer[3].Outline}`,
                }}
              >
                <Typography variant="bodyXsRegular">{label}</Typography>
              </Box>
            )}
            <Box sx={{ height: '100%', width: `${percent}%`, backgroundColor: fillColor }} />
          </Stack>
        </Stack>
      </WithWrapper>
    </Grid>
  )
}

export const HealthAndBufferBar = ({
  health,
  liquidationBuffer,
  sx,
}: {
  health: Decimal | null | undefined
  liquidationBuffer: Decimal | null | undefined
  sx?: SxProps
}) => {
  const { state, isHealthy = true } = getState({ health, liquidationBuffer })
  const label = maybe(state, s => STATE_LABEL[s])

  return (
    <Grid container columnSpacing={DIVIDER_SPACING} sx={applySxProps(sx)}>
      <GridSegment
        isActive={!isHealthy}
        type="liquidationBuffer"
        value={liquidationBuffer}
        percent={getLiquidationBufferPercent(state, liquidationBuffer)}
        fillColor={getLiquidationBufferColor(state)}
        label={label}
      />
      <GridSegment
        isActive={isHealthy}
        type="health"
        value={health}
        percent={getHealthPercent(state, health)}
        fillColor={getHealthColor(state)}
        label={label}
      />
    </Grid>
  )
}
