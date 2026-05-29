import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { formatCollateralNotional, getTokens, getUtilizationPercent } from '@/llamalend/llama.utils'
import { useMarketCapAndAvailable, useMarketTotalCollateral, useRateCurve } from '@/llamalend/queries/market'
import { TooltipOptions, TotalCollateralTooltip, UtilizationTooltip } from '@/llamalend/widgets/tooltips'
import { RateCurveTooltip } from '@/llamalend/widgets/tooltips/chart/RateCurveTooltip'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { notFalsy, maybe, maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import {
  ChartFooter,
  ChartStateWrapper,
  CHART_LINE_DASH_PATTERNS,
  EChartsLineChart,
  type ChartLineDashPattern,
  type LegendItem,
  type LineSeriesConfig,
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { decimal, decimalMinus, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'

const { Spacing, Height } = SizesAndSpaces

export interface RateCurveChartPoint {
  utilization: number
  borrowApr: number
  supplyApy: number
}

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

const SERIES_CONFIG: { key: RateCurveSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'borrowApr', label: t`Borrow APR` },
  { key: 'supplyApy', label: t`Supply APY`, dash: CHART_LINE_DASH_PATTERNS.wide },
]

export const MarketRateCurveChart = ({
  market,
  blockchainId,
  chainId,
  marketId,
}: {
  market: LendMarketTemplate | undefined | null
  blockchainId: Chain | undefined
  chainId: number | undefined
  marketId: string | undefined
}) => {
  const [visibleSeries, setVisibleSeries] = useState<RateCurveSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))

  const controllerAddress = market?.addresses.controller as Address | undefined
  const { collateralToken, borrowToken } = market ? getTokens(market) : {}

  const {
    design: { Color },
  } = useTheme()

  const {
    data: rateCurve,
    isLoading,
    error,
  } = useRateCurve({ blockchainId, contractAddress: controllerAddress }, Boolean(blockchainId && controllerAddress))

  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: totalCollateral, isLoading: isTotalCollateralLoading } = useMarketTotalCollateral({
    chainId,
    marketId,
  })
  const { data: collateralUsdRate, isLoading: isCollateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateralToken?.address,
  })
  const { data: borrowedUsdRate, isLoading: isBorrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowToken?.address,
  })

  const currentUtilization = useMemo(
    () =>
      getUtilizationPercent(capAndAvailable?.available, capAndAvailable?.totalAssets) ?? rateCurve?.currentUtilization,
    [capAndAvailable, rateCurve?.currentUtilization],
  )
  const totalBorrowed = useMemo(() => {
    if (capAndAvailable?.available == null || capAndAvailable.totalAssets == null) return null

    const borrowed = decimalMinus(capAndAvailable.totalAssets, capAndAvailable.available)
    return +borrowed < 0 ? decimal(0)! : borrowed
  }, [capAndAvailable])
  const totalBorrowedUsdValue =
    maybes(
      [totalBorrowed, borrowedUsdRate],
      ([totalBorrowed, borrowedUsdRate]) => Number(totalBorrowed) * borrowedUsdRate,
    ) ?? null
  const utilizationBreakdown = maybe(
    [totalBorrowed, capAndAvailable?.totalAssets],
    ([borrow, available]) =>
      `${formatNumber(borrow, { abbreviate: true })}/${formatNumber(available, {
        abbreviate: true,
      })} ${borrowToken?.symbol ?? ''}`,
  )

  const collateralTotal = maybe(totalCollateral, totalCollateral => Number(totalCollateral.collateral)) ?? null
  const borrowedCollateralTotal = maybe(totalCollateral, totalCollateral => Number(totalCollateral.borrowed)) ?? null
  const collateralUsdValue = maybes([collateralTotal, collateralUsdRate], ([total, usdRate]) => total * usdRate) ?? null
  const borrowedCollateralUsdValue =
    maybes([borrowedCollateralTotal, borrowedUsdRate], ([total, usdRate]) => total * usdRate) ?? null
  const combinedCollateralUsdValue = maybes([collateralUsdValue, borrowedCollateralUsdValue], ([c, b]) => c + b) ?? null
  const isTotalCollateralMetricLoading =
    !market || isTotalCollateralLoading || isCollateralUsdRateLoading || isBorrowedUsdRateLoading

  const chartData = useMemo<RateCurveChartPoint[]>(
    () => sortBy(rateCurve?.rates ?? [], 'utilization'),
    [rateCurve?.rates],
  )

  const markLines = useMemo(
    () =>
      notFalsy(
        currentUtilization != null && {
          value: currentUtilization,
          label: formatPercent(currentUtilization),
          color: Color.Primary[500],
          dash: CHART_LINE_DASH_PATTERNS.tight,
        },
      ),
    [currentUtilization, Color.Primary],
  )

  const seriesColors: Record<RateCurveSeriesKey, string> = useMemo(
    () => ({ borrowApr: Color.Primary[500], supplyApy: Color.Tertiary[400] }),
    [Color.Primary, Color.Tertiary],
  )

  const series: LineSeriesConfig<RateCurveSeriesKey>[] = useMemo(
    () => SERIES_CONFIG.map(serie => ({ ...serie, color: seriesColors[serie.key] })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries],
  )

  return (
    <Card size="small">
      <CardHeader title={t`Interest Rate & Utilization`} />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Stack
          sx={{
            display: 'grid',
            gap: Spacing.xl,
            gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' },
          }}
        >
          <Metric
            size="medium"
            label={t`Utilization`}
            value={currentUtilization}
            loading={currentUtilization == null && (isCapAndAvailableLoading || isLoading || !market)}
            valueOptions={{ unit: 'percentage' }}
            notional={utilizationBreakdown}
            valueTooltip={{
              title: t`Utilization`,
              body: <UtilizationTooltip marketType={LlamaMarketType.Lend} />,
              ...TooltipOptions,
            }}
          />
          <Metric
            size="medium"
            label={t`Total borrowed`}
            value={totalBorrowed}
            loading={totalBorrowed == null && (isCapAndAvailableLoading || !market)}
            valueOptions={{
              unit: borrowToken?.symbol ? { symbol: ` ${borrowToken.symbol}`, position: 'suffix' } : undefined,
              abbreviate: true,
            }}
            notional={maybe(totalBorrowedUsdValue, totalBorrowedUsdValue => formatUsd(totalBorrowedUsdValue))}
          />
          <Metric
            size="medium"
            label={t`Total collateral`}
            value={combinedCollateralUsdValue}
            loading={combinedCollateralUsdValue == null && isTotalCollateralMetricLoading}
            valueOptions={{ unit: 'dollar' }}
            notional={
              isTotalCollateralMetricLoading
                ? undefined
                : formatCollateralNotional(
                    {
                      value: decimal(totalCollateral?.collateral),
                      symbol: collateralToken?.symbol,
                    },
                    { value: decimal(totalCollateral?.borrowed), symbol: borrowToken?.symbol },
                  )
            }
            valueTooltip={{
              title: t`Total Collateral`,
              body: (
                <TotalCollateralTooltip
                  collateralSymbol={collateralToken?.symbol}
                  totalCollateral={collateralTotal}
                  borrowedSymbol={borrowToken?.symbol}
                  totalBorrowed={borrowedCollateralTotal}
                  combinedCollateralUsdValue={combinedCollateralUsdValue}
                  collateralUsdRate={collateralUsdRate ?? null}
                  borrowedUsdRate={borrowedUsdRate ?? null}
                />
              ),
              ...TooltipOptions,
            }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={isLoading || !market}
          error={error}
          errorMessage={t`Unable to fetch rate curve data.`}
        >
          <EChartsLineChart<RateCurveChartPoint, RateCurveSeriesKey, 'utilization'>
            data={chartData}
            height={Height.shortChart}
            xKey="utilization"
            series={series}
            visibleSeries={visibleSeries}
            xAxisType="value"
            markLines={markLines}
            xTickFormatter={value => formatPercent(+value)}
            yTickFormatter={value => formatPercent(+value)}
            yPaddingRatio={0.05}
            renderTooltip={RateCurveTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart illustrates the relationship between utilization and interest rates in this market. It reflects the market’s monetary policy—how rates adjust based on supply and demand dynamics.`}
        />
      </CardContent>
    </Card>
  )
}
