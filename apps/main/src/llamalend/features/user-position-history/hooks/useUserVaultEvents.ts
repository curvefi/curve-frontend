import { useMarketContext } from '@/llamalend/features/market-context'
import { type UserVaultEvent } from '@curvefi/prices-api/llamalend'
import { fromWei } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'
import { decimalGreaterThan, decimalMultiply, ZERO } from '@ui/lib/decimal'
import { useUserVaultEventsQuery } from '../queries/user-vault-events'

export type ParsedUserVaultEvent = Omit<UserVaultEvent, 'type'> & {
  type: 'Deposit' | 'Withdraw' | 'TransferIn' | 'TransferOut'
  chainId: number
  amount: Decimal | undefined
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
        .map((event): ParsedUserVaultEvent => {
          const sign = event.type === 'Withdraw' ? -1 : 1
          const shareChange = decimalMultiply(fromWei(event.shares, vaultToken.decimals), sign)
          return {
            ...event,
            type:
              event.type === 'Transfer'
                ? decimalGreaterThan(ZERO, shareChange)
                  ? 'TransferOut'
                  : 'TransferIn'
                : event.type,
            chainId,
            symbol: borrowToken.symbol,
            amount:
              event.type === 'Transfer'
                ? undefined
                : decimalMultiply(fromWei(event.assets, borrowToken.decimals), sign),
            shareChange,
          }
        })
        .toReversed(),
    ),
  )
}
