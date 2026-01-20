import { Dispatch, ReactNode, useMemo } from 'react'
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { styled } from 'styled-components'
import { ChartBandBalancesSettings } from '@/loan/components/ChartBandBalances/ChartBandBalancesSettings'
import type { BrushStartEndIndex } from '@/loan/components/ChartBandBalances/types'
import { TipContent, TipIcon, TipTitle, ChartTooltip } from '@/loan/components/ChartTooltip'
import type { ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { useStore } from '@/loan/store/useStore'
import { BandsBalancesData } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { Box } from '@ui/Box'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { BN, FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

interface Props extends Pick<ManageLoanProps, 'market'> {
  brushIndex: BrushStartEndIndex
  data: BandsBalancesData[]
  oraclePrice: string | undefined
  oraclePriceBand: number | null | undefined
  showLiquidationIndicator: boolean
  title: string | ReactNode
  setBrushIndex: Dispatch<BrushStartEndIndex>
}

export const ChartBandBalances = ({
  brushIndex,
  market: llamma,
  data,
  oraclePrice,
  oraclePriceBand,
  showLiquidationIndicator,
  title,
  setBrushIndex,
}: Props) => {
  const xAxisDisplayType = useStore((state) => state.chartBands.xAxisDisplayType)

  const isNGroupeds = useMemo(() => data.filter((d) => d.isNGrouped), [data])

  const oraclePriceBandData = data.find((d) => +d.n === oraclePriceBand && (+d.p_up > 0 || +d.p_down > 0))
  const chartHeight = 290
  let barWidth = 0

  return (
    <>
      <Header>
        <SubTitle>{title}</SubTitle>
        <ChartBandBalancesSettings />
      </Header>
      <Wrapper chartHeight={chartHeight}>
        {data.length !== 0 ? (
          <InnerWrapper>
            <ResponsiveContainer width="99%" height={chartHeight}>
              <ComposedChart data={data} margin={{ right: 25 }}>
                <CartesianGrid vertical={false} stroke="var(--chart_axis--color)" opacity={0.2} />
                <XAxis
                  dataKey="n"
                  label={{
                    value: xAxisDisplayType === 'price' ? 'Band median price (USD)' : 'Band',
                    position: 'insideBottom',
                    offset: 10,
                    fontSize: 12,
                  }}
                  height={50}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(n) => {
                    let formattedTick = formatNumber(n, { decimals: 5 })
                    if (xAxisDisplayType === 'price') {
                      const d = data.find((d) => d.n === n)
                      if (d) {
                        formattedTick =
                          d.pUpDownMedian === '' && d.isOraclePriceBand && oraclePrice
                            ? formatNumber(oraclePrice, { notation: 'compact' })
                            : formatNumber(d.pUpDownMedian, { notation: 'compact' })
                      }
                    }
                    return formattedTick
                  }}
                />
                <YAxis
                  dataKey="collateralStablecoinUsd"
                  label={{
                    value: `TVL (USD)`,
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 12,
                    style: { textAnchor: 'middle' },
                  }}
                  width={90}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(usdValue) => formatNumber(usdValue, { notation: 'compact' })}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const {
                        stablecoin,
                        collateral,
                        collateralUsd,
                        isLiquidationBand,
                        isOraclePriceBand,
                        n,
                        p_up,
                        p_down,
                      } = payload[0].payload
                      const StablecoinLabel = <>{formatNumber(stablecoin)}</>

                      const collateralAmount = +collateral
                      let CollateralLabel = <>{formatNumber(0)}</>
                      if (collateralAmount) {
                        const formattedCollateralAmount = formatNumber(collateralAmount)
                        const formattedCollateralUsdAmount = formatNumber(collateralUsd, FORMAT_OPTIONS.USD)
                        CollateralLabel = <>{`${formattedCollateralAmount} ≈ ${formattedCollateralUsdAmount}`}</>
                      }

                      return (
                        <ChartTooltip>
                          {isOraclePriceBand ? (
                            <>
                              <div>
                                <TipTitle>{t`Oracle price`}</TipTitle>
                                <TipContent>{formatNumber(oraclePrice)}</TipContent>
                              </div>
                              <TipTitle>{t`Band ${n}`}</TipTitle>
                            </>
                          ) : (
                            <>
                              <div>
                                <TipTitle>{getTokenName(llamma).stablecoin}</TipTitle>
                                <TipContent>
                                  <TipIcon name="StopFilledAlt" size={20} fill="var(--chart_stablecoin--color)" />{' '}
                                  {StablecoinLabel}
                                </TipContent>
                              </div>

                              <div>
                                <TipTitle>
                                  {getTokenName(llamma).collateral}
                                  {isLiquidationBand ? <span> {t`(Soft liquidation)`}</span> : ''}
                                </TipTitle>
                                <TipContent>
                                  <TipIcon
                                    name="StopFilledAlt"
                                    size={20}
                                    fill="var(--chart_collateral--color)"
                                    stroke={
                                      isLiquidationBand
                                        ? 'var(--health_mode_soft_liquidation_darkBg--color)'
                                        : 'var(--chart_collateral--color)'
                                    }
                                  />{' '}
                                  {CollateralLabel}
                                </TipContent>
                              </div>

                              <div>
                                <TipTitle>{t`Band ${n}`}</TipTitle>
                                <TipContent>
                                  {stablecoin && (
                                    <>
                                      {formatNumber(p_up)} - {formatNumber(p_down)}
                                    </>
                                  )}
                                </TipContent>
                              </div>
                            </>
                          )}
                        </ChartTooltip>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: 12 }}
                  height={showLiquidationIndicator ? 60 : 45}
                  content={() => (
                    <LegendWrapper flex flexCenter flexAlignItems="center">
                      <TipContent>
                        <TipIcon name="StopFilledAlt" size={20} fill="var(--chart_collateral--color)" />
                        {getTokenName(llamma).collateral}
                      </TipContent>
                      <TipContent>
                        <TipIcon name="StopFilledAlt" size={20} fill="var(--chart_stablecoin--color)" />
                        {getTokenName(llamma).stablecoin}
                      </TipContent>
                    </LegendWrapper>
                  )}
                />
                <Brush
                  dataKey="n"
                  height={30}
                  fill="var(--chart_brush_background-color)"
                  startIndex={brushIndex.startIndex}
                  endIndex={brushIndex.endIndex}
                  onChange={({ startIndex, endIndex }) => {
                    setTimeout(() => {
                      setBrushIndex({ startIndex, endIndex })
                    }, 1000)
                  }}
                />

                <Bar
                  dataKey="collateralStablecoinUsd"
                  shape={(arg: unknown) => {
                    const props = arg as {
                      width: number
                      collateralUsd: number
                      isLiquidationBand: boolean
                      stablecoin: number
                      collateralStablecoinUsd: number
                      x: number
                      y: number
                      height: number
                    }
                    const { width, collateralUsd, isLiquidationBand, stablecoin, collateralStablecoinUsd } = props

                    if (barWidth === 0 && +width > 0) {
                      barWidth = width
                    }

                    const collateralWidth = new BN(width)
                      .multipliedBy(collateralUsd)
                      .dividedBy(collateralStablecoinUsd)
                      .toNumber()
                    const stablecoinWidth = new BN(width)
                      .multipliedBy(stablecoin)
                      .dividedBy(collateralStablecoinUsd)
                      .toNumber()

                    return (
                      <>
                        <Rectangle
                          {...props}
                          width={stablecoinWidth + collateralWidth}
                          fill="var(--chart_stablecoin--color)"
                        />
                        <Rectangle
                          {...props}
                          width={collateralWidth}
                          fill="var(--chart_collateral--color)"
                          stroke={isLiquidationBand ? 'var(--health_mode_soft_liquidation_darkBg--color)' : ''}
                          strokeWidth={isLiquidationBand ? 1 : 0}
                        />
                      </>
                    )
                  }}
                />

                {/* oracle line */}
                {oraclePriceBandData && typeof oraclePrice !== 'undefined' ? (
                  <ReferenceLine
                    isFront
                    x={`${oraclePriceBand}`}
                    opacity={0}
                    label={({ viewBox: { x, y, height } }) => {
                      // place oracle reference line based on band's p_up and p_down value
                      const { p_up, p_down } = oraclePriceBandData ?? {}
                      const xValue = barWidth * ((+oraclePrice - +p_up) / (+p_down - +p_up))
                      const labelWidth = 45
                      const labelLineX = labelWidth / 2
                      const finalXValue = x - barWidth / 2 + xValue - labelWidth / 2

                      return (
                        <svg width={labelWidth} height={chartHeight} x={finalXValue}>
                          <text
                            x="2"
                            y={y - 5}
                            fill="var(--chart_reference_line--color)"
                            fontWeight="bold"
                            fontSize={11}
                            className="small"
                          >
                            Oracle
                          </text>
                          <line
                            x1={labelLineX}
                            y1={height + y}
                            x2={labelLineX}
                            y2={y}
                            stroke="var(--chart_reference_line--color)"
                            strokeWidth={4}
                          />
                        </svg>
                      )
                    }}
                  />
                ) : (
                  <ReferenceLine
                    isFront
                    x={`${oraclePriceBand}`}
                    stroke={'var(--chart_reference_line--color)'}
                    strokeWidth={4}
                    label={
                      <Label
                        value={t`Oracle`}
                        fill="var(--chart_reference_line--color)"
                        fontSize={11}
                        fontWeight="bold"
                        offset={7}
                        position="top"
                      />
                    }
                  />
                )}

                {/* grouped N */}
                {isNGroupeds.map((d) => (
                  <ReferenceLine
                    isFront
                    key={d.n}
                    x={d.n}
                    opacity={0}
                    width={100}
                    label={
                      <Label
                        value={data.length > 30 ? '••' : '•••'}
                        fontSize={20}
                        fontWeight="bold"
                        position="inside"
                      />
                    }
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </InnerWrapper>
        ) : (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        )}
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div<{ chartHeight: number }>`
  width: 100%;
  height: ${({ chartHeight }) => `${chartHeight}px`};
  position: relative;
`

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const LegendWrapper = styled(Box)`
  > *:first-of-type {
    margin-right: 1rem;
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-2);
`

const SubTitle = styled.h3`
  font-size: var(--font-size-3);
`
