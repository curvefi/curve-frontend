import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/EvmChartStateWrapper'
import { ChartStateWrapper, type ChartEmptyState } from '@ui/features/charts/ChartStateWrapper'
import { q } from '@ui/features/queries/util'

const HEIGHT = 240
const CHART = 'chart-content'
const SPINNER = '.MuiCircularProgress-root'

const ThrowingChart = () => {
  throw new Error('render failed')
}

type Points = string[]

const EMPTY_STATE: ChartEmptyState<Points> = {
  title: 'Nothing here',
  description: 'No points for this range',
  testId: 'chart-empty',
}

type StateProps = Partial<{
  data: Points | undefined
  isLoading: boolean
  error: Error | null
  emptyState: ChartEmptyState<Points> | undefined
  onReload: () => void
}>

const mountChart = (props: StateProps = {}, child = <div data-testid={CHART} />) => {
  const { isLoading = false, error = null, onReload } = props
  const data = 'data' in props ? props.data : ['point']
  const emptyState = 'emptyState' in props ? props.emptyState : EMPTY_STATE
  return cy.mount(
    <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={false}>
      <EvmChartStateWrapper
        query={q({ data, isLoading, error })}
        height={HEIGHT}
        emptyState={emptyState}
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
    mountChart({ isLoading: true, data: [], error: new Error('boom') })
    cy.get(SPINNER).should('be.visible')
    cy.get('[data-testid="chart-error"]').should('not.exist')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('shows the error with its message and reloads on click, before the empty state', () => {
    const onReload = cy.stub().as('reload')
    mountChart({ error: new Error('boom'), data: [], onReload })
    cy.get('[data-testid="chart-error"]')
      .should('have.css', 'min-height', `${HEIGHT}px`)
      .and('contain.text', 'Unable to fetch chart data.')
    cy.get('[data-testid="chart-empty"]').should('not.exist')
    cy.contains('button', 'Reload').click()
    cy.get('@reload').should('have.been.calledOnce')
  })

  it('shows the empty state with the given copy for an empty array', () => {
    mountChart({ data: [] })
    cy.get('[data-testid="chart-empty"]').should('contain.text', 'No points for this range')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('shows the default empty state for an empty array without empty state copy', () => {
    mountChart({ data: [], emptyState: undefined })
    cy.contains('No chart data found').should('be.visible')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('shows the empty state when the isEmpty selector matches non-empty data', () => {
    const isEmpty = cy.stub().as('isEmpty').returns(true)
    mountChart({ data: ['point'], emptyState: { ...EMPTY_STATE, isEmpty } })
    cy.get('@isEmpty').should('have.been.calledWith', ['point'])
    cy.get('[data-testid="chart-empty"]').should('contain.text', 'No points for this range')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('renders the chart for an empty array when the isEmpty selector does not match', () => {
    mountChart({ data: [], emptyState: { ...EMPTY_STATE, isEmpty: () => false } })
    cy.get(`[data-testid="${CHART}"]`).should('exist')
    cy.get('[data-testid="chart-empty"]').should('not.exist')
  })

  it('catches chart render errors', () => {
    cy.on('uncaught:exception', () => false)
    mountChart({}, <ThrowingChart />)
    cy.contains('Chart Error').should('be.visible')
  })

  it('shows the empty state while data is undefined without an error or loading flag', () => {
    mountChart({ data: undefined })
    cy.get('[data-testid="chart-empty"]').should('contain.text', 'No points for this range')
    cy.get(SPINNER).should('not.exist')
    cy.get(`[data-testid="${CHART}"]`).should('not.exist')
  })

  it('renders a connect wallet button from the empty state with the connection props', () => {
    const connect = cy.stub().as('connect').resolves()
    cy.mount(
      <ChartStateWrapper
        query={q<Points>({ data: [], isLoading: false, error: null })}
        height={HEIGHT}
        emptyState={{ ...EMPTY_STATE, button: { type: 'connect-wallet' } }}
        isConnected={false}
        isConnecting={false}
        connect={connect}
      >
        {() => <div data-testid={CHART} />}
      </ChartStateWrapper>,
    )
    cy.get('[data-testid="chart-empty"]').should('contain.text', 'No points for this range')
    cy.contains('button', 'Connect Wallet').click()
    cy.get('@connect').should('have.been.calledOnce')
  })
})
