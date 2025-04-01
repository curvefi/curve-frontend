import { useMemo, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MAX_USD_VALUE } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TypographyVariantKey } from '@ui-kit/themes/typography'
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

export const SIZES = Object.keys(MetricSize) as (keyof typeof MetricSize)[]

type UnitOptions = {
  symbol: string
  position: 'prefix' | 'suffix'
  abbreviate: boolean
}

const dollar: UnitOptions = {
  symbol: '$',
  position: 'prefix',
  abbreviate: true,
}

const percentage: UnitOptions = {
  symbol: '%',
  position: 'suffix',
  abbreviate: false,
}

export const UNITS = ['dollar', 'percentage'] as const
type Unit = (typeof UNITS)[number] | UnitOptions

const UNIT_MAP: Record<(typeof UNITS)[number], UnitOptions> = {
  dollar,
  percentage,
} as const

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

type MetricValueProps = Required<Pick<Props, 'value' | 'formatter' | 'abbreviate'>> & {
  change?: number
  unit: UnitOptions | undefined
  fontVariant: TypographyVariantKey
  fontVariantUnit: TypographyVariantKey
  copyValue: () => void
}

function runFormatter(value: number, formatter: (value: number) => string, abbreviate: boolean, symbol?: string) {
  if (symbol === '$' && value > MAX_USD_VALUE) {
    console.warn(`USD value is too large: ${value}`)
    return `?`
  }
  return formatter(abbreviate ? abbreviateNumber(value) : value)
}

const MetricValue = ({
  value,
  formatter,
  change,
  abbreviate,
  unit,
  fontVariant,
  fontVariantUnit,
  copyValue,
}: MetricValueProps) => (
  <Stack direction="row" gap={Spacing.xxs} alignItems="baseline">
    <Tooltip arrow placement="bottom" title={value.toLocaleString()} onClick={copyValue} sx={{ cursor: 'pointer' }}>
      <Stack direction="row" alignItems="baseline">
        {unit?.position === 'prefix' && (
          <Typography variant={fontVariantUnit} color="textSecondary">
            {unit.symbol}
          </Typography>
        )}

        <Typography variant={fontVariant} color="textPrimary">
          {useMemo(
            () => runFormatter(value, formatter, abbreviate, unit?.symbol),
            [formatter, abbreviate, value, unit?.symbol],
          )}
        </Typography>

        {abbreviate && (
          <Typography variant={fontVariant} color="textPrimary" textTransform="capitalize">
            {scaleSuffix(value)}
          </Typography>
        )}

        {unit?.position === 'suffix' && (
          <Typography variant={fontVariantUnit} color="textSecondary">
            {unit.symbol}
          </Typography>
        )}
      </Stack>
    </Tooltip>

    {(change || change === 0) && (
      <Typography variant="highlightM" color={change > 0 ? 'success' : change < 0 ? 'error' : 'textHighlight'}>
        {formatChange(change)}%
      </Typography>
    )}
  </Stack>
)

type Props = {
  /** The actual metric value to display */
  value: number
  /** A unit can be a currency symbol or percentage, prefix or suffix */
  unit?: Unit | undefined
  /** The number of decimals the value should contain */
  decimals?: number
  /** If the value should be abbreviated to 1.23k or 3.45m */
  abbreviate?: boolean
  /** Optional value that denotes a change in metric value since 'last' time */
  change?: number
  /** Optional formatter for metric value */
  formatter?: (value: number) => string

  /** Label that goes above the value */
  label: string
  /** Optional tooltip content shown next to the label */
  tooltip?: string
  /** The text to display when the value is copied to the clipboard */
  copyText?: string

  /** Notional values give extra context to the metric, like underlying value */
  notional?: number
  notionalFormatter?: (value: number) => string
  notionalAbbreviate?: boolean
  notionalDecimals?: number
  notionalUnit?: Unit

  size?: keyof typeof MetricSize
  alignment?: Alignment
  loading?: boolean
}

export const Metric = ({
  value,
  unit,
  abbreviate,
  change,
  decimals = 1,
  formatter = (value: number) => formatValue(value, decimals),

  label,
  tooltip,
  copyText,

  notional,
  notionalFormatter = (value: number) => formatNotionalValue(value, notionalDecimals),
  notionalAbbreviate,
  notionalUnit,
  notionalDecimals,

  size = 'medium',
  alignment = 'start',
  loading = false,
}: Props) => {
  unit = typeof unit === 'string' ? UNIT_MAP[unit] : unit
  abbreviate ??= unit?.abbreviate ?? false

  notionalUnit = typeof notionalUnit === 'string' ? UNIT_MAP[notionalUnit] : notionalUnit
  notionalAbbreviate ??= notionalUnit?.abbreviate ?? false

  const [openCopyAlert, setOpenCopyAlert] = useState(false)

  const copyValue = () => {
    copyToClipboard(value.toString())
    setOpenCopyAlert(true)
  }

  const metricValueProps = {
    value,
    unit,
    abbreviate,
    change,
    formatter,
    fontVariant: MetricSize[size],
    fontVariantUnit: MetricUnitSize[size],
    copyValue,
  }

  return (
    <Stack alignItems={alignment}>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
        {tooltip && (
          <Tooltip arrow placement="top" title={tooltip}>
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

      {notional !== undefined && (
        <Typography variant="highlightXsNotional" color="textTertiary">
          {notionalUnit?.position === 'prefix' && notionalUnit.symbol}
          {notionalFormatter(notionalAbbreviate ? abbreviateNumber(notional) : notional)}
          {notionalAbbreviate && scaleSuffix(notional)}
          {notionalUnit?.position === 'suffix' && notionalUnit.symbol}
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
