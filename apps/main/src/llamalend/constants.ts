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

export const BORROW_RATE_TITLE = t`Borrow APR`
export const NET_BORROW_RATE_TITLE = t`Est. Net Borrow APR`
export const COLLATERAL_YIELD_TITLE = t`Collateral Yield`
export const SUPPLY_RATE_TITLE = t`Supply APY`
export const NET_SUPPLY_RATE_TITLE = t`Net Supply APY`
export const USER_NET_SUPPLY_RATE_TITLE = t`Your net supply APY`
export const BORROW_APR_DESCRIPTION = t`Borrow APR is the interest charged on the debt. It follows the market's monetary policy. On mint markets it also follows crvUSD's peg and borrow incentives. It does not include collateral yield.`
export const NET_BORROW_APR_DESCRIPTION = t`Estimated net borrow APR subtracts collateral yield and incentives from Borrow APR. That estimate is a same-asset comparison only when the yield is paid in the debt asset. When it is not, as with wstETH yield against crvUSD debt, it is not the borrow cost.`

export const LEVERAGE = 'leverage' as const satisfies SlippageType

/** Any v1 lend market created after this date is considered deprecated. */
export const LEND_V1_DEPRECATION_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025
