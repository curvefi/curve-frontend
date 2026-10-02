import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalGreaterThan, ZERO } from '@ui/lib/decimal'
import { POOL_TITLES, PoolColumnId } from '../columns'
import type { PoolClaimables } from '../types'
import { ClaimablesTooltipContent } from './ClaimablesTooltipContent'
import { ClaimablesIcons } from './RewardIcons'

const { Spacing } = SizesAndSpaces

export const ClaimablesCell = ({
  blockchainId,
  claimables,
  totalUsd,
}: {
  blockchainId: string
  claimables: QueryProp<PoolClaimables>
  totalUsd: QueryProp<Decimal>
}) => {
  if (claimables.error) {
    return (
      <Stack sx={{ alignItems: 'end' }}>
        <ErrorIconButton error={claimables.error} size="extraSmall" />
      </Stack>
    )
  }

  const hasClaimables = totalUsd.data != null && decimalGreaterThan(totalUsd.data, ZERO)

  return (
    <WithWrapper
      shouldWrap={hasClaimables}
      Wrapper={Tooltip}
      title={POOL_TITLES[PoolColumnId.Claimables]}
      body={
        claimables.data && (
          <ClaimablesTooltipContent claimables={claimables.data} blockchainId={blockchainId} totalUsd={totalUsd} />
        )
      }
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
              {formatNumber(hasClaimables ? totalUsd.data : null, 'usd.precise')}
            </Typography>
            {claimables.data && <ClaimablesIcons claimables={claimables.data} blockchainId={blockchainId} />}
          </>
        )}
      </Stack>
    </WithWrapper>
  )
}
