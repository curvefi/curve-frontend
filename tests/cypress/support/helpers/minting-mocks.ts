export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets?fetch_on_chain=false', {
    fixture: 'minting-markets.json',
  })

export const mockMintSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots?agg=none', {
    fixture: 'minting-snapshots.json',
  })
