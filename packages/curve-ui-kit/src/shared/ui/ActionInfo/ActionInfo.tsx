import { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CallMade from '@mui/icons-material/CallMade'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack, { type StackProps } from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { IconButtonIconSize } from '@ui-kit/themes/components/button'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { applySxProps } from '@ui-kit/utils'
import { Tooltip } from '../Tooltip'
import { WithSkeleton } from '../WithSkeleton'
import { WithWrapper } from '../WithWrapper'

const { Spacing, ButtonSize, IconSize } = SizesAndSpaces

export type ActionInfoSize = 'small' | 'medium'

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
} as const satisfies Record<ActionInfoSize, TypographyVariantKey>

const prevValueSize = labelSize

const valueSize = {
  small: 'bodyXsBold',
  medium: 'bodyMBold',
} as const satisfies Record<ActionInfoSize, TypographyVariantKey>

const iconButtonSize = {
  small: 'extraExtraSmall',
  medium: 'extraSmall',
} satisfies Record<ActionInfoSize, IconButtonProps['size']>

const rowHeight: Record<ActionInfoSize, string> = {
  small: ButtonSize.xxs,
  medium: ButtonSize.xs,
}

type ValueDecoratorProps = Pick<ActionInfoProps, 'size' | 'error' | 'valueColor' | 'testId' | 'value'>

const ValueTypography = ({
  size = DEFAULT_SIZE,
  error,
  valueColor,
  children,
  testId,
  value,
}: ValueDecoratorProps & { children: ReactNode }) => (
  <Typography
    variant={valueSize[size]}
    color={error ? 'error' : (valueColor ?? 'textPrimary')}
    component="div"
    data-testid={testId}
    data-value={value}
  >
    {children}
  </Typography>
)

/** Renders a value as a typography (same variant and color as the main value) if it's a string, otherwise renders the value directly */
const ValueDecorator = (props: ValueDecoratorProps) => (
  <WithWrapper shouldWrap={typeof props.value === 'string'} Wrapper={ValueTypography} {...props}>
    {props.value}
  </WithWrapper>
)
export const ActionInfo = ({
  label,
  labelColor,
  prevValue: givenPrevValue,
  prevValueColor,
  value: givenValue,
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
  const buttonSize = iconButtonSize[size]
  const iconSize = IconButtonIconSize[buttonSize]
  const value = givenValue ?? givenPrevValue
  const prevValue = value === givenPrevValue ? null : givenPrevValue
  return (
    <Stack
      direction="row"
      alignItems={alignItems}
      columnGap={Spacing.sm}
      data-testid={testId}
      sx={applySxProps(sx, { minHeight: rowHeight[size] })}
    >
      <Typography
        flexGrow={1}
        variant={labelSize[size]}
        color={labelColor ?? 'textSecondary'}
        textAlign="start"
        component="div"
        whiteSpace="nowrap"
      >
        {label}
      </Typography>

      <Stack direction="row" alignItems="center" gap={Spacing.xs} className="ActionInfo-valueGroup">
        <Stack direction="row" gap={Spacing.xs} flexWrap="wrap" justifyContent="end">
          <Stack direction="row" gap={Spacing.xs}>
            <Typography
              variant={prevValueSize[size]}
              color={prevValueColor ?? 'textTertiary'}
              data-testid={`${testId}-previous`}
              data-value={`${givenPrevValue}`}
              whiteSpace="nowrap"
            >
              {prevValue}
            </Typography>
            {prevValue != null && (
              <ArrowForwardIcon
                sx={{ color: (t) => t.palette.text.tertiary, width: IconSize[iconSize], height: IconSize[iconSize] }}
              />
            )}

            <Tooltip title={valueTooltip} placement="top">
              {/** Additional stack to add some space between left (icon), value and right (icon) */}
              <Stack
                direction="row"
                alignItems={alignItems}
                gap={Spacing.xxs}
                className="ActionInfo-value"
                whiteSpace="nowrap"
              >
                <ValueDecorator
                  value={valueLeft}
                  size={size}
                  error={error}
                  valueColor={valueColor}
                  testId={`${testId}-left`}
                />

                <WithSkeleton
                  component="div"
                  loading={!!loading}
                  {...(Array.isArray(loading)
                    ? { width: loading[0], height: loading[1] }
                    : { width: '2ch', height: '1rem' })}
                >
                  <ValueTypography
                    size={size}
                    error={error}
                    valueColor={valueColor}
                    testId={`${testId}-value`}
                    value={value}
                  >
                    {typeof loading === 'string' ? loading : error ? '' : (value ?? '-')}
                  </ValueTypography>
                </WithSkeleton>
              </Stack>
            </Tooltip>
          </Stack>
          <ValueDecorator
            value={valueRight}
            size={size}
            error={error}
            valueColor={valueColor}
            testId={`${testId}-right`}
          />
        </Stack>

        {error && <ErrorIconButton error={error} size={buttonSize} />}
        {copyValue && (
          <CopyIconButton
            copyText={copyValue}
            label={`${t`Copy `}${copyValue}${t` to clipboard`}`}
            confirmationText={copiedTitle ?? t`Value has been copied to clipboard`}
            size={buttonSize}
          />
        )}

        {link && (
          <IconButton
            component={link.startsWith('http') ? Link : RouterLink}
            href={link}
            target="_blank"
            rel="noopener"
            size={buttonSize}
          >
            <CallMade />
          </IconButton>
        )}
      </Stack>
    </Stack>
  )
}
