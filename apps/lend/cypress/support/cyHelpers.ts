export function getByTestId(value: string) {
  return cy.get(`[data-testid=${value}]`)
}
