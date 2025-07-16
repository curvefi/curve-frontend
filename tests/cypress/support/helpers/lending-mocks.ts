import { MAX_USD_VALUE, oneAddress, oneFloat, oneInt, oneOf, onePrice, range } from '@/support/generators'
import { oneToken } from '@/support/helpers/tokens'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { fromEntries } from '@curvefi/prices-api/objects.util'

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
  }
}

export const HighUtilizationAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as const

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
            // 99.99 utilization and 10k liquidity to test the sorting and slider filter
            // (100% would result in 0 liquidity and be hidden)
            ...oneLendingPool(chain, oneFloat()),
            total_assets_usd: 100_000_000,
            total_debt_usd: 99_990_000,
            address: HighUtilizationAddress,
            vault: HighUtilizationAddress,
            controller: HighUtilizationAddress,
          },
          {
            // 0 utilization to test the slider filter
            ...oneLendingPool(chain, oneFloat()),
            total_debt_usd: 0,
          },
        ] as GetMarketsResponse['data'])
      : []),
  ]
  return { count: data.length, data }
}

export const createLendingVaultChainsResponse = (): Record<Chain, GetMarketsResponse> =>
  fromEntries(LendingChains.map((chain) => [chain, oneLendingVaultResponse(chain)]))

export const mockLendingVaults = (chains: Record<Chain, GetMarketsResponse>) =>
  cy.intercept('https://prices.curve.finance/v1/lending/markets?fetch_on_chain=true', { body: { chains } })

export const mockLendingSnapshots = () =>
  cy.intercept('https://prices.curve.finance/v1/lending/markets/*/*/snapshots?agg=none&fetch_on_chain=true', {
    fixture: 'lending-snapshots.json',
  })
