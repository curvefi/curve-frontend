import { formatUnits } from 'viem'
import { useMarketContext } from '@/llamalend/features/market-context'
import { type UserVaultEvent } from '@curvefi/prices-api/llamalend'
import { mapQuery } from '@ui/features/queries/util'
import { useUserVaultEventsQuery } from '../queries/user-vault-events'

export type ParsedUserVaultEvent = Omit<UserVaultEvent, 'type'> & {
  type: 'Deposit' | 'Withdraw'
  chainId: number
  amount: number
  shareChange: number
  symbol: string
}

export const useUserVaultEvents = () => {
  const {
    blockchainId,
    chainId,
    userAddress,
    vaultToken,
    tokens: { borrowToken },
  } = useMarketContext()
  const query = useUserVaultEventsQuery({ blockchainId, userAddress, contractAddress: vaultToken?.address })
  return mapQuery(query, ({ events }): ParsedUserVaultEvent[] =>
    !borrowToken || !vaultToken
      ? []
      : events
          .filter((event): event is UserVaultEvent & { type: 'Deposit' | 'Withdraw' } => event.type !== 'Transfer')
          .map(event => ({
            ...event,
            chainId,
            symbol: borrowToken.symbol,
            amount:
              Number(formatUnits(BigInt(event.assets), borrowToken.decimals)) * (event.type === 'Deposit' ? 1 : -1),
            shareChange:
              Number(formatUnits(BigInt(event.shares), vaultToken.decimals)) * (event.type === 'Deposit' ? 1 : -1),
          }))
          .toSorted((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex),
  )
}
