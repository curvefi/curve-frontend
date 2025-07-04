import Stack from '@mui/material/Stack'
import type Typography from '@mui/material/Typography'
import { GasIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils'

const { Spacing, IconSize } = SizesAndSpaces

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

type TokenAmount = { symbol: string; amount: number }

/**
 * Formats collateral into a readable string representation.
 * Handles both single collateral objects and arrays of collateral.
 * For arrays, concatenates all entries with ' + ' separator.
 * Uses abbreviateNumber and scaleSuffix for compact number formatting.
 *
 * @param tokens - Single collateral object or array of collateral objects
 * @returns Formatted string combining all collateral values and symbols
 *
 * @example
 * formatTokens({ symbol: 'ETH', amount: 10.5 })
 * // Returns: "10.5 ETH"
 *
 * formatTokens({ symbol: 'USDC', amount: 1500000 })
 * // Returns: "1.5m USDC"
 *
 * formatTokens([
 *   { symbol: 'ETH', amount: 10.5 },
 *   { symbol: 'BTC', amount: 2500000 }
 * ])
 * // Returns: "10.5 ETH + 2.5m BTC"
 */
const formatTokens = (tokens: TokenAmount | TokenAmount[]) =>
  (Array.isArray(tokens) ? tokens : [tokens])
    .map((x) => `${abbreviateNumber(x.amount)}${scaleSuffix(x.amount)} ${x.symbol}`)
    .join(' + ')

/** Short-hand type for MUI Typography color */
type TextColor = React.ComponentProps<typeof Typography>['color']

/**
 * Determines the color for displaying new health values based on comparison with old values.
 *
 * @param health - Health object containing old value and optional new value
 * @returns Typography color:
 *   - 'textPrimary' if new value is null/undefined or zero
 *   - 'error' if new value is less than old value (health decreased)
 *   - 'success' if new value is greater than or equal to old value (health improved/maintained)
 */
const newHealthColor = (health: Props['health']): TextColor =>
  health.new == null || health.new === 0 ? 'textPrimary' : health.new < health.old ? 'error' : 'success'

/** Health color when not changing it */
const healthColor = (health: number): TextColor => (health <= 5 ? 'error' : health <= 15 ? 'warning' : 'success')

/** Describes a change in value for a certain action info. New is optional as it we await input. */
type Delta = { old: number; new?: number }

/**
 * Props for ActionInfos component.
 *
 * Each property represents a line item in the accordion. Properties with old/new structure
 * will display comparisons with previous values. Optional properties only render when provided.
 */
export type Props = {
  /** Loan health value and the accordion title. Below 0 means hard-liquidated. */
  health: Delta
  loan: {
    /** Borrow rate values the user is paying to keep the loan open */
    borrowRate?: Delta
    /** Debt token with amount and optional new amount for comparison */
    debt?: TokenAmount & { new?: number }
    /** LTV value indicates how big the loan is compared to the collateral */
    ltv?: Delta
    /** Array of collateral assets - only renders when provided */
    collateral?: TokenAmount[]
  }
  collateral: {
    /** Borrowed collateral token information */
    borrowed?: TokenAmount
    /** The leverage multiplier if present, like 9x or 10x */
    leverage?: Delta
    /** Assets the user gets when withdrawing or closing the position */
    assetsToWithdraw?: TokenAmount[]
  }
  /** Meta information about to the potential transaction itself */
  transaction: {
    /** Transaction cost breakdown in ETH, GWEI, and USD */
    estimatedTxCost?: { eth: number; gwei: number; dollars: number }
  }
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
  loan: { borrowRate, debt, ltv, collateral },
  collateral: { borrowed, leverage, assetsToWithdraw },
  transaction: { estimatedTxCost },
}: Props) => (
  <Accordion
    ghost
    size="small"
    title={
      /**
       * Health display logic for the accordion title.
       * Shows current health value with appropriate color coding:
       * - When health is changing (new value exists): displays new value with comparison colors
       * - When health is static: displays current value with standard health color thresholds
       *
       * Note: Health change colors indicate direction of change rather than absolute health status.
       * A decrease from 150% to 140% shows as red (worse) even though 140% is still healthy.
       * This is subject to change if it turns out to be bad UX.
       */
      <ActionInfo
        label="Health"
        value={`${formatValue(health.new ?? health.old)}%`}
        valueColor={health.new != null ? newHealthColor(health) : healthColor(health.old)}
        {...(health.new != null && {
          prevValue: `${formatValue(health.old)}%`,
          prevValueColor: 'textTertiary',
        })}
        sx={{ flexGrow: 1 }}
      />
    }
  >
    <Stack gap={Spacing.md}>
      <Stack>
        {borrowRate && (
          <ActionInfo
            label="Borrow Rate"
            value={`${formatValue(borrowRate.new)}%`}
            prevValue={`${formatValue(borrowRate.old)}%`}
          />
        )}

        {debt && (
          <ActionInfo
            label="Debt"
            value={`${formatTokens({ symbol: debt.symbol, amount: debt.new ?? debt.amount })}`}
            prevValue={`${formatTokens({ symbol: debt.symbol, amount: debt.amount })}`}
          />
        )}

        {ltv && <ActionInfo label="LTV" value={`${formatValue(ltv.new)}%`} prevValue={`${formatValue(ltv.old)}%`} />}

        {collateral &&
          collateral.map((c, i) => (
            <ActionInfo
              key={`collateral-${c.symbol}`}
              label={i === 0 ? 'Collateral' : ''}
              value={`${formatTokens(c)}`}
            />
          ))}
      </Stack>

      <Stack>
        {leverage && (
          <ActionInfo
            label="Leverage"
            value={`${formatValue(leverage.new, 1)}x`}
            prevValue={`${formatValue(leverage.old, 1)}x`}
          />
        )}

        {borrowed && <ActionInfo label="Collateral" value={`${formatTokens(borrowed)}`} />}

        {assetsToWithdraw && <ActionInfo label="Assets to withdraw" value={`${formatTokens(assetsToWithdraw)}`} />}
      </Stack>

      {estimatedTxCost && (
        <ActionInfo
          label="Estimated tx cost"
          valueLeft={<GasIcon sx={{ width: IconSize.md, height: IconSize.md }} />}
          value={`$${formatValue(estimatedTxCost.dollars)}`}
          valueTooltip={`${estimatedTxCost.eth} ETH at ${estimatedTxCost.gwei} GWEI`}
        />
      )}
    </Stack>
  </Accordion>
)
