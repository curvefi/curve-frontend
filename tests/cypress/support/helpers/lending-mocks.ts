import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { fromEntries, range } from '@curvefi/prices-api/objects.util'
import { MAX_USD_VALUE, oneAddress, oneDate, oneFloat, oneInt, oneOf, onePrice } from '@cy/support/generators'
import { oneToken } from '@cy/support/helpers/tokens'

const LendingChains = ['ethereum', 'fraxtal', 'arbitrum'] as const
export type Chain = (typeof LendingChains)[number]

const oneLendingPool = (chain: Chain, utilization: number): GetMarketsResponse['data'][number] => {
  const collateral = oneToken(chain)
  const borrowed = oneToken(chain)
  const collateralBalance = oneFloat()
  const borrowedBalance = oneFloat()
  const borrowedPrice = borrowed.usdPrice ?? onePrice()
  const collateralPrice = collateral.usdPrice ?? onePrice()
  const totalAssets = onePrice(MAX_USD_VALUE / collateralPrice)
  const totalAssetsUsd = totalAssets * collateralPrice
  const totalDebtUsd = utilization * totalAssetsUsd
  const minBand = oneInt()
  const minted = onePrice()
  const redeemed = onePrice(minted)
  return {
    name: [collateral.symbol, borrowed.symbol].join('-'),
    controller: oneAddress(),
    vault: oneAddress(),
    llamma: oneAddress(),
    policy: oneAddress(),
    oracle: oneAddress(),
    oracle_pools: oneOf([], [oneAddress()]),
    rate: oneFloat(),
    borrow_apy: oneFloat(),
    lend_apy: oneFloat(),
    lend_apr: oneFloat(),
    lend_apr_crv_0_boost: oneFloat(),
    lend_apr_crv_max_boost: oneFloat(),
    n_loans: oneInt(),
    price_oracle: onePrice(),
    amm_price: onePrice(),
    base_price: onePrice(),
    total_debt: totalDebtUsd / borrowedPrice,
    total_assets: totalAssets,
    total_debt_usd: totalDebtUsd,
    total_assets_usd: totalAssetsUsd,
    minted: minted,
    redeemed: redeemed,
    minted_usd: minted * borrowedPrice,
    redeemed_usd: redeemed * borrowedPrice,
    loan_discount: oneFloat(1e18),
    liquidation_discount: oneFloat(1e18),
    leverage: oneFloat(),
    min_band: minBand,
    max_band: oneInt(minBand),
    collateral_balance: collateralBalance,
    borrowed_balance: borrowedBalance,
    collateral_balance_usd: collateralBalance * collateralPrice,
    borrowed_balance_usd: borrowedBalance * borrowedPrice,
    collateral_token: { symbol: collateral.symbol, address: collateral.address, rebasing_yield: null },
    borrowed_token: { symbol: borrowed.symbol, address: borrowed.address, rebasing_yield: null },
    extra_reward_apr: [],
    created_at: oneDate().toISOString(),
    max_ltv: oneFloat(60, 110), // between 60% and 110%
  }
}

export const HighTVLAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as const
export const HighUtilizationAddress = '0xBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as const

function oneLendingVaultResponse(chain: Chain): GetMarketsResponse {
  const count = oneInt(2, 20)
  const data = [
    ...range(count).map((index) => oneLendingPool(chain, index / count)),
    ...(chain == 'ethereum'
      ? ([
          {
            // fixed vault address to test campaign rewards
            ...oneLendingPool(chain, oneFloat(0.98)),
            vault: '0xc28c2fd809fc1795f90de1c9da2131434a77721d',
          },
          {
            // largest TVL to test the sorting
            ...oneLendingPool(chain, oneFloat()),
            total_assets_usd: 60_000_000,
            total_debt_usd: 50_000_000,
            collateral_balance_usd: 50_000_000,
            borrowed_balance_usd: 50_000_000,
            address: HighTVLAddress,
            vault: HighTVLAddress,
            controller: HighTVLAddress,
          },
          {
            // 99% utilization to test the sorting and slider filter
            ...oneLendingPool(chain, oneFloat()),
            total_assets_usd: 100_000_000,
            total_debt_usd: 99_000_000,
            address: HighUtilizationAddress,
            vault: HighUtilizationAddress,
            controller: HighUtilizationAddress,
          },
          {
            // 0 TVL (below 10k) to test the slider filter
            ...oneLendingPool(chain, oneFloat()),
            total_assets_usd: 0,
            total_debt_usd: 0,
            collateral_balance_usd: 0,
            borrowed_balance_usd: 0,
          },
        ] as GetMarketsResponse['data'])
      : []),
  ]
  return { count: data.length, data }
}

export const createLendingVaultChainsResponse = (): Record<Chain, GetMarketsResponse> =>
  fromEntries(LendingChains.map((chain) => [chain, oneLendingVaultResponse(chain)]))

export const mockLendingVaults = (chains: Record<Chain, GetMarketsResponse>) =>
  cy.intercept('https://prices.curve.finance/v1/lending/markets', { body: { chains } })

const HOUR = 60 * 60 * 1000
export const mockLendingSnapshots = (chain = oneOf(...LendingChains)) =>
  cy.intercept('https://prices.curve.finance/v1/lending/markets/*/*/snapshots?fetch_on_chain=true&limit=7', {
    body: {
      chain,
      data: range(84).map((i) => ({
        borrow_apy: i / 2, // increasing APY, graph should be green
        lend_apy: 2 / (i + 1), // decreasing APY, graph should be red
        timestamp: new Date('2024-12-24T').getTime() - i * 4 * HOUR, // 4h intervals
        extra_rewards_apr: [],
        collateral_token: oneToken(chain),
        borrowed_token: oneToken(chain),
      })),
    },
  })
