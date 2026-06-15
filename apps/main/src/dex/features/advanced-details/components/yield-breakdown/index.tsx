import { useMemo } from 'react'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useYieldBreakdown } from '../../hooks/useYieldBreakdown'
import { createYieldBreakdownColumns, type YieldBreakdownRow } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const YieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const { baseTotal, total, rows } = useYieldBreakdown({
    chainId,
    poolDataCacheOrApi,
    poolId,
  })
  const isMobile = useIsMobile()
  const columns = useMemo(() => createYieldBreakdownColumns({ isMobile }), [isMobile])
  const table = useTable({ data: rows, columns, ...getTableOptions(rows) })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Yield Breakdown`} size="small" />
        <DataTable<YieldBreakdownRow>
          table={table}
          size="small"
          isLoading={false}
          disableStickyHeader
          emptyState={<EmptyStateRow table={table} size="sm">{t`No yield breakdown found.`}</EmptyStateRow>}
          footerRow={total && <FooterRow baseTotal={baseTotal} total={total} />}
        />
      </Stack>
    )
  )
}
