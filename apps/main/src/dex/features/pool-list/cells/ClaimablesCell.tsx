import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ZERO } from '@ui/lib/decimal'
import { POOL_TITLES, PoolColumnId } from '../columns'
import type { PoolRow } from '../types'
import { claimablesTotalUsd } from '../utils'
import { ClaimablesTooltipContent } from './ClaimablesTooltipContent'
import { ClaimablesIcons } from './RewardIcons'

const { Spacing } = SizesAndSpaces

export const ClaimablesCell = ({
  pool: {
    blockchainId,
    userPosition: { claimables },
  },
}: {
  pool: PoolRow
}) => {
  if (claimables?.error) {
    return (
      <Stack sx={{ alignItems: 'end' }}>
        <ErrorIconButton error={claimables.error} size="extraSmall" />
      </Stack>
    )
  }

  if (claimables?.isLoading) {
    return (
      <Stack data-testid="pool-claimables-loading" sx={{ alignItems: 'end', gap: Spacing.xs }}>
        <Skeleton width="5rem" />
        <Skeleton variant="circular" width="1rem" height="1rem" />
      </Stack>
    )
  }

  const total = claimablesTotalUsd(claimables?.data ?? [])
  if (!claimables?.data || total === ZERO) {
    return (
      <Typography variant="tableCellMBold" sx={{ textAlign: 'end' }}>
        {formatNumber(null, 'usd.precise')}
      </Typography>
    )
  }

  return (
    <Tooltip
      clickable
      mobileDrawer
      title={POOL_TITLES[PoolColumnId.Claimables]}
      body={<ClaimablesTooltipContent claimables={claimables.data} blockchainId={blockchainId} />}
      placement="top"
    >
      <Stack data-testid="pool-claimables" sx={{ alignItems: 'end', gap: Spacing.xs }}>
        <Typography variant="tableCellMBold">{formatNumber(total, 'usd.precise')}</Typography>
        <ClaimablesIcons claimables={claimables.data} blockchainId={blockchainId} />
      </Stack>
    </Tooltip>
  )
}
