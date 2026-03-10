import { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CallMade from '@mui/icons-material/CallMade'
import { IconProps } from '@mui/material/Icon'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack, { type StackProps } from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { Tooltip } from '../Tooltip'
import { WithSkeleton } from '../WithSkeleton'
import { WithWrapper } from '../WithWrapper'

const { Spacing, IconSize } = SizesAndSpaces

export type ActionInfoSize = 'small' | 'medium' | 'large'

export type ActionInfoProps = {
  /** Label displayed on the left side */
  label: ReactNode
  /** Custom color for the label text */
  labelColor?: TypographyProps['color']
  /** Primary value to display and copy */
  value: ReactNode
  /** Custom color for the value text */
  valueColor?: TypographyProps['color']
  /** Optional content to display to the left of the value */
  valueLeft?: ReactNode
  /** Optional content to display to the right of the value */
  valueRight?: ReactNode
  /** Tooltip text to display when hovering over the value */
  valueTooltip?: ReactNode
  /** Previous value (if needed for comparison) */
  prevValue?: ReactNode
  /** Custom color for the previous value text */
  prevValueColor?: TypographyProps['color']
  /** Placeholder when no value or previous value is provided */
  emptyValue?: ReactNode
  /** URL to navigate to when clicking the external link button */
  link?: string
  /** Value to be copied (will display a copy button). */
  copyValue?: string
  /** Message displayed in the snackbar title when the value is copied */
  copiedTitle?: string
  /** Size of the component */
  size?: ActionInfoSize
  /** Whether the component is in a loading state. Can be one of:
   * - boolean
   * - string (value is used for skeleton width inference)
   * - [number, number] (explicit skeleton width and height in px)
   **/
  loading?: boolean | [number, number] | string
  /** Error state; Unused for now, but kept for future use */
  error?: boolean | Error | string | null
  /** Test ID for the component */
  testId?: string
  /** Additional styles */
  sx?: StackProps['sx']
  /** CSS align-items property */
  alignItems?: StackProps['alignItems']
}

const DEFAULT_SIZE: ActionInfoSize = 'medium'

const labelSize = {
  small: 'bodyXsRegular',
  medium: 'bodyMRegular',
  large: 'bodyMRegular',
} as const satisfies Record<ActionInfoSize, TypographyVariantKey>

const prevValueSize = labelSize

const valueSize = {
  small: 'bodyXsBold',
  medium: 'bodyMBold',
  large: 'bodyMBold',
} as const satisfies Record<ActionInfoSize, TypographyVariantKey>

const iconButtonSize: Record<ActionInfoSize, IconButtonProps['size']> = {
  small: 'extraExtraSmall',
  medium: 'extraSmall',
  large: 'extraSmall',
}

const iconSize: Record<ActionInfoSize, IconProps['fontSize']> = {
  small: 'small',
  medium: 'medium',
  large: 'medium',
}

const isSet = (v: ReactNode) => v || v === 0

type ValueDecoratorProps = Pick<ActionInfoProps, 'size' | 'error' | 'valueColor'>

const ValueTypography = ({
  size = DEFAULT_SIZE,
  error,
  valueColor,
  children,
}: ValueDecoratorProps & { children: ReactNode }) => (
  <Typography variant={valueSize[size]} color={error ? 'error' : (valueColor ?? 'textPrimary')} component="div">
    {children}
  </Typography>
)
/** Renders a value as a typography (same variant and color as the main value) if it's a string, otherwise renders the value directly */
const ValueDecorator = ({ value, size, error, valueColor }: ValueDecoratorProps & { value?: ReactNode }) => (
  <WithWrapper
    shouldWrap={typeof value === 'string'}
    Wrapper={ValueTypography}
    size={size}
    error={error}
    valueColor={valueColor}
  >
    {value}
  </WithWrapper>
)
export const ActionInfo = ({
  label,
  labelColor,
  prevValue,
  prevValueColor,
  value,
  emptyValue = '-',
  valueColor,
  valueLeft,
  valueRight,
  valueTooltip,
  link,
  size = DEFAULT_SIZE,
  copyValue,
  copiedTitle,
  loading = false,
  error = false,
  alignItems = 'center',
  testId = 'action-info',
  sx,
}: ActionInfoProps) => {
  const errorMessage = (typeof error === 'object' && error?.message) || (typeof error === 'string' && error)
  const showPrevValue = isSet(value) && isSet(prevValue)
  value ??= prevValue ?? emptyValue

  return (
    <Stack direction="row" alignItems="center" columnGap={Spacing.sm} data-testid={testId} sx={sx}>
      <Typography
        flexGrow={1}
        variant={labelSize[size]}
        color={labelColor ?? 'textSecondary'}
        textAlign="start"
        component="div"
      >
        {label}
      </Typography>

      <Stack direction="row" alignItems={alignItems} gap={Spacing.xs} className="ActionInfo-valueGroup">
        {showPrevValue && (
          <Typography
            variant={prevValueSize[size]}
            color={prevValueColor ?? 'textTertiary'}
            data-testid={`${testId}-previous-value`}
            data-value={`${prevValue}`}
          >
            {prevValue}
          </Typography>
        )}

        {showPrevValue && (
          <ArrowForwardIcon
            sx={{
              width: IconSize.sm,
              height: IconSize.sm,
              color: (t) => t.palette.text.tertiary,
            }}
          />
        )}

        <Tooltip title={valueTooltip} placement="top">
          {/** Additional stack to add some space between left (icon), value and right (icon) */}
          <Stack
            direction="row"
            alignItems={alignItems}
            gap={Spacing.xxs}
            data-testid={`${testId}-value`}
            data-value={`${value}`}
            className="ActionInfo-value"
          >
            <ValueDecorator value={valueLeft} size={size} error={error} valueColor={valueColor} />

            <WithSkeleton
              component="div"
              loading={!!loading}
              {...(Array.isArray(loading)
                ? { width: loading[0], height: loading[1] }
                : { width: '2ch', height: '1rem' })}
            >
              <ValueTypography size={size} error={error} valueColor={valueColor}>
                {typeof loading === 'string' ? loading : error ? '' : value}
              </ValueTypography>
            </WithSkeleton>

            <ValueDecorator value={valueRight} size={size} error={error} valueColor={valueColor} />
          </Stack>
        </Tooltip>

        {error && !loading && (
          <ErrorIconButton
            message={errorMessage}
            error={error}
            buttonSize={iconButtonSize[size]}
            iconSize={iconSize[size]}
          />
        )}
        {copyValue && (
          <CopyIconButton
            copyText={copyValue}
            label={`${t`Copy `}${copyValue}${t` to clipboard`}`}
            confirmationText={copiedTitle ?? t`Value has been copied to clipboard`}
            size={iconButtonSize[size]}
          />
        )}

        {link && (
          <IconButton
            component={link.startsWith('http') ? Link : RouterLink}
            href={link}
            target="_blank"
            rel="noopener"
            size={iconButtonSize[size]}
          >
            <CallMade />
          </IconButton>
        )}
      </Stack>
    </Stack>
  )
}
