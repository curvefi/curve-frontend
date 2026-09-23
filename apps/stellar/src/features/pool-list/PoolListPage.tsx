import { asStellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolList } from '@/stellar/features/pool-list/usePoolList'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import { StellarUrls } from '@/stellar/routes/routes'
import Stack from '@mui/material/Stack'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { POOL_LIST_COLUMNS } from './pool-list.columns'

const pagination = { pageIndex: 0, pageSize: 20 }

export const PoolListPage = () => {
  const { network } = useParams<NetworkQuery>()
  const params = { network }
  const query = usePoolList(params)
  const table = useCurveTable({
    query: q(query),
    columns: POOL_LIST_COLUMNS,
    getRowId: p => p.address,
    initialState: { pagination },
    meta: { getRowHref: ({ network, address }) => StellarUrls.pool({ pool: asStellarContract(address), network }) },
  })

  return (
    <ListPageLayout>
      <Stack>
        <TableHeader title={t`Pools`} onReload={query.refetch} isLoading={query.isFetching} />
        <DataTable
          table={table}
          emptyState={{ title: t`No pools found` }}
          errorState={{ title: t`Could not load pools`, onReload: query.refetch }}
        />
      </Stack>
    </ListPageLayout>
  )
}
