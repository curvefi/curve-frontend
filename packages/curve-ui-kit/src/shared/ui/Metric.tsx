import { useCallback, useMemo, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import {
  copyToClipboard,
  defaultNumberFormatter,
  formatNumber,
  decomposeNumber,
  type NumberFormatOptions,
  type SxProps,
} from '@ui-kit/utils'
import { Duration } from '../../themes/design/0_primitives'
import { WithSkeleton } from './WithSkeleton'

const { Spacing, IconSize } = SizesAndSpaces

// Correspond to flexbox align items values.
export const ALIGNMENTS = ['start', 'center', 'end'] as const
type Alignment = (typeof ALIGNMENTS)[number]

export const MetricSize = {
  small: 'highlightM',
  medium: 'highlightL',
  large: 'highlightXl',
  extraLarge: 'highlightXxl',
} as const satisfies Record<string, TypographyVariantKey>

export const MetricUnitSize = {
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

export const SIZES = Object.keys(MetricSize) as (keyof typeof MetricSize)[]

type Notional = NumberFormatOptions & {
  value: number
}

/**
 * Converts notional values to a formatted string representation.
 * Handles single numbers, strings, single notional objects, or arrays of notional objects.
 *
 * @param notionals - The notional value(s) to format. Can be:
 *   - A string (returned as-is)
 *   - A number (converted to basic notional object)
 *   - A single Notional object with value, unit, decimals, and formatter
 *   - An array of Notional objects
 * @returns A string with formatted notional values joined by ' + '
 *
 * @example
 * notionalsToString("Custom text") // "Custom text"
 * notionalsToString(1000) // "1000"
 * notionalsToString({ value: 1000, unit: 'dollar' }) // "$1k"
 * notionalsToString([{ value: 1000, unit: 'dollar' }, { value: 50, unit: 'percentage' }]) // "$1k + 50%"
 */
function notionalsToString(notionals: Props['notional']) {
  if (typeof notionals === 'string') return notionals

  const ns =
    typeof notionals === 'number'
      ? [{ value: notionals }]
      : notionals && !Array.isArray(notionals)
        ? [notionals]
        : (notionals ?? [])

  return ns.map((notional) => formatNumber(notional.value, notional)).join(' + ')
}

/** At the moment of writing the default formatter already formats to 2 decimals, but I really want to make this explicit for potential future changes. */
export const formatChange = (value: number): string => defaultNumberFormatter(value, { decimals: 2 })

type MetricValueProps = Pick<Props, 'value' | 'valueOptions' | 'change' | 'testId'> & {
  size: NonNullable<Props['size']>
  tooltip?: Props['valueTooltip']
  copyValue?: () => void
}

const MetricValue = ({ value, valueOptions, change, size, copyValue, tooltip, testId }: MetricValueProps) => {
  const numberValue = useMemo(() => (typeof value === 'number' && isFinite(value) ? value : null), [value])
  const { color = 'textPrimary', ...formattingOptions } = valueOptions
  const { prefix, mainValue, scaleSuffix, suffix } =
    numberValue === null ? {} : decomposeNumber(numberValue, formattingOptions)

  const fontVariant = MetricSize[size]
  const fontVariantUnit = MetricUnitSize[size]

  return (
    <Stack direction="row" gap={Spacing.xxs} alignItems="baseline">
      <Tooltip
        arrow
        placement="bottom"
        onClick={copyValue}
        sx={copyValue && { cursor: 'pointer' }}
        {...tooltip}
        title={tooltip?.title ?? (numberValue !== null ? numberValue.toLocaleString() : t`N/A`)}
        data-testid={`${testId}-value`}
      >
        <Stack direction="row" alignItems="baseline">
          {prefix && (
            <Typography variant={fontVariantUnit} color="textSecondary">
              {prefix}
            </Typography>
          )}

          <Typography variant={fontVariant} color={color}>
            {mainValue ?? t`N/A`}
          </Typography>

          {scaleSuffix && (
            <Typography variant={fontVariant} color="textPrimary" textTransform="capitalize">
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

type Props = {
  /** The actual metric value to display */
  value: number | '' | false | undefined | null
  valueOptions: NumberFormatOptions & { color?: TypographyProps['color'] }

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
  notional?: number | string | Notional | Notional[]

  size?: keyof typeof MetricSize
  alignment?: Alignment
  loading?: boolean
  testId?: string
  sx?: SxProps
}

export const Metric = ({
  value,
  valueOptions = {},
  change,

  label,
  labelTooltip,
  valueTooltip,
  copyText,

  notional,

  size = 'medium',
  alignment = 'start',
  loading = false,
  testId = 'metric',
  sx,
}: Props) => {
  const notionals = useMemo(() => notionalsToString(notional), [notional])

  const [openCopyAlert, setOpenCopyAlert] = useState(false)
  const copyValue = useCallback(() => {
    void copyToClipboard(value!.toString())
    setOpenCopyAlert(true)
  }, [value])

  const metricValueProps: MetricValueProps = useMemo(
    () => ({
      value,
      valueOptions,
      change,
      size,
      copyValue: value != null ? copyValue : undefined,
      tooltip: valueTooltip,
      testId,
    }),
    [change, copyValue, size, testId, value, valueOptions, valueTooltip],
  )

  return (
    <Stack alignItems={alignment} data-testid={testId} sx={sx}>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
        {labelTooltip && (
          <Tooltip arrow placement="top" {...labelTooltip}>
            <span>
              {' '}
              <InfoOutlinedIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
            </span>
          </Tooltip>
        )}
      </Typography>

      <WithSkeleton loading={loading}>
        <MetricValue {...metricValueProps} />
      </WithSkeleton>

      {notionals && (
        <Typography variant="highlightXsNotional" color="textTertiary">
          {notionals}
        </Typography>
      )}

      <Snackbar open={openCopyAlert} onClose={() => setOpenCopyAlert(false)} autoHideDuration={Duration.Snackbar}>
        <Alert variant="filled" severity="success">
          <AlertTitle>{copyText}</AlertTitle>
          {value}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
