import { encodeAbiParameters, keccak256, type Address, type Hex } from 'viem'
import type { LayerZeroBridgeFamily, LayerZeroToken } from './layerzero'

export type DelayedEvent = {
  chainId: number
  originChainId: number
  bridgeAddress: Address
  tokenAddress: Address
  token: LayerZeroToken
  family: LayerZeroBridgeFamily
  nonce: bigint
  receiver: Address
  amount: bigint
  timestamp: bigint
  blockNumber: bigint
  logIndex: number
}

export type PendingLayerZeroClaim = DelayedEvent & { delayedHash: Hex }

export const getDelayedHash = ({
  family,
  timestamp,
  receiver,
  amount,
}: Pick<DelayedEvent, 'family' | 'timestamp' | 'receiver' | 'amount'>) =>
  family === 'crv'
    ? keccak256(
        encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'address' }, { type: 'uint256' }],
          [timestamp, receiver, amount],
        ),
      )
    : keccak256(
        encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'bytes' }],
          [timestamp, encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [receiver, amount])],
        ),
      )

export const groupDelayedEvents = (events: DelayedEvent[]) =>
  Object.values(
    events.reduce<Record<string, DelayedEvent>>((grouped, event) => {
      const key = `${event.chainId}:${event.bridgeAddress.toLowerCase()}:${event.nonce}`
      const current = grouped[key]
      grouped[key] = current
        ? {
            ...event,
            timestamp: current.timestamp < event.timestamp ? current.timestamp : event.timestamp,
          }
        : event
      return grouped
    }, {}),
  )

export type ClaimStatus = 'paused' | 'waiting-time' | 'waiting-capacity' | 'ready'

export const getClaimStatus = ({
  family,
  timestamp,
  wait,
  now,
  isKilled,
  available,
}: Pick<DelayedEvent, 'family' | 'timestamp'> & {
  wait: bigint
  now: bigint
  isKilled: boolean
  available?: bigint
}): ClaimStatus => {
  if (isKilled) return 'paused'
  const matured = family === 'crv' ? now >= timestamp + wait : now > timestamp + wait
  if (!matured) return 'waiting-time'
  if (family === 'crv' && available === 0n) return 'waiting-capacity'
  return 'ready'
}
