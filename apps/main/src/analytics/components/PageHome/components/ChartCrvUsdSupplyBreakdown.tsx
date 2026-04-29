import { useState, useMemo } from 'react'
import {
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
import { fromEntries, mapRecord, notFalsy, recordEntries, recordValues } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatUsd } from '@ui-kit/utils'
import { useCrvUsdSupply } from '../queries/useCrvUsdSupply.query'

/**
 * Hardcoded market names used in the prices API endpoint.
 * The `name` is what the prices API returns.
 * `label` is what we want to display in the chart, `null` to omit the market type.
 */
const MARKETS = {
  keepersDebt: { name: 'Keepers debt', label: t`Keepers debt` },
  lendingOperatorsDebt: { name: 'Lending operators debt', label: t`Lending operators debt` },
  yieldBasisDebt: { name: 'Yield Basis debt', label: t`Yield basis debt` },
  flashLenderDebt: { name: 'FlashLender debt', label: null },
} as const

type MarketName = keyof typeof MARKETS

const MARKET_NAMES_SET = new Set<string>(Object.values(MARKETS).map(m => m.name))

const MARKET_LABELS = fromEntries(
  recordEntries(MARKETS)
    .filter(([_, { label }]) => label)
    .map(([key, { label }]) => [key, label!]),
)

const ALL_LABELS = joinButtonText(...recordValues(MARKET_LABELS))
const ALL_EXCLUDED = joinButtonText(
  ...recordValues(MARKETS)
    .filter(({ label }) => !label)
    .map(({ name }) => name),
)

const MINT_MARKETS_LABEL = t`Mint markets`

const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]

/** Chart component displaying crvUSD supply breakdown over time as stacked areas per market category */
export function ChartCrvUsdSupplyBreakdown() {
  const [period, setPeriod] = useState<Period>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)

  const { data, isFetching: loading } = useCrvUsdSupply({ days: DAYS[period] })

  const theme = useTheme()
  const palette = createPalette({ theme })

  // Not using switch hook for the non mint markets as otherwise it's a lot of boilerplate
  const [mintMarketsVisible, , , toggleMintMarketsVisible] = useSwitch(true)
  const [visibility, setVisibility] = useState<Record<MarketName, boolean>>(() => mapRecord(MARKETS, () => true))
  const toggleVisibility = (key: MarketName) => setVisibility(prev => ({ ...prev, [key]: !prev[key] }))

  const chartData = useMemo(
    () =>
      llama(data)
        .groupBy(x => new Date(x.timestamp).getTime())
        .entries()
        .map(([, x]) => ({
          time: new Date(x[0].timestamp).getTime(),
          mintMarkets: llama(x)
            .filter(y => !MARKET_NAMES_SET.has(y.market))
            .sumBy(y => y.supply),
          ...mapRecord(MARKETS, (_, { name }) => x.find(y => y.market === name)?.supply ?? 0),
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(c => c.time, 'asc')
        .value(),
    [data],
  )

  const legendSets: LegendItem[] = useMemo(
    () => [
      {
        label: MINT_MARKETS_LABEL,
        box: { fill: palette.colors[0] },
        toggled: mintMarketsVisible,
        onToggle: toggleMintMarketsVisible,
      },
      ...recordEntries(MARKET_LABELS).map(([key, label], i) => ({
        label,
        box: { fill: palette.colors[i + 1] },
        toggled: visibility[key],
        onToggle: () => toggleVisibility(key),
      })),
    ],
    [palette.colors, mintMarketsVisible, toggleMintMarketsVisible, visibility],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        legendSets,
        options: {
          tooltip: createTooltip(formatUsd),
          xAxis: { data: chartData.map(x => x.time).map(timeToCategory) },
          yAxis: { axisLabel: { formatter: (v: number) => formatUsd(v) } },
          series: [
            {
              name: MINT_MARKETS_LABEL,
              data: chartData.map(x => x.mintMarkets),
              type: 'line',
              stack: 'supply',
              areaStyle: {},
            },
            ...recordEntries(MARKET_LABELS).map(([key, name]) => ({
              name,
              data: chartData.map(x => x[key]),
              type: 'line' as const,
              stack: 'supply',
              areaStyle: {},
            })),
          ],
        },
        palette,
      }),
    [chartData, legendSets, palette],
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
              mintMarkets: chartData.map(x => ({ time: x.time, value: x.mintMarkets })),
              ...mapRecord(MARKET_LABELS, key => chartData.map(x => ({ time: x.time, value: x[key] }))),
            }}
            fullscreen={fullscreen}
          />
          <ButtonFullscreen onToggle={toggleFullscreen} fullscreen={fullscreen} />
        </>
      }
    >
      <ChartFooter
        legendSets={legendSets}
        description={notFalsy(
          t`Total crvUSD in circulation broken down by source.`,
          t`"Mint markets" aggregates all standard lending markets.`,
          t`The remaining areas show protocol-specific debt: Keepers debt stabilizes the peg, while ${ALL_LABELS} debt reflect other protocol-level minting.`,
          ALL_EXCLUDED.length && t`${ALL_EXCLUDED} are not included in the total.`,
        ).join(' ')}
      />
    </EChartsCard>
  )
}
