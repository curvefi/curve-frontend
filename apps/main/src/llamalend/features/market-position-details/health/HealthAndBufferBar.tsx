import type { UserPositionStatus, UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { type HealthQuery, useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { QueryData } from '@evm-ui/lib/queries/types'
import { Stack } from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { Accordion } from '@ui/components/Accordion'
import { Badge } from '@ui/components/Badge'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { IS_DEVELOPMENT } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'
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

const { Badge: BadgeSizes, Height, MinWidth, Spacing } = SizesAndSpaces

const LIQUIDATION_PROTECTION_LABEL = t`Liquidation Protection`

const POSITION_STATUS_LABEL: Partial<Record<UserPositionStatusKey, string>> = {
  softLiquidation: t`Soft Liquidation`,
  fullyConverted: LIQUIDATION_PROTECTION_LABEL,
  incompleteConversion: LIQUIDATION_PROTECTION_LABEL,
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

export const HealthAndBufferBar = ({
  positionStatus: { data: positionStatus, isLoading: isStatusLoading, error: statusError },
  type,
  health,
}: {
  positionStatus: QueryProp<UserPositionStatus>
  type: HealthType
  health: HealthQuery
}) => {
  const { size, tooltip, getValue, getColor, getPercentage } = SEGMENT_CONFIG[type]
  // error already shown in the sibling Metric component
  const { data, isLoading: isHealthLoading } = mapQuery(health, getValue)
  const isHealth = type === 'health'
  const percentage = getPercentage(data)
  const label = isHealth && maybe(positionStatus, status => POSITION_STATUS_LABEL[status])
  const testId = `health-details-${{ health: 'health', liquidationBuffer: 'liquidation-buffer' }[type]}-bar`

  return (
    <WithSkeleton loading={isHealthLoading} variant="rectangular" width="100%" height={Height.healthBar[size]}>
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
          {isHealth && (label || statusError || isStatusLoading) && (
            <Stack
              direction="row"
              sx={{
                position: 'absolute',
                insetInlineStart: `calc((${Height.healthBar[size]} - ${BadgeSizes.Size.extraSmall}) / 2)`,
                alignItems: 'center',
                gap: Spacing.xs,
              }}
            >
              {statusError && <ErrorIconButton error={statusError} size="extraExtraSmall" />}
              <WithSkeleton
                loading={isStatusLoading}
                variant="rectangular"
                width="3rem"
                height={BadgeSizes.Size.extraSmall}
              >
                {label && (
                  <Badge
                    data-testid={`${testId}-badge`}
                    size="extraSmall"
                    color={positionStatus === 'hardLiquidation' ? 'alert' : 'warning'}
                    label={label}
                  />
                )}
              </WithSkeleton>
            </Stack>
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
