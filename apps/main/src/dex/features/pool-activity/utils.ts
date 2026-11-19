import type { ActivityRow } from '@evm-ui/features/activity-table/types'
import { getSwapDeltas, SWAP_BREAKDOWN_CUTOFF } from '@evm-ui/features/activity-table/utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import type { PoolLiquidityRow, PoolSwapRow } from './types'

export const toPoolActivitySwapRow = ({
  chainId,
  blockchainId,
  txHash,
  time: timestamp,
  buyer: address,
  tokensSold,
  tokensSoldUsd,
  tokenSold,
  tokensBought,
  tokensBoughtUsd,
  tokenBought,
}: PoolSwapRow): ActivityRow => ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  address,
  action: { label: t`Swap` },
  valueUsd: maybe(tokensBoughtUsd, Math.abs) ?? null,
  breakdownCutoff: SWAP_BREAKDOWN_CUTOFF,
  deltas: getSwapDeltas(
    { token: tokenSold, amount: tokensSold, amountUsd: tokensSoldUsd },
    { token: tokenBought, amount: tokensBought, amountUsd: tokensBoughtUsd },
  ),
})

export const toPoolActivityLiquidityRow = ({
  chainId,
  blockchainId,
  txHash,
  time: timestamp,
  provider: address,
  eventType,
  tokenAmounts,
  poolTokens,
}: PoolLiquidityRow): ActivityRow => {
  const isAdd = eventType === 'AddLiquidity'

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: isAdd ? { label: t`Add liquidity`, color: 'success' } : { label: t`Remove liquidity`, color: 'error' },
    valueUsd: null,
    deltas: tokenAmounts
      .map((amount, index) => ({
        label: isAdd ? t`Add` : t`Remove`,
        token: poolTokens[index],
        amount: isAdd ? amount : -amount,
        amountUsd: null,
      }))
      .filter(({ amount }) => amount !== 0),
  }
}
