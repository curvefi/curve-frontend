import { TIMEOUT_TYPES } from './timeout-types'

const { standard, extended, long } = TIMEOUT_TYPES

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
  'curveLite.pools': long, // api2.curve.finance/get_pools/:chainId
  'router.tokens': long, // /api/router/v1/tokens
  'router.routes': extended, // /api/router/v1/routes

  // Chain reads and previews are distinct from submission/receipt confirmation.
  'evm.balances': extended,
  'evm.contractRead': extended,
  'evm.allowance': extended,
  'evm.simulation': extended,
  'evm.confirmation': long,
  'llamalend.marketMetadata': extended, // SDK market initialization: API metadata and contract configuration.
  'llamalend.liquidity': extended, // RPC cap/available liquidity, with Prices API market/token-price fallback.
  'llamalend.rates': long, // RPC rates or API market data, snapshots, and Merkl rewards.

  // Tenderly VNet REST lifecycle and admin JSON-RPC operations.
  'tenderly.create': standard,
  'tenderly.fork': standard,
  'tenderly.get': standard,
  'tenderly.delete': standard,
  'tenderly.fund': standard,
  'tenderly.storage': standard,
  'tenderly.snapshot': standard,
  'tenderly.clock': standard,
  'tenderly.submit': standard,
  // Existing setup callbacks await multiple operations; retain their workflow budgets.
  'tenderly.approve': standard, // Submit approval and confirm its receipt.
  'tenderly.exchange': standard, // Approve, exchange and confirm both receipts.
  'tenderly.createLoan': extended, // Approve collateral and create a loan, including receipts.
  'tenderly.softLiquidation': extended, // Read state, override oracle storage, advance time and exchange.

  // Soroban reads/simulations, confirmation, and multi-step test-pool setup.
  'stellar.read': extended,
  'stellar.simulation': extended,
  'stellar.confirmation': long,
  'stellar.deployPool': long,
  'stellar.seedPool': long,

  // Intercepted HTTP responses: independently tunable from live services.
  'mock.prices.chains': long, // /v1/chains/ and /v2/pools/chains/
  'mock.prices.pools': long, // /v2/pools/
  'mock.prices.markets': standard, // /v1/lending/markets and /v1/crvusd/markets
  'mock.prices.snapshots': long, // Market historical-rate snapshots and their charts.
  'mock.prices.charts': long, // Intercepted LLAMMA/oracle OHLC data.
  'mock.curveCore.platforms': long, // api-core.curve.finance/v1/getPlatforms
  'mock.curveLite.platforms': long, // api2.curve.finance/get_platforms
  'mock.curveLite.pools': long, // api2.curve.finance/get_pools/:chainId
  'mock.merkl.opportunities': long, // /api/merkl/v1/opportunities
  'mock.router.routes': standard, // /api/router/v1/routes
  'mock.sentry.report': standard, // Intercepted Sentry envelope submission.

  // Stubbed SDK operations in component tests.
  'mock.evm.balances': extended,
  'mock.evm.contractRead': standard,
  'mock.evm.allowance': standard,
  'mock.evm.simulation': extended,
  'mock.evm.confirmation': extended,
} as const satisfies Record<string, Cypress.Timeoutable>

export type TimeoutCategory = keyof typeof TIMEOUTS

type MockableTimeoutCategory = {
  [Category in TimeoutCategory]: `mock.${Category}` extends TimeoutCategory ? Category : never
}[TimeoutCategory]

/** Shared helpers receive the mock flag explicitly; never infer it from the environment. */
export const getTimeoutCategory = <Category extends MockableTimeoutCategory>(
  category: Category,
  isMocked: boolean,
): Category | `mock.${Category}` => (isMocked ? `mock.${category}` : category)
