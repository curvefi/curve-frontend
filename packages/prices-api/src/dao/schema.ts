import { z } from 'zod/v4'
import type { Address } from '@primitives/address.utils'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const lockType = z.enum(['CREATE_LOCK', 'INCREASE_LOCK_AMOUNT', 'INCREASE_UNLOCK_TIME', 'WITHDRAW'])
export type LockType = z.infer<typeof lockType>

const votesOverview = z
  .object({
    proposals: z.number(),
    prop_votes: z.number(),
    prop_unique_voters: z.number(),
    gauge_votes: z.number(),
    epoch: z.number(),
  })
  .transform(data => ({
    proposals: data.proposals,
    votesProposals: data.prop_votes,
    votesGauges: data.gauge_votes,
    votersUnique: data.prop_unique_voters,
    epoch: data.epoch,
  }))

const locksDaily = z
  .object({
    day: timestampResponse,
    amount: z.string(),
  })
  .transform(data => ({
    day: parseTimestamp(data.day),
    amount: BigInt(data.amount),
  }))

const userLock = z
  .object({
    amount: z.string(),
    unlock_time: timestampResponse,
    lock_type: lockType,
    locked_balance: z.string(),
    dt: timestampResponse,
    transaction_hash: z.string(),
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    amount: BigInt(Math.round(parseFloat(data.amount))),
    unlockTime: parseTimestamp(data.unlock_time),
    lockType: data.lock_type,
    lockedBalance: BigInt(Math.round(parseFloat(data.locked_balance))),
    txHash: data.transaction_hash,
  }))

const supply = z
  .object({
    total_vecrv: z.string(),
    escrowed_crv: z.string(),
    crv_supply: z.string(),
    circulating_supply: z.string(),
    locked_supply_details: z.array(
      z.object({
        address,
        label: z.string(),
        locked: z.string(),
      }),
    ),
    block_number: z.number(),
    dt: timestampResponse,
    transaction_hash: address,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    veCrvTotal: BigInt(data.total_vecrv),
    crvEscrowed: BigInt(data.escrowed_crv),
    crvSupply: BigInt(data.crv_supply),
    circulatingSupply: BigInt(data.circulating_supply),
    lockedSupplyDetails: data.locked_supply_details.map(item => ({
      address: item.address,
      label: item.label,
      locked: BigInt(item.locked),
    })),
    blockNumber: data.block_number,
    txHash: data.transaction_hash,
  }))

const locker = z
  .object({
    user: z.string().transform(value => value as Address | `Others(${string})`),
    locked: z.string(),
    weight: z.string(),
    weight_ratio: z.string(),
    unlock_time: timestampResponse.nullable(),
  })
  .transform(data => ({
    user: data.user,
    locked: BigInt(Math.round(parseFloat(data.locked))),
    weight: BigInt(Math.round(parseFloat(data.weight))),
    weightRatio: parseFloat(data.weight_ratio.slice(0, -1)),
    unlockTime: data.unlock_time === null ? null : parseTimestamp(data.unlock_time),
  }))

export const getVotesOverviewResponse = z
  .object({
    data: z.array(votesOverview),
  })
  .transform(data => data.data)

export const getLocksDailyResponse = z
  .object({
    locks: z.array(locksDaily),
  })
  .transform(data => data.locks)

export const getSupplyResponse = z
  .object({
    supply: z.array(supply),
  })
  .transform(data => data.supply)

export const getUserLocksResponse = z
  .object({
    locks: z.array(userLock),
  })
  .transform(data => data.locks)

export const getLockersResponse = z
  .object({
    locks: z.array(locker),
  })
  .transform(data => data.locks)

export const getLockersTopResponse = z
  .object({
    users: z.array(locker),
  })
  .transform(data => data.users)

export type VotesOverview = z.infer<typeof votesOverview>
export type LocksDaily = z.infer<typeof locksDaily>
export type UserLock = z.infer<typeof userLock>
export type Supply = z.infer<typeof supply>
export type Locker = z.infer<typeof locker>
