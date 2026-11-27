import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { AddressCell } from '../../cells/AddressCell'
import { getActivityTableMeta } from '../table-meta'
import type { ActivityRow } from '../types'

export const ActivityAddressCell = ({ row, table }: CellContext<CurveTableFeatures, ActivityRow>) => {
  const { address, chainId } = row.original
  const { formatAddress, scanAddressPath } = getActivityTableMeta(table).addressDisplay

  return (
    <AddressCell
      formatAddress={formatAddress}
      address={address}
      explorerUrl={scanAddressPath(chainId, address)}
      align="end"
    />
  )
}
