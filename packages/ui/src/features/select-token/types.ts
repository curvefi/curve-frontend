import type { IconToken } from '@ui/components/TokenIcon'
import { t } from '@ui/lib/i18n'

export type TokenCategory = 'all' | 'lp' | 'staked' | 'llamalend'
export const TOKEN_CATEGORY_LABELS: Record<TokenCategory, string> = {
  all: t`All`,
  lp: t`LP`,
  staked: t`Staked`,
  llamalend: t`Llamalend`,
}

export type TokenOption = IconToken & { chain?: string; category?: TokenCategory }
