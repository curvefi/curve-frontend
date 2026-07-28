import { type HealthQuery, useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { Stack } from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
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
import { IS_DEVELOPMENT } from '@ui-kit/utils'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import {
  getLiquidationBufferColor,
  getLiquidationBufferPercent,
  getLiquidationBufferState,
  HealthAndBufferState,
  getHealthColor,
  getHealthPercent,
  getHealthState,
  HealthType,
} from './utils'

const { Height, MinWidth } = SizesAndSpaces

const SOFT_LIQUIDATION_LABEL = t`Soft Liquidation`

const HEALTH_LABEL: Partial<Record<HealthAndBufferState, string>> = {
  softLiquidation: SOFT_LIQUIDATION_LABEL,
  light: SOFT_LIQUIDATION_LABEL,
  risky: SOFT_LIQUIDATION_LABEL,
  critical: SOFT_LIQUIDATION_LABEL,
  hardLiquidation: t`Hard Liquidation`,
}

const SEGMENT_CONFIG: Record<
  HealthType,
  {
    size: 'lg' | 'sm'
    tooltip: typeof HEALTH_TOOLTIP | typeof LIQUIDATION_BUFFER_TOOLTIP
    getValue: (data: QueryData<typeof useUserHealthValues>) => Decimal | null | undefined
    getColor: (value: Decimal | null | undefined) => (theme: Theme) => string | undefined
    getPercentage: (value: Decimal | null | undefined) => number
  }
> = {
  liquidationBuffer: {
    size: 'sm',
    tooltip: LIQUIDATION_BUFFER_TOOLTIP,
    getValue: data => data.liquidationBuffer,
    getColor: value => getLiquidationBufferColor(maybe(value, value => getLiquidationBufferState(+value))),
    getPercentage: getLiquidationBufferPercent,
  },
  health: {
    size: 'lg',
    tooltip: HEALTH_TOOLTIP,
    getValue: data => data.health,
    getColor: value => getHealthColor(maybe(value, value => getHealthState(+value))),
    getPercentage: getHealthPercent,
  },
}

const BADGE_SIZE_BY_BAR_SIZE = {
  lg: 'small',
  sm: 'extraSmall',
} as const

export const HealthAndBufferBar = ({
  state,
  type,
  query,
}: {
  state: HealthAndBufferState | undefined
  type: HealthType
  query: HealthQuery
}) => {
  const { size, tooltip, getValue, getColor, getPercentage } = SEGMENT_CONFIG[type]
  const { data, isLoading } = mapQuery(query, getValue)
  const percentage = getPercentage(data)
  const label = type === 'health' ? maybe(state, state => HEALTH_LABEL[state]) : undefined

  return (
    <Tooltip title={tooltip.title} body={tooltip.body}>
      <WithSkeleton loading={isLoading} variant="rectangular" width="100%" height={Height.healthBar[size]}>
        <Stack
          sx={{
            height: Height.healthBar[size],
            backgroundColor: theme => theme.design.Color.Neutral[300],
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${percentage}%`,
              minWidth: percentage > 0 ? MinWidth.healthBar : 'auto',
              backgroundColor: getColor(data),
            }}
          />
          {label && (
            <Badge
              size={BADGE_SIZE_BY_BAR_SIZE[size]}
              color={state === 'hardLiquidation' ? 'alert' : 'warning'}
              label={label}
              sx={{ position: 'absolute', bottom: 0, left: 0 }}
            />
          )}
        </Stack>
      </WithSkeleton>
    </Tooltip>
  )
}

/** Development-only diagnostics for health related values and derived state. */
export const HealthAndBufferDebug = ({
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
