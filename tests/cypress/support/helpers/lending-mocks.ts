import { MARKET_CUTOFF_DATE } from '@/llamalend/constants'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { MAX_USD_VALUE, oneAddress, oneDate, oneFloat, oneInt, oneOf, onePrice } from '@cy/support/generators'
import { oneToken } from '@cy/support/helpers/tokens'
import { fromEntries, range } from '@primitives/objects.utils'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'

const LendingChains = ['ethereum', 'fraxtal', 'arbitrum'] as const
export type Chain = (typeof LendingChains)[number]

// keep the general pool TVL below the special HighTVL row to guarantee ordering in tests
const oneLargeTvl = () => oneFloat(SMALL_POOL_TVL, MAX_USD_VALUE)
const oneSmallTvl = () => oneFloat(SMALL_POOL_TVL)

const oneLendingPool = (
  chain: Chain,
  { utilization = oneFloat(0, 0.99), tvl = oneLargeTvl() }: { utilization?: number; tvl?: number },
): GetMarketsResponse['data'][number] => {
  const collateral = oneToken(chain)
  const borrowed = oneToken(chain)
  const borrowedPrice = borrowed.usdPrice ?? onePrice()
  const collateralPrice = collateral.usdPrice ?? onePrice()
  const liquidityUsd = Math.max(0, oneFloat(0, tvl)) // portion of TVL represented by (assets - debt)
  const totalAssetsUsd = liquidityUsd / (1 - utilization)
  const totalDebtUsd = totalAssetsUsd * utilization
  const totalAssets = totalAssetsUsd / collateralPrice
  const totalDebt = totalDebtUsd / borrowedPrice
  const minBand = oneInt()
  const minted = onePrice()
  const redeemed = onePrice(minted)
  const remainderUsd = Math.max(tvl - liquidityUsd, 0) // portion of TVL not covered by liquidity
  const collateralBalanceUsd = remainderUsd === 0 ? 0 : oneFloat(0, remainderUsd)
  const borrowedBalanceUsd = remainderUsd - collateralBalanceUsd
  const collateralBalance = collateralBalanceUsd / collateralPrice
  const borrowedBalance = borrowedBalanceUsd / borrowedPrice
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
    borrow_total_apy: oneFloat(),
    borrow_apr: oneFloat(),
    borrow_total_apr: oneFloat(),
    lend_apy: oneFloat(),
    lend_apr: oneFloat(),
    lend_apr_crv_0_boost: oneFloat(),
    lend_apr_crv_max_boost: oneFloat(),
    n_loans: oneInt(),
    price_oracle: onePrice(),
    amm_price: onePrice(),
    base_price: onePrice(),
    total_debt: totalDebt,
    total_assets: totalAssets,
    total_debt_usd: totalDebtUsd,
    total_assets_usd: totalAssetsUsd,
    minted,
    redeemed,
    minted_usd: minted * borrowedPrice,
    redeemed_usd: redeemed * borrowedPrice,
    loan_discount: oneFloat(1e18),
    liquidation_discount: oneFloat(1e18),
    leverage: oneFloat(),
    min_band: minBand,
    max_band: oneInt(minBand),
    collateral_balance: collateralBalance,
    borrowed_balance: borrowedBalance,
    collateral_balance_usd: collateralBalanceUsd,
    borrowed_balance_usd: borrowedBalanceUsd,
    collateral_token: {
      symbol: collateral.symbol,
      address: collateral.address,
      rebasing_yield: null,
      rebasing_yield_apr: null,
    },
    borrowed_token: {
      symbol: borrowed.symbol,
      address: borrowed.address,
      rebasing_yield: null,
      rebasing_yield_apr: null,
    },
    extra_reward_apr: [],
    created_at: oneDate({ maxDate: MARKET_CUTOFF_DATE }).toISOString(),
    max_ltv: oneFloat(60, 110), // between 60% and 110%
  }
}

export const HighTVLAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as const
export const HighUtilizationAddress = '0xBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as const
export const RewardsTestAddress = '0xCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa' as const

function oneLendingVaultResponse(chain: Chain): GetMarketsResponse {
  const count = oneInt(15, 20)
  const data = [
    ...range(count).map((index) =>
      oneLendingPool(chain, { utilization: index / count, tvl: oneFloat() > 0.9 ? oneSmallTvl() : oneLargeTvl() }),
    ),
    ...(chain == 'ethereum'
      ? ([
          {
            // fixed vault address to test campaign rewards
            ...oneLendingPool(chain, { utilization: oneFloat(0.98) }),
            vault: RewardsTestAddress,
            extra_reward_apr: [{ address: oneAddress(), symbol: 'RWD', apr: 0.5 }],
          },
          {
            // largest TVL to test the sorting
            ...oneLendingPool(chain, { utilization: oneFloat(0.4, 0.8), tvl: MAX_USD_VALUE * 2 }),
            address: HighTVLAddress,
            vault: HighTVLAddress,
            controller: HighTVLAddress,
          },
          {
            // 99% utilization to test the sorting and slider filter
            ...oneLendingPool(chain, { utilization: 0.99 }),
            extra_reward_apr: [{ address: oneAddress(), symbol: 'RWD', apr: 0.5 }],
            address: HighUtilizationAddress,
            vault: HighUtilizationAddress,
            controller: HighUtilizationAddress,
          },
          {
            // small TVL to test the slider filter
            ...oneLendingPool(chain, { tvl: SMALL_POOL_TVL / 2 }),
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
        borrow_apr: i / 2, // increasing APR, graph should be green
        borrow_total_apy: i / 2 - 1,
        borrow_total_apr: i / 2 - 1,
        lend_apy: 2 / (i + 1), // decreasing APY, graph should be red
        lend_apr: 2 / (i + 1),
        lend_apr_crv_0_boost: 0,
        lend_apr_crv_max_boost: 0,
        timestamp: new Date('2024-12-24T').getTime() - i * 4 * HOUR, // 4h intervals
        extra_rewards_apr: [],
        collateral_token: oneToken(chain),
        borrowed_token: oneToken(chain),
      })),
    },
  })

/** Mock Merkl API to provide campaign rewards for the RewardsTestAddress vault used in tests */
export const mockMerklCampaigns = () =>
  cy.intercept('https://api.merkl.xyz/v4/opportunities*', {
    body: [
      {
        type: 'POOL',
        identifier: 'test-campaign',
        name: 'Test Rewards Campaign',
        description: 'Test campaign for Cypress',
        howToSteps: ['Step 1'],
        apr: 0.1,
        explorerAddress: RewardsTestAddress,
        tags: ['curve'],
        chain: { id: 1, name: 'Ethereum' },
        rewardsRecord: {
          breakdowns: [
            {
              token: {
                chainId: 1,
                address: oneAddress(),
                symbol: 'RWD',
                icon: 'https://example.com/icon.png',
              },
              value: 100,
            },
          ],
        },
      },
    ],
  })
