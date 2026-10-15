import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import type { LitePool } from '@curvefi/prices-api/pools'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import type { LiquidityDetailsData } from '@ui/features/pools/liquidity-details/types'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimalDiv, decimalGreaterThan, decimalMultiply, decimalPercent } from '@ui/lib/decimal'
import { usePoolTokens } from './usePoolTokens'

export const useLiquidityDetails = (
  { network, pool }: PoolQuery,
  litePool: QueryProp<LitePool | null>,
  totalUsd: QueryProp<Decimal>,
): LiquidityDetailsData => {
  const { address: account } = useWallet()
  const params = { network, pool }
  const config = usePoolConfig(params)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { symbols, decimals, decimalsData } = usePoolTokens({ network, account, tokenAddresses }) ?? {}
  const balance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const supply = usePoolSupply(params)
  const reserves = usePoolReserves({ ...params, decimals: decimalsData })
  const amounts = combineQueries(
    [balance, supply, reserves, ...(decimals ?? [])],
    (balance, supply, reserves, ...decimals) =>
      +supply ? scaleReserves(reserves, decimals, balance, supply) : undefined,
  )
  const underlyingValue = combineQueries([totalUsd, balance, supply], (totalUsd, balance, supply) =>
    +supply ? decimalDiv(decimalMultiply(totalUsd, balance), supply) : undefined,
  )
  const lpValue = combineQueries(
    [balance, mapQuery(litePool, pool => pool?.lpTokenPrice ?? undefined)],
    decimalMultiply,
  )

  return {
    hasPosition: !!account && !!balance.data && decimalGreaterThan(balance.data, '0'),
    metrics: { lpTokenTotal: q(balance), positionValue: fallbackQ(lpValue, underlyingValue) },
    marketParticipation: { userLpShare: combineQueries([balance, supply], decimalPercent) },
    rows: mapQuery(tokenAddresses, addresses =>
      maybe(symbols, symbols =>
        zip(addresses, symbols).map(([address, symbol], index) => ({
          address: asAddress(address),
          symbol,
          amount: mapQuery(amounts, amounts => amounts[index]),
        })),
      ),
    ),
  }
}
