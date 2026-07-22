import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { Stack, Typography } from '@mui/material'
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
import { formatNumber } from '@ui-kit/utils'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import {
  getLiquidationBufferColor,
  getLiquidationBufferPercent,
  HealthAndBufferState,
  getHealthColor,
  getHealthPercent,
  HealthType,
  getHealthDetailsState,
} from './utils'

const { Spacing, Height } = SizesAndSpaces

type HealthQuery = QueryProp<QueryData<typeof useUserHealthValues>>

const SOFT_LIQUIDATION_LABEL = t`Soft Liquidation`

const HEALTH_LABEL: Record<HealthAndBufferState, string> = {
  pristine: t`Pristine`,
  good: t`Good`,
  caution: t`Caution`,
  tight: t`Tight`,
  softLiquidation: SOFT_LIQUIDATION_LABEL,
  light: SOFT_LIQUIDATION_LABEL,
  risky: SOFT_LIQUIDATION_LABEL,
  critical: SOFT_LIQUIDATION_LABEL,
  hardLiquidation: SOFT_LIQUIDATION_LABEL,
}

const SEGMENT_CONFIG: Record<
  HealthType,
  {
    title: string
    tooltip: typeof HEALTH_TOOLTIP | typeof LIQUIDATION_BUFFER_TOOLTIP
    getValue: (data: QueryData<typeof useUserHealthValues>) => Decimal | null | undefined
    getColor: (state: HealthAndBufferState | undefined) => (theme: Theme) => string | undefined
    getPercentage: (state: HealthAndBufferState | undefined, liquidationBuffer: Decimal | null | undefined) => number
  }
> = {
  liquidationBuffer: {
    title: t`Liquidation buffer`,
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

const Bar = ({
  state,
  type,
  query,
}: {
  state: HealthAndBufferState | undefined
  type: HealthType
  query: HealthQuery
}) => {
  const { title, tooltip, getValue, getColor, getPercentage } = SEGMENT_CONFIG[type]
  const { data, isLoading } = mapQuery(query, getValue)
  const label = (
    {
      health: maybe(state, s => HEALTH_LABEL[s]),
      liquidationBuffer: maybe(data, value => formatNumber(value, 'percent.value')),
    } satisfies Record<HealthType, string | undefined>
  )[type]

  return (
    <Stack>
      <Tooltip title={tooltip.title} body={tooltip.body}>
        <Grid container>
          <Grid size={2}>
            <Typography variant="bodyXsRegular" color="textTertiary">
              {title}
            </Typography>
          </Grid>
          <Grid size={10}>
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
                {label && (
                  <Box
                    sx={{
                      position: 'absolute',
                      height: Height.healthBar.label,
                      left: Spacing.xxs,
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
          </Grid>
        </Grid>
      </Tooltip>
    </Stack>
  )
}

export const HealthAndBufferBar = ({ healthQuery }: { healthQuery: HealthQuery }) => {
  const { state } = getHealthDetailsState(healthQuery.data)

  return (
    <Stack>
      <Bar state={state} type="health" query={healthQuery} />
      <Bar state={state} type="liquidationBuffer" query={healthQuery} />
    </Stack>
  )
}
