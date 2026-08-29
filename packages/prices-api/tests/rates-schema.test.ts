import { describe, expect, it } from 'vitest'
import { getMarketsResponse as getCrvUsdMarketsResponse, getSnapshotsResponse as getCrvUsdSnapshotsResponse } from '../src/crvusd/schema'
import { getRateCurveResponse } from '../src/lending/schema'
import {
  getMarketsResponse as getLlamalendMarketsResponse,
  getSnapshotsResponse as getLlamalendSnapshotsResponse,
} from '../src/llamalend/schema'

const token = {
  address: '0x0000000000000000000000000000000000000001',
  decimals: 18,
  rebasing_yield_apr: 1.5,
  symbol: 'TOKEN',
}

const llamalendMarket = {
  amm_a: 100,
  amm_price: 1,
  base_price: 1,
  borrow_apr: 4,
  borrow_total_apr: 3,
  borrowed_balance: 1,
  borrowed_balance_usd: 1,
  borrowed_token: token,
  collateral_balance: 1,
  collateral_balance_usd: 1,
  collateral_token: token,
  controller: '0x0000000000000000000000000000000000000002',
  created_at: 1,
  extra_reward_apr: [],
  leverage: 1,
  lend_apr: 2,
  lend_apr_crv_0_boost: 0.5,
  lend_apr_crv_max_boost: 1,
  liquidation_discount: 0.06,
  llamma: '0x0000000000000000000000000000000000000003',
  loan_discount: 0.09,
  max_band: 1,
  max_ltv: 0.8,
  min_band: 0,
  minted: 1,
  minted_usd: 1,
  n_loans: 1,
  name: 'Market',
  oracle: '0x0000000000000000000000000000000000000004',
  oracle_pools: [],
  policy: '0x0000000000000000000000000000000000000005',
  price_oracle: 1,
  rate: 0.04,
  redeemed: 1,
  redeemed_usd: 1,
  total_assets: 1,
  total_assets_usd: 1,
  total_debt: 1,
  total_debt_usd: 1,
  vault: '0x0000000000000000000000000000000000000006',
  version: 1,
}

const llamalendSnapshot = {
  amm_a: 100,
  amm_price: 1,
  base_price: 1,
  borrow_apr: 4,
  borrow_total_apr: 3,
  borrowed_balance: 1,
  borrowed_balance_usd: 1,
  borrowed_token: token,
  collateral_balance: 1,
  collateral_balance_usd: 1,
  collateral_token: token,
  extra_rewards_apr: [],
  lend_apr: 200,
  lend_apr_crv_0_boost: 50,
  lend_apr_crv_max_boost: 100,
  liquidation_discount: 0.06,
  loan_discount: 0.09,
  max_band: 1,
  max_ltv: 0.8,
  min_band: 0,
  minted: 1,
  minted_usd: 1,
  n_loans: 1,
  price_oracle: 1,
  rate: 0.04,
  redeemed: 1,
  redeemed_usd: 1,
  sum_debt_squared: 1,
  timestamp: 1,
  total_assets: 1,
  total_assets_usd: 1,
  total_debt: 1,
  total_debt_usd: 1,
}

const crvUsdMarket = {
  address: '0x0000000000000000000000000000000000000001',
  amm_a: 100,
  amm_price: 1,
  base_price: 1,
  borrow_apr: 4,
  borrow_total_apr: 3,
  borrowable: 1,
  collateral_amount: 1,
  collateral_amount_usd: 1,
  collateral_token: token,
  collected_fees: 1,
  created_at: 1,
  debt_ceiling: 1,
  factory_address: '0x0000000000000000000000000000000000000002',
  future_rate: 0.04,
  leverage: 1,
  liquidation_discount: 0.06,
  llamma: '0x0000000000000000000000000000000000000003',
  loan_discount: 0.09,
  max_band: 1,
  max_ltv: 0.8,
  min_band: 0,
  minted: 1,
  monetary_policy_address: '0x0000000000000000000000000000000000000004',
  n_loans: 1,
  oracle: '0x0000000000000000000000000000000000000005',
  oracle_pools: [],
  pending_fees: 1,
  price_oracle: 1,
  rate: 0.04,
  redeemed: 1,
  stablecoin_amount: 1,
  stablecoin_amount_usd: 1,
  stablecoin_token: token,
  total_debt: 1,
  total_debt_usd: 1,
  volume_24h_usd: 1,
}

const crvUsdSnapshot = {
  amm_a: 100,
  amm_price: 1,
  base_price: 1,
  borrow_apr: 4,
  borrowable: 1,
  collateral_token: token,
  dt: 1,
  liquidation_discount: 0.06,
  loan_discount: 0.09,
  max_band: 1,
  max_ltv: 0.8,
  min_band: 0,
  minted: 1,
  n_loans: 1,
  price_oracle: 1,
  rate: 0.04,
  redeemed: 1,
  stablecoin_token: token,
  sum_debt_squared: 1,
  total_collateral: 1,
  total_collateral_usd: 1,
  total_debt: 1,
  total_debt_usd: 1,
  total_stablecoin: 1,
  total_stablecoin_usd: 1,
}

describe('APR-only rate response schemas', () => {
  it('parses APR-only LlamaLend markets and snapshots', () => {
    const [market] = getLlamalendMarketsResponse.parse({ count: 1, data: [llamalendMarket] })
    const [snapshot] = getLlamalendSnapshotsResponse.parse({ data: [llamalendSnapshot] })

    expect(market).toMatchObject({ borrowApr: 4, borrowTotalApr: 3, lendApr: 2 })
    expect(market?.borrowedToken).toMatchObject({ rebasingYieldApr: 1.5 })
    expect(snapshot).toMatchObject({ borrowApr: 4, borrowTotalApr: 3, lendApr: 2 })
    expect(snapshot?.borrowedToken).toMatchObject({ rebasingYieldApr: 1.5 })
  })

  it('parses APR-only crvUSD markets and snapshots', () => {
    const [market] = getCrvUsdMarketsResponse.parse({ count: 1, data: [crvUsdMarket] })
    const [snapshot] = getCrvUsdSnapshotsResponse.parse({ data: [crvUsdSnapshot] })

    expect(market).toMatchObject({ borrowApr: 4, borrowTotalApr: 3 })
    expect(market?.collateralToken).toMatchObject({ rebasingYieldApr: 1.5 })
    expect(snapshot).toMatchObject({ borrowApr: 4 })
    expect(snapshot?.collateralToken).toMatchObject({ rebasingYieldApr: 1.5 })
  })

  it('parses an APR-only lending rate curve', () => {
    expect(
      getRateCurveResponse.parse({
        chain: 'ethereum',
        current_borrow_apr: 4,
        current_supply_apr: 2,
        current_utilization: 0.5,
        rates: [{ borrow_apr: 4, supply_apr: 2, utilization: 0.5 }],
      }),
    ).toEqual({
      currentBorrowApr: 4,
      currentSupplyApr: 2,
      currentUtilization: 0.5,
      rates: [{ borrowApr: 4, supplyApr: 2, utilization: 0.5 }],
    })
  })

  it('strips legacy APY fields instead of returning them', () => {
    const [market] = getLlamalendMarketsResponse.parse({
      count: 1,
      data: [
        {
          ...llamalendMarket,
          borrow_apy: 100,
          borrow_total_apy: 100,
          lend_apy: 100,
          borrowed_token: { ...token, rebasing_yield: 100 },
        },
      ],
    })
    const [snapshot] = getLlamalendSnapshotsResponse.parse({
      data: [
        {
          ...llamalendSnapshot,
          borrow_apy: 100,
          borrow_total_apy: 100,
          lend_apy: 100,
          borrowed_token: { ...token, rebasing_yield: 100 },
          collateral_token: { ...token, rebasing_yield: 100 },
        },
      ],
    })
    const [crvUsdParsedMarket] = getCrvUsdMarketsResponse.parse({
      count: 1,
      data: [
        {
          ...crvUsdMarket,
          borrow_apy: 100,
          borrow_total_apy: 100,
          collateral_token: { ...token, rebasing_yield: 100 },
          stablecoin_token: { ...token, rebasing_yield: 100 },
        },
      ],
    })
    const [crvUsdParsedSnapshot] = getCrvUsdSnapshotsResponse.parse({
      data: [
        {
          ...crvUsdSnapshot,
          borrow_apy: 100,
          collateral_token: { ...token, rebasing_yield: 100 },
          stablecoin_token: { ...token, rebasing_yield: 100 },
        },
      ],
    })
    const rateCurve = getRateCurveResponse.parse({
      chain: 'ethereum',
      current_borrow_apr: 4,
      current_borrow_apy: 100,
      current_supply_apr: 2,
      current_supply_apy: 100,
      current_utilization: 0.5,
      rates: [{ borrow_apr: 4, borrow_apy: 100, supply_apr: 2, supply_apy: 100, utilization: 0.5 }],
    })

    expect(market).not.toHaveProperty('borrowApy')
    expect(market).not.toHaveProperty('borrowTotalApy')
    expect(market).not.toHaveProperty('lendApy')
    expect(market?.borrowedToken).not.toHaveProperty('rebasingYield')
    expect(snapshot).not.toHaveProperty('borrowApy')
    expect(snapshot).not.toHaveProperty('borrowTotalApy')
    expect(snapshot).not.toHaveProperty('lendApy')
    expect(snapshot?.borrowedToken).not.toHaveProperty('rebasingYield')
    expect(snapshot?.collateralToken).not.toHaveProperty('rebasingYield')
    expect(crvUsdParsedMarket).not.toHaveProperty('borrowApy')
    expect(crvUsdParsedMarket).not.toHaveProperty('borrowTotalApy')
    expect(crvUsdParsedMarket?.collateralToken).not.toHaveProperty('rebasingYield')
    expect(crvUsdParsedMarket?.stablecoinToken).not.toHaveProperty('rebasingYield')
    expect(crvUsdParsedSnapshot).not.toHaveProperty('borrowApy')
    expect(crvUsdParsedSnapshot?.collateralToken).not.toHaveProperty('rebasingYield')
    expect(crvUsdParsedSnapshot?.stablecoinToken).not.toHaveProperty('rebasingYield')
    expect(rateCurve).not.toHaveProperty('currentBorrowApy')
    expect(rateCurve).not.toHaveProperty('currentSupplyApy')
    expect(rateCurve.rates[0]).not.toHaveProperty('borrowApy')
    expect(rateCurve.rates[0]).not.toHaveProperty('supplyApy')
  })
})
