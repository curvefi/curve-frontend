import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { allViewports } from '@cy/support/ui'
import type { BaseConfig } from '@ui/utils'
import { lightTheme } from '@ui-kit/themes'
import { constQ, q } from '@ui-kit/types/util'
import { RouteProviderCard } from '@ui-kit/widgets/RouteProvider/RouteProviderCard'

const { design } = lightTheme()

const hexToRgb = (value: string) => {
  const parsed = Number.parseInt(value.replace('#', ''), 16)
  return `rgb(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255})`
}

const mountRouteProviderCard = ({
  isSelected = true,
  enabled = true,
}: { isSelected?: boolean; enabled?: boolean } = {}) => {
  cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig}>
      <RouteProviderCard
        query={{
          isFetching: false,
          enabled,
          ...q({
            error: null,
            isLoading: false,
            data: {
              id: 'curve',
              router: 'curve',
              amountIn: ['694241694241'],
              amountOut: ['694241694241'],
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
          }),
        }}
        networks={{ 1: { name: 'Ethereum' } as BaseConfig }}
        chainId={1}
        tokenOut={{ symbol: 'crvUSD', decimals: 18, usdRate: constQ(1) }}
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
