import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { RelativeTimeCell } from '../../cells/RelativeTimeCell'
import { UserPositionIndicator } from '../../UserPositionIndicator'
import { getActivityTableMeta } from '../table-meta'
import type { ActivityRow } from '../types'

export const ActivityTimeCell = ({ row, table }: CellContext<CurveTableFeatures, ActivityRow>) => {
  const { timestamp, chainId, txHash, address } = row.original
  const { addressDisplay, userAddress } = getActivityTableMeta(table)
  // Can't use Viem's `isAddressEqual` because this should also work for Stellar. Typing refactor is a TODO.
  const isUserActivity = address.toLowerCase() === userAddress?.toLowerCase()

  return (
    <Stack direction="row">
      {isUserActivity && <UserPositionIndicator tooltipTitle={t`Your activity`} />}
      <RelativeTimeCell
        timestamp={new Date(timestamp)}
        txUrl={txHash ? addressDisplay.scanTxPath(chainId, txHash) : undefined}
      />
    </Stack>
  )
}
