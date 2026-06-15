import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { allViewports } from '@cy/support/ui'
import type { BaseConfig } from '@ui/utils'
import type { RouteResponse } from '@ui-kit/entities/router-api'
import { lightTheme } from '@ui-kit/themes'
import { constQ, q, type QueryProp } from '@ui-kit/types/util'
import { RouteProviderCard } from '@ui-kit/widgets/RouteProvider/RouteProviderCard'

const { design } = lightTheme()

const hexToRgb = (value: string) => {
  const parsed = Number.parseInt(value.replace('#', ''), 16)
  return `rgb(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255})`
}

const mountRouteProviderCard = ({
  isSelected = true,
  enabled = true,
  route = {
    id: 'curve',
    router: 'curve',
    amountIn: ['69424100000000000000'],
    amountOut: ['69424100000000000000'],
    priceImpact: 0.01,
    gas: null,
    createdAt: Date.now(),
    warnings: [],
    route: [
      {
        name: 'Curve',
        tokenIn: ['0x0000000000000000000000000000000000000000'],
        tokenOut: ['0x0000000000000000000000000000000000000000'],
        protocol: 'curve',
        action: 'swap',
        chainId: 1,
      },
    ],
    tx: {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x',
      from: '0x0000000000000000000000000000000000000000',
      value: '0',
    },
  },
  isLoading = false,
  usdRate = constQ(1),
}: {
  isSelected?: boolean
  enabled?: boolean
  route?: RouteResponse | null
  isLoading?: boolean
  usdRate?: QueryProp<number>
} = {}) => {
  cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig}>
      <RouteProviderCard
        query={{
          isFetching: false,
          enabled,
          ...q<RouteResponse | null>({ error: null, isLoading, data: route }),
        }}
        networks={{ 1: { name: 'Ethereum' } as BaseConfig }}
        chainId={1}
        tokenOut={{ symbol: 'crvUSD', decimals: 18, usdRate }}
        isSelected={isSelected}
        bestOutputAmount="69.4241"
        router="curve"
        onSelect={() => undefined}
      />
    </ComponentTestWrapper>,
  )
}

allViewports().forEach(([width, height, breakpoint]) => {
  describe(`RouteProviderCard (${breakpoint})`, () => {
    beforeEach(() => {
      cy.viewport(width, height)
    })

    it('renders route amount and USD notional', () => {
      mountRouteProviderCard()
      cy.get('[data-testid="route-provider-amount"]').should('have.text', '69.42')
      cy.get('[data-testid="route-provider-usd"]').should('have.text', '~$69.42')
    })

    it('renders placeholders while route data is loading', () => {
      mountRouteProviderCard({ route: null, isLoading: true })
      cy.get('[data-testid="route-provider-amount"]').should('have.text', '0.00001')
      cy.get('[data-testid="route-provider-usd"]').should('have.text', '0.001')
    })

    it('renders empty amount and no-route USD state without a route', () => {
      mountRouteProviderCard({ route: null })
      cy.get('[data-testid="route-provider-amount"]').should('have.text', '-')
      cy.get('[data-testid="route-provider-usd"]').should('have.text', 'No route available')
    })

    it('renders USD placeholder while token USD rate is loading', () => {
      mountRouteProviderCard({ usdRate: q<number>({ data: undefined, error: null, isLoading: true }) })
      cy.get('[data-testid="route-provider-amount"]').should('have.text', '69.42')
      cy.get('[data-testid="route-provider-usd"]').should('have.text', '0.001')
    })

    it('renders with the expected card height', () => {
      mountRouteProviderCard()
      cy.get('[data-testid="route-provider-card"]').then(([$card]) => {
        const { height } = $card.getBoundingClientRect()
        expect(height).to.equal(breakpoint === 'mobile' ? 46 : 48)
      })
    })

    it('updates background color on hover for selected card', () => {
      mountRouteProviderCard({ isSelected: true })
      cy.get('[data-testid="route-provider-card"]').should(
        'have.css',
        'background-color',
        hexToRgb(design.Layer.TypeAction.Selected),
      )
      cy.get('[data-testid="route-provider-card"]').invoke('addClass', 'cypress-hover')
      cy.get('[data-testid="route-provider-card"]').should(
        'have.css',
        'background-color',
        hexToRgb(design.Layer.TypeAction.Hover),
      )
    })

    it('updates background color on hover for unselected card', () => {
      mountRouteProviderCard({ isSelected: false })
      cy.get('[data-testid="route-provider-card"]').should(
        'have.css',
        'background-color',
        hexToRgb(design.Layer[1].Fill),
      )
      cy.get('[data-testid="route-provider-card"]').invoke('addClass', 'cypress-hover')
      cy.get('[data-testid="route-provider-card"]').should(
        'have.css',
        'background-color',
        hexToRgb(design.Layer.TypeAction.Hover),
      )
    })

    it('renders disabled state when route provider is unavailable', () => {
      mountRouteProviderCard({ enabled: false })
      cy.get('[data-testid="route-provider-rows"]')
        .should('have.css', 'opacity', '0.5')
        .and('have.css', 'pointer-events', 'none')
        .and('have.css', 'cursor', 'not-allowed')
    })
  })
})
