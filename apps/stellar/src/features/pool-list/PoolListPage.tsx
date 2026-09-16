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
import { useFactoryPoolData } from './useFactoryPoolData'

const pagination = { pageIndex: 0, pageSize: 20 }

/** Note: temporary pool list, it will be replaced by API when available. */
export const PoolListPage = () => {
  const { network } = useParams<NetworkQuery>()
  const query = useFactoryPoolData({ network })
  const table = useCurveTable({
    query: q(query),
    columns: POOL_LIST_COLUMNS,
    getRowId: ({ factory, pool }) => `${factory}-${pool}`,
    initialState: { pagination },
    meta: { getRowHref: StellarUrls.pool },
  })

  return (
    <ListPageLayout>
      <Stack>
        <TableHeader title={t`Pools`} onReload={() => void query.refetch()} isLoading={query.isFetching} />
        <DataTable
          table={table}
          emptyState={{ title: t`No pools found` }}
          errorState={{ title: t`Could not load pools`, onReload: query.refetch }}
        />
      </Stack>
    </ListPageLayout>
  )
}
