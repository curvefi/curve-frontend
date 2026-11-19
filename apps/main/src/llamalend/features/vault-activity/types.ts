import type { Chain } from '@curvefi/prices-api'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import type { ActivityToken } from '@evm-ui/features/activity-table/types'
import type { Token } from '@primitives/address.utils'

export type VaultActivityProps = {
  chainId: number
  blockchainId: Chain
  borrowToken: Token | undefined
  vaultToken: Token | undefined
}

export type VaultActivityRow = VaultEvent &
  Omit<VaultActivityProps, 'borrowToken' | 'vaultToken'> & {
    borrowToken: ActivityToken | undefined
    vaultToken: ActivityToken | undefined
  }
