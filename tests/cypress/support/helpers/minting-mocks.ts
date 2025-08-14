export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets?fetch_on_chain=true', {
    fixture: 'minting-markets.json',
  })

export const mockMintSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots?agg=none&fetch_on_chain=true', {
    fixture: 'minting-snapshots.json',
  })
