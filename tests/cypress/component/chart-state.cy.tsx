import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/EvmChartStateWrapper'
import { q } from '@ui/features/queries/util'

const HEIGHT = 240
const CHART = 'chart-content'
const SPINNER = '.MuiCircularProgress-root'

const ThrowingChart = () => {
  throw new Error('render failed')
}

type StateProps = Partial<{
  data: string | undefined
  isLoading: boolean
  isEmpty: boolean
  error: Error | null
  onReload: () => void
}>

const mountChart = (props: StateProps = {}, child = <div data-testid={CHART} />) => {
  const { isLoading = false, isEmpty = false, error = null, onReload } = props
  const data = 'data' in props ? props.data : 'points'
  return cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={false}>
      <EvmChartStateWrapper
        query={q({ data, isLoading, error })}
        height={HEIGHT}
        isEmpty={isEmpty}
        emptyState={{ title: 'Nothing here', description: 'No points for this range', testId: 'chart-empty' }}
        errorState={{ description: 'Unable to fetch chart data.', onReload }}
      >
        {() => child}
      </EvmChartStateWrapper>
    </ComponentTestWrapper>,
  )
}

describe('Chart states', () => {
  it('renders the chart when data is ready', () => {
    mountChart()
    cy.get(`[data-testid="${CHART}"]`).should('exist')
  })

  it('shows a spinner while loading, even with an error or empty data', () => {
    mountChart({ isLoading: true, isEmpty: true, error: new Error('boom') })
    cy.get(SPINNER).should('be.visible')
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

  it('shows a spinner while data is undefined without an error or loading flag', () => {
    mountChart({ data: undefined })
    cy.get(SPINNER).should('be.visible')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('shows the empty state over the pending spinner', () => {
    mountChart({ data: undefined, isEmpty: true })
    cy.get('[data-testid="chart-empty"]').should('contain.text', 'Nothing here')
    cy.get(SPINNER).should('not.exist')
  })
})
