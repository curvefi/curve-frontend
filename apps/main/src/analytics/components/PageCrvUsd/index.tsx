import { useMemo } from 'react'
import { getLendingVaultsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import { getMintMarketOptions } from '@/llamalend/queries/market-list/mint-markets'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics'
import Grid from '@mui/material/Grid'
import { useQuery } from '@tanstack/react-query'
import { useCrvUsdPriceHistory } from '@ui-kit/entities/crvusd-price.query'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCrvUsdYieldBasisSupply } from '../../queries/crvUsdYieldBasisSupply.query'
import { useYieldBasisPools } from '../../queries/yieldBasisPools.query'
import { useYieldBasisPoolVolumes } from '../../queries/yieldBasisPoolVolume.query'
import { useYieldBasisVolume } from '../../queries/yieldBasisVolume.query'
import { ChartCrvUsdPrice } from '../charts/ChartCrvUsdPrice'
import { DashboardMetricCard } from './components/DashboardMetricCard'
import { LlamaLendSummary } from './components/LlamaLendSummary'
import { MintMarketsTable } from './components/MintMarketsTable'
import { PageTitle } from './components/PageTitle'
import { PegKeepersCard } from './components/PegKeepersCard'
import { SavingsSummary } from './components/SavingsSummary'
import { SupplySummary } from './components/SupplySummary'
import { YieldBasisPoolsTable } from './components/YieldBasisPoolsTable'
import {
  CHAIN,
  getLatestPrice,
  getLlamaLendSummary,
  getWeightedAverage,
  toMintMarketRows,
  toYieldBasisPoolRows,
} from './utils'
import { ChartCrvUsdSupplyBreakdown } from '../charts/ChartCrvUsdSupplyBreakdown'

const { Spacing } = SizesAndSpaces

export const PageCrvUsd = () => {
  const priceQuery = useCrvUsdPriceHistory({ days: 2 })
  const latestPrice = useMemo(() => getLatestPrice(priceQuery.data), [priceQuery.data])

  const yieldBasisSupplyQuery = useCrvUsdYieldBasisSupply({ chain: CHAIN })
  const scrvUsdStatisticsQuery = useScrvUsdStatistics({})
  const mintMarketsQuery = useQuery(getMintMarketOptions({}))
  const lendingVaultsQuery = useQuery(getLendingVaultsOptions({}))
  const yieldBasisPoolsQuery = useYieldBasisPools({ chain: CHAIN })
  const yieldBasisVolumeQuery = useYieldBasisVolume({ chain: CHAIN })
  const yieldBasisPoolVolumeQueries = useYieldBasisPoolVolumes(CHAIN, yieldBasisPoolsQuery.data)

  const mintMarketRows = useMemo(() => toMintMarketRows(mintMarketsQuery.data), [mintMarketsQuery.data])
  const yieldBasisPoolRows = useMemo(
    () => toYieldBasisPoolRows(yieldBasisPoolVolumeQueries.map(query => query.data)),
    [yieldBasisPoolVolumeQueries],
  )
  const llamaLendSummary = useMemo(() => getLlamaLendSummary(lendingVaultsQuery.data), [lendingVaultsQuery.data])
  const mintMarketAvgBorrowApy = useMemo(
    () =>
      getWeightedAverage(
        mintMarketRows,
        row => row.borrowApy,
        row => row.borrowedUsd,
      ),
    [mintMarketRows],
  )

  const crvUsdMcap =
    yieldBasisSupplyQuery.data?.totalSupply == null
      ? undefined
      : yieldBasisSupplyQuery.data.totalSupply * (latestPrice.price ?? 1)
  const scrvUsdMcap =
    scrvUsdStatisticsQuery.data?.supply == null
      ? undefined
      : scrvUsdStatisticsQuery.data.supply * (latestPrice.price ?? 1)
  const yieldBasisPoolVolumesLoading = yieldBasisPoolVolumeQueries.some(query => query.isFetching)

  return (
    <Grid
      container
      columnSpacing={Spacing.md}
      rowSpacing={Spacing.md}
      columns={{ mobile: 6, tablet: 12 }}
      sx={{ marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }}
      data-testid="analytics-crvusd"
    >
      <Grid size={{ mobile: 6, tablet: 12 }}>
        <PageTitle />
      </Grid>

      <Grid size={{ mobile: 6, tablet: 3 }}>
        <DashboardMetricCard
          label={t`crvUSD Mcap`}
          value={crvUsdMcap}
          loading={yieldBasisSupplyQuery.isFetching}
          valueOptions={{ unit: 'dollar' }}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 3 }}>
        <DashboardMetricCard
          label={t`scrvUSD Mcap`}
          value={scrvUsdMcap}
          loading={scrvUsdStatisticsQuery.isFetching}
          valueOptions={{ unit: 'dollar' }}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 3 }}>
        <DashboardMetricCard
          label={t`crvUSD Price`}
          value={latestPrice.price}
          change={latestPrice.changePct}
          loading={priceQuery.isFetching}
          valueOptions={{ unit: 'dollar', decimals: 4, abbreviate: false }}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 3 }}>
        <DashboardMetricCard
          label={t`YB Volume 24h`}
          value={yieldBasisVolumeQuery.data?.stats.volume24h}
          loading={yieldBasisVolumeQuery.isFetching}
          valueOptions={{ unit: 'dollar' }}
        />
      </Grid>

      <Grid size={{ mobile: 6, tablet: 6 }}>
        <ChartCrvUsdSupplyBreakdown />
      </Grid>

      <Grid size={{ mobile: 6, tablet: 6 }}>
        <ChartCrvUsdPrice initialPeriod="3m" />
      </Grid>

      <Grid size={{ mobile: 6, tablet: 3 }}>
        <SupplySummary
          supply={yieldBasisSupplyQuery.data}
          scrvUsdSupply={scrvUsdStatisticsQuery.data?.supply}
          loading={yieldBasisSupplyQuery.isFetching || scrvUsdStatisticsQuery.isFetching}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 6 }}>
        <YieldBasisPoolsTable
          rows={yieldBasisPoolRows}
          loading={yieldBasisPoolsQuery.isFetching || yieldBasisPoolVolumesLoading}
          volume24h={yieldBasisVolumeQuery.data?.stats.volume24h}
          volume7d={yieldBasisVolumeQuery.data?.stats.volume7d}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 3 }}>
        <PegKeepersCard />
      </Grid>

      <Grid size={{ mobile: 6, tablet: 3 }}>
        <SavingsSummary
          apy={scrvUsdStatisticsQuery.data?.apyProjected}
          supply={scrvUsdStatisticsQuery.data?.supply}
          avgBorrowApy={mintMarketAvgBorrowApy}
          marketCount={mintMarketRows.length}
          loading={scrvUsdStatisticsQuery.isFetching || mintMarketsQuery.isFetching}
        />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 6 }}>
        <MintMarketsTable rows={mintMarketRows} loading={mintMarketsQuery.isFetching} />
      </Grid>
      <Grid size={{ mobile: 6, tablet: 3 }}>
        <LlamaLendSummary summary={llamaLendSummary} loading={lendingVaultsQuery.isFetching} />
      </Grid>
    </Grid>
  )
}
