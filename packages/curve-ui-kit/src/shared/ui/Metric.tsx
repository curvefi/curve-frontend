import { type ReactNode, useCallback, useMemo } from 'react'
import { type ButtonProps } from '@mui/material/Button'
import Stack, { StackProps } from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { useBreakpoint } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import type { MakeOptional, QueryProp } from '@ui-kit/types/util'
import {
  applySxProps,
  copyToClipboard,
  decomposeNumber,
  defaultNumberFormatter,
  formatNumber,
  type NumberFormatOptions,
  type SxProps,
} from '@ui-kit/utils'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'
import { LabelTooltipIcon } from './LabelTooltipIcon'
import { METRIC_CATEGORIES, type MetricCategory, type MetricLayout } from './metric-categories'
import { WithSkeleton } from './WithSkeleton'
import { WithWrapper } from './WithWrapper'

const {
  Spacing,
  Metric: { horizontal: metricHorizontalSizes },
} = SizesAndSpaces

// Correspond to flexbox align items values.
// eslint-disable-next-line react-refresh/only-export-components
export const ALIGNMENTS = ['start', 'center', 'end'] as const
type Alignment = (typeof ALIGNMENTS)[number]

const MetricSize = {
  small: 'highlightM',
  medium: 'highlightL',
  large: 'highlightXl',
  extraLarge: 'highlightXxl',
} as const satisfies Record<string, TypographyVariantKey>

const MetricUnitSize = {
  small: 'highlightXs',
  medium: 'highlightS',
  large: 'highlightM',
  extraLarge: 'highlightL',
} as const satisfies Record<string, TypographyVariantKey>

const MetricChangeSize = {
  small: 'highlightXs',
  medium: 'highlightM',
  large: 'highlightM',
  extraLarge: 'highlightM',
} as const satisfies Record<string, TypographyVariantKey>

const MetricButtonSize = {
  small: 'extraSmall',
  medium: 'extraSmall',
  large: 'small',
  extraLarge: 'medium',
} satisfies Record<keyof typeof MetricSize, ButtonProps['size']>

const MetricMinHeight = {
  small: metricHorizontalSizes.sm,
  medium: metricHorizontalSizes.md,
  large: metricHorizontalSizes.lg,
  extraLarge: metricHorizontalSizes.xl,
} satisfies Record<keyof typeof MetricSize, string>

const ORIENTATION_STYLE = {
  horizontal: {
    direction: 'row',
    alignItems: () => 'baseline',
    labelVariant: 'bodyMRegular',
    labelColor: 'textSecondary',
  },
  vertical: {
    direction: 'column',
    alignItems: (alignment: Alignment) => alignment,
    labelVariant: 'bodyXsRegular',
    labelColor: 'textTertiary',
  },
} as const satisfies Record<
  MetricLayout['orientation'],
  {
    direction: StackProps['direction']
    alignItems: (alignment: Alignment) => 'baseline' | Alignment
    labelVariant: TypographyVariantKey
    labelColor: TypographyProps['color']
  }
>

type Notional = Omit<NumberFormatOptions, 'abbreviate'> & {
  value: Amount
  abbreviate?: boolean // Defaults to true
}

const formatNotional = (notional: number | string | Notional | null | undefined) =>
  notional == null
    ? formatNumber(null, 'usd.notional')
    : typeof notional === 'string'
      ? notional
      : typeof notional === 'number'
        ? formatNumber(notional, { abbreviate: true })
        : formatNumber(notional.value, { abbreviate: true, ...notional })

/** At the moment of writing the default formatter already formats to 2 decimals, but I really want to make this explicit for potential future changes. */
const formatChange = (value: number): string => defaultNumberFormatter(value, { decimals: 2 })

/**
 * MUI Typography resolves the `color` prop through registered theme color names.
 * Hex values need to be applied as CSS to avoid being treated as unresolved theme colors.
 */
const getTypographyColorProps = (color: TypographyProps['color']) =>
  typeof color === 'string' && color.startsWith('#') ? { sx: { color } } : { color }

type MetricValueProps = Pick<MetricProps, 'valueOptions' | 'change' | 'testId'> & {
  value: Amount | null
  size: MetricLayout['size']
  tooltip?: MetricProps['valueTooltip']
  copyValue?: () => void
}

const MetricValue = ({ value, valueOptions = {}, change, size, copyValue, tooltip, testId }: MetricValueProps) => {
  const numberValue = useMemo(() => ((value || value === 0) && isFinite(Number(value)) ? Number(value) : null), [value])
  const { color = 'textPrimary', abbreviate = true, fallback = t`N/A`, ...formattingOptions } = valueOptions
  const { prefix, mainValue, scaleSuffix, suffix } =
    numberValue === null ? {} : decomposeNumber(numberValue, { ...formattingOptions, abbreviate })

  const fontVariant = MetricSize[size]
  const fontVariantUnit = MetricUnitSize[size]
  const valueColorProps = getTypographyColorProps(color)

  return (
    <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'baseline' }}>
      <Tooltip
        arrow
        placement="bottom"
        onClick={copyValue}
        sx={copyValue && { cursor: 'pointer' }}
        {...tooltip}
        title={tooltip?.title ?? (numberValue == null ? fallback : numberValue.toLocaleString())}
        data-testid={`${testId}-value`}
        data-value={value}
      >
        <Stack direction="row" sx={{ alignItems: 'baseline' }}>
          {prefix && (
            <Typography variant={fontVariantUnit} color="textSecondary">
              {prefix}
            </Typography>
          )}

          <Typography variant={fontVariant} {...valueColorProps}>
            {mainValue ?? fallback}
          </Typography>

          {scaleSuffix && (
            <Typography
              variant={fontVariant}
              {...valueColorProps}
              sx={applySxProps(valueColorProps.sx, { textTransform: 'capitalize' })}
            >
              {scaleSuffix}
            </Typography>
          )}

          {suffix && (
            <Typography variant={fontVariantUnit} color="textSecondary">
              {suffix}
            </Typography>
          )}
        </Stack>
      </Tooltip>
      {(change || change === 0) && (
        <Typography
          variant={MetricChangeSize[size]}
          color={change > 0 ? 'success' : change < 0 ? 'error' : 'textHighlight'}
        >
          {formatChange(change)}%
        </Typography>
      )}
    </Stack>
  )
}

const NotionalTypography = ({ children }: { children: ReactNode }) => (
  <Typography variant="highlightXsNotional" color="textTertiary">
    {children}
  </Typography>
)

export type MetricProps = {
  /** The actual metric value to display */
  value: QueryProp<MetricValueProps['value']>
  valueOptions?: MakeOptional<NumberFormatOptions, 'abbreviate'> /* defaults to true */ & {
    color?: TypographyProps['color']
  }

  /** Optional value that denotes a change in metric value since 'last' time */
  change?: number
  /** Label that goes above the value */
  label: string
  /** Optional tooltip content shown next to the label with an info icon */
  labelTooltip?: Omit<TooltipProps, 'children'>
  /** Optional replacement tooltip content shown when hovering over the value */
  valueTooltip?: Omit<TooltipProps, 'children'>
  /** The text to display when the value is copied to the clipboard */
  copyText?: string

  /** Notional values give extra context to the metric, like underlying value */
  notional?: QueryProp<number | string | Notional | null>

  /** Optional icon shown after the value in vertical orientation and before the label in the horizontal orientation. */
  icon?: ReactNode

  size?: keyof typeof MetricSize
  category: MetricCategory
  alignment?: Alignment
  testId?: string
  sx?: SxProps
}

export const Metric = ({
  value: { error, data, isLoading },
  valueOptions = {},
  change,

  label,
  labelTooltip,
  valueTooltip,
  copyText = t`Value has been copied to clipboard`,

  notional,

  icon,

  category,
  alignment = 'start',
  testId = 'metric',
  sx,
}: MetricProps) => {
  const breakpoint = useBreakpoint()
  const { orientation, size } = METRIC_CATEGORIES[category][breakpoint]
  const orientationStyle = ORIENTATION_STYLE[orientation]
  const isHorizontal = orientation === 'horizontal'
  const notionals = notional && (
    <WithSkeleton loading={notional.isLoading}>
      <Typography variant="highlightXsNotional" color="textTertiary">
        {error && <ErrorIconButton size="extraExtraSmall" error={error} />}
        {formatNotional(notional.data) ?? (notional.isLoading && 'placeholder')}
      </Typography>
    </WithSkeleton>
  )
  const copyValue = useCallback(() => {
    if (data || data === 0) {
      void copyToClipboard(data.toString())
      showToast({ title: copyText, message: data, severity: 'info' })
    }
  }, [data, copyText])

  return (
    <Stack
      data-testid={testId}
      direction={orientationStyle.direction}
      sx={applySxProps(
        { alignItems: orientationStyle.alignItems(alignment) },
        isHorizontal && {
          justifyContent: 'space-between',
          alignSelf: 'stretch',
          columnGap: Spacing.sm,
          minHeight: MetricMinHeight[size],
        },
        sx,
      )}
    >
      <WithWrapper
        shouldWrap={isHorizontal}
        Wrapper={Stack}
        direction="row"
        sx={{ alignItems: 'baseline', flexShrink: 0 }}
      >
        {isHorizontal && icon}
        <Typography variant={orientationStyle.labelVariant} color={orientationStyle.labelColor}>
          {label}
          <LabelTooltipIcon tooltip={labelTooltip} />
        </Typography>
      </WithWrapper>
      <WithSkeleton loading={isLoading}>
        <Stack
          direction="row"
          sx={applySxProps(
            { alignItems: 'baseline' },
            isHorizontal && {
              flexWrap: 'wrap',
              gap: Spacing.xxs,
              justifyContent: 'flex-end',
            },
          )}
        >
          {/* Keep error state vertical rhythm aligned with regular metric values by inheriting metric typography sizing. */}
          {error ? (
            <ErrorIconButton size={MetricButtonSize[size]} error={error} />
          ) : (
            <>
              <MetricValue
                value={data ?? null}
                valueOptions={valueOptions}
                change={change}
                size={size}
                copyValue={data || data === 0 ? copyValue : undefined}
                tooltip={valueTooltip}
                testId={testId}
              />
              {!isHorizontal && icon}
            </>
          )}
          {isHorizontal && notionals && <NotionalTypography>{notionals}</NotionalTypography>}
        </Stack>
      </WithSkeleton>
      {!isHorizontal && notionals && <NotionalTypography>{notionals}</NotionalTypography>}
    </Stack>
  )
}
