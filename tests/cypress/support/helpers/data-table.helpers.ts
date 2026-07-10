import { Breakpoint } from '@cy/support/ui'

/**
 * Makes sure that the filter chips are visible during the given callback.
 * On mobile, the filters are hidden behind a drawer and need to be expanded for some actions.
 */
export function withFilterChips<T>(breakpoint: Breakpoint, callback: () => Cypress.Chainable<T>) {
  if (breakpoint !== 'mobile') return callback()
  cy.get('[data-testid^="btn-drawer-filter-"]').click()
  return callback().then(result => {
    cy.get('body').click(0, 0)
    return cy.wrap(result)
  })
}

export const getHiddenCount = (breakpoint: Breakpoint): Cypress.Chainable<string> =>
  withFilterChips(breakpoint, () => cy.get('[data-testid="hidden-market-count"]').then(([{ innerText }]) => innerText))

export function expandFirstRowOnMobile(breakpoint: Breakpoint) {
  if (breakpoint == 'mobile') {
    cy.get(`[data-testid="expand-icon"]`).first().click()
    cy.get(`[data-testid="data-table-expansion-row"]`).should('be.visible')
  }
}

/**
 * Makes expanded-panel drawer actions available during the given callback. On mobile, actions are inside a row
 * expansion and the kebab drawer.
 */
export function withExpandedPanelDrawer<T>(breakpoint: Breakpoint, callback: () => Cypress.Chainable<T>) {
  if (breakpoint === 'mobile') {
    cy.get('body').then($body => {
      if (!$body.find('[data-testid="data-table-expansion-row"]').length) {
        expandFirstRowOnMobile(breakpoint)
      }
    })
    cy.get('[data-testid="data-table-expansion-row"]').should('be.visible')
    cy.get('[data-testid="expanded-panel-actions-menu-button"]').click()
    cy.get('[data-testid="expanded-panel-actions-menu"]').should('be.visible')
  }

  return callback().then(result => {
    if (breakpoint === 'mobile') {
      // The drawer can be hidden or unmounted depending on the state of the expanded panel. This works for both cases
      cy.get('[data-testid="expanded-panel-actions-menu"]:visible').should('not.exist')
    }
    return cy.wrap(result)
  })
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

export function withFilters<T>(breakpoint: Breakpoint, callback: () => Cypress.Chainable<T>) {
  cy.get(`[data-testid="btn-open-filters"]`).click({ waitForAnimations: true })
  if (breakpoint !== 'mobile') {
    cy.get('[data-testid="table-filters-popover"]').should('be.visible')
  }
  return callback().then(result => {
    if (breakpoint === 'mobile') {
      closeDrawer(breakpoint)
    } else {
      cy.get('[data-testid="btn-close-filters"]').click({ waitForAnimations: true })
      cy.get('[data-testid="btn-close-filters"]').should('not.exist')
    }
    return cy.wrap(result)
  })
}

export const withMultiSelectFilter = <T>(
  { id, clearOnClose = false }: { id: string; clearOnClose?: boolean },
  callback?: () => Cypress.Chainable<T>,
) => {
  cy.get(`[data-testid="multi-select-filter-${id}"]`).click() // open the menu
  return (callback ? callback() : cy.wrap(undefined as T)).then(result => {
    // clearing the filters automatically close the menu
    if (clearOnClose) {
      cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens and close
    } else {
      cy.get('body').click(0, 0) // close multi select token popover
    }
    cy.get(`[data-testid="menu-${id}"]`).should('not.exist') // wait for the menu to close
    return cy.wrap(result)
  })
}

export function closeSlider(breakpoint: Breakpoint) {
  cy.get('body').click(0, 0, { waitForAnimations: true })
  cy.get(`[data-testid^="slider-"]`).should('not.exist')
  closeDrawer(breakpoint)
}

export const getTableCellAssets = () => cy.get('[data-testid="data-table-cell-assets"]')
