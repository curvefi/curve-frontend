import { oneOf } from '@cy/support/generators'
import { DISCLAIMER_TABS, TABS as LEGAL_PAGE_TABS } from '@ui-kit/widgets/Legal/constants'
import { LOAD_TIMEOUT } from '../ui'

export const oneLegalPageTab = () => oneOf(...LEGAL_PAGE_TABS.map((tab) => tab.value))
export const oneDisclaimersSubTabs = () => oneOf(...DISCLAIMER_TABS.map((tab) => tab.value))

const isTabClickable = ($tab: JQuery) => window.getComputedStyle($tab[0]).pointerEvents !== 'none'

export const clickTab = (testIdPrefix: string, value: string, options: Partial<Cypress.Timeoutable> = LOAD_TIMEOUT) => {
  const tab = cy
    .get(`[data-testid="${testIdPrefix}-container"]`, options)
    .get(`[data-testid="${testIdPrefix}-${value}"]`, options)

  tab.then(($tab) => {
    // check if the tab is clickable
    if (isTabClickable($tab)) {
      cy.wrap($tab).click({ force: true })
      return
    }
    // if not clickable, find it in the kebab menu and click it
    cy.get(`[data-testid="${testIdPrefix}-kebab-button"]`, options).click({ force: true })
    cy.get(`[data-testid="${testIdPrefix}-kebab-menu"]`, options)
      .get(`[data-testid="${testIdPrefix}-${value}"]`, options)
      .click({ force: true })
  })
}
