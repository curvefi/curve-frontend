import { POOLS_DATA_ETHEREUM } from '@curvefi/api/lib/constants/pools/ethereum'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

/**
 * Use CurveJS for metadata, LP seeding and metapool balances so tests don't duplicate pool/zap logic.
 * Runtime helpers reuse PoolTestCase's hydrated instance; mount it before calling them.
 */
export const TEST_POOLS = [
  '3pool',
  'frax', // FRAX uses a zap for underlying withdrawals, requiring LP approval; wrapped withdrawals use the pool directly.
].map(id => {
  const pool = POOLS_DATA_ETHEREUM[id]
  return {
    id,
    address: pool.swap_address as Address,
    lpToken: pool.token_address as Address,
    depositAddress: (pool.deposit_address ?? pool.swap_address) as Address,
    coins: pool.underlying_coin_addresses.map((address, index) => ({
      address: address as Address,
      symbol: pool.underlying_coins[index],
      decimals: pool.underlying_decimals[index],
    })),
    wrappedCoins: pool.is_plain
      ? undefined
      : pool.wrapped_coin_addresses.map((address, index) => ({
          address: address as Address,
          symbol: pool.wrapped_coins[index],
          decimals: pool.wrapped_decimals[index],
        })),
  }
})

export type TestPool = (typeof TEST_POOLS)[number]

export const seedPoolForWithdraw = (poolAddress: Address, amounts: Decimal[]) =>
  cy.then(TIMEOUTS['tenderly.submit'], async () => {
    const pool = globalLibs.require('curveApi').getPool(poolAddress)
    await pool.depositApprove(amounts) // CurveJS waits for approval receipts.
    const receipt = await pool.curve.provider.waitForTransaction(await pool.deposit(amounts, 0.5))
    expect(receipt?.status).to.equal(1)
  })

export const getPoolUnderlyingBalances = (poolAddress: Address) =>
  cy.then(TIMEOUTS['tenderly.contractRead'], () =>
    globalLibs.require('curveApi').getPool(poolAddress).stats.underlyingBalances(),
  )
