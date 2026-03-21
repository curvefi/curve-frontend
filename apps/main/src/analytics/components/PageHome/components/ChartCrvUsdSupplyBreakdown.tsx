import { useState, useMemo } from 'react'
import {
  areaColor,
  ButtonExport,
  ButtonFullscreen,
  ChartFooter,
  createChartOptions,
  createPalette,
  createTooltip,
  EChartsCard,
  timeToCategory,
} from '@/analytics/features/charts'
import { DAYS, type Period } from '@/analytics/features/charts/types'
import { llama } from '@/analytics/llamadash'
import { useTheme } from '@mui/material/styles'
import { mapRecord, notFalsy, objectKeys, recordEntries } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatUsd } from '@ui-kit/utils'
import { useCrvUsdSupply } from '../queries/useCrvUsdSupply.query'

const MARKET_NAMES = {
  keepersDebt: 'Keepers debt',
  lendingOperatorsDebt: 'Lending operators debt',
  yieldBasisDebt: 'Yield Basis debt',
  flashLenderDebt: 'FlashLender debt',
} as const

type MarketName = keyof typeof MARKET_NAMES

const MARKET_NAMES_SET = new Set<string>(Object.values(MARKET_NAMES))

const MARKET_LABELS = {
  keepersDebt: t`Keepers debt`,
  lendingOperatorsDebt: t`LendingOperators debt`,
  yieldBasisDebt: t`YieldBasis debt`,
  flashLenderDebt: t`FlashLender debt`,
} as const satisfies Record<MarketName, string>

const MINT_MARKETS_LABEL = t`Mint markets`

const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]

/** Chart component displaying crvUSD supply breakdown over time as stacked areas per market category */
export function ChartCrvUsdSupplyBreakdown() {
  const [period, setPeriod] = useState<Period>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)

  const { data, isFetching: loading } = useCrvUsdSupply({ days: DAYS[period] })

  const theme = useTheme()
  const palette = createPalette({ theme })

  const seriesColors = useMemo(
    () => ({
      mintMarkets: palette.colors[0],
      ...Object.fromEntries(objectKeys(MARKET_NAMES).map((key, i) => [key, palette.colors[i + 1]])),
    }),
    [palette.colors],
  ) as Record<'mintMarkets' | MarketName, string>

  // Not using switch hook for the non mint markets as otherwise it's a lot of boilerplate
  const [mintMarketsVisible, , , toggleMintMarketsVisible] = useSwitch(true)
  const [visibility, setVisibility] = useState<Record<MarketName, boolean>>(() => mapRecord(MARKET_NAMES, () => true))
  const toggleVisibility = (key: MarketName) => setVisibility((prev) => ({ ...prev, [key]: !prev[key] }))

  const chartData = useMemo(
    () =>
      llama(data)
        .groupBy((x) => new Date(x.timestamp).getTime())
        .entries()
        .map(([, x]) => ({
          time: new Date(x[0].timestamp).getTime(),
          mintMarkets: llama(x)
            .filter((y) => !MARKET_NAMES_SET.has(y.market))
            .sumBy((y) => y.supply),
          ...mapRecord(MARKET_NAMES, (_, market) => x.find((y) => y.market === market)?.supply ?? 0),
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy((c) => c.time, 'asc')
        .value(),
    [data],
  )

  const legendSets: LegendItem[] = useMemo(
    () => [
      {
        label: MINT_MARKETS_LABEL,
        box: { fill: seriesColors.mintMarkets },
        toggled: mintMarketsVisible,
        onToggle: toggleMintMarketsVisible,
      },
      ...objectKeys(MARKET_LABELS).map((key) => ({
        label: MARKET_LABELS[key],
        box: { fill: seriesColors[key] },
        toggled: visibility[key],
        onToggle: () => toggleVisibility(key),
      })),
    ],
    [seriesColors, mintMarketsVisible, toggleMintMarketsVisible, visibility],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        options: {
          tooltip: createTooltip(formatUsd),
          xAxis: { data: chartData.map((x) => x.time).map(timeToCategory) },
          yAxis: { axisLabel: { formatter: (v: number) => formatUsd(v) } },
          series: notFalsy(
            mintMarketsVisible && {
              name: MINT_MARKETS_LABEL,
              data: chartData.map((x) => x.mintMarkets),
              type: 'line',
              stack: 'supply',
              ...areaColor(seriesColors.mintMarkets),
            },
            ...recordEntries(MARKET_LABELS).map(
              ([key, label]) =>
                visibility[key] && {
                  name: label,
                  data: chartData.map((x) => x[key]),
                  type: 'line' as const,
                  stack: 'supply',
                  ...areaColor(seriesColors[key]),
                },
            ),
          ),
        },
        palette,
      }),
    [chartData, palette, seriesColors, mintMarketsVisible, visibility],
  )

  return (
    <EChartsCard
      title={t`crvUSD Supply Breakdown`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
          <ButtonExport
            filename="crvusd_supply"
            data={{
              mintMarkets: chartData.map((x) => ({ time: x.time, value: x.mintMarkets })),
              ...mapRecord(MARKET_NAMES, (key) => chartData.map((x) => ({ time: x.time, value: x[key] }))),
            }}
            fullscreen={fullscreen}
          />
          <ButtonFullscreen onToggle={toggleFullscreen} fullscreen={fullscreen} />
        </>
      }
    >
      <ChartFooter
        legendSets={legendSets}
        description={t`Total crvUSD in circulation broken down by source. "Mint markets" aggregates all standard lending markets. The remaining areas show protocol-specific debt: Keepers debt stabilizes the peg, while LendingOperators, YieldBasis, and FlashLender debt reflect other protocol-level minting.`}
      />
    </EChartsCard>
  )
}
