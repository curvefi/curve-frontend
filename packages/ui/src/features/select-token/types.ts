import type { Token } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

export type TokenCategory = 'all' | 'lp' | 'staked' | 'llamalend'
export const TOKEN_CATEGORY_LABELS: Record<TokenCategory, string> = {
  all: t`All`,
  lp: t`LP`,
  staked: t`Staked`,
  llamalend: t`Llamalend`,
}

export type TokenOption = Token & { chain?: string; category?: TokenCategory }
