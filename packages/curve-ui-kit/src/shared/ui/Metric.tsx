import { useMemo, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { MAX_USD_VALUE } from '@ui/utils/utilsConstants'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { abbreviateNumber, copyToClipboard, scaleSuffix } from '@ui-kit/utils'
import { Duration } from '../../themes/design/0_primitives'
import { WithSkeleton } from './WithSkeleton'

const { Spacing, IconSize } = SizesAndSpaces

// Correspond to flexbox align items values.
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

export const SIZES = Object.keys(MetricSize) as (keyof typeof MetricSize)[]

export type UnitOptions = {
  symbol: string
  position: 'prefix' | 'suffix'
}

const dollar: UnitOptions = { symbol: '$', position: 'prefix' }
const percentage: UnitOptions = { symbol: '%', position: 'suffix' }
const multiplier: UnitOptions = { symbol: 'x', position: 'suffix' }
const UNIT_MAP = { dollar, percentage, multiplier } as const

type Unit = keyof typeof UNIT_MAP | UnitOptions
export const UNITS = Object.keys(UNIT_MAP) as unknown as keyof typeof UNIT_MAP

/** Options for any value being used, whether it's the main value or a notional it doesn't matter */
type Formatting = {
  /** A unit can be a currency symbol or percentage, prefix or suffix */
  unit?: Unit | undefined
  /** The number of decimals the value should contain */
  decimals?: number
  /** If the value should be abbreviated to 1.23k or 3.45m */
  abbreviate?: boolean
  /** Optional formatter for value */
  formatter?: (value: number) => string
}

type Notional = Formatting & {
  value: number
}

// Default value formatter.
const formatValue = (value: number, decimals?: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

// Default notional value formatter.
const formatNotionalValue = (value: number, decimals?: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

const formatChange = (value: number) => {
  // Looks aesthetically more pleasing without decimals.
  if (value === 0) return '0'

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function runFormatter(value: number, formatter: (value: number) => string, abbreviate: boolean, symbol?: string) {
  if (symbol === '$' && value > MAX_USD_VALUE) {
    console.warn(`USD value is too large: ${value}`)
    return `?`
  }
  return formatter(abbreviate ? abbreviateNumber(value) : value)
}

/**
 * Converts notional values to a formatted string representation.
 * Handles single numbers, single notional objects, or arrays of notional objects.
 *
 * @param notionals - The notional value(s) to format. Can be:
 *   - A number (converted to basic notional object)
 *   - A single Notional object with value, unit, decimals, and formatter
 *   - An array of Notional objects
 * @returns A string with formatted notional values joined by ' + '
 *
 * @example
 * notionalsToString(1000) // "1000"
 * notionalsToString({ value: 1000, unit: 'dollar' }) // "$1k"
 * notionalsToString([{ value: 1000, unit: 'dollar' }, { value: 50, unit: 'percentage' }]) // "$1k + 50%"
 */
function notionalsToString(notionals: Props['notional']) {
  const ns =
    typeof notionals === 'number'
      ? [{ value: notionals }]
      : notionals && !Array.isArray(notionals)
        ? [notionals]
        : (notionals ?? [])

  return ns
    .map((notional) => {
      const {
        value,
        abbreviate = true,
        decimals = 1,
        formatter = (value: number) => formatNotionalValue(value, decimals),
      } = notional
      const { symbol, position } = typeof notional.unit === 'string' ? UNIT_MAP[notional.unit] : (notional.unit ?? {})

      return [
        position === 'prefix' ? symbol : '',
        formatter(abbreviate ? abbreviateNumber(value) : value),
        abbreviate ? scaleSuffix(value) : '',
        position === 'suffix' ? symbol : '',
      ]
        .filter(Boolean)
        .join('')
    })
    .join(' + ')
}

type MetricValueProps = Pick<Props, 'value'> &
  Required<Omit<Formatting, 'decimals' | 'unit'>> & {
    color?: Props['valueOptions']['color']
    change?: number
    unit: UnitOptions | undefined
    size: keyof typeof MetricSize
    fontVariant: TypographyVariantKey
    fontVariantUnit: TypographyVariantKey
    copyValue: () => void
    tooltip?: Props['valueTooltip']
  }

const MetricValue = ({
  value,
  formatter,
  abbreviate,
  change,
  unit,
  size,
  fontVariant,
  fontVariantUnit,
  color,
  copyValue,
  tooltip,
}: MetricValueProps) => {
  const numberValue: number | null = useMemo(() => {
    if (typeof value === 'number' && isFinite(value)) {
      return value
    }
    return null
  }, [value])

  const { symbol, position } = unit ?? {}

  return (
    <Stack direction="row" gap={Spacing.xxs} alignItems="baseline">
      <Tooltip
        arrow
        placement="bottom"
        onClick={copyValue}
        sx={{ cursor: 'pointer' }}
        {...tooltip}
        title={tooltip?.title ?? (numberValue !== null ? numberValue.toLocaleString() : t`N/A`)}
      >
        <Stack direction="row" alignItems="baseline">
          {position === 'prefix' && numberValue !== null && (
            <Typography variant={fontVariantUnit} color="textSecondary">
              {symbol}
            </Typography>
          )}

          <Typography variant={fontVariant} color={color ?? 'textPrimary'}>
            {useMemo(
              () => (numberValue === null ? t`N/A` : runFormatter(numberValue, formatter, abbreviate, symbol)),
              [numberValue, formatter, abbreviate, symbol],
            )}
          </Typography>

          {numberValue !== null && abbreviate && (
            <Typography variant={fontVariant} color="textPrimary" textTransform="capitalize">
              {scaleSuffix(numberValue)}
            </Typography>
          )}

          {position === 'suffix' && numberValue !== null && (
            <Typography variant={fontVariantUnit} color="textSecondary">
              {symbol}
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
  valueOptions: Formatting & { color?: TypographyProps['color'] }

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
  notional?: number | Notional | Notional[]

  size?: keyof typeof MetricSize
  alignment?: Alignment
  loading?: boolean
  testId?: string
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
  testId,
}: Props) => {
  const {
    color,
    abbreviate = true,
    decimals = 1,
    formatter = (value: number) => formatValue(value, decimals),
  } = valueOptions
  const unit = typeof valueOptions.unit === 'string' ? UNIT_MAP[valueOptions.unit] : valueOptions.unit

  const notionals = useMemo(() => notionalsToString(notional), [notional])

  const [openCopyAlert, setOpenCopyAlert] = useState(false)

  const copyValue = () => {
    if (value) {
      void copyToClipboard(value.toString())
    }
    setOpenCopyAlert(true)
  }

  const metricValueProps: MetricValueProps = {
    value,
    abbreviate,
    unit,
    change,
    formatter,
    size,
    color,
    fontVariant: MetricSize[size],
    fontVariantUnit: MetricUnitSize[size],
    copyValue,
    tooltip: valueTooltip,
  }

  return (
    <Stack alignItems={alignment} data-testid={testId}>
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
