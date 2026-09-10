import { useMarketContext } from '@/llamalend/features/market-context'
import { type UserVaultEvent } from '@curvefi/prices-api/llamalend'
import type { LlamaChainId } from '@evm-ui/features/connect-wallet/lib/types'
import { fromWei } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
import { useUserVaultEventsQuery } from '../queries/user-vault-events'

export type ParsedUserVaultEvent = Omit<UserVaultEvent, 'type'> & {
  type: 'Deposit' | 'Withdraw'
  chainId: LlamaChainId
  amount: Decimal
  shareChange: Decimal
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
  return mapQuery(query, ({ events }) =>
    maybes([borrowToken, vaultToken], (borrowToken, vaultToken): ParsedUserVaultEvent[] =>
      events
        .filter((event): event is UserVaultEvent & { type: 'Deposit' | 'Withdraw' } => event.type !== 'Transfer')
        .map(event => {
          const sign = event.type === 'Deposit' ? 1 : -1
          return {
            ...event,
            chainId,
            symbol: borrowToken.symbol,
            amount: decimalMultiply(fromWei(event.assets, borrowToken.decimals), sign),
            shareChange: decimalMultiply(fromWei(event.shares, vaultToken.decimals), sign),
          }
        })
        .toReversed(),
    ),
  )
}
