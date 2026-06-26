import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, type SxProps, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { QueryData } from '@ui-kit/lib/queries/types'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { QueryProp } from '@ui-kit/types/util'
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
  isLoading,
}: {
  isActive?: boolean // wether the segment is active. This control the widths of the segment (larger when active)
  type: SegmentType
  percent: number
  fillColor: (theme: Theme) => string | undefined
  value: Decimal | null | undefined
  label?: string
  isLoading: boolean | undefined
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
          <WithSkeleton loading={!!isLoading} variant="rectangular" width="100%" height={Height.healthBar.new}>
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
          </WithSkeleton>
        </Stack>
      </WithWrapper>
    </Grid>
  )
}

export const HealthAndBufferBar = ({
  healthQuery: { data, isLoading },
  sx,
}: {
  healthQuery: QueryProp<QueryData<typeof useUserHealthValue>>
  sx?: SxProps
}) => {
  const { health, liquidationBuffer } = data ?? {}
  const { state, isHealthy } = getState(data)
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
        isLoading={isLoading}
      />
      <GridSegment
        isActive={isHealthy}
        type="health"
        value={health}
        percent={getHealthPercent(state, health)}
        fillColor={getHealthColor(state)}
        label={label}
        isLoading={isLoading}
      />
    </Grid>
  )
}
