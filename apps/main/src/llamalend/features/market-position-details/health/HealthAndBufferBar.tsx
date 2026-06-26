import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, type SxProps, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { QueryData } from '@ui-kit/lib/queries/types'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { applySxProps, formatNumber } from '@ui-kit/utils'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import {
  getHealthDetailsState,
  getLiquidationBufferColor,
  getLiquidationBufferPercent,
  HealthAndBufferState,
  getHealthColor,
  getHealthPercent,
} from './utils'

const { Spacing, Height } = SizesAndSpaces

type SegmentType = 'liquidationBuffer' | 'health'

const DIVIDER_SPACING = Spacing.xxs

const STATE_LABEL: Record<HealthAndBufferState, string> = {
  pristine: t`Pristine`,
  good: t`Good`,
  tight: t`Tight`,
  softLiquidation: t`Soft Liquidation`,
  risky: t`At risk`,
  critical: t`Critical`,
  hardLiquidation: t`Hard liquidation`,
}

const SEGMENT_CONFIG: Record<
  SegmentType,
  {
    title: string
    withDivider?: boolean
    getColor: (state: HealthAndBufferState | undefined) => (theme: Theme) => string | undefined
    getPercentage: (state: HealthAndBufferState | undefined, liquidationBuffer: Decimal | null | undefined) => number
  }
> = {
  liquidationBuffer: {
    title: t`Buffer`,
    getColor: getLiquidationBufferColor,
    getPercentage: getLiquidationBufferPercent,
  },
  health: {
    title: t`Health`,
    withDivider: true,
    getColor: getHealthColor,
    getPercentage: getHealthPercent,
  },
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
  isActive,
  state,
  tooltip,
  type,
  query: { data, isLoading },
}: {
  isActive?: boolean // wether the segment is active. This control the widths of the segment (larger when active)
  state: HealthAndBufferState | undefined
  tooltip: Pick<TooltipProps, 'title' | 'body'>
  type: SegmentType
  query: QueryProp<Decimal | null | undefined>
}) => {
  const { title, withDivider, getColor, getPercentage } = SEGMENT_CONFIG[type]
  const label = maybe(state, s => STATE_LABEL[s])
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
        <Tooltip title={tooltip.title} body={tooltip.body}>
          <Stack sx={{ flex: 1 }}>
            <Typography variant="bodyXsRegular" color="textTertiary">
              {/* TODO: add the parenthesis as a number unit? */}
              {title} {maybe(data, v => '(' + formatNumber(v, 'number.compact') + ')')}
            </Typography>
            <WithSkeleton loading={isLoading} variant="rectangular" width="100%" height={Height.healthBar.new}>
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
                <Box
                  sx={{ height: '100%', width: `${getPercentage(state, data)}%`, backgroundColor: getColor(state) }}
                />
              </Stack>
            </WithSkeleton>
          </Stack>
        </Tooltip>
      </WithWrapper>
    </Grid>
  )
}

export const HealthAndBufferBar = ({
  healthQuery,
  sx,
}: {
  healthQuery: QueryProp<QueryData<typeof useUserHealthValue>>
  sx?: SxProps
}) => {
  const { state, isHealthy } = getHealthDetailsState(healthQuery.data)

  return (
    <Grid container columnSpacing={DIVIDER_SPACING} sx={applySxProps(sx)}>
      <GridSegment
        state={state}
        isActive={!isHealthy}
        tooltip={LIQUIDATION_BUFFER_TOOLTIP}
        type="liquidationBuffer"
        query={mapQuery(healthQuery, d => d.liquidationBuffer)}
      />
      <GridSegment
        state={state}
        isActive={isHealthy}
        tooltip={HEALTH_TOOLTIP}
        type="health"
        query={mapQuery(healthQuery, d => d.health)}
      />
    </Grid>
  )
}
