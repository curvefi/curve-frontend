import { type HealthQuery, useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { Stack, Typography } from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { QueryData } from '@ui-kit/lib/queries/types'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber, IS_DEVELOPMENT } from '@ui-kit/utils'
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

const { Spacing, Height, MinWidth } = SizesAndSpaces

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
  hardLiquidation: t`Hard Liquidation`,
}

const SEGMENT_CONFIG: Record<
  HealthType,
  {
    title: string
    tooltip: typeof HEALTH_TOOLTIP | typeof LIQUIDATION_BUFFER_TOOLTIP
    getValue: (data: QueryData<typeof useUserHealthValues>) => Decimal | null | undefined
    getColor: (
      state: HealthAndBufferState | undefined,
      value: Decimal | null | undefined,
    ) => (theme: Theme) => string | undefined
    getPercentage: (value: Decimal | null | undefined) => number
  }
> = {
  liquidationBuffer: {
    title: t`Buffer`,
    tooltip: LIQUIDATION_BUFFER_TOOLTIP,
    getValue: data => data.liquidationBuffer,
    getColor: (_, value) => getLiquidationBufferColor(value),
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
  const percentage = getPercentage(data)
  const label = (
    {
      health: maybe(state, s => HEALTH_LABEL[s]),
      liquidationBuffer: maybe(data, value => formatNumber(value, 'percent.value')),
    } satisfies Record<HealthType, string | undefined>
  )[type]

  return (
    <Stack>
      <Tooltip title={tooltip.title} body={tooltip.body}>
        <Grid container sx={{ alignItems: 'center' }}>
          <Grid size={{ mobile: 2, desktop: 1 }}>
            <Typography variant="bodyXsRegular" color="textTertiary">
              {title}
            </Typography>
          </Grid>
          {(label || isLoading) && (
            <Grid
              size={{ mobile: 3, desktop: 2 }}
              // Flex prevents the inline Badge line box from increasing the Grid row height.
              sx={{ display: 'flex' }}
            >
              <WithSkeleton loading={isLoading} variant="rectangular" width="5rem" height={Height.healthDetails.label}>
                <Badge size="extraSmall" color={state === 'hardLiquidation' ? 'alert' : 'default'} label={label} />
              </WithSkeleton>
            </Grid>
          )}
          <Grid size="grow">
            <WithSkeleton loading={isLoading} variant="rectangular" width="100%" height={Height.healthDetails.bar}>
              <Stack
                sx={{
                  height: Height.healthDetails.bar,
                  backgroundColor: theme => theme.design.Color.Neutral[300],
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${percentage}%`,
                    minWidth: percentage > 0 ? MinWidth.healthBar : 'auto',
                    backgroundColor: getColor(state, data),
                  }}
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
  const { state, type } = getHealthDetailsState(healthQuery.data)

  return (
    <Stack spacing={Spacing['3xs']}>
      <HealthAndBufferDebug healthQuery={healthQuery} state={state} type={type} />
      <Bar state={state} type="health" query={healthQuery} />
      <Bar state={state} type="liquidationBuffer" query={healthQuery} />
    </Stack>
  )
}

/** Development-only diagnostics for health related values and derived state. */
const HealthAndBufferDebug = ({
  healthQuery,
  state,
  type,
}: {
  healthQuery: HealthQuery
  state: HealthAndBufferState | undefined
  type: HealthType
}) => {
  const { health, healthFactor, liquidationBuffer, debug } = healthQuery.data ?? {}
  return (
    IS_DEVELOPMENT && (
      <Accordion title={t`Health and buffer state`} ghost size="extraSmall">
        <AccordionDetails>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {JSON.stringify(
              {
                values: { ...debug, health, healthFactor, liquidationBuffer },
                display: {
                  type,
                  state,
                  healthPercent: getHealthPercent(health),
                  liquidationBufferPercent: getLiquidationBufferPercent(liquidationBuffer),
                },
                isLoading: healthQuery.isLoading,
                error: healthQuery.error?.message,
              },
              null,
              2,
            ).slice(2, -2)}
          </pre>
        </AccordionDetails>
      </Accordion>
    )
  )
}
