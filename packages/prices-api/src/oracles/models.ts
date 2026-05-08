import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { Timestamp } from '../timestamp'

type Oracle = {
  chain: Chain
  address: Address
  lastConfirmedBlockNumber: number
  blockHeader: {
    hashBlock: Address
    hashParent: Address
    stateRoot: Address
    blockNumber: number
    timestamp: Timestamp
  }
}

export type Oracles = {
  lastRecordedBlock: number
  oracles: Oracle[]
}
