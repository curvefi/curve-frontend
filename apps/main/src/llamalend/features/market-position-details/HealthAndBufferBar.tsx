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

const { Spacing, Height } = SizesAndSpaces

type HealthState = 'pristine' | 'good' | 'tight' | 'softLiquidation'
type LiquidationBufferState = 'risky' | 'critical' | 'hardLiquidation'
type HealthAndBufferState = HealthState | LiquidationBufferState
type SegmentType = 'liquidationBuffer' | 'health'

const DIVIDER_SPACING = Spacing.xxs
// the base on wich to calculate the "percentage" of the liquidation buffer bar: liqudation_baffer / base
const LIQ_BUFFER_BASE_PERCENTAGE = 10
// the base on wich to calculate the "percentage" of the health bar: health / base
const HEALTH_BASE_PERCENTAGE = 100

const HEALTH_THRESHOLDS: Record<Exclude<HealthState, 'pristine'>, number> = {
  /** Below this value the position enter soft liquidation */
  softLiquidation: 0,
  /** Below this value the position is tight */
  tight: 20,
  /** Below this value, the position is in good standing; above is pristine */
  good: 50,
} as const

const LIQUIDATION_BUFFER_THRESHOLDS: Record<Exclude<LiquidationBufferState, 'risky'>, number> = {
  /** Below this value the position is hard liquidated */
  hardLiquidation: 0,
  /** Below this value the position is critical. Above it is risky */
  critical: 20,
} as const

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

const clampPercent = (value: number) => Math.max(0, Math.min(value, 100))

const getHealthState = (health: number): HealthState => {
  if (health > HEALTH_THRESHOLDS.good) return 'pristine'
  if (health > HEALTH_THRESHOLDS.tight) return 'good'
  if (health > HEALTH_THRESHOLDS.softLiquidation) return 'tight'
  return 'softLiquidation'
}

const getLiquidationBufferState = (liquidationBuffer: number): LiquidationBufferState => {
  if (liquidationBuffer <= LIQUIDATION_BUFFER_THRESHOLDS.hardLiquidation) return 'hardLiquidation'
  if (liquidationBuffer < LIQUIDATION_BUFFER_THRESHOLDS.critical) return 'critical'
  return 'risky'
}

const getHealthBarFillColor = (state: HealthAndBufferState) => (theme: Theme) => {
  const { Layer } = theme.design
  switch (state) {
    case 'pristine':
      return Layer.Feedback.Info
    case 'good':
      return Layer.Feedback.Success
    case 'tight':
      return Layer.Feedback.Caution
    case 'softLiquidation':
    case 'risky':
    case 'critical':
      return undefined
    case 'hardLiquidation':
      return Layer.Feedback.Error
  }
}

const getLiquidationBufferBarFillColor = (state: HealthAndBufferState) => (theme: Theme) => {
  const { Layer } = theme.design
  switch (state) {
    case 'pristine':
    case 'good':
    case 'tight':
    case 'softLiquidation':
      return Layer.Feedback.Info
    case 'risky':
      return Layer.Feedback.Warning
    case 'critical':
    case 'hardLiquidation':
      return Layer.Feedback.Error
  }
}

/**
 * If `healthValue` is defined, it returns true if the position has not entered soft liquidation (health > 0), false if it has.
 * It returns undefined if the value is not defined
 */
const getIsHealthy = (healthValue: Decimal | null | undefined) =>
  maybe(healthValue, healthValue => +healthValue > HEALTH_THRESHOLDS.softLiquidation)

const getHealthPercent = (state: HealthAndBufferState, health: Decimal | null | undefined) => {
  if (health == null) return 100
  switch (state) {
    case 'pristine':
    case 'hardLiquidation':
      return 100
    case 'good':
    case 'tight':
      return clampPercent((+health / HEALTH_BASE_PERCENTAGE) * 100)
    default:
      return 0
  }
}

const getLiquidationBufferPercent = (state: HealthAndBufferState, liquidationBuffer: Decimal | null | undefined) =>
  ['risky', 'critical'].includes(state) && liquidationBuffer
    ? clampPercent((+liquidationBuffer / LIQ_BUFFER_BASE_PERCENTAGE) * 100)
    : 100

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
  label: string
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
            {title} ({formatNumber(value, 'number.compact')})
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
  // todo: health and liquidationBuffer should be returned defined (loading skeleton in the parent)
  if (health == null || liquidationBuffer == null) return undefined
  const isHealthy = getIsHealthy(health)
  const state = isHealthy ? getHealthState(+health) : getLiquidationBufferState(+liquidationBuffer)
  const label = STATE_LABEL[state]

  return (
    <Grid container columnSpacing={DIVIDER_SPACING} sx={applySxProps(sx)}>
      <GridSegment
        isActive={!isHealthy}
        type="liquidationBuffer"
        value={liquidationBuffer}
        percent={getLiquidationBufferPercent(state, liquidationBuffer)}
        fillColor={getLiquidationBufferBarFillColor(state)}
        label={label}
      />
      <GridSegment
        isActive={isHealthy}
        type="health"
        value={health}
        percent={getHealthPercent(state, health)}
        fillColor={getHealthBarFillColor(state)}
        label={label}
      />
    </Grid>
  )
}
