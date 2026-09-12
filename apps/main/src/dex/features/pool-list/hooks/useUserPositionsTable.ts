import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/entities/campaigns'
import { useCombinedQueries } from '@evm-ui/lib'
import { useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { maybe } from '@primitives/objects.utils'
import { constQ, mapQuery, useMappedQuery } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { enrichPoolRow, poolToRowData } from '../utils'

export const useUserPositionsTable = ({ network }: { network: NetworkConfig }) => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress })

  const { data: tokenAddresses } = useMappedQuery(
    positions,
    useCallback(({ positions }) => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses }, !!userAddress)

  // constQ suppresses loading state, and ?? null allows useCombinedQueries to run even when data is not yet loaded or present.
  const tableQuery = useCombinedQueries(
    [positions, constQ(network), constQ(campaigns.data), constQ(tokenRates.data ?? null)],
    useCallback(
      ({ positions }, network, campaigns, prices) =>
        positions
          .map(position =>
            enrichPoolRow(poolToRowData(position), network, campaigns, {
              lpBalance: position.totalBalance,
              depositsUsd: maybe(prices?.[position.lpTokenAddress], price =>
                decimalMultiply(position.totalBalance, price),
              ),
            }),
          )
          .toSorted((a, b) => decimalCompare(b.userPosition.depositsUsd ?? '0', a.userPosition.depositsUsd ?? '0')),
      [],
    ),
  )

  return {
    isFetching: positions.isFetching || campaigns.isLoading,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    totalLiquidityUsd: mapQuery(tableQuery, rows =>
      decimalSum(...rows.map(({ userPosition }) => userPosition.depositsUsd ?? '0')),
    ),
  }
}
