import { range } from '@/support/generators'

/**
 * Cypress does not allow queries that return 0 or more elements. This works around by using the underlying jQuery.
 */
export const cyForEach = (
  selector: string,
  callback: (chainable: Cypress.Chainable<JQuery<HTMLElement>>) => void,
  parent: string = 'body',
) =>
  cy.get(parent).then(($parent) => {
    const items: JQuery<HTMLElement> = $parent.find(selector)
    cy.log(`Found ${items.length} elements for selector ${selector} within ${parent}`)
    // get items in reverse and query them again, because they may be removed
    const results = range(items.length)
      .reverse()
      .map((i) => callback(cy.get(`${parent} ${selector}`).eq(i)))
    return cy.wrap(results)
  })
