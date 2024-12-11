import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from 'themes/design/1_sizes_spaces'
import { Fonts } from 'themes/typography/fonts'

export const SIZES = ['small', 'medium', 'large', 'extraLarge'] as const
type Size = (typeof SIZES)[number]

// Correspond to flexbox align items values.
export const ALIGNMENTS = ['start', 'center', 'end'] as const
type Alignment = (typeof ALIGNMENTS)[number]

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

// I don't know if this is the right place or approach for size mapping.
// Perhaps it's suited somewhere better in the design folder.
const SizeMapping: Record<Size, string> = {
  small: 'highlightM',
  medium: 'highlightL',
  large: 'highlightXl',
  extraLarge: 'highlightXxl',
}

/**
 * Returns the appropriate unit suffix for a given number value.
 *
 * @param value - The number to determine the unit for.
 * @returns The unit suffix as a string ('t' for trillion, 'b' for billion, 'm' for million, 'k' for thousand, or '' for smaller values).
 *
 * @example
 * unit(1500000000000) // Returns 't'
 * unit(2000000000) // Returns 'b'
 * unit(3000000) // Returns 'm'
 * unit(4000) // Returns 'k'
 * unit(500) // Returns ''
 * unit(-1000000) // Returns 'm'
 * unit(0) // Returns ''
 */
function suffix(value: number): string {
  const units = ['', 'k', 'm', 'b', 't']
  const index = Math.max(0, Math.min(units.length - 1, Math.floor(Math.log10(Math.abs(value)) / 3)))

  return units[index]
}

/**
 * Abbreviates a number such that it can go along with a suffix like k, m, b or t.
 *
 * @example
 * round(1234.5678) // Returns "1.23", goes with suffix "k"
 * round(1000000) // Returns "1.0", goes with suffix "m"
 */
function abbr(value: number): number {
  const exp = Math.floor(Math.log10(Math.abs(value)) / 3) * 3
  // Only apply the scaling if exp is positive
  value /= exp > 0 ? 10 ** exp : 1

  return value
}

// Default value formatter.
const formatValue = (value: number, decimals: number): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Default notional value formatter.
const formatNotionalValue = (value: number): string => {
  return value.toLocaleString()
}

type Props = {
  /** Label that goes above the value */
  label: string
  /** The actual metric value to display */
  value: number
  /** Optional formatter for metric value */
  valueFormatter?: (value: number) => string
  /** If the value should be abbreviated to 1.23k or 3.45m */
  abbreviate?: boolean
  /** The number of decimals the value should contain */
  decimals?: number
  /** A unit can be a currency symbol or percentage, prefix or suffix */
  unit?: Unit
  /** Optional value that denotes a change in metric value since 'last' time */
  change?: number
  //TODO: add optional change unit.
  /** Whether or not to show the notional label below the metric value */
  notional?: boolean
  /** TODO: make this a unit */
  notionalSymbol?: string
  /** Optional formatter for notional value */
  notionalFormatter?: (value: number) => string
  size?: Size
  alignment?: Alignment
}

export const Metric = ({
  label,
  value,
  valueFormatter = (value: number) => formatValue(value, decimals),
  abbreviate,
  decimals = 1,
  change,
  unit: unitProp,
  notional = false,
  notionalFormatter = formatNotionalValue,
  notionalSymbol,
  size = 'medium',
  alignment = 'start',
}: Props) => {
  const unit = typeof unitProp === 'string' ? UNIT_MAP[unitProp as keyof typeof UNIT_MAP] : unitProp
  const shouldAbbreviate = abbreviate ?? unit?.abbreviate ?? false
  const showSuffix = shouldAbbreviate && unit?.position !== 'suffix'

  return (
    <Box display="flex" flexDirection="column" alignItems={alignment} gap={SizesAndSpaces.Spacing.xs}>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
      </Typography>

      <Box display="flex" alignItems="baseline" gap={SizesAndSpaces.Spacing.xxs}>
        {unit?.position === 'prefix' && (
          <Typography variant={SizeMapping[size]} fontFamily={Fonts['Mona Sans']} color="textSecondary">
            {unit.symbol}
          </Typography>
        )}

        <Typography variant={SizeMapping[size]} fontFamily={Fonts['Mona Sans']} color="textPrimary">
          {valueFormatter(shouldAbbreviate ? abbr(value) : value)}
        </Typography>

        {showSuffix && (
          <Typography
            variant={SizeMapping[size]}
            fontFamily={Fonts['Mona Sans']}
            color="textPrimary"
            textTransform="capitalize"
          >
            {suffix(value)}
          </Typography>
        )}

        {unit?.position === 'suffix' && (
          <Typography variant={SizeMapping[size]} fontFamily={Fonts['Mona Sans']} color="textSecondary">
            {unit.symbol}
          </Typography>
        )}

        {(change || change === 0) && (
          <Typography
            variant="highlightM"
            fontFamily={Fonts['Mona Sans']}
            color={change > 0 ? 'success' : change < 0 ? 'error' : 'info'}
          >
            {change}%
          </Typography>
        )}
      </Box>

      {notional && (
        <Typography variant="highlightXsNotional" fontFamily={Fonts['Mona Sans']} color="textTertiary">
          {notionalFormatter(value)}
          {notionalSymbol ? ` ${notionalSymbol}` : ''}
        </Typography>
      )}
    </Box>
  )
}
