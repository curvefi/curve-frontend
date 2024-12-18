import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { TypographyVariantKey, TYPOGRAPHY_VARIANTS } from 'curve-ui-kit/src/themes/typography'
import { abbreviateNumber, scaleSuffix } from 'curve-ui-kit/src/utils'

const { Spacing } = SizesAndSpaces

// Correspond to flexbox align items values.
export const ALIGNMENTS = ['start', 'center', 'end'] as const
type Alignment = (typeof ALIGNMENTS)[number]

const MetricSize = {
  small: 'highlightM',
  medium: 'highlightL',
  large: 'highlightXl',
  extraLarge: 'highlightXxl',
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

type Props = {
  /** Label that goes above the value */
  label: string

  /** The actual metric value to display */
  value: number
  /** Optional formatter for metric value */
  formatter?: (value: number) => string
  /** If the value should be abbreviated to 1.23k or 3.45m */
  abbreviate?: boolean
  /** The number of decimals the value should contain */
  decimals?: number
  /** A unit can be a currency symbol or percentage, prefix or suffix */
  unit?: Unit

  /** Optional value that denotes a change in metric value since 'last' time */
  change?: number

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
  label,

  value,
  formatter = (value: number) => formatValue(value, decimals),
  abbreviate,
  unit,
  decimals = 1,

  change,

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

  return (
    <Box display="flex" flexDirection="column" alignItems={alignment} gap={Spacing.xs}>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
      </Typography>

      {loading ? (
        <Skeleton
          variant="text"
          width="100%"
          sx={{
            fontSize: TYPOGRAPHY_VARIANTS[MetricSize[size]],
          }}
        />
      ) : (
        <Box display="flex" gap={Spacing.xs} alignItems="baseline">
          <Tooltip arrow title={value.toLocaleString()}>
            <Box display="flex" gap={Spacing.xxs} alignItems="baseline">
              {unit?.position === 'prefix' && (
                <Typography variant={MetricSize[size]} color="textSecondary">
                  {unit.symbol}
                </Typography>
              )}

              <Typography variant={MetricSize[size]} color="textPrimary">
                {formatter(abbreviate ? abbreviateNumber(value) : value)}
              </Typography>

              {abbreviate && (
                <Typography variant={MetricSize[size]} color="textPrimary" textTransform="capitalize">
                  {scaleSuffix(value)}
                </Typography>
              )}

              {unit?.position === 'suffix' && (
                <Typography variant={MetricSize[size]} color="textSecondary">
                  {unit.symbol}
                </Typography>
              )}
            </Box>
          </Tooltip>

          {(change || change === 0) && (
            <Typography
              variant="highlightM"
              color={change > 0 ? 'success' : change < 0 ? 'error' : 'textHighlight'}
              sx={{ marginInlineStart: Spacing.xs }} // Not part of Figma, but my own addition
            >
              {formatChange(change)}%
            </Typography>
          )}
        </Box>
      )}

      {notional !== undefined && (
        <Typography variant="highlightXsNotional" color="textTertiary">
          {notionalUnit?.position === 'prefix' && notionalUnit.symbol}
          {notionalFormatter(notionalAbbreviate ? abbreviateNumber(notional) : notional)}
          {notionalAbbreviate && scaleSuffix(notional)}
          {notionalUnit?.position === 'suffix' && notionalUnit.symbol}
        </Typography>
      )}
    </Box>
  )
}
