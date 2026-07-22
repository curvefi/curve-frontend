import type { PoolType } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolRow } from '../../types'

const { Spacing } = SizesAndSpaces

const poolTypeClassifications: Record<PoolType, 'stable' | 'volatile'> = {
  main: 'stable',
  factory: 'stable',
  crvusd: 'stable',
  stableswapng: 'stable',
  crypto: 'volatile',
  factory_crypto: 'volatile',
  factory_tricrypto: 'volatile',
  twocryptong: 'volatile',
}

const poolTypeLabels = {
  stable: t`Stable`,
  volatile: t`Volatile`,
} as const

/** Displays the classifications supplied by the prices API for a pool. */
export const PoolBadges = ({ pool }: { pool: Pick<PoolRow, 'poolType' | 'isMetapool'> }) => {
  const classification = pool.poolType && poolTypeClassifications[pool.poolType]

  if (!classification && !pool.isMetapool) return null

  return (
    <Stack direction="row" data-testid="pool-badges" sx={{ alignItems: 'center', gap: Spacing.xs }}>
      {classification && (
        <Badge
          size="extraSmall"
          label={poolTypeLabels[classification]}
          data-testid={`badge-pool-type-${classification}`}
        />
      )}
      {pool.isMetapool && <Badge size="extraSmall" label={t`Metapool`} data-testid="badge-pool-metapool" />}
    </Stack>
  )
}
