import { MarketType } from '@evm-ui/types/market'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { t } from '@ui/lib/i18n'

/**
 * Preset options for loan creation
 * @see PRESET_RANGES
 **/
export enum LoanPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export const PRESET_RANGES = { [LoanPreset.Safe]: 50, [LoanPreset.MaxLtv]: 4, [LoanPreset.Custom]: 10 }

export const MarketTypeSuffix: Record<MarketType, string> = {
  [MarketType.Lend]: t`(Lending Markets)`,
  [MarketType.Mint]: t`(Mint Markets)`,
}

export const NET_SUPPLY_RATE_TITLE = t`Net Supply APY`
export const USER_NET_SUPPLY_RATE_TITLE = t`Your net supply APY`
export const ESTIMATED_NET_BORROW_APR_TITLE = t`Est. net borrow APR`
export const TOTAL_SUPPLY_APY_TITLE = t`Total supply APY`
export const USER_TOTAL_SUPPLY_APY_TITLE = t`Your total supply APY`
export const MARKET_SOLVENCY_TITLE = t`Market solvency`
export const RANGE_HEALTH_DESCRIPTION = t`Health reaches 1.00 at the start of the Liquidation range, where collateral can convert and losses can occur. It stays at 1.00 within and below the range; monitor Liquidation buffer and Status.`

// Distinguish annual rate estimates from position PnL.
export const ESTIMATED_LEVERAGED_APR_TITLE = t`Estimated leveraged APR`
export const ESTIMATED_APR_AT_MAX_LEVERAGE_TITLE = t`Estimated max leveraged APR`

export const LEVERAGE = 'leverage' as const satisfies SlippageType

/** Any v1 lend market created after this date is considered deprecated. */
export const LEND_V1_DEPRECATION_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025
