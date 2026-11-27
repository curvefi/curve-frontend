import type { LitePool } from '@curvefi/prices-api/pools'
import { maybe, maybes } from '@primitives/objects.utils'
import { decimal, decimalMultiply, decimalPercent, fromWei } from '@ui/lib/decimal'

export const litePoolToComposition = (pool: LitePool) => ({
  totalUsd: decimal(pool.tvl),
  tokens: pool.coins?.map(coin => {
    const balance = maybes([coin.poolBalance, coin.decimals], (balance, decimals) => fromWei(balance, +decimals))
    const balanceUsd = maybes([balance, coin.usdPrice], decimalMultiply)
    return {
      token: coin.symbol || coin.address,
      tokenAddress: coin.address,
      balance,
      balanceUsd,
      usdRate: coin.usdPrice ?? undefined,
      percentShareInPool: maybe(balanceUsd, balance => decimalPercent(balance, decimal(pool.tvl)!)),
    }
  }),
})
