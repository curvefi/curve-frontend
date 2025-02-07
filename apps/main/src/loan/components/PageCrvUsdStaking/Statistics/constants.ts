import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { t } from '@lingui/macro'

type PriceLineLabel = { label: string; dash: string }

/**
 * SCRVUSD Vault/Token Address on Ethereum Mainnet
 */
export const SCRVUSD_VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367'

export const TOOLTIP_MAX_WIDTH = '20.5rem'

/**
 * labels for price line revenue chart
 */
export const priceLineLabels: Record<YieldKeys, PriceLineLabel> = {
  proj_apy: { label: t`APR`, dash: 'none' },
  proj_apy_7d_avg: { label: t`7-day MA APR`, dash: '2 2' },
  proj_apy_total_avg: { label: t`Average APR`, dash: '4 4' },
} as const
