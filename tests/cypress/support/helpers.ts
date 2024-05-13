export function dataTestId(value: string) {
  return cy.get(`[data-testid=${value}]`)
}
