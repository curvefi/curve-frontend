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
const tokenProfile = liquidityProfile(cryptoCurve, [1, 0], { points: 48 })!
const usdProfile = valueLiquidityProfile(tokenProfile, 111_124.75)!
const stableCurve = createStableSwapCurve([1_400_000, 600_000], [1, 1], 200)!
const stableProfile = liquidityProfile(stableCurve, [1, 0], { points: 48 })!
const chartProps: LiquidityDensityChartProps = {
  profile: usdProfile,
  inputSymbol: 'WBTC',
  outputSymbol: 'USDC',
  unit: 'dollar',
  oraclePrice: 109_500,
  centerPrice: peakPrice(cryptoCurve, [1, 0]),
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
    <ComponentTestWrapper config={mockedWagmiConfig}>
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

/** Check the rendered canvas text, including rotation, to catch clipped axis titles. */
const expectAxisTitleVisible = (chart: ECharts, title: string) => {
  const label = chart
    .getZr()
    .storage.getDisplayList()
    .find(element => 'text' in element.style && element.style.text === title)
  expect(label, title).not.to.be.undefined
  // Text bounds are local to the label. Copy them so the rotation/translation into chart pixels does not mutate ECharts' layout.
  const bounds = label!.getBoundingRect().clone()
  if (label!.transform) bounds.applyTransform(label!.transform)
  expect(bounds.x, `${title} left`).to.be.at.least(0)
  expect(bounds.y, `${title} top`).to.be.at.least(0)
  expect(bounds.x + bounds.width, `${title} right`).to.be.at.most(chart.getWidth())
  expect(bounds.y + bounds.height, `${title} bottom`).to.be.at.most(chart.getHeight())
}

describe(`Liquidity density chart (${BREAKPOINT}, ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT})`, () => {
  beforeEach(() => cy.viewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT))

  it(`renders density on both sides of spot using the ${THEME} palette`, () => {
    mountChart({ theme: THEME })
    cy.get('[data-testid="liquidity-density-title"]').should('be.visible').and('have.text', 'Liquidity distribution')
    ;['Internal price oracle', 'Center of liquidity', 'Current price', 'WBTC', 'USDC'].forEach(label => {
      cy.get(LEGEND).should('be.visible').and('contain.text', label)
    })
    getChart().should(chart => {
      const left = usdProfile.samples.find(sample => sample.high < usdProfile.spot)!
      const right = usdProfile.samples.findLast(sample => sample.low > usdProfile.spot)!
      expect(pixelAt(chart, left.price, left.depth / 2)).to.deep.equal(rgba(themes[THEME].design.Chart.Lines[1]))
      expect(pixelAt(chart, right.price, right.depth / 2)).to.deep.equal(rgba(themes[THEME].design.Chart.Lines[2]))
      // Reference markers must remain inside the plot, in the same price coordinate system as the bars.
      ;[chartProps.oraclePrice!, chartProps.centerPrice!, usdProfile.spot].forEach(price => {
        expect(chart.containPixel({ gridIndex: 0 }, chart.convertToPixel({ gridIndex: 0 }, [price, 0]))).to.equal(true)
      })
      expectAxisTitleVisible(chart, 'Liquidity in 1% range in USD')
      expectAxisTitleVisible(chart, 'USDC per WBTC')
    })
    cy.get(CHART).should($chart => expect($chart[0].getBoundingClientRect().right).to.be.at.most(VIEWPORT_WIDTH))
  })

  it('shows the sampled price and USD depth on hover', () => {
    mountChart()
    getChart().then(chart => hoverSample(chart, usdProfile.samples[10]))
    cy.get('[data-testid="liquidity-density-tooltip-depth"]').should('be.visible').and('contain.text', '$')
    cy.get('[data-testid="liquidity-density-tooltip-deviation"]').should('be.visible').and('contain.text', '%')
  })

  it('renders narrow stablecoin ranges and leaves unsolved intervals empty', () => {
    const gap = stableProfile.samples[10]
    mountChart({
      profile: { ...stableProfile, samples: stableProfile.samples.filter(sample => sample !== gap) },
      inputSymbol: 'USDT',
      centerPrice: peakPrice(stableCurve, [1, 0]),
      oraclePrice: undefined,
    })
    cy.get(LEGEND).should('not.contain.text', 'Internal price oracle')
    getChart().should(chart => {
      const sample = stableProfile.samples[9]
      expect(pixelAt(chart, sample.price, sample.depth / 2)).to.deep.equal(rgba(themes.light.design.Chart.Lines[1]))
      expect(pixelAt(chart, gap.price, gap.depth / 2)).not.to.deep.equal(rgba(themes.light.design.Chart.Lines[1]))
    })
    getChart().then(chart => hoverSample(chart, stableProfile.samples[9]))
    cy.get(TOOLTIP).should('be.visible').and('contain.text', 'USDC per USDT')
  })

  it('labels unavailable USD valuation in token units', () => {
    mountChart({ profile: tokenProfile, unit: { symbol: ' WBTC', position: 'suffix' } })
    getChart().should(chart => {
      expectAxisTitleVisible(chart, 'Liquidity in 1% range in WBTC')
      const hasTokenTick = chart
        .getZr()
        .storage.getDisplayList()
        .some(
          element =>
            'text' in element.style &&
            typeof element.style.text === 'string' &&
            /^\d[\d.,]* WBTC$/.test(element.style.text),
        )
      expect(hasTokenTick, 'Y-axis ticks include the token unit').to.be.true
    })
    getChart().then(chart => hoverSample(chart, tokenProfile.samples[10]))
    cy.get('[data-testid="liquidity-density-tooltip-depth"]')
      .should('be.visible')
      .and('contain.text', ' WBTC')
      .and('not.contain.text', '$')
  })

  it('resizes when its card width changes without a window resize', () => {
    mountChart()
    getChart().then(chart => {
      const initialWidth = chart.getWidth()
      // Constrain the production card directly; its ResizeObserver must update the canvas to match the plot.
      cy.get(CHART).invoke('css', 'width', '50%')
      cy.get(PLOT).should($plot => {
        const resized = getInstanceByDom($plot[0].querySelector<HTMLElement>('.echarts-for-react')!)!
        const plotWidth = $plot[0].getBoundingClientRect().width
        expect(resized.getWidth()).to.equal(Math.round(plotWidth))
        expect(resized.getWidth()).to.be.lessThan(initialWidth)
      })
    })
  })

  it('handles loading, unavailable data, and query errors without drawing a chart', () => {
    mountChart({ profile: undefined, isLoading: true })
    cy.get(PLOT).find('[role="progressbar"]').should('be.visible')
    cy.get(PLOT).find('canvas').should('not.exist')
    mountChart({ profile: undefined })
    cy.get(PLOT).find('[data-testid="liquidity-density-connect-wallet"]').should('be.visible')
    cy.get(PLOT).find('[data-testid="liquidity-density-unavailable"]').should('not.exist')
    cy.get(PLOT).find('canvas').should('not.exist')
    mountChart({ profile: undefined, error: new Error('RPC unavailable') })
    cy.get(PLOT).should('be.visible').and('contain.text', 'Unable to fetch liquidity distribution.')
    cy.get(PLOT).find('canvas').should('not.exist')
  })
})
