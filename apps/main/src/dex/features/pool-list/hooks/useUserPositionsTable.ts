import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useUserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import { useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/entities/campaigns'
import { useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, useMappedQuery } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { claimablesTotalUsd, enrichPoolRow, poolToRowData } from '../utils'

export const useUserPositionsTable = ({ network }: { network: NetworkConfig }) => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress })
  const claimables = useUserPoolClaimables({ chainId, userAddress }, positions)

  const tokenAddresses = useMappedQuery(
    positions,
    useCallback(({ positions }) => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses.data }, !!userAddress)

  const tableQuery = useMappedQuery(
    positions,
    useCallback(
      ({ positions }) =>
        positions
          .map(position =>
            enrichPoolRow(poolToRowData(position), network, campaigns.data, {
              lpBalance: position.totalBalance,
              depositsUsd: maybe(tokenRates.data?.[position.lpTokenAddress], price =>
                decimalMultiply(position.totalBalance, price),
              ),
              claimables: mapQuery(claimables, rewards => rewards[position.address] ?? null),
            }),
          )
          .toSorted((a, b) => decimalCompare(b.userPosition.depositsUsd ?? '0', a.userPosition.depositsUsd ?? '0')),
      [network, campaigns.data, tokenRates.data, claimables],
    ),
  )

  return {
    isFetching: positions.isFetching || campaigns.isLoading || claimables.isFetching,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    claimablesTotalUsd: mapQuery(claimables, pools =>
      decimalSum(...Object.values(pools).map(claimables => claimablesTotalUsd(claimables))),
    ),
    totalLiquidityUsd: mapQuery(tableQuery, rows =>
      decimalSum(...rows.map(({ userPosition }) => userPosition.depositsUsd)),
    ),
  }
}
