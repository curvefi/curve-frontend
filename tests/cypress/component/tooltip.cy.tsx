import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import Box from '@mui/material/Box'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { constQ } from '@ui-kit/types/util'
import { ReleaseChannel } from '@ui-kit/utils'

const mountTooltip = (tooltip: React.ReactElement) => cy.mount(<ComponentTestWrapper>{tooltip}</ComponentTestWrapper>)

const setReleaseChannel = (channel: ReleaseChannel) =>
  cy.window().then(win => win.localStorage.setItem('release-channel-v1', JSON.stringify(channel)))

const stubClipboard = () =>
  cy.window().then(win => {
    const writeText = cy.stub().resolves()
    Object.defineProperty(win.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    cy.wrap(writeText).as('writeText')
  })

describe('Tooltip', () => {
  beforeEach(() => setReleaseChannel(ReleaseChannel.Beta))

  it('renders title and body content in a drawer on mobile', () => {
    cy.viewport(400, 700)
    mountTooltip(
      <Tooltip
        title="Drawer title"
        body={
          <Box data-testid="drawer-body" sx={{ maxWidth: '20rem' }}>
            Drawer body
          </Box>
        }
      >
        <button data-testid="tooltip-trigger">Show tooltip</button>
      </Tooltip>,
    )

    cy.get('[data-testid="tooltip-trigger"]').trigger('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }],
    })
    cy.get('.MuiDrawer-paper')
      .should('be.visible')
      .and('contain.text', 'Drawer title')
      .and('contain.text', 'Drawer body')
    cy.get('[role="tooltip"]').should('not.exist')
    cy.get('[data-testid="drawer-body"]').should($body => {
      const parent = $body[0].parentElement
      const parentStyle = getComputedStyle(parent!)
      const availableWidth =
        parent!.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight)

      expect($body[0].getBoundingClientRect().width).to.be.closeTo(availableWidth, 1)
    })
  })

  it('renders body-only content without an empty title on mobile', () => {
    cy.viewport(400, 700)
    mountTooltip(
      <Tooltip title={null} body={<span>Body only</span>}>
        <button data-testid="tooltip-trigger">Show tooltip</button>
      </Tooltip>,
    )

    cy.get('[data-testid="tooltip-trigger"]').trigger('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }],
    })
    cy.get('.MuiDrawer-paper').should('contain.text', 'Body only').find('.MuiTypography-root').should('not.exist')
  })

  it('keeps the MUI tooltip presentation on desktop', () => {
    cy.viewport(1200, 700)
    mountTooltip(
      <Tooltip title="Desktop tooltip">
        <button data-testid="tooltip-trigger">Show tooltip</button>
      </Tooltip>,
    )

    cy.get('[data-testid="tooltip-trigger"]').focus()
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'Desktop tooltip')
    cy.get('.MuiDrawer-paper').should('not.exist')
  })

  it('keeps externally controlled tooltips on the MUI path', () => {
    cy.viewport(400, 700)
    mountTooltip(
      <Tooltip title="Controlled tooltip" open>
        <button>Controlled trigger</button>
      </Tooltip>,
    )

    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'Controlled tooltip')
    cy.get('.MuiDrawer-paper').should('not.exist')
  })

  it('copies a mobile metric value from the drawer action instead of the trigger', () => {
    cy.viewport(400, 700)
    stubClipboard()
    mountTooltip(
      <Metric
        category="storybook.metric.standard"
        label="Metric"
        value={constQ(123.45)}
        valueTooltip={{ title: 'Metric value' }}
      />,
    )

    cy.get('[data-testid="metric-value"]')
      .trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      .trigger('click', { force: true })
    cy.get('@writeText').should('not.have.been.called')

    cy.get('.MuiDrawer-paper').find('button').contains('Copy value').click()
    cy.get('@writeText').should('have.been.calledOnceWith', '123.45')
  })

  it('does not copy from the metric tap when its mobile tooltip is disabled', () => {
    cy.viewport(400, 700)
    stubClipboard()
    mountTooltip(
      <Metric
        category="storybook.metric.standard"
        label="Metric"
        value={constQ(123.45)}
        valueOptions={{ disableTooltip: true }}
      />,
    )

    cy.get('[data-testid="metric-value"]').click()
    cy.get('@writeText').should('not.have.been.called')
    cy.get('.MuiDrawer-paper').should('not.exist')
  })

  it('keeps existing mobile tooltip and copy behavior outside beta', () => {
    cy.viewport(400, 700)
    setReleaseChannel(ReleaseChannel.Stable)
    stubClipboard()
    mountTooltip(
      <>
        <Tooltip title="Stable tooltip">
          <button data-testid="tooltip-trigger">Show tooltip</button>
        </Tooltip>
        <Metric category="storybook.metric.standard" label="Metric" value={constQ(123.45)} />
      </>,
    )

    cy.get('[data-testid="tooltip-trigger"]').focus()
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'Stable tooltip')
    cy.get('[data-testid="metric-value"]').click()
    cy.get('@writeText').should('have.been.calledOnceWith', '123.45')
    cy.get('.MuiDrawer-paper').should('not.exist')
  })
})
