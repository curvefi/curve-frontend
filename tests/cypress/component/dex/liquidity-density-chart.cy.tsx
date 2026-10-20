/* eslint-disable @typescript-eslint/no-unused-expressions */
import { getInstanceByDom, type ECharts } from 'echarts'
import {
  LiquidityDensityChart,
  type LiquidityDensityChartProps,
} from '@/dex/features/liquidity-density/LiquidityDensityChart'
import { oneOf } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { oneViewport } from '@cy/support/ui'
import { peakPrice } from '@ui/features/pools/liquidity-density/curve'
import { liquidityProfile, valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'
import type { LiquiditySample } from '@ui/features/pools/liquidity-density/types'
import { ThemeProvider } from '@ui/features/themes/ThemeProvider'
import { chadTheme, darkTheme, lightTheme } from '@ui/features/themes/themes'

const cryptoCurve = createTwoCryptoCurve([20_000_000, 180], 110_000, 40, 0.001)!
const tokenProfile = liquidityProfile(cryptoCurve, [1, 0])!
const usdProfile = valueLiquidityProfile(tokenProfile, 111_124.75)
const stableCurve = createStableSwapCurve([1_400_000, 600_000], [1, 1], 200)!
const stableProfile = valueLiquidityProfile(liquidityProfile(stableCurve, [1, 0])!, 1)
const chartProps: LiquidityDensityChartProps = {
  profile: usdProfile,
  inputSymbol: 'WBTC',
  outputSymbol: 'USDC',
  outputTokenUsdPrice: 1,
  oraclePrice: 109_500,
  centerPrice: peakPrice(cryptoCurve, [1, 0]),
  isLoading: false,
  error: null,
  action: null,
}

const themes = { light: lightTheme(), dark: darkTheme(), chad: chadTheme() }
const THEME = oneOf('light', 'dark', 'chad')
const [VIEWPORT_WIDTH, VIEWPORT_HEIGHT, BREAKPOINT] = oneViewport()
const CHART = '[data-testid="liquidity-density-chart"]'
const PLOT = '[data-testid="liquidity-density-plot"]'
const LEGEND = '[data-testid="liquidity-density-legend"]'
const TOOLTIP = '[data-testid="liquidity-density-tooltip"]'

const mountChart = ({
  theme = 'light',
  ...props
}: Partial<LiquidityDensityChartProps> & { theme?: keyof typeof themes } = {}) =>
  cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={false}>
      <ThemeProvider theme={theme}>
        <LiquidityDensityChart {...chartProps} {...props} />
      </ThemeProvider>
    </ComponentTestWrapper>,
  )

const getChart = () =>
  cy
    .get(PLOT)
    .find('.echarts-for-react')
    .should('be.visible')
    .should($chart => expect(getInstanceByDom($chart[0])?.getOption()).not.to.equal(undefined))
    .then($chart => getInstanceByDom($chart[0])!)

const hoverSample = (chart: ECharts, { price, depth }: LiquiditySample) => {
  const [x, y] = chart.convertToPixel({ gridIndex: 0 }, [price, depth / 2])
  cy.get(PLOT).find('canvas').first().trigger('mousemove', x, y)
}

/** Read the actual canvas so incorrect bar positions, missing bars, and wrong theme colors fail. */
const pixelAt = (chart: ECharts, price: number, depth: number) => {
  const [x, y] = chart.convertToPixel({ gridIndex: 0 }, [price, depth])
  const canvas = chart.getDom().querySelector('canvas')!
  const scale = canvas.width / canvas.getBoundingClientRect().width
  return Array.from(canvas.getContext('2d')!.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data)
}

const rgba = (hex: `#${string}`) => [...[1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)), 255]

/** Check rendered label bounds, including rotation, without depending on their text. */
const expectChartLabelsVisible = (chart: ECharts) => {
  const labels = chart
    .getZr()
    .storage.getDisplayList()
    .filter(element => 'text' in element.style && !element.ignore && !element.invisible)
  expect(labels).not.to.be.empty
  labels.forEach(label => {
    // Copy local bounds before applying the transform into chart pixels.
    const bounds = label.getBoundingRect().clone()
    if (label.transform) bounds.applyTransform(label.transform)
    expect(bounds.x).to.be.at.least(0)
    expect(bounds.y).to.be.at.least(0)
    expect(bounds.x + bounds.width).to.be.at.most(chart.getWidth())
    expect(bounds.y + bounds.height).to.be.at.most(chart.getHeight())
  })
}

describe(`Liquidity density chart (${BREAKPOINT}, ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT})`, () => {
  beforeEach(() => cy.viewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT))

  it(`renders density on both sides of spot using the ${THEME} palette`, () => {
    mountChart({ theme: THEME })
    cy.get('[data-testid="liquidity-density-title"]').should('be.visible')
    cy.get(LEGEND).find('[data-testid="chart-legend-box"]').should('have.length', 2).and('be.visible')
    cy.get(LEGEND).find('[data-testid="chart-legend-line"]').should('not.exist')
    ;['current-price', 'center-price', 'oracle-price'].forEach(key => {
      cy.get(`[data-testid="liquidity-density-${key}"]`)
        .should('be.visible')
        .find('[data-testid="chart-legend-line"]')
        .should('be.visible')
    })
    getChart().should(chart => {
      const left = usdProfile.samples.find(sample => sample.high < usdProfile.spot)!
      const right = usdProfile.samples.findLast(sample => sample.low > usdProfile.spot)!
      expect(pixelAt(chart, left.price, left.depth / 2)).to.deep.equal(rgba(themes[THEME].design.Chart.Lines[7]))
      expect(pixelAt(chart, right.price, right.depth / 2)).to.deep.equal(rgba(themes[THEME].design.Chart.Lines[8]))
      // Reference markers must remain inside the plot, in the same price coordinate system as the bars.
      ;[chartProps.oraclePrice!, chartProps.centerPrice!, usdProfile.spot].forEach(price =>
        expect(chart.containPixel({ gridIndex: 0 }, chart.convertToPixel({ gridIndex: 0 }, [price, 0]))).to.equal(true),
      )
      expectChartLabelsVisible(chart)
    })
    cy.get(CHART).should($chart => expect($chart[0].getBoundingClientRect().right).to.be.at.most(VIEWPORT_WIDTH))
  })

  it('shows liquidity and deviation on hover without price markers', () => {
    mountChart()
    getChart().then(chart => hoverSample(chart, usdProfile.samples[10]))
    cy.get('[data-testid="liquidity-density-tooltip-depth"]').should('be.visible')
    cy.get('[data-testid="liquidity-density-tooltip-deviation"]').should('be.visible')
    cy.get(TOOLTIP).find('[data-testid="chart-legend-line"]').should('not.exist')
  })

  it('renders narrow stablecoin ranges and leaves unsolved intervals empty', () => {
    const gap = stableProfile.samples[10]
    mountChart({
      profile: { ...stableProfile, samples: stableProfile.samples.filter(sample => sample !== gap) },
      inputSymbol: 'USDT',
      centerPrice: peakPrice(stableCurve, [1, 0]),
      oraclePrice: undefined,
    })
    cy.get('[data-testid="liquidity-density-oracle-price-value"]')
      .should('be.visible')
      .and('not.have.attr', 'data-value')
    getChart().should(chart => {
      const sample = stableProfile.samples[9]
      expect(pixelAt(chart, sample.price, sample.depth / 2)).to.deep.equal(rgba(themes.light.design.Chart.Lines[7]))
      expect(pixelAt(chart, gap.price, gap.depth / 2)).not.to.deep.equal(rgba(themes.light.design.Chart.Lines[7]))
    })
    getChart().then(chart => hoverSample(chart, stableProfile.samples[9]))
    cy.get(TOOLTIP).should('be.visible')
  })

  it('values price metrics in USD and measures deviation from the liquidity center', () => {
    const outputTokenUsdPrice = 0.98
    const centerPrice = usdProfile.spot / 1.0245
    mountChart({ outputTokenUsdPrice, centerPrice })
    ;[
      { key: 'current-price', price: usdProfile.spot },
      { key: 'center-price', price: centerPrice },
      { key: 'oracle-price', price: chartProps.oraclePrice! },
    ].forEach(({ key, price }) => {
      cy.get(`[data-testid="liquidity-density-${key}-value"]`).should(
        'have.attr',
        'data-value',
        String(price * outputTokenUsdPrice),
      )
    })
    cy.get('[data-testid="liquidity-density-deviation-value"]').should($value => {
      expect(Number($value.attr('data-value'))).to.be.closeTo(2.45, 1e-10)
    })
  })

  it('resizes when its container width changes without a window resize', () => {
    mountChart()
    getChart().then(chart => {
      const initialWidth = chart.getWidth()
      // Constrain the chart container directly; its ResizeObserver must update the canvas to match the plot.
      cy.get(CHART).invoke('css', 'width', '50%')
      cy.get(PLOT).should($plot => {
        const resized = getInstanceByDom($plot[0].querySelector<HTMLElement>('.echarts-for-react')!)!
        const plotWidth = $plot[0].getBoundingClientRect().width
        expect(resized.getWidth()).to.equal(Math.round(plotWidth))
        expect(resized.getWidth()).to.be.lessThan(initialWidth)
      })
    })
  })

  it('shows loading without drawing a chart', () => {
    mountChart({ profile: undefined, isLoading: true })
    cy.get(PLOT).find('[role="progressbar"]').should('be.visible')
    cy.get(PLOT).find('canvas').should('not.exist')
  })

  it('shows an empty state when samples are missing', () => {
    mountChart({ profile: undefined })
    cy.get(PLOT).find('canvas').should('not.exist')
    cy.get(PLOT).find('[data-testid="liquidity-density-connect-wallet"]').should('be.visible')
    cy.get(PLOT).find('[data-testid="liquidity-density-unavailable"]').should('not.exist')
  })

  it('requests a wallet connection when samples are empty', () => {
    mountChart({ profile: { ...usdProfile, samples: [] } })
    cy.get(PLOT).find('[data-testid="liquidity-density-connect-wallet"]').should('be.visible')
    cy.get(PLOT).find('[data-testid="liquidity-density-unavailable"]').should('not.exist')
    cy.get(PLOT).find('canvas').should('not.exist')
  })

  it('shows query errors without drawing a chart', () => {
    mountChart({ profile: undefined, error: new Error('RPC unavailable') })
    cy.get(PLOT).find('[data-testid="chart-error"]').should('be.visible')
    cy.get(PLOT).find('canvas').should('not.exist')
  })
})
