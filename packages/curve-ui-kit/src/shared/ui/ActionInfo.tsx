import type { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CallMade from '@mui/icons-material/CallMade'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { Stack, Tooltip } from '@mui/material'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { copyToClipboard } from '@ui-kit/utils'
import { WithSkeleton } from './WithSkeleton'

const { Spacing, IconSize } = SizesAndSpaces
const MOCK_SKELETON = 10 // Mock value for skeleton to infer some width

type ComponentSize = 'small' | 'medium' | 'large'

type ActionInfoProps = {
  /** Label displayed on the left side */
  label: string
  /** Primary value to display and copy */
  value: string
  /** Custom color for the value text */
  valueColor?: React.ComponentProps<typeof Typography>['color']
  /** Optional content to display to the left of the value */
  valueLeft?: ReactNode
  /** Optional content to display to the right of the value */
  valueRight?: ReactNode
  /** Tooltip text to display when hovering over the value */
  valueTooltip?: string
  /** Previous value (if needed for comparison) */
  prevValue?: string
  /** Custom color for the previous value text */
  prevValueColor?: React.ComponentProps<typeof Typography>['color']
  /** URL to navigate to when clicking the external link button */
  link?: string
  /** Whether or not the value can be copied */
  copy?: boolean
  /** Message displayed in the snackbar title when the value is copied */
  copiedTitle?: string
  /** Size of the component */
  size?: ComponentSize
  /** Whether the component is in a loading state. Can be boolean or string (string value is used for skeleton width inference) */
  loading?: boolean | string
}

const labelSize = {
  small: 'bodyXsRegular',
  medium: 'bodyMRegular',
  large: 'bodyMRegular',
} as const satisfies Record<ComponentSize, TypographyVariantKey>

const prevValueSize = {
  small: 'bodySRegular',
  medium: 'bodyMRegular',
  large: 'bodyMRegular',
} as const satisfies Record<ComponentSize, TypographyVariantKey>

const valueSize = {
  small: 'bodyXsBold',
  medium: 'highlightM',
  large: 'headingSBold',
} as const satisfies Record<ComponentSize, TypographyVariantKey>

const ActionInfo = ({
  label,
  prevValue,
  prevValueColor,
  value,
  valueColor,
  valueLeft,
  valueRight,
  valueTooltip = '',
  link,
  size = 'medium',
  copy = false,
  copiedTitle,
  loading = false,
}: ActionInfoProps) => {
  const [isOpen, open, close] = useSwitch(false)

  const copyValue = () => {
    copyToClipboard(value)
    open()
  }

  return (
    <Stack direction="row" alignItems="center" gap={Spacing.sm}>
      <Typography flexGrow={1} variant={labelSize[size]} color="textSecondary">
        {label}
      </Typography>

      {prevValue && (
        <Stack direction="row" alignItems="center">
          <Typography variant={prevValueSize[size]} color={prevValueColor ?? 'textSecondary'}>
            {prevValue}
          </Typography>

          <ArrowForwardIcon
            sx={{
              width: IconSize.sm,
              height: IconSize.sm,
              color: (t) => t.palette.text.primary,
            }}
          />
        </Stack>
      )}

      <Stack direction="row" alignItems="center" gap={Spacing.xs}>
        {valueLeft}

        <WithSkeleton loading={!!loading}>
          <Tooltip
            title={valueTooltip}
            placement="top"
            slotProps={{
              popper: {
                sx: {
                  userSelect: 'none',
                  pointerEvents: 'none',
                },
              },
            }}
          >
            <Typography variant={valueSize[size]} color={valueColor ?? 'textPrimary'}>
              {!loading ? value : typeof loading === 'string' ? loading : MOCK_SKELETON}
            </Typography>
          </Tooltip>
        </WithSkeleton>

        {valueRight}

        {copy && (
          <IconButton size="small" onClick={copyValue} color="primary">
            <ContentCopy />
          </IconButton>
        )}

        {link && (
          <IconButton component={Link} href={link} target="_blank" rel="noopener" size="small" color="primary">
            <CallMade />
          </IconButton>
        )}
      </Stack>

      <Snackbar open={isOpen} onClose={close} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{copiedTitle ?? t`Value has been copied to clipboard`}</AlertTitle>
          {value}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ActionInfo
