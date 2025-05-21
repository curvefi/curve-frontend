import Stack from '@mui/material/Stack'
import type Typography from '@mui/material/Typography'
import { GasIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

/**
 * Formats a number to a specified number of decimal places using locale string formatting.
 * Automatically removes trailing zeros for cleaner display.
 *
 * @param x - The number to format (returns '-' if null/undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string or '-' for null/undefined values
 */
const formatValue = (x?: number, decimals: number = 2) =>
  x == null
    ? '-'
    : x.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })

type Token = { symbol: string; amount: number }

/**
 * Formats collateral into a readable string representation.
 * Handles both single collateral objects and arrays of collateral.
 * For arrays, concatenates all entries with ' + ' separator.
 * Uses abbreviateNumber and scaleSuffix for compact number formatting.
 *
 * @param collateral - Single collateral object or array of collateral objects
 * @returns Formatted string combining all collateral values and symbols
 *
 * @example
 * formatCollateral({ symbol: 'ETH', amount: 10.5 })
 * // Returns: "10.5 ETH"
 *
 * formatCollateral({ symbol: 'USDC', amount: 1500000 })
 * // Returns: "1.5m USDC"
 *
 * formatCollateral([
 *   { symbol: 'ETH', amount: 10.5 },
 *   { symbol: 'BTC', amount: 2500000 }
 * ])
 * // Returns: "10.5 ETH + 2.5m BTC"
 */
const formatCollateral = (collateral: Token | Token[]) =>
  (Array.isArray(collateral) ? collateral : [collateral])
    .map((x) => `${abbreviateNumber(x.amount)}${scaleSuffix(x.amount)} ${x.symbol}`)
    .join(' + ')

/**
 * Determines the color for displaying new health values based on comparison with old values.
 *
 * @param health - Health object containing old value and optional new value
 * @returns Typography color:
 *   - 'textPrimary' if new value is null/undefined or zero
 *   - 'error' if new value is less than old value (health decreased)
 *   - 'success' if new value is greater than or equal to old value (health improved/maintained)
 */
const newHealthColor = (health: Props['health']): React.ComponentProps<typeof Typography>['color'] =>
  health.new == null || health.new === 0 ? 'textPrimary' : health.new < health.old ? 'error' : 'success'

/**
 * Props for ActionInfos component.
 *
 * Each property represents a line item in the accordion. Properties with old/new structure
 * will display comparisons with previous values. Optional properties only render when provided.
 */
export type Props = {
  /** Health values with old value and optional new value */
  health: { old: number; new?: number }
  /** Borrow rate values with old value and optional new value */
  borrowRate: { old: number; new?: number }
  /** Debt token with amount and optional new amount for comparison */
  debt: Token & { new?: number }
  /** Array of collateral assets - only renders when provided */
  collateral?: Token[]
  /** LTV values with old value and optional new value */
  ltv: { old: number; new?: number }
  /** Leverage values with old value and optional new value */
  leverage: { old: number; new?: number }
  /** Borrowed collateral token information */
  borrowedCollateral: Token
  /** Assets to withdraw - only renders when provided */
  assetsToWithdraw?: Token[]
  /** Transaction cost breakdown in ETH, GWEI, and USD */
  estimatedTxCost: { eth: number; gwei: number; dollars: number }
}

/**
 * Component that displays action information in an accordion format.
 *
 * The health metric appears in the accordion title with success/error color coding.
 * All other metrics are displayed in the expanded content with old/new value comparisons
 * where applicable. Optional items (collateral, assetsToWithdraw) only render when provided.
 * Transaction cost displays USD value with ETH/GWEI tooltip.
 */
export const ActionInfos = ({
  health,
  borrowRate,
  debt,
  collateral,
  ltv,
  leverage,
  borrowedCollateral,
  assetsToWithdraw,
  estimatedTxCost,
}: Props) => (
  <Accordion
    ghost
    size="small"
    title={
      <ActionInfo
        label="Health"
        value={`${formatValue(health.new)}%`}
        valueColor={newHealthColor(health)}
        prevValue={`${formatValue(health.old)}%`}
        prevValueColor="textPrimary"
        sx={{ flexGrow: 1 }}
      />
    }
  >
    <Stack>
      <ActionInfo
        label="Borrow Rate"
        value={`${formatValue(borrowRate.new)}%`}
        prevValue={`${formatValue(borrowRate.old)}%`}
      />

      <ActionInfo
        label="Debt"
        value={`${formatCollateral({ symbol: debt.symbol, amount: debt.new ?? debt.amount })}`}
        prevValue={`${formatCollateral({ symbol: debt.symbol, amount: debt.amount })}`}
      />

      {collateral && <ActionInfo label="Collateral" value={`${formatCollateral(collateral)}`} />}

      <ActionInfo label="LTV" value={`${formatValue(ltv.new)}%`} prevValue={`${formatValue(ltv.old)}%`} />

      <ActionInfo
        label="Leverage"
        value={`${formatValue(leverage.new, 1)}x`}
        prevValue={`${formatValue(leverage.old, 1)}x`}
      />

      <ActionInfo label="Collateral" value={`${formatCollateral(borrowedCollateral)}`} />

      {assetsToWithdraw && <ActionInfo label="Assets to withdraw" value={`${formatCollateral(assetsToWithdraw)}`} />}

      <ActionInfo
        label="Estimated tx cost"
        valueLeft={
          <GasIcon
            sx={{
              width: IconSize.md,
              height: IconSize.md,
            }}
          />
        }
        value={`$${formatValue(estimatedTxCost.dollars)}`}
        valueTooltip={`${estimatedTxCost.eth} ETH at ${estimatedTxCost.gwei} GWEI`}
      />
    </Stack>
  </Accordion>
)
