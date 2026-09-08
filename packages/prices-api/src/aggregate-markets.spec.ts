import { describe, expect, it } from 'vitest'
import { getAllMarketsResponse as mintMarkets } from './crvusd/schema'
import { getAllMarketsResponse as lendingMarkets } from './llamalend/schema'

const MARKET_ADDRESS = '0x0000000000000000000000000000000000000001'
const token = { address: MARKET_ADDRESS, symbol: 'TOKEN', decimals: 18, rebasing_yield: 3.44, rebasing_yield_apr: 3.4 }

// Common payload covering the fields required by both aggregate market endpoints.
const market = {
  name: 'TOKEN/crvUSD',
  version: 2,
  address: MARKET_ADDRESS,
  factory_address: MARKET_ADDRESS,
  controller: MARKET_ADDRESS,
  vault: MARKET_ADDRESS,
  llamma: MARKET_ADDRESS,
  policy: MARKET_ADDRESS,
  monetary_policy_address: MARKET_ADDRESS,
  oracle: MARKET_ADDRESS,
  oracle_pools: [],
  collateral_token: token,
  borrowed_token: token,
  stablecoin_token: token,
  created_at: 1_700_000_000,
  rate: 0,
  future_rate: 0,
  borrow_apy: 3.1,
  borrow_total_apy: -0.34,
  borrow_apr: 3,
  borrow_total_apr: -0.4,
  lend_apy: 2,
  lend_apr: 2,
  lend_apr_crv_0_boost: 0,
  lend_apr_crv_max_boost: 0,
  extra_reward_apr: [],
  leverage: 9.99,
  max_ltv: 90,
  n_loans: 0,
  amm_a: 100,
  price_oracle: 1,
  amm_price: 1,
  base_price: 1,
  min_band: 0,
  max_band: 0,
  loan_discount: 0,
  liquidation_discount: 0,
  total_debt: 0,
  total_debt_usd: 0,
  total_assets: 0,
  total_assets_usd: 0,
  minted: 0,
  minted_usd: 0,
  redeemed: 0,
  redeemed_usd: 0,
  collateral_balance: 0,
  collateral_balance_usd: 0,
  borrowed_balance: 0,
  borrowed_balance_usd: 0,
  collateral_amount: 0,
  collateral_amount_usd: 0,
  stablecoin_amount: 0,
  stablecoin_amount_usd: 0,
  volume_24h_usd: 0,
  debt_ceiling: 0,
  borrowable: 0,
  pending_fees: 0,
  collected_fees: 0,
}

describe.each([
  ['lending', lendingMarkets],
  ['mint', mintMarkets],
] as const)('%s aggregate markets', (_, schema) => {
  it('preserves known, unavailable and zero ROE inputs without rejecting the market list', () => {
    const data = [
      market,
      {
        ...market,
        leverage: null,
        borrow_apy: null,
        max_ltv: null,
        collateral_token: { ...token, rebasing_yield: null },
      },
      { ...market, borrow_apy: 0, collateral_token: { ...token, rebasing_yield: 0 } },
    ]
    const { ethereum } = schema.parse({ chains: { ethereum: { count: data.length, data } } })

    expect(ethereum).toHaveLength(3)
    expect(ethereum[0]).toMatchObject({
      leverage: 9.99,
      borrowApy: 3.1,
      maxLtv: 90,
      collateralToken: { rebasingYield: 3.44 },
    })
    expect(ethereum[1]).toMatchObject({
      leverage: null,
      borrowApy: null,
      maxLtv: null,
      collateralToken: { rebasingYield: null },
    })
    expect(ethereum[2]).toMatchObject({ borrowApy: 0, collateralToken: { rebasingYield: 0 } })
  })
})
