export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets', {
    fixture: 'minting-markets.json',
  })

export const mockMintSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots*', {
    fixture: 'minting-snapshots.json',
  })
