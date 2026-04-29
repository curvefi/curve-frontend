import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { Timestamp } from '../timestamp'

export type GetOraclesResponse = {
  last_recorded_block: number
  oracles: {
    chain: Chain
    address: Address
    last_confirmed_block_number: number
    block_header: {
      block_hash: Address
      parent_hash: Address
      state_root: Address
      block_number: number
      timestamp: Timestamp
    }
    last_updated: number
  }[]
}
