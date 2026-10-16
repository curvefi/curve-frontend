import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { invalidatePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { invalidatePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { invalidatePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery, UserQuery } from '@/stellar/queries/query-types'
import { invalidateTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { invalidateWithdrawMaxAmount } from '@/stellar/queries/withdraw/withdraw-max-amounts.query'
import { zip } from '@primitives/array.utils'
import { invalidateLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'

export const invalidatePoolLiquidity = async ({
  network,
  pool,
  account,
  tokens,
  decimals,
}: PoolQuery & UserQuery & { tokens: StellarContract[]; decimals: number[] }) => {
  const params = { network, pool, decimals }
  await Promise.allSettled([
    ...zip([...tokens, pool], [...decimals, LP_TOKEN_DECIMALS]).map(([token, decimals]) =>
      invalidateTokenBalance({ ...params, token, account, decimals }),
    ),
    invalidatePoolReserves(params),
    invalidatePoolSupply(params),
    invalidatePoolRates(params),
    invalidateWithdrawMaxAmount({ network, pool }, { partial: true }),
    invalidateLitePoolList({ chainId: STELLAR_NETWORKS[network].chainId }),
  ])
}
