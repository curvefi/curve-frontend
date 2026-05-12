import { z } from 'zod/v4'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const oracle = z
  .object({
    chain: z.string(),
    address,
    last_confirmed_block_number: z.number(),
    block_header: z.object({
      block_hash: address,
      parent_hash: address,
      state_root: address,
      block_number: z.number(),
      timestamp: timestampResponse,
    }),
    last_updated: z.number(),
  })
  .transform(({ block_header, ...data }) => ({
    chain: data.chain,
    address: data.address,
    lastConfirmedBlockNumber: data.last_confirmed_block_number,
    blockHeader: {
      hashBlock: block_header.block_hash,
      hashParent: block_header.parent_hash,
      stateRoot: block_header.state_root,
      blockNumber: block_header.block_number,
      timestamp: parseTimestamp(block_header.timestamp),
    },
  }))

export const getOraclesResponse = z
  .object({
    last_recorded_block: z.number(),
    oracles: z.array(oracle),
  })
  .transform(data => ({
    lastRecordedBlock: data.last_recorded_block,
    oracles: data.oracles,
  }))

export type Oracles = z.infer<typeof getOraclesResponse>
