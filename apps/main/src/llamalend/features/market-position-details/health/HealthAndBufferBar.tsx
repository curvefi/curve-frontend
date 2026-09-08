import { type HealthQuery, useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { QueryData } from '@evm-ui/lib/queries/types'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { Stack } from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { Accordion } from '@ui/components/Accordion'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { IS_DEVELOPMENT } from '@ui/utils/env'
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

const { Height, MinWidth, Spacing } = SizesAndSpaces

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
  const testId = `health-details-${type === 'liquidationBuffer' ? 'liquidation-buffer' : type}-bar`

  return (
    <WithSkeleton loading={isLoading} variant="rectangular" width="100%" height={Height.healthBar[size]}>
      <Tooltip title={tooltip.title} body={tooltip.body}>
        <Stack
          data-testid={testId}
          sx={{
            height: Height.healthBar[size],
            backgroundColor: theme => theme.design.Color.Neutral[300],
            overflow: 'hidden',
            position: 'relative',
            justifyContent: 'center',
          }}
        >
          <Box
            data-testid={`${testId}-fill`}
            sx={{
              height: '100%',
              width: `${percentage}%`,
              minWidth: percentage > 0 ? MinWidth.healthBar : 'auto',
              backgroundColor: getColor(data),
            }}
          />
          {label && (
            <Badge
              data-testid={`${testId}-badge`}
              size={BADGE_SIZE_BY_BAR_SIZE[size]}
              color={state === 'hardLiquidation' ? 'alert' : 'warning'}
              label={label}
              sx={{ position: 'absolute', left: Spacing['3xs'] }}
            />
          )}
        </Stack>
      </Tooltip>
    </WithSkeleton>
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
