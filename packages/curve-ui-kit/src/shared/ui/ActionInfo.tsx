import { ReactNode, useCallback } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CallMade from '@mui/icons-material/CallMade'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { copyToClipboard, type SxProps } from '@ui-kit/utils'
import { Tooltip } from './Tooltip'
import { WithSkeleton } from './WithSkeleton'

const { Spacing, IconSize } = SizesAndSpaces
const MOCK_SKELETON = 10 // Mock value for skeleton to infer some width

type ComponentSize = 'small' | 'medium' | 'large'

export type ActionInfoProps = {
  /** Label displayed on the left side */
  label: string
  /** Custom color for the label text */
  labelColor?: TypographyProps['color']
  /** Primary value to display and copy */
  value: string
  /** Custom color for the value text */
  valueColor?: TypographyProps['color']
  /** Optional content to display to the left of the value */
  valueLeft?: ReactNode
  /** Optional content to display to the right of the value */
  valueRight?: ReactNode
  /** Tooltip text to display when hovering over the value */
  valueTooltip?: string
  /** Previous value (if needed for comparison) */
  prevValue?: string
  /** Custom color for the previous value text */
  prevValueColor?: TypographyProps['color']
  /** URL to navigate to when clicking the external link button */
  link?: string
  /** Whether or not the value can be copied */
  copy?: boolean
  /** Value to be copied. Example use case would be copying the full address when the value is formatted / shortened. Defaults to original value. */
  copyValue?: string
  /** Message displayed in the snackbar title when the value is copied */
  copiedTitle?: string
  /** Size of the component */
  size?: ComponentSize
  /** Whether the component is in a loading state. Can be boolean or string (string value is used for skeleton width inference) */
  loading?: boolean | string
  /** Error state; Unused for now, but kept for future use */
  error?: boolean | Error | null
  testId?: string
  sx?: SxProps
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
  labelColor,
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
  copyValue: givenCopyValue,
  copiedTitle,
  loading = false,
  error = false,
  testId = 'action-info',
  sx,
}: ActionInfoProps) => {
  const [isSnackbarOpen, openSnackbar, closeSnackbar] = useSwitch(false)
  const copyValue = (givenCopyValue ?? value).trim()

  const copyAndShowSnackbar = useCallback(() => {
    void copyToClipboard(copyValue)
    openSnackbar()
  }, [copyValue, openSnackbar])

  return (
    <Stack direction="row" alignItems="center" gap={Spacing.sm} sx={sx} data-testid={testId}>
      <Typography flexGrow={1} variant={labelSize[size]} color={labelColor ?? 'textSecondary'} textAlign="start">
        {label}
      </Typography>

      <Stack direction="row" alignItems="center" gap={Spacing.xs}>
        {prevValue && (
          <Typography variant={prevValueSize[size]} color={prevValueColor ?? 'textTertiary'}>
            {prevValue}
          </Typography>
        )}

        {prevValue && (
          <ArrowForwardIcon
            sx={{
              width: IconSize.sm,
              height: IconSize.sm,
              color: (t) => t.palette.text.tertiary,
            }}
          />
        )}

        <Tooltip title={(typeof error === 'object' && error?.message) || valueTooltip} placement="top">
          {/** Additional stack to add some space between left (icon), value and right (icon) */}
          <Stack direction="row" alignItems="center" gap={Spacing.xxs} data-testid={`${testId}-value`}>
            {valueLeft}

            <WithSkeleton loading={!!loading}>
              <Typography variant={valueSize[size]} color={error ? 'error' : (valueColor ?? 'textPrimary')}>
                {loading ? (
                  typeof loading === 'string' ? (
                    loading
                  ) : (
                    MOCK_SKELETON
                  )
                ) : error ? (
                  <ExclamationTriangleIcon fontSize="small" />
                ) : (
                  value
                )}
              </Typography>
            </WithSkeleton>

            {valueRight}
          </Stack>
        </Tooltip>

        {copy && copyValue && (
          <IconButton size="extraSmall" title={copyValue} onClick={copyAndShowSnackbar} color="primary">
            <ContentCopy />
          </IconButton>
        )}

        {link && (
          <IconButton
            component={link.startsWith('http') ? Link : RouterLink}
            href={link}
            target="_blank"
            rel="noopener"
            size="extraSmall"
            color="primary"
          >
            <CallMade />
          </IconButton>
        )}
      </Stack>

      <Snackbar open={isSnackbarOpen} onClose={closeSnackbar} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{copiedTitle ?? t`Value has been copied to clipboard`}</AlertTitle>
          {copyValue}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default ActionInfo
