import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { closeDrawer } from '@cy/support/helpers/data-table.helpers'
import { LOAD_TIMEOUT, oneMobileViewport } from '@cy/support/ui'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type EmptyParams = Record<string, never>

const menu = [
  { value: 'loan-increase', label: 'Borrow', component: () => <div data-testid="borrow-panel">Borrow form</div> },
  { value: 'loan-decrease', label: 'Repay', component: () => <div data-testid="repay-panel">Repay form</div> },
  {
    value: 'collateral',
    label: 'Collateral',
    subTabs: [
      {
        value: 'add',
        label: 'Add',
        component: () => <div data-testid="add-collateral-panel">Add collateral form</div>,
      },
      {
        value: 'remove',
        label: 'Remove',
        component: () => <div data-testid="remove-collateral-panel">Remove collateral form</div>,
      },
    ],
  },
] satisfies FormTab<EmptyParams>[]

// Inactive tab panels may be unmounted, so cy.get(...).should('not.be.visible') can time out before selection.
const shouldBeInvisibleOrNotExist = (testId: string) => {
  cy.get('body').then($body => {
    const selector = `[data-testid="${testId}"]`
    if ($body.find(selector).length) cy.get(selector).should('not.be.visible')
  })
}

const openMobileAction = (action: string, label: string, panelTestId: string, assertDrawer?: () => void) => {
  shouldBeInvisibleOrNotExist(panelTestId)
  cy.get(`[data-testid="mobile-form-action-${action}"]`, LOAD_TIMEOUT).click()
  cy.get('[data-testid="mobile-form-drawer"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="mobile-form-active-action"]').should('be.visible').and('have.text', label)
  cy.get(`[data-testid="tab-${action}"]`).should('not.exist')
  cy.get(`[data-testid="${panelTestId}"]`).should('be.visible')
  assertDrawer?.()
  closeDrawer('mobile')
  cy.get(`[data-testid="${panelTestId}"]`).should('not.be.visible')
}
const [width, height] = oneMobileViewport()

describe('Mobile FormTabs drawer', () => {
  beforeEach(() => cy.viewport(width, height))
  it('opens the drawer on the selected market action', () => {
    cy.mount(
      <ComponentTestWrapper>
        <FormTabs withMobileDrawer params={{}} menu={menu} />
      </ComponentTestWrapper>,
    )

    openMobileAction('loan-increase', 'Borrow', 'borrow-panel')
    openMobileAction('loan-decrease', 'Repay', 'repay-panel')
    openMobileAction('collateral', 'Collateral', 'add-collateral-panel', () => {
      cy.get('[data-testid="tab-add"]').should('be.visible')
      cy.get('[data-testid="tab-remove"]').should('be.visible')
    })
  })
})
