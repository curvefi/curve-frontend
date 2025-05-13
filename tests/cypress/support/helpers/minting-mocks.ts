export const mockChains = (chains = ['ethereum', 'arbitrum']) =>
  cy.intercept('https://prices.curve.finance/v1/chains/', {
    body: { data: chains.map((name) => ({ name })) },
  })

export const mockMintMarkets = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*', (req) => {
    const chain = new URL(req.url).pathname.split('/').pop()
    req.reply(
      chain == 'ethereum' ? { fixture: 'minting-markets.json' } : { chain, page: 1, per_page: 10, count: 0, data: [] },
    )
  })

export const mockMintSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots?agg=none', {
    fixture: 'minting-snapshots.json',
  })
