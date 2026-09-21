import { sum } from 'lodash'
import { getAddress } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import type { ChainId, PoolData } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { shortenAddress } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { q } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

export const usePoolComposition = ({
  chainId,
  poolData,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolData: PoolData
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: currencyReserves } = usePoolCurrencyReserves({ chainId, poolId, isWrapped: poolData.isWrapped })

  // We use prices API as a fallback for non-lite networks, and currencyReserves.total is NaN when no wallet is connected.
  const usePricesApiReserves = isNaN(Number(currencyReserves?.total)) && !isLiteChain(chainId)
  const pricesApiTotalUsd = sum(pricesApiPoolData?.balancesUsd)

  // Transform Prices API reserves data to match the shape of currencyReserves (and not bothering with useMemo as arrays are super small)
  const reserves = usePricesApiReserves
    ? poolData.tokenAddresses.map((tokenAddress, index) => {
        const balance = pricesApiPoolData?.balances[index]
        const balanceUsd = pricesApiPoolData?.balancesUsd[index]

        return {
          tokenAddress,
          balance,
          balanceUsd,
          percentShareInPool: pricesApiTotalUsd ? ((balanceUsd ?? 0) / pricesApiTotalUsd) * 100 : undefined,
          usdRate: balance ? (balanceUsd ?? 0) / balance : 0,
        }
      })
    : currencyReserves?.tokens

  const rows: PoolCompositionRow[] = poolData.tokens.map((symbol, index) => {
    const tokenAddress = poolData.tokenAddresses[index]
    const reserve = reserves?.find(token => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())

    return {
      source: {
        address: getAddress(tokenAddress),
        blockchainId: network.blockchainId,
        iconPosition: 'left' as const,
        primary: symbol,
      },
      displayAddress: shortenAddress(tokenAddress),
      explorerUrl: scanTokenPath(chainId, tokenAddress),
      marketShare: maybe(reserve?.percentShareInPool, x => +x),
      amount: reserve?.balance,
      amountUsd: reserve?.balanceUsd,
      price: reserve?.usdRate,
    }
  })

  const totalUsd = decimal(usePricesApiReserves ? pricesApiTotalUsd : currencyReserves?.totalUsd)

  // this isn't a proper loading check, but we need a bigger refactor for that later on
  const isLoading = usePricesApiReserves ? !pricesApiPoolData?.balances.length : !currencyReserves
  const error = null // TODO: correctly handle error and loading state
  return { rows: q({ data: rows, isLoading, error }), totalUsd: q({ data: totalUsd, isLoading, error }) }
}
