import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type EmptyParams = Record<string, never>

const menu = [
  { value: 'loan-increase', label: 'Borrow', component: () => <div data-testid="borrow-panel">Borrow form</div> },
  { value: 'loan-decrease', label: 'Repay', component: () => <div data-testid="repay-panel">Repay form</div> },
  {
    value: 'collateral',
    label: 'Collateral',
    component: () => <div data-testid="collateral-panel">Collateral form</div>,
  },
] satisfies FormTab<EmptyParams>[]

const openMobileAction = (action: string, panelTestId: string) => {
  cy.get(`[data-testid="mobile-form-action-${action}"]`, LOAD_TIMEOUT).should('be.visible').click()
  cy.get('[data-testid="mobile-form-drawer"]', LOAD_TIMEOUT).should('be.visible')
  cy.get(`[data-testid="${panelTestId}"]`).should('be.visible')
  cy.get('body').type('{esc}')
  cy.get('[data-testid="mobile-form-drawer"]').should('not.be.visible')
}

describe('Mobile FormTabs drawer', () => {
  it('opens the drawer on the selected market action', () => {
    cy.viewport(390, 900)
    cy.mount(
      <ComponentTestWrapper>
        <FormTabs withMobileDrawer params={{}} menu={menu} />
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="mobile-form-action-bar"]', LOAD_TIMEOUT).should('be.visible')
    cy.get('[data-testid="borrow-panel"]').should('not.be.visible')

    openMobileAction('loan-increase', 'borrow-panel')
    openMobileAction('loan-decrease', 'repay-panel')
    openMobileAction('collateral', 'collateral-panel')
  })
})
