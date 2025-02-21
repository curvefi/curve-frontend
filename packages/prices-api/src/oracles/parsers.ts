import { toDate } from '../timestamp'
import type * as Responses from './responses'
import type * as Models from './models'

export const parseOracles = (x: Responses.GetOraclesResponse): Models.Oracles => ({
  lastRecordedBlock: x.last_recorded_block,
  oracles: x.oracles.map(({ block_header, ...oracle }) => ({
    chain: oracle.chain,
    address: oracle.address,
    lastConfirmedBlockNumber: oracle.last_confirmed_block_number,
    blockHeader: {
      hashBlock: block_header.block_hash,
      hashParent: block_header.parent_hash,
      stateRoot: block_header.state_root,
      blockNumber: block_header.block_number,
      timestamp: toDate(block_header.timestamp),
    },
  })),
})
