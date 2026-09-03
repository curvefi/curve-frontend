import { useMemo } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketBorrowers, useMarketSuppliers } from '@/llamalend/queries/market'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { useManualPagination } from '@evm-ui/features/activity-table'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { mapQuery } from '@evm-ui/types/util'
import { getPageCount } from '@evm-ui/utils'
import type { BaseConfig } from '@legacy-ui/utils'
import { scanAddressPath } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import { maybe } from '@primitives/objects.utils'
import {
  BORROWER_COLUMNS,
  getSupplierColumns,
  mobileBorrowerVisibility,
  mobileSupplierVisibility,
} from './market-participants.columns'
import {
  BorrowerExpandedPanel,
  BorrowerExpandedPanelActions,
  SupplierExpandedPanel,
  SupplierExpandedPanelActions,
} from './market-participants.utils'

const PAGE_SIZE = 10

export const BorrowersCard = ({ networkConfig }: { networkConfig: BaseConfig | undefined }) => {
  const { blockchainId, controllerAddress, tokens } = useMarketContext()
  const { pagination, onPaginationChange, apiPage } = useManualPagination(PAGE_SIZE)
  const borrowersQuery = useMarketBorrowers({
    blockchainId,
    contractAddress: controllerAddress,
    page: apiPage,
    perPage: PAGE_SIZE,
  })
  const isMobile = useIsMobile()
  const query = mapQuery(borrowersQuery, ({ borrowers }) =>
    borrowers.map(borrower => ({
      ...borrower,
      borrowToken: tokens.borrowToken,
      collateralToken: tokens.collateralToken,
      explorerUrl: scanAddressPath(networkConfig, borrower.address),
      network: blockchainId,
    })),
  )
  const table = useCurveTable({
    query,
    columns: BORROWER_COLUMNS,
    state: { columnVisibility: isMobile ? mobileBorrowerVisibility : undefined, pagination },
    getRowId: row => row.address,
    manualPagination: true,
    pageCount: getPageCount(borrowersQuery.data?.totalBorrowers, PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <Card size="small" data-testid="top-borrowers-card">
      <MarketCardHeader title={t`Top Borrowers`} />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No borrowers found.` }}
        errorState={{ title: t`Could not load borrowers.` }}
        expandedPanel={{ Body: BorrowerExpandedPanel, Actions: BorrowerExpandedPanelActions }}
      />
    </Card>
  )
}

export const SuppliersCard = ({
  chainId,
  networkConfig,
}: {
  chainId: number
  networkConfig: BaseConfig | undefined
}) => {
  const { blockchainId, vaultToken, tokens } = useMarketContext()
  const { pagination, onPaginationChange, apiPage } = useManualPagination(PAGE_SIZE)
  const suppliersQuery = useMarketSuppliers({
    blockchainId,
    contractAddress: vaultToken?.address,
    page: apiPage,
    perPage: PAGE_SIZE,
  })
  const { data: borrowTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: tokens.borrowToken?.address })
  const isMobile = useIsMobile()
  const columns = useMemo(() => getSupplierColumns(tokens.borrowToken?.symbol), [tokens.borrowToken?.symbol])
  const query = mapQuery(suppliersQuery, ({ depositors }) =>
    depositors.map(supplier => ({
      ...supplier,
      assetsUsd: maybe(borrowTokenUsdRate, rate => supplier.assets * rate),
      borrowToken: tokens.borrowToken,
      explorerUrl: scanAddressPath(networkConfig, supplier.address),
      network: blockchainId,
    })),
  )
  const table = useCurveTable({
    query,
    columns,
    state: { columnVisibility: isMobile ? mobileSupplierVisibility : undefined, pagination },
    getRowId: row => row.address,
    manualPagination: true,
    pageCount: getPageCount(suppliersQuery.data?.totalSuppliers, PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <Card size="small" data-testid="top-suppliers-card">
      <MarketCardHeader title={t`Top Suppliers`} />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No suppliers found.` }}
        errorState={{ title: t`Could not load suppliers.` }}
        expandedPanel={{ Body: SupplierExpandedPanel, Actions: SupplierExpandedPanelActions }}
      />
    </Card>
  )
}
