import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import { getClaimStatus, getDelayedHash, groupDelayedEvents } from './layerzero-claims'

const event = {
  chainId: 1,
  bridgeAddress: zeroAddress,
  token: 'CRV' as const,
  family: 'crv' as const,
  nonce: 1n,
  receiver: zeroAddress,
  amount: 10n,
  timestamp: 100n,
  blockNumber: 1n,
  logIndex: 0,
}

describe('LayerZero delayed claims', () => {
  it('uses the deployment-matched delayed hashes', () => {
    expect(getDelayedHash(event)).not.toBe(getDelayedHash({ ...event, family: 'stable' }))
  })

  it('retains the earliest timestamp and latest CRV remainder', () => {
    expect(
      groupDelayedEvents([event, { ...event, amount: 4n, timestamp: 110n, blockNumber: 2n, logIndex: 1 }]),
    ).toEqual([{ ...event, amount: 4n, timestamp: 100n, blockNumber: 2n, logIndex: 1 }])
  })

  it('distinguishes waiting, capacity, ready, and paused claims', () => {
    expect(getClaimStatus({ ...event, wait: 10n, now: 105n, isKilled: false, available: 5n })).toBe('waiting-time')
    expect(getClaimStatus({ ...event, wait: 10n, now: 110n, isKilled: false, available: 0n })).toBe('waiting-capacity')
    expect(getClaimStatus({ ...event, wait: 10n, now: 110n, isKilled: false, available: 5n })).toBe('ready')
    expect(getClaimStatus({ ...event, wait: 10n, now: 110n, isKilled: true, available: 5n })).toBe('paused')
  })
})
