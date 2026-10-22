import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'

const HEIGHT = 240
const CHART = 'chart-content'

const ThrowingChart = () => {
  throw new Error('render failed')
}

type StateProps = Partial<{ isLoading: boolean; isEmpty: boolean; error: Error | null; onReload: () => void }>

const mountChart = (
  { isLoading = false, isEmpty = false, error = null, onReload }: StateProps = {},
  child = <div data-testid={CHART} />,
) =>
  cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={false}>
      <EvmChartStateWrapper
        height={HEIGHT}
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyTitle="Nothing here"
        emptyMessage="No points for this range"
        emptyTestId="chart-empty"
        error={error}
        errorMessage="Unable to fetch chart data."
        refreshData={onReload}
      >
        {child}
      </EvmChartStateWrapper>
    </ComponentTestWrapper>,
  )

describe('Chart states', () => {
  it('renders the chart when data is ready', () => {
    mountChart()
    cy.get(`[data-testid="${CHART}"]`).should('exist')
  })

  it('shows a spinner while loading, even with an error or empty data', () => {
    mountChart({ isLoading: true, isEmpty: true, error: new Error('boom') })
    cy.get('.MuiCircularProgress-root').should('be.visible')
    cy.get('[data-testid="chart-error"]').should('not.exist')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('shows the error with its message and reloads on click, before the empty state', () => {
    const onReload = cy.stub().as('reload')
    mountChart({ error: new Error('boom'), isEmpty: true, onReload })
    cy.get('[data-testid="chart-error"]')
      .should('have.css', 'min-height', `${HEIGHT}px`)
      .and('contain.text', 'An error occurred')
      .and('contain.text', 'Unable to fetch chart data.')
    cy.get('[data-testid="chart-empty"]').should('not.exist')
    cy.contains('button', 'Reload').click()
    cy.get('@reload').should('have.been.calledOnce')
  })

  it('shows the empty state with the given copy', () => {
    mountChart({ isEmpty: true })
    cy.get('[data-testid="chart-empty"]')
      .should('contain.text', 'Nothing here')
      .and('contain.text', 'No points for this range')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('catches chart render errors', () => {
    cy.on('uncaught:exception', () => false)
    mountChart({}, <ThrowingChart />)
    cy.contains('Chart Error').should('be.visible')
  })
})
