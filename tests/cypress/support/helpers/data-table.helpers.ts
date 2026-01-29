/* eslint-disable */
import { Breakpoint, e2eBaseUrl } from '@cy/support/ui'

/**
 * Makes sure that the filter chips are visible during the given callback.
 * On mobile, the filters are hidden behind a drawer and need to be expanded for some actions.
 */
export function withFilterChips(breakpoint: Breakpoint, callback: () => Cypress.Chainable) {
  if (breakpoint !== 'mobile') return callback()
  cy.get('[data-testid="btn-drawer-filter-dex-pools"]').click()
  return callback().then((result) => {
    cy.get('body').click(0, 0)
    return cy.wrap(result)
  })
}

export const getHiddenCount = (breakpoint: Breakpoint) =>
  withFilterChips(breakpoint, () => cy.get('[data-testid="hidden-market-count"]').then(([{ innerText }]) => innerText))

export function toggleSmallPools(breakpoint: Breakpoint) {
  if (breakpoint === 'desktop') {
    cy.get(`[data-testid='user-profile-button']`).click()
    cy.get(`[data-testid='small-pools-switch']`).click()
    cy.get('body').click(0, 0) // close the user profile menu
  } else {
    cy.get(`[data-testid='menu-toggle']`).click()
    cy.get(`[data-testid='sidebar-settings']`).click()
    cy.get(`[data-testid='small-pools-switch']`).click()
    cy.get(`[data-testid='menu-toggle']`).click()
  }
}

export const firstRow = () => cy.get(`[data-testid^="data-table-row-"]`).first()

export function expandFirstRowOnMobile(breakpoint: Breakpoint) {
  if (breakpoint == 'mobile') {
    cy.get(`[data-testid="expand-icon"]`).first().click()
    cy.get(`[data-testid="data-table-expansion-row"]`).should('be.visible')
  }
}

export function openDrawer(breakpoint: Breakpoint, type: 'filter' | 'sort') {
  if (breakpoint == 'mobile') {
    cy.get(`[data-testid^="btn-drawer-${type}-"]`).click({ waitForAnimations: true })
  }
}

export function closeDrawer(breakpoint: Breakpoint) {
  if (breakpoint == 'mobile') {
    cy.get('body').click(0, 0)
  }
}

export function expandFilters(breakpoint: Breakpoint) {
  if (breakpoint == 'mobile') {
    openDrawer(breakpoint, 'filter')
  } else {
    cy.get(`[data-testid="btn-expand-filters"]`).click({ waitForAnimations: true })
  }
}

export function closeSlider(breakpoint: Breakpoint) {
  cy.get('body').click(0, 0, { waitForAnimations: true })
  cy.get(`[data-testid^="slider-"]`).should('not.exist')
  closeDrawer(breakpoint)
}

export function checkTvlFilterWithSmallPool(breakpoint: Breakpoint, expectedPath: string) {}
