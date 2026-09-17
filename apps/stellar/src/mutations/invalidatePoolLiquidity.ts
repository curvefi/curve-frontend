import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { invalidatePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { invalidatePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { invalidatePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery, UserQuery } from '@/stellar/queries/root-keys'
import { invalidateTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { zip } from '@primitives/array.utils'

export const invalidatePoolLiquidity = async ({
  network,
  pool,
  account,
  tokens,
  decimals,
}: PoolQuery & UserQuery & { tokens: StellarContract[]; decimals: number[] }) => {
  const params = { network, pool }
  await Promise.allSettled([
    ...zip([...tokens, pool], [...decimals, LP_TOKEN_DECIMALS]).map(([token, decimals]) =>
      invalidateTokenBalance({ network, token, account, decimals }),
    ),
    invalidatePoolReserves(params),
    invalidatePoolSupply(params),
    invalidatePoolRates(params),
  ])
}
