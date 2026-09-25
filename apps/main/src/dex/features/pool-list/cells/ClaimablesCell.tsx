import type { PoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalGreaterThan, ZERO } from '@ui/lib/decimal'
import { POOL_TITLES, PoolColumnId } from '../columns'
import { claimablesTotalUsd } from '../utils'
import { ClaimablesTooltipContent } from './ClaimablesTooltipContent'
import { ClaimablesIcons } from './RewardIcons'

const { Spacing } = SizesAndSpaces

export const ClaimablesCell = ({
  blockchainId,
  claimables,
}: {
  blockchainId: string
  claimables: QueryProp<PoolClaimables>
}) => {
  if (claimables.error) {
    return (
      <Stack sx={{ alignItems: 'end' }}>
        <ErrorIconButton error={claimables.error} size="extraSmall" />
      </Stack>
    )
  }

  const total = claimablesTotalUsd(claimables.data ?? [])
  const hasClaimables = decimalGreaterThan(total, ZERO)

  return (
    <WithWrapper
      shouldWrap={hasClaimables}
      Wrapper={Tooltip}
      title={POOL_TITLES[PoolColumnId.Claimables]}
      body={<ClaimablesTooltipContent claimables={claimables.data!} blockchainId={blockchainId} />}
      placement="top"
      clickable
      mobileDrawer
    >
      <Stack sx={{ alignItems: 'end', gap: Spacing.xs }}>
        {claimables.isLoading ? (
          <>
            <Skeleton width="5rem" />
            <Skeleton variant="circular" width="1rem" height="1rem" />
          </>
        ) : (
          <>
            <Typography variant="tableCellMBold">
              {formatNumber(hasClaimables ? total : null, 'usd.precise')}
            </Typography>
            <ClaimablesIcons claimables={claimables.data!} blockchainId={blockchainId} />
          </>
        )}
      </Stack>
    </WithWrapper>
  )
}
