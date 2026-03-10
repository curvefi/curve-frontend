import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

type Oracle = {
  chain: Chain
  address: Address
  lastConfirmedBlockNumber: number
  blockHeader: {
    hashBlock: Address
    hashParent: Address
    stateRoot: Address
    blockNumber: number
    timestamp: Date
  }
}

export type Oracles = {
  lastRecordedBlock: number
  oracles: Oracle[]
}
