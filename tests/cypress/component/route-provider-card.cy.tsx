import { ThemeProvider } from '@mui/material/styles'
import { lightTheme } from '@ui-kit/themes'
import { RouteProviderCard } from '@ui-kit/widgets/RouteProvider/RouteProviderCard'

const theme = lightTheme()

const hexToRgb = (value: string) => {
  const parsed = Number.parseInt(value.replace('#', ''), 16)
  return `rgb(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255})`
}

const mountRouteProviderCard = () => {
  cy.mount(
    <ThemeProvider theme={theme}>
      <RouteProviderCard
        route={{ provider: 'curve', toAmountOutput: '69.4241', isLoading: false }}
        tokenSymbol="crvUSD"
        usdPrice={1.0}
        isSelected
        bestOutputAmount="69.4241"
        providerLabel="Curve"
        onSelect={() => undefined}
        icon={<span data-testid="route-icon" style={{ width: '16px', height: '16px', display: 'inline-block' }} />}
      />
    </ThemeProvider>,
  )
}

describe('RouteProviderCard', () => {
  it('renders with the expected card height', () => {
    mountRouteProviderCard()

    cy.get('[data-testid="route-provider-card"]').then(([$card]) => {
      const { height } = $card.getBoundingClientRect()
      expect(height).to.equal(48)
    })
  })

  it('updates background color on hover', () => {
    mountRouteProviderCard()

    cy.get('[data-testid="route-provider-card"]').should(
      'have.css',
      'background-color',
      hexToRgb(theme.design.Layer['1'].Fill),
    )
    cy.get('[data-testid="route-provider-card"]').invoke('addClass', 'cypress-hover')
    cy.get('[data-testid="route-provider-card"]').should(
      'have.css',
      'background-color',
      hexToRgb(theme.design.Layer.TypeAction.Hover),
    )
  })
})
