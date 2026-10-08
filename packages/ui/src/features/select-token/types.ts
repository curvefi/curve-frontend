import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

export type TokenCategory = 'all' | 'lp' | 'staked' | 'llamalend'
export const TOKEN_CATEGORY_LABELS: Record<TokenCategory, string> = {
  all: t`All`,
  lp: t`LP`,
  staked: t`Staked`,
  llamalend: t`Llamalend`,
}

export type TokenOption = { address: Address; symbol: string; chain?: string; category?: TokenCategory }
