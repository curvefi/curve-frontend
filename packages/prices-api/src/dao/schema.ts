import { z } from 'zod/v4'
import type { Address } from '@primitives/address.utils'
import { address, camelizeKeys, timestamp } from '../schemas'

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
  .transform(camelizeKeys)
  .transform(({ propVotes, gaugeVotes, propUniqueVoters, ...data }) => ({
    ...data,
    votesProposals: propVotes,
    votesGauges: gaugeVotes,
    votersUnique: propUniqueVoters,
  }))

const locksDaily = z
  .object({
    day: timestamp,
    amount: z.string(),
  })
  .transform(({ amount, ...data }) => ({
    ...data,
    amount: BigInt(amount),
  }))

const userLock = z
  .object({
    amount: z.string(),
    unlock_time: timestamp,
    lock_type: lockType,
    locked_balance: z.string(),
    dt: timestamp,
    transaction_hash: z.string(),
  })
  .transform(camelizeKeys)
  .transform(({ dt, amount, lockedBalance, transactionHash, ...data }) => ({
    ...data,
    timestamp: dt,
    amount: BigInt(Math.round(parseFloat(amount))),
    lockedBalance: BigInt(Math.round(parseFloat(lockedBalance))),
    txHash: transactionHash,
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
    dt: timestamp,
    transaction_hash: address,
  })
  .transform(camelizeKeys)
  .transform(
    ({
      dt,
      totalVecrv,
      escrowedCrv,
      crvSupply,
      circulatingSupply,
      lockedSupplyDetails,
      blockNumber,
      transactionHash,
    }) => ({
      timestamp: dt,
      veCrvTotal: BigInt(totalVecrv),
      crvEscrowed: BigInt(escrowedCrv),
      crvSupply: BigInt(crvSupply),
      circulatingSupply: BigInt(circulatingSupply),
      lockedSupplyDetails: lockedSupplyDetails.map(item => ({
        address: item.address,
        label: item.label,
        locked: BigInt(item.locked),
      })),
      blockNumber,
      txHash: transactionHash,
    }),
  )

const locker = z
  .object({
    user: z.string().transform(value => value as Address | `Others(${string})`),
    locked: z.string(),
    weight: z.string(),
    weight_ratio: z.string(),
    unlock_time: timestamp.nullable(),
  })
  .transform(camelizeKeys)
  .transform(({ locked, weight, weightRatio, ...data }) => ({
    ...data,
    locked: BigInt(Math.round(parseFloat(locked))),
    weight: BigInt(Math.round(parseFloat(weight))),
    weightRatio: parseFloat(weightRatio.slice(0, -1)),
  }))

export const getVotesOverviewResponse = z.object({ data: z.array(votesOverview) }).transform(({ data }) => data)
export const getLocksDailyResponse = z.object({ locks: z.array(locksDaily) }).transform(({ locks }) => locks)
export const getSupplyResponse = z.object({ supply: z.array(supply) }).transform(({ supply }) => supply)
export const getUserLocksResponse = z.object({ locks: z.array(userLock) }).transform(({ locks }) => locks)
export const getLockersResponse = z.object({ locks: z.array(locker) }).transform(({ locks }) => locks)
export const getLockersTopResponse = z.object({ users: z.array(locker) }).transform(({ users }) => users)

export type VotesOverview = z.infer<typeof votesOverview>
export type LocksDaily = z.infer<typeof locksDaily>
export type UserLock = z.infer<typeof userLock>
export type Supply = z.infer<typeof supply>
export type Locker = z.infer<typeof locker>
