import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, type SxProps, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { QueryData } from '@ui-kit/lib/queries/types'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import {
  getHealthDetailsState,
  getLiquidationBufferColor,
  getLiquidationBufferPercent,
  HealthAndBufferState,
  getHealthColor,
  getHealthPercent,
  HealthType,
} from './utils'

const { Spacing, Height } = SizesAndSpaces

type HealthQuery = QueryProp<QueryData<typeof useUserHealthValue>>

const STATE_LABEL: Record<HealthAndBufferState, string> = {
  pristine: t`Pristine`,
  good: t`Good`,
  caution: t`Caution`,
  tight: t`Tight`,
  softLiquidation: t`Soft Liquidation`,
  light: t`At risk`,
  risky: t`At risk`,
  critical: t`Critical`,
  hardLiquidation: t`Hard liquidation`,
}

const SEGMENT_CONFIG: Record<
  HealthType,
  {
    title: string
    tooltip: typeof HEALTH_TOOLTIP | typeof LIQUIDATION_BUFFER_TOOLTIP
    getValue: (data: QueryData<typeof useUserHealthValue>) => Decimal | null | undefined
    getColor: (state: HealthAndBufferState | undefined) => (theme: Theme) => string | undefined
    getPercentage: (state: HealthAndBufferState | undefined, liquidationBuffer: Decimal | null | undefined) => number
  }
> = {
  liquidationBuffer: {
    title: t`Buffer`,
    tooltip: LIQUIDATION_BUFFER_TOOLTIP,
    getValue: data => data.liquidationBuffer,
    getColor: getLiquidationBufferColor,
    getPercentage: getLiquidationBufferPercent,
  },
  health: {
    title: t`Health`,
    tooltip: HEALTH_TOOLTIP,
    getValue: data => data.health,
    getColor: getHealthColor,
    getPercentage: getHealthPercent,
  },
}

const GridSegment = ({
  state,
  type,
  activeType,
  query,
}: {
  state: HealthAndBufferState | undefined
  type: HealthType
  activeType: HealthType
  query: HealthQuery
}) => {
  const { title, tooltip, getValue, getColor, getPercentage } = SEGMENT_CONFIG[type]
  const { data, isLoading } = mapQuery(query, getValue)
  const label = maybe(state, s => STATE_LABEL[s])
  // this controls the widths of the segment (larger when active) and rendering the label
  const isActive = type === activeType

  return (
    <Grid size={isActive ? 9 : 3}>
      <Tooltip title={tooltip.title} body={tooltip.body}>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="bodyXsRegular" color="textTertiary">
            {title}
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
              <Box sx={{ height: '100%', width: `${getPercentage(state, data)}%`, backgroundColor: getColor(state) }} />
            </Stack>
          </WithSkeleton>
        </Stack>
      </Tooltip>
    </Grid>
  )
}

export const HealthAndBufferBar = ({ healthQuery, sx }: { healthQuery: HealthQuery; sx?: SxProps }) => {
  const { state, type: activeType } = getHealthDetailsState(healthQuery.data)

  return (
    <Grid container columnSpacing={Spacing['3xs']} sx={sx}>
      <GridSegment state={state} activeType={activeType} type="liquidationBuffer" query={healthQuery} />
      <GridSegment state={state} activeType={activeType} type="health" query={healthQuery} />
    </Grid>
  )
}
