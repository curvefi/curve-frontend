import type { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { IconButtonProps } from '@mui/material/IconButton'
import Stack, { type StackProps } from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { IconButtonIconSize } from '@ui-kit/themes/components/button'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { type QueryOrValue, toQuery, toValue } from '@ui-kit/types/util'
import { applySxProps } from '@ui-kit/utils'
import { LabelTooltipIcon } from '../LabelTooltipIcon'
import { Tooltip, type TooltipProps } from '../Tooltip'
import { WithSkeleton } from '../WithSkeleton'
import { WithWrapper } from '../WithWrapper'

const { Spacing, ButtonSize, IconSize } = SizesAndSpaces

export type ActionInfoSize = 'small' | 'medium'

export type ActionInfoProps = {
  /** Label displayed on the left side */
  label: QueryOrValue<ReactNode>
  /** Optional tooltip content shown next to the label with an info icon */
  labelTooltip?: Omit<TooltipProps, 'children'>
  /** Custom color for the label text */
  labelColor?: TypographyProps['color']
  /** Custom color for the primary displayed value text */
  valueColor?: TypographyProps['color']
  /** Optional content to display to the left of the value */
  valueLeft?: QueryOrValue<ReactNode>
  /** Optional content to display to the right of the value */
  valueRight?: QueryOrValue<ReactNode>
  /** Tooltip text to display when hovering over the value */
  valueTooltip?: QueryOrValue<ReactNode>
  /** Value to copy from the primary displayed value when clicked. */
  copyValue?: string
  /** Size of the component */
  size?: ActionInfoSize
  /** Test ID for the component */
  testId?: string
  /** Additional styles */
  sx?: StackProps['sx']

  /** Current Query whose data is the primary value to display and copy. */
  value: QueryOrValue<ReactNode>
  /** Query whose data is the expected value after the action. */
  futureValue?: QueryOrValue<ReactNode>
  /** Custom color for the current value text. */
  currentValueColor?: TypographyProps['color']
  /** Skeleton dimensions or fallback value */
  skeleton?: [number, number] | string
}

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

type ValueDecoratorProps = Pick<ActionInfoProps, 'size' | 'value' | 'valueColor' | 'testId'>

const ValueTypography = ({
  size = DEFAULT_SIZE,
  valueColor,
  children,
  testId,
  value,
  onClick,
}: ValueDecoratorProps & {
  children: ReactNode
  onClick?: () => void
}) => {
  const { error, data } = toQuery(value)
  return (
    <Typography
      variant={valueSize[size]}
      color={error ? 'error' : (valueColor ?? 'textPrimary')}
      component="div"
      data-testid={testId}
      data-value={data}
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
}

/** Renders a value as a typography (same variant and color as the main value) if it's a string, otherwise renders the value directly */
const ValueDecorator = (props: ValueDecoratorProps) => (
  <WithWrapper shouldWrap={typeof toValue(props.value) === 'string'} Wrapper={ValueTypography} {...props}>
    {toValue(props.value)}
  </WithWrapper>
)

export const ActionInfo = (props: ActionInfoProps) => {
  const {
    label,
    labelTooltip,
    labelColor,
    futureValue: propFutureValue,
    currentValueColor,
    value: propValue,
    valueColor,
    valueLeft,
    valueRight,
    valueTooltip,
    size = DEFAULT_SIZE,
    copyValue,
    testId = 'action-info',
    sx,
    skeleton,
  } = props
  const { data: givenCurrentValue, isLoading: valueLoading, error: valueError } = toQuery(propValue)
  const givenFutureValue = toQuery(propFutureValue)

  const buttonSize = iconButtonSize[size]
  const iconSize = IconButtonIconSize[buttonSize]
  const tooltip = toValue(valueTooltip)

  const error = givenFutureValue?.error ?? valueError
  const isLoading = valueLoading || givenFutureValue?.isLoading
  const futureValue = givenFutureValue?.data ?? givenCurrentValue
  const value = futureValue === givenCurrentValue ? null : givenCurrentValue

  const copyToClipboard = useCopyToClipboard({ copyText: copyValue })

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
        {toValue(label)}
        <LabelTooltipIcon tooltip={labelTooltip} />
      </Typography>
      <Stack direction="row" className="ActionInfo-valueGroup" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'end' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <Typography
              variant={currentValueSize[size]}
              color={currentValueColor ?? 'textTertiary'}
              data-testid={`${testId}-previous`}
              data-value={
                givenFutureValue
                  ? typeof givenCurrentValue == 'object'
                    ? 'Object'
                    : `${givenCurrentValue}`
                  : undefined
              }
              sx={{ whiteSpace: 'nowrap' }}
            >
              {value}
            </Typography>
            {value != null && (
              <ArrowForwardIcon
                sx={{ color: t => t.palette.text.tertiary, width: IconSize[iconSize], height: IconSize[iconSize] }}
              />
            )}

            <Tooltip title={tooltip} placement="top" clickable={!!tooltip}>
              {/** Additional stack to add some space between left (icon), value and right (icon) */}
              <Stack
                direction="row"
                className="ActionInfo-value"
                sx={{ alignItems: 'center', gap: Spacing.xxs, whiteSpace: 'nowrap' }}
              >
                <ValueDecorator value={valueLeft} size={size} valueColor={valueColor} testId={`${testId}-left`} />

                <WithSkeleton
                  component="div"
                  loading={isLoading}
                  {...(Array.isArray(skeleton)
                    ? { width: skeleton[0], height: skeleton[1] }
                    : { width: '2ch', height: '1rem' })}
                >
                  <ValueTypography
                    size={size}
                    valueColor={valueColor}
                    testId={`${testId}-value`}
                    value={copyValue ?? futureValue}
                    onClick={copyValue && !isLoading && !error ? copyToClipboard : undefined}
                  >
                    {typeof isLoading === 'string' ? isLoading : error ? '' : (futureValue ?? '-')}
                  </ValueTypography>
                </WithSkeleton>
              </Stack>
            </Tooltip>
          </Stack>
          <ValueDecorator value={valueRight} size={size} valueColor={valueColor} testId={`${testId}-right`} />
        </Stack>

        {error && <ErrorIconButton error={error} size={buttonSize} />}
      </Stack>
    </Stack>
  )
}
