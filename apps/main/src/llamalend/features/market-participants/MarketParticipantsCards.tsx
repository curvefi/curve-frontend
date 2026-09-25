import { useMemo } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import {
  useMarketBorrowers,
  useMarketSuppliers,
  useMarketTotalCollateral,
  useMarketTotalDebt,
} from '@/llamalend/queries/market'
import { getMarketRateTypeTabConfig } from '@/llamalend/rates.utils'
import {
  AvailableLiquidityMetric,
  TotalCollateralMetric,
  TotalDebtMetric,
  TotalLiquidityMetric,
} from '@/llamalend/widgets/MarketMetrics'
import { useAvailableLiquidity } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { useManualPagination } from '@evm-ui/features/activity-table'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import { MarketRateType, MarketType } from '@evm-ui/types/market'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { useTabs } from '@ui/hooks/useTabs'
import { decimal, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import {
  getBorrowerColumns,
  getSupplierColumns,
  mobileBorrowerVisibility,
  mobileSupplierVisibility,
} from './market-participants.columns'
import { BorrowerExpandedPanel, ParticipantRow, SupplierExpandedPanel } from './market-participants.utils'

const PAGE_SIZE = 10
const METRIC_CATEGORY = 'llamalend.marketParticipants'

/** Combines collateral and soft-liquidated borrowed tokens in collateral-token units. */
const calculateCombinedCollateral = ({
  collateral,
  borrowed,
  collateralUsdRate,
  borrowUsdRate,
}: {
  collateral: Decimal | undefined
  borrowed: Decimal | undefined
  collateralUsdRate: number
  borrowUsdRate: number
}) =>
  collateralUsdRate === 0
    ? undefined
    : maybes([collateral, borrowed], (collateral, borrowed) =>
        decimalSum(collateral, decimalMultiply(borrowed, borrowUsdRate / collateralUsdRate)),
      )

const ParticipantExpandedPanelActions = ({
  row: {
    original: { explorerUrl },
  },
}: {
  row: { original: ParticipantRow }
}) => (
  <ExpandedPanelActions
    actions={notFalsy(
      explorerUrl && {
        id: 'view-on-explorer',
        label: t`View on explorer`,
        href: explorerUrl,
        size: 'extraSmall',
        color: 'ghost',
      },
    )}
  />
)

export const BorrowersCard = () => {
  const { chainId, blockchainId, marketId, controllerAddress, apiMarket, marketType, tokens } = useMarketContext()
  const { pagination, onPaginationChange, apiPage } = useManualPagination(PAGE_SIZE)
  const borrowersQuery = useMarketBorrowers({
    blockchainId,
    contractAddress: controllerAddress,
    marketType,
    page: apiPage,
    perPage: PAGE_SIZE,
  })
  const totalDebt = fallbackQ(
    q(useMarketTotalDebt({ chainId, marketId })),
    mapQuery(apiMarket, market => decimal(market.assets.borrowed.balance)),
  )
  const totalCollateral = useMarketTotalCollateral({ chainId, marketId })
  const collateralUsdRate = useTokenUsdRate({ chainId, tokenAddress: tokens.collateralToken?.address })
  const borrowedUsdRate = useTokenUsdRate({ chainId, tokenAddress: tokens.borrowToken?.address })
  const collateralTotal = mapQuery(totalCollateral, ({ collateral }) => collateral)
  const borrowedCollateralTotal = mapQuery(totalCollateral, ({ borrowed }) => borrowed)
  const combinedCollateral = combineQueries(
    [totalCollateral, collateralUsdRate, borrowedUsdRate],
    ({ collateral, borrowed }, collateralUsdRate, borrowUsdRate) =>
      calculateCombinedCollateral({ collateral, borrowed, collateralUsdRate, borrowUsdRate }),
  )
  const combinedCollateralUsdValue = combineQueries(
    [totalCollateral, collateralUsdRate, borrowedUsdRate],
    ({ collateral, borrowed }, collateralUsdRate, borrowedUsdRate) =>
      maybes(
        [collateral, borrowed],
        (collateral, borrowed) => +collateral * collateralUsdRate + +borrowed * borrowedUsdRate,
      ),
  )
  const isMobile = useIsMobile()
  const query = mapQuery(borrowersQuery, ({ borrowers }) =>
    borrowers.map(borrower => ({
      ...borrower,
      borrowToken: tokens.borrowToken,
      collateralToken: tokens.collateralToken,
      explorerUrl: scanAddressPath(chainId, borrower.address),
      blockchainId,
    })),
  )
  const table = useCurveTable({
    query,
    columns: useMemo(
      () => getBorrowerColumns(blockchainId, tokens.collateralToken?.address, tokens.borrowToken?.address),
      [blockchainId, tokens.borrowToken?.address, tokens.collateralToken?.address],
    ),
    state: { columnVisibility: isMobile ? mobileBorrowerVisibility : undefined, pagination },
    getRowId: row => row.address,
    manualPagination: true,
    pageCount: getPageCount(borrowersQuery.data?.totalBorrowers, PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <Card size="small" data-testid="top-borrowers-card">
      <CardContent>
        <MetricsGrid>
          <Metric
            category={METRIC_CATEGORY}
            testId="market-total-borrowers"
            label={t`Total borrowers`}
            value={mapQuery(borrowersQuery, ({ totalBorrowers }) => totalBorrowers)}
            valueOptions={{ abbreviate: true }}
          />
          <TotalDebtMetric
            category={METRIC_CATEGORY}
            testId="market-participants-total-debt"
            value={totalDebt}
            symbol={tokens.borrowToken?.symbol}
            usdRate={q(borrowedUsdRate)}
          />
          <TotalCollateralMetric
            category={METRIC_CATEGORY}
            testId="market-participants-total-collateral"
            value={fallbackQ(
              combinedCollateral,
              combineQueries([apiMarket, collateralUsdRate], (market, collateralUsdRate) =>
                collateralUsdRate ? decimal(market.totalCollateralUsd / collateralUsdRate) : undefined,
              ),
            )}
            symbol={tokens.collateralToken?.symbol}
            usdRate={q(collateralUsdRate)}
            tooltip={{
              collateralSymbol: tokens.collateralToken?.symbol,
              totalCollateral: collateralTotal.data,
              borrowedSymbol: tokens.borrowToken?.symbol,
              totalBorrowed: borrowedCollateralTotal.data,
              combinedCollateralUsdValue: combinedCollateralUsdValue.data,
              collateralUsdRate: collateralUsdRate.data ?? null,
              borrowedUsdRate: borrowedUsdRate.data ?? null,
            }}
          />
        </MetricsGrid>
      </CardContent>
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No borrowers found.` }}
        errorState={{ title: t`Could not load borrowers.` }}
        expandedPanel={{ Body: BorrowerExpandedPanel, Actions: ParticipantExpandedPanelActions }}
      />
    </Card>
  )
}

export const SuppliersCard = () => {
  const { chainId, blockchainId, marketQuery, apiMarket, vaultToken, tokens } = useMarketContext()
  const { pagination, onPaginationChange, apiPage } = useManualPagination(PAGE_SIZE)
  const suppliersQuery = useMarketSuppliers({
    blockchainId,
    contractAddress: vaultToken?.address,
    page: apiPage,
    perPage: PAGE_SIZE,
  })
  const availableLiquidity = useAvailableLiquidity({ chainId, marketQuery, apiMarket })
  const borrowTokenUsdRate = availableLiquidity.usdRate.data
  const isMobile = useIsMobile()
  const query = mapQuery(suppliersQuery, ({ depositors }) =>
    depositors.map(supplier => ({
      ...supplier,
      assetsUsd: maybe(borrowTokenUsdRate, rate => supplier.assets * rate),
      borrowToken: tokens.borrowToken,
      explorerUrl: scanAddressPath(chainId, supplier.address),
      blockchainId,
    })),
  )
  const table = useCurveTable({
    query,
    columns: useMemo(
      () => getSupplierColumns(blockchainId, tokens.borrowToken?.address),
      [blockchainId, tokens.borrowToken?.address],
    ),
    state: { columnVisibility: isMobile ? mobileSupplierVisibility : undefined, pagination },
    getRowId: row => row.address,
    manualPagination: true,
    pageCount: getPageCount(suppliersQuery.data?.totalSuppliers, PAGE_SIZE),
    onPaginationChange,
  })

  return (
    <Card size="small" data-testid="top-suppliers-card">
      <CardContent>
        <MetricsGrid>
          <Metric
            category={METRIC_CATEGORY}
            testId="market-total-suppliers"
            label={t`Total suppliers`}
            value={mapQuery(suppliersQuery, ({ totalSuppliers }) => totalSuppliers)}
            valueOptions={{ abbreviate: true }}
          />
          <TotalLiquidityMetric
            category={METRIC_CATEGORY}
            testId="market-participants-total-liquidity"
            value={availableLiquidity.total}
            symbol={tokens.borrowToken?.symbol}
            usdRate={availableLiquidity.usdRate}
          />
          <AvailableLiquidityMetric
            category={METRIC_CATEGORY}
            testId="market-participants-available-liquidity"
            marketType={MarketType.Lend}
            value={availableLiquidity.value}
            symbol={tokens.borrowToken?.symbol}
            usdRate={availableLiquidity.usdRate}
          />
        </MetricsGrid>
      </CardContent>
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No suppliers found.` }}
        errorState={{ title: t`Could not load suppliers.` }}
        expandedPanel={{ Body: SupplierExpandedPanel, Actions: ParticipantExpandedPanelActions }}
      />
    </Card>
  )
}

const MARKET_PARTICIPANT_TABS = {
  [MarketRateType.Borrow]: { label: t`Borrowers`, component: BorrowersCard },
  [MarketRateType.Supply]: { label: t`Suppliers`, component: SuppliersCard },
}

export const MarketParticipantsTabs = ({ rateType }: { rateType: MarketRateType }) => {
  const { marketType } = useMarketContext()
  const { types, defaultValue } = getMarketRateTypeTabConfig({ marketType, rateType })
  const { tab, tabs, onChange, content } = useTabs({
    menu: types.map(type => ({ ...MARKET_PARTICIPANT_TABS[type], value: type })),
    defaultValue,
  })

  return (
    <Stack>
      <TabsSwitcher
        variant="contained"
        value={tab.value}
        onChange={onChange}
        options={tabs}
        testIdPrefix="market-participants-tab"
      />
      {content}
    </Stack>
  )
}
