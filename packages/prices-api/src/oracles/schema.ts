import { z } from 'zod/v4'
import { address, camelizeKeys, timestampResponse } from '../schemas'
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
  .transform(camelizeKeys)
  .transform(({ blockHeader, ...data }) => ({
    chain: data.chain,
    address: data.address,
    lastConfirmedBlockNumber: data.lastConfirmedBlockNumber,
    blockHeader: {
      hashBlock: blockHeader.blockHash,
      hashParent: blockHeader.parentHash,
      stateRoot: blockHeader.stateRoot,
      blockNumber: blockHeader.blockNumber,
      timestamp: parseTimestamp(blockHeader.timestamp),
    },
  }))

export const getOraclesResponse = z
  .object({
    last_recorded_block: z.number(),
    oracles: z.array(oracle),
  })
  .transform(camelizeKeys)

export type Oracles = z.infer<typeof getOraclesResponse>
