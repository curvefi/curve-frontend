import { useMemo } from 'react'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import type { AlertType, PoolAlert } from '@/dex/types/main.types'
import { AlertIcons } from '@/dex/utils/alerts'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Badge, type BadgeProps } from '@ui-kit/shared/ui/Badge'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolRow } from '../../types'

const { Spacing } = SizesAndSpaces
type PoolType = NonNullable<PoolRow['poolType']>

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

const alertTypeToBadgeColor: Record<AlertType, BadgeProps['color']> = {
  '': 'accent',
  info: 'accent',
  warning: 'warning',
  error: 'alert',
  danger: 'alert',
}

const PoolBadge = (props: Omit<BadgeProps, 'size'>) => <Badge size="extraSmall" {...props} />

const AlertBadge = ({ alert, source }: { alert: PoolAlert; source: 'pool' | 'token' }) => (
  <Tooltip title={alert.message ?? alert.banner?.subtitle ?? alert.banner?.title} clickable>
    <PoolBadge
      color={alertTypeToBadgeColor[alert.alertType]}
      icon={AlertIcons[alert.alertType]}
      data-testid={`badge-${source}-alert`}
    />
  </Tooltip>
)

/** Displays classification, status, pool alert, and token alert badges for a pool. */
export const PoolBadges = ({ pool }: { pool: PoolRow }) => {
  const tokenAddresses = useMemo(() => pool.coins.map(({ address }) => address), [pool.coins])
  const poolAlert = usePoolAlert({
    network: pool.network,
    poolAddress: pool.address,
    hasVyperVulnerability: pool.hasVyperVulnerability,
  })
  const tokenAlert = useTokenAlert(tokenAddresses)
  const classification = pool.poolType && poolTypeClassifications[pool.poolType]

  return (
    <Stack
      direction="row"
      data-testid="pool-badges"
      sx={{ alignItems: 'center', gap: Spacing.xs, '&:empty': { display: 'none' } }}
    >
      {classification && (
        <PoolBadge label={poolTypeLabels[classification]} data-testid={`badge-pool-type-${classification}`} />
      )}
      {pool.isMetapool && <PoolBadge label={t`Metapool`} data-testid="badge-pool-metapool" />}
      {pool.gauge?.isKilled && (
        <PoolBadge color="warning" label={t`Inactive gauge`} data-testid="badge-pool-inactive-gauge" />
      )}
      {poolAlert && !poolAlert.isPoolPageOnly && <AlertBadge alert={poolAlert} source="pool" />}
      {tokenAlert && <AlertBadge alert={tokenAlert} source="token" />}
    </Stack>
  )
}
