export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets', {
    fixture: 'minting-markets.json',
  })

export const mockMintSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots?fetch_on_chain=true&limit=7', {
    fixture: 'minting-snapshots.json',
  })
