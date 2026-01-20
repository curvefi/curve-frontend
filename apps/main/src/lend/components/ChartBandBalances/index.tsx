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
import { ChartBandBalancesSettings } from '@/lend/components/ChartBandBalances/ChartBandBalancesSettings'
import type { BrushStartEndIndex } from '@/lend/components/ChartBandBalances/types'
import { TipContent, TipIcon, TipTitle, ChartTooltip } from '@/lend/components/ChartTooltip'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps, ParsedBandsBalances } from '@/lend/types/lend.types'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { TextCaption } from '@ui/TextCaption'
import { BN, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const ChartBandBalances = ({
  rChainId,
  rOwmId,
  brushIndex,
  data,
  oraclePrice,
  oraclePriceBand,
  showLiquidationIndicator,
  title,
  setBrushIndex,
  market,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'market'> & {
  brushIndex: BrushStartEndIndex
  data: ParsedBandsBalances[] | undefined
  oraclePrice: string | undefined
  oraclePriceBand: number | null | undefined
  showLiquidationIndicator: boolean
  title: string | ReactNode
  setBrushIndex: Dispatch<BrushStartEndIndex>
}) => {
  const { borrowed_token, collateral_token } = market ?? {}
  const xAxisDisplayType = useStore((state) => state.chartBands.xAxisDisplayType)
  const statsCapAndAvailable = useStore((state) => state.markets.statsCapAndAvailableMapper[rChainId]?.[rOwmId])

  const { cap, available } = statsCapAndAvailable ?? {}

  const isNGroupeds = useMemo(() => data?.filter((d) => d.isNGrouped), [data])

  const oraclePriceBandData = data?.find((d) => +d.n === oraclePriceBand && (+d.p_up > 0 || +d.p_down > 0))
  const chartHeight = 290
  let barWidth = 0

  const isChartNotAvailable = typeof cap !== 'undefined' && +cap === +available && data?.length === 0

  const showInAccurateChartAlert = useMemo(() => {
    if (typeof cap !== 'undefined' && +cap > 0 && data && data.length > 0) {
      return data?.every((d) => +d.borrowed + +d.collateral === 0)
    }
    return false
  }, [cap, data])

  return (
    <>
      {showInAccurateChartAlert && (
        <Box margin="0 0 var(--spacing-normal) 0">
          <AlertBox alertType="info">Unable to display meaningful values for bands due to small loan size.</AlertBox>
        </Box>
      )}
      <Header>
        <SubTitle>{title}</SubTitle>
        {!isChartNotAvailable && <ChartBandBalancesSettings />}
      </Header>
      {isChartNotAvailable ? (
        <StyledAlertBox alertType="">
          <TextCaption isCaps isBold>
            Chart not available
          </TextCaption>
        </StyledAlertBox>
      ) : (
        <Wrapper chartHeight={chartHeight}>
          {data?.length === 0 ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            <InnerWrapper>
              <ResponsiveContainer width="99%" height={chartHeight}>
                <ComposedChart data={data} margin={{ right: 25 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart_axis--color)" opacity={0.2} />
                  <XAxis
                    dataKey="n"
                    label={{
                      value:
                        xAxisDisplayType === 'price'
                          ? `Band median price (${collateral_token?.symbol}/${borrowed_token?.symbol})`
                          : 'Band',
                      position: 'insideBottom',
                      offset: 10,
                      fontSize: 12,
                    }}
                    height={50}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(n) => {
                      let formattedTick = formatNumber(n)
                      if (xAxisDisplayType === 'price') {
                        const d = data?.find((d) => d.n === n)
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
                    dataKey="collateralBorrowedUsd"
                    label={{
                      value: `TVL (${collateral_token?.symbol}/${borrowed_token?.symbol})`,
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
                          borrowed,
                          collateral,
                          collateralUsd,
                          isLiquidationBand,
                          isOraclePriceBand,
                          n,
                          p_up,
                          p_down,
                        } = payload[0].payload

                        const BorrowedLabel = <>{formatNumber(borrowed)}</>
                        const collateralAmount = +collateral
                        let CollateralLabel = <>{formatNumber(0)}</>
                        if (collateralAmount) {
                          const formattedCollateralAmount = formatNumber(collateralAmount)
                          const formattedCollateralUsdAmount = formatNumber(collateralUsd)
                          CollateralLabel = (
                            <>{`${formattedCollateralAmount} ≈ ${formattedCollateralUsdAmount} ${borrowed_token?.symbol}`}</>
                          )
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
                                  <TipTitle>{borrowed_token?.symbol}</TipTitle>
                                  <TipContent>
                                    <TipIcon name="StopFilledAlt" size={20} fill="var(--chart_stablecoin--color)" />{' '}
                                    {BorrowedLabel}
                                  </TipContent>
                                </div>

                                <div>
                                  <TipTitle>
                                    {collateral_token?.symbol}
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
                                    {borrowed && (
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
                          {collateral_token?.symbol}
                        </TipContent>
                        <TipContent>
                          <TipIcon name="StopFilledAlt" size={20} fill="var(--chart_stablecoin--color)" />
                          {borrowed_token?.symbol}
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
                    dataKey="collateralBorrowedUsd"
                    shape={(props: unknown) => {
                      const { width, collateralUsd, isLiquidationBand, borrowed, collateralBorrowedUsd } = props as {
                        width: number
                        collateralUsd: number
                        isLiquidationBand: boolean
                        borrowed: number
                        collateralBorrowedUsd: number
                        x: number
                        y: number
                        height: number
                      }

                      if (barWidth === 0 && +width > 0) {
                        barWidth = width
                      }

                      const collateralWidth = new BN(width)
                        .multipliedBy(collateralUsd)
                        .dividedBy(collateralBorrowedUsd)
                        .toNumber()
                      const borrowedWidth = new BN(width)
                        .multipliedBy(borrowed)
                        .dividedBy(collateralBorrowedUsd)
                        .toNumber()

                      return (
                        <>
                          <Rectangle
                            {...(props as object)}
                            width={borrowedWidth + collateralWidth}
                            fill="var(--chart_stablecoin--color)"
                          />
                          <Rectangle
                            {...(props as object)}
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
                  {isNGroupeds?.map((d) => (
                    <ReferenceLine
                      isFront
                      key={d.n}
                      x={d.n}
                      opacity={0}
                      width={100}
                      label={
                        <Label
                          value={data && data.length > 30 ? '••' : '•••'}
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
          )}
        </Wrapper>
      )}
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
`

const SubTitle = styled.h3`
  font-size: var(--font-size-3);
`

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: var(--spacing-narrow) 0;
`
