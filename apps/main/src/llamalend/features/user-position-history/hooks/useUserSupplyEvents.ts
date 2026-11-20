import type { MarketToken, MarketTokens } from '@/llamalend/llama.utils'
import { type UserVaultEvent } from '@curvefi/prices-api/llamalend'
import type { LlamaChainId } from '@evm-ui/features/connect-wallet/lib/types'
import { fromWei } from '@evm-ui/utils'
import { BlockchainIds } from '@evm-ui/utils/network'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'
import { decimalGreaterThan, decimalMultiply, ZERO } from '@ui/lib/decimal'
import { useUserVaultEventsQuery } from '../queries/user-vault-events'

export type ParsedUserSupplyEvent = Omit<UserVaultEvent, 'type'> & {
  type: 'Deposit' | 'Withdraw' | 'TransferIn' | 'TransferOut'
  chainId: number
  amount: Decimal | undefined
  shareChange: Decimal
  borrowToken: MarketToken
  vaultToken: MarketToken
}

export type UserSupplyEventsProps = {
  userAddress: Address | undefined
  chainId: LlamaChainId
  tokens: Partial<MarketTokens>
  vaultToken: MarketToken | undefined
}

export const useUserSupplyEvents = ({
  chainId,
  userAddress,
  vaultToken,
  tokens: { borrowToken },
}: UserSupplyEventsProps) => {
  const blockchainId = BlockchainIds[chainId]
  const query = useUserVaultEventsQuery({ blockchainId, userAddress, contractAddress: vaultToken?.address })
  return mapQuery(query, ({ events }) =>
    maybes([borrowToken, vaultToken], (borrowToken, vaultToken) =>
      events
        .map((event): ParsedUserSupplyEvent => {
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
            borrowToken,
            vaultToken,
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
