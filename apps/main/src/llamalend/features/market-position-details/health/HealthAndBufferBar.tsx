import type { ReactNode } from 'react'
import type { FeedbackKey, PositionStatus } from '@/llamalend/health.utils'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { maybe } from '@primitives/objects.utils'
import { Badge, type BadgeProps } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Badge: BadgeSizes, Height, MinWidth } = SizesAndSpaces

const POSITION_STATUS_BADGE = {
  liquidatable: { label: t`Liquidatable`, color: 'alert' },
  inRange: { label: t`Soft liquidation`, color: 'warning' },
  belowRange: { label: t`Below range`, color: 'warning' },
  nearRange: { label: t`Near range`, color: 'warning' },
  aboveRange: { label: t`Above range`, color: 'default' },
} as const satisfies Record<PositionStatus, Pick<BadgeProps, 'label' | 'color'>>

export const HealthAndBufferBar = ({
  testId,
  size,
  tooltip,
  isLoading,
  fill = 0,
  feedback,
  status,
}: {
  testId: string
  size: 'lg' | 'sm'
  tooltip: { title: string; body: ReactNode }
  isLoading: boolean
  fill: number | undefined
  feedback: FeedbackKey | undefined
  /** Shown as a badge over the bar */
  status?: PositionStatus
}) => (
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
            width: `${fill}%`,
            minWidth: fill > 0 ? MinWidth.healthBar : 'auto',
            backgroundColor: theme => maybe(feedback, key => theme.design.Layer.Feedback[key]),
          }}
        />
        {status && (
          <Badge
            data-testid={`${testId}-badge`}
            size="extraSmall"
            {...POSITION_STATUS_BADGE[status]}
            sx={{
              position: 'absolute',
              insetInlineStart: `calc((${Height.healthBar[size]} - ${BadgeSizes.Size.extraSmall}) / 2)`,
            }}
          />
        )}
      </Stack>
    </Tooltip>
  </WithSkeleton>
)
