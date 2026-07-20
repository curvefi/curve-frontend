import type { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { IconButtonProps } from '@mui/material/IconButton'
import Stack, { type StackProps } from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { IconButtonIconSize } from '@ui-kit/themes/components/button'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { isQuery, type QueryProp } from '@ui-kit/types/util'
import { applySxProps } from '@ui-kit/utils'
import { LabelTooltipIcon } from '../LabelTooltipIcon'
import { Tooltip, type TooltipProps } from '../Tooltip'
import { WithSkeleton } from '../WithSkeleton'
import { WithWrapper } from '../WithWrapper'

const { Spacing, ButtonSize, IconSize } = SizesAndSpaces

export type ActionInfoSize = 'small' | 'medium'

type ActionInfoLoading = boolean | [number, number] | string
type ActionInfoError = boolean | Error | string | null

type ActionInfoBaseProps = {
  /** Label displayed on the left side */
  label: ReactNode
  /** Optional tooltip content shown next to the label with an info icon */
  labelTooltip?: Omit<TooltipProps, 'children'>
  /** Custom color for the label text */
  labelColor?: TypographyProps['color']
  /** Custom color for the primary displayed value text */
  valueColor?: TypographyProps['color']
  /** Optional content to display to the left of the value */
  valueLeft?: ReactNode
  /** Optional content to display to the right of the value */
  valueRight?: ReactNode
  /** Tooltip text to display when hovering over the value */
  valueTooltip?: ReactNode
  /** Value to copy from the primary displayed value when clicked. */
  copyValue?: string
  /** Message displayed in the snackbar title when the value is copied */
  copiedTitle?: string
  /** Size of the component */
  size?: ActionInfoSize
  /** Test ID for the component */
  testId?: string
  /** Additional styles */
  sx?: StackProps['sx']
}

type ActionInfoLegacyProps = {
  /** Primary value to display and copy */
  value: ReactNode
  futureValue?: never
  currentValueColor?: never
  /** Whether the component is in a loading state. Can be one of:
   * - boolean
   * - string (value is used for skeleton width inference)
   * - [number, number] (explicit skeleton width and height in px)
   **/
  loading?: ActionInfoLoading
  /** Error state; Unused for now, but kept for future use */
  error?: ActionInfoError
}

type ActionInfoQueryProps = {
  /** Query whose data is the current value. */
  value: QueryProp<ReactNode>
  loading?: never
  error?: never
  /** Query whose data is the expected value after the action. */
  futureValue?: QueryProp<ReactNode>
  /** Custom color for the current value text. */
  currentValueColor?: TypographyProps['color']
}

export type ActionInfoProps = ActionInfoBaseProps & (ActionInfoLegacyProps | ActionInfoQueryProps)

const DEFAULT_SIZE: ActionInfoSize = 'medium'

const labelSize = {
  small: 'bodyXsRegular',
  medium: 'bodyMRegular',
} as const satisfies Record<ActionInfoSize, TypographyVariantKey>

const currentValueSize = labelSize

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

type ValueDecoratorProps = Pick<ActionInfoProps, 'size' | 'error' | 'valueColor' | 'testId'> & { value: ReactNode }

const ValueTypography = ({
  size = DEFAULT_SIZE,
  error,
  valueColor,
  children,
  testId,
  value,
  onClick,
}: ValueDecoratorProps & {
  children: ReactNode
  onClick?: () => void
}) => (
  <Typography
    variant={valueSize[size]}
    color={error ? 'error' : (valueColor ?? 'textPrimary')}
    component="div"
    data-testid={testId}
    data-value={value}
    onClick={onClick}
    sx={
      onClick && {
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      }
    }
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

export const ActionInfo = (props: ActionInfoProps) => {
  const {
    label,
    labelTooltip,
    labelColor,
    futureValue: givenFutureValue,
    currentValueColor,
    value: propValue,
    valueColor,
    valueLeft,
    valueRight,
    valueTooltip,
    size = DEFAULT_SIZE,
    copyValue,
    copiedTitle,
    testId = 'action-info',
    sx,
  } = props
  const {
    data: givenCurrentValue,
    isLoading: valueLoading,
    error: valueError,
  } = isQuery(propValue) ? propValue : { data: propValue, isLoading: props.loading ?? false, error: props.error }
  const buttonSize = iconButtonSize[size]
  const iconSize = IconButtonIconSize[buttonSize]

  const error = givenFutureValue?.error ?? valueError
  const loading = valueLoading || givenFutureValue?.isLoading
  const futureValue = givenFutureValue?.data ?? givenCurrentValue
  const value = futureValue === givenCurrentValue ? null : givenCurrentValue

  const copyToClipboard = useCopyToClipboard({
    copyText: copyValue ?? '',
    confirmationText: copiedTitle ?? t`Value has been copied to clipboard`,
  })

  return (
    <Stack
      direction="row"
      data-testid={testId}
      sx={applySxProps({ alignItems: 'center', columnGap: Spacing.sm, minHeight: rowHeight[size] }, sx)}
    >
      <Typography
        variant={labelSize[size]}
        color={labelColor ?? 'textSecondary'}
        component="div"
        sx={{ flexGrow: 1, textAlign: 'start', whiteSpace: 'nowrap' }}
      >
        {label}
        <LabelTooltipIcon tooltip={labelTooltip} />
      </Typography>
      <Stack direction="row" className="ActionInfo-valueGroup" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'end' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <Typography
              variant={currentValueSize[size]}
              color={currentValueColor ?? 'textTertiary'}
              data-testid={`${testId}-previous`}
              // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions -- Existing violation before enabling this rule.
              data-value={givenFutureValue ? `${givenCurrentValue}` : undefined}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {value}
            </Typography>
            {value != null && (
              <ArrowForwardIcon
                sx={{ color: t => t.palette.text.tertiary, width: IconSize[iconSize], height: IconSize[iconSize] }}
              />
            )}

            <Tooltip title={valueTooltip} placement="top" clickable={!!valueTooltip}>
              {/** Additional stack to add some space between left (icon), value and right (icon) */}
              <Stack
                direction="row"
                className="ActionInfo-value"
                sx={{ alignItems: 'center', gap: Spacing.xxs, whiteSpace: 'nowrap' }}
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
                    value={copyValue ?? futureValue}
                    onClick={copyValue && !loading && !error ? copyToClipboard : undefined}
                  >
                    {typeof loading === 'string' ? loading : error ? '' : (futureValue ?? '-')}
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
      </Stack>
    </Stack>
  )
}
