const [standard, extended, long, superSlow] = [30, 90, 120, 180].map((seconds): Cypress.Timeoutable => ({
  timeout: seconds * 1000,
}))

/**
 * Select the dependency and operation being awaited, including for data displayed in the DOM.
 * Use ui.* once the data is ready; use mock.* when the dependency is stubbed.
 *
 * Initial budgets preserve the largest previous timeout assigned to each category. In particular,
 * UI and mocked API budgets remain generous deliberately; tightening them is a separate change.
 * Keep these independent of query refresh intervals, SDK deadlines and Cypress's command defaults.
 */
export const TIMEOUTS = {
  // Browser rendering, interaction, client routing, document loading and Firefox test isolation.
  'ui.render': long,
  'ui.interaction': extended,
  'ui.navigation': long,
  'ui.pageLoad': long,
  'ui.teardown': standard,

  // prices.curve.finance: market details, historical rates, OHLC, participants/events and refuel data.
  'prices.snapshots': long,
  'prices.charts': long,
  'prices.activity': long,
  'prices.refuel': long,
  'prices.pools': long, // prices.curve.finance/v1/chains/:chain
  'curveLite.pools': long, // api2.curve.finance/get_pools/:chainId
  'router.tokens': long, // /api/router/v1/tokens
  'router.routes': extended, // /api/router/v1/routes

  // Chain reads and previews are distinct from submission/receipt confirmation.
  'evm.balances': extended,
  'evm.contractRead': extended,
  'evm.simulation': standard,
  'llamalend.marketMetadata': extended, // SDK market initialization: API metadata and contract configuration.
  'llamalend.liquidity': extended, // RPC cap/available liquidity, with Prices API market/token-price fallback.
  'llamalend.rates': long, // RPC rates or API market data, snapshots, and Merkl rewards.

  // Tenderly VNet lifecycle, RPC reads, simulations and transaction workflows.
  'tenderly.create': standard,
  'tenderly.fork': standard,
  'tenderly.get': standard,
  'tenderly.delete': standard,
  'tenderly.fund': standard,
  'tenderly.storage': standard,
  'tenderly.snapshot': standard,
  'tenderly.clock': standard,
  'tenderly.balances': extended,
  'tenderly.contractRead': extended,
  'tenderly.allowance': extended,
  'tenderly.simulation': extended,
  'tenderly.submit': superSlow, // Includes approvals and receipt confirmation.

  // Soroban reads/simulations, confirmation, and multi-step test-pool setup.
  'stellar.read': extended,
  'stellar.simulation': extended,
  'stellar.confirmation': long,
  'stellar.fundWallet': long,
  'stellar.deployPool': long,
  'stellar.seedPool': long,

  // Intercepted HTTP responses: independently tunable from live services.
  'mock.prices.chains': standard, // /v1/chains/ and /v2/pools/chains/
  'mock.prices.pools': standard, // /v2/pools/
  'mock.prices.markets': standard, // /v1/lending/markets and /v1/crvusd/markets
  'mock.prices.snapshots': standard, // Market historical-rate snapshots and their charts.
  'mock.prices.charts': standard, // Intercepted LLAMMA/oracle OHLC data.
  'mock.curveCore.platforms': standard, // api-core.curve.finance/v1/getPlatforms
  'mock.curveLite.platforms': standard, // api2.curve.finance/get_platforms
  'mock.curveLite.pools': standard, // api2.curve.finance/get_pools/:chainId
  'mock.merkl.opportunities': standard, // /api/merkl/v1/opportunities
  'mock.router.routes': standard, // /api/router/v1/routes
  'mock.sentry.report': standard, // Intercepted Sentry envelope submission.

  // Stubbed SDK operations in component tests.
  'mock.balances': extended,
  'mock.contractRead': standard,
  'mock.allowance': standard,
  'mock.simulation': extended,
  'mock.submit': extended,
} as const satisfies Record<string, Cypress.Timeoutable>

export type TimeoutCategory = keyof typeof TIMEOUTS

/** Shared helpers receive the mock flag explicitly; never infer it from the environment. */
export const getTimeoutCategory = <
  Provider extends 'evm' | 'tenderly',
  Operation extends 'balances' | 'contractRead' | 'allowance' | 'simulation' | 'submit',
>(
  provider: Provider,
  operation: Operation,
  isMocked: boolean,
) => `${isMocked ? 'mock' : provider}.${operation}` as const
