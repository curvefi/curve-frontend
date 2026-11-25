import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { t } from '@ui/lib/i18n'

// Stellar currently supports only Stableswap pools. Keep that in constants so they are easy to find.
export const STELLAR_POOL_TYPE_LABEL = t`Stableswap`
export const STELLAR_CAN_WITHDRAW_UNBALANCED = true
export const STELLAR_SLIPPAGE_TYPE = 'stable'
export const STELLAR_DEFAULT_SLIPPAGE = SLIPPAGE[STELLAR_SLIPPAGE_TYPE].default
