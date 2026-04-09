export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets', {
    fixture: 'minting-markets.json',
  })

export const mockMintSnapshots = ({ limit = 7 }: { limit?: number } = {}) =>
  cy.intercept(`https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots?agg=day*limit=${limit}`, {
    fixture: 'minting-snapshots.json',
  })
