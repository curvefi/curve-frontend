import { type Address, isHash, type PublicClient, zeroHash } from 'viem'
import { useConfig } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api'
import { getPublicClient } from '@wagmi/core'
import {
  LAYERZERO_CLAIM_DEPLOYMENTS,
  layerZeroCrvCapacityAbi,
  layerZeroRetryAbi,
  layerZeroStableCapacityAbi,
  layerZeroStatusAbi,
  type LayerZeroClaimDeployment,
} from '../layerzero'
import {
  getClaimStatus,
  getDelayedHash,
  groupDelayedEvents,
  type ClaimStatus,
  type DelayedEvent,
} from '../layerzero-claims'

const OVERLAP_BLOCKS = 128n

type ChainScan = { chainId: number; cursor?: bigint; events: DelayedEvent[]; error?: string }
export type LayerZeroClaim = DelayedEvent & { status: ClaimStatus; wait: bigint; available?: bigint }
type ClaimsResult = { claims: LayerZeroClaim[]; scans: ChainScan[] }
type DelayedLog = {
  address?: Address
  args?: { nonce?: bigint; receiver?: Address; amount?: bigint }
  blockNumber?: bigint
  logIndex?: number
}

const isLogRangeError = (error: unknown) => {
  const message = String(error).toLowerCase()
  return [
    'block range',
    'range is too wide',
    'response size exceeded',
    'too many results',
    'query exceeds',
    '-32005',
  ].some(fragment => message.includes(fragment))
}

const getLogs = async (
  client: PublicClient,
  deployments: LayerZeroClaimDeployment[],
  receiver: Address,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<DelayedLog[]> => {
  try {
    return await client.getLogs({
      address: deployments.map(({ bridgeAddress }) => bridgeAddress),
      event: layerZeroRetryAbi[0],
      args: { receiver },
      fromBlock,
      toBlock,
    })
  } catch (error) {
    if (fromBlock === toBlock || !isLogRangeError(error)) throw error
    const middle = (fromBlock + toBlock) / 2n
    return [
      ...(await getLogs(client, deployments, receiver, fromBlock, middle)),
      ...(await getLogs(client, deployments, receiver, middle + 1n, toBlock)),
    ]
  }
}

const scanChain = async (
  config: ReturnType<typeof useConfig>,
  receiver: Address,
  deployments: LayerZeroClaimDeployment[],
  previous?: ChainScan,
): Promise<ChainScan> => {
  const chainId = deployments[0].chainId
  const client = getPublicClient(config, { chainId }) as PublicClient | undefined
  if (!client) throw new Error('No public RPC client configured')
  const toBlock = await client.getBlockNumber()
  const firstBlock = deployments.reduce(
    (earliest, deployment) => (deployment.startBlock < earliest ? deployment.startBlock : earliest),
    deployments[0].startBlock,
  )
  const fromBlock = previous?.cursor
    ? previous.cursor > OVERLAP_BLOCKS
      ? previous.cursor - OVERLAP_BLOCKS
      : firstBlock
    : firstBlock
  const logs = fromBlock <= toBlock ? await getLogs(client, deployments, receiver, fromBlock, toBlock) : []
  const blockNumbers = [...new Set(logs.map(log => log.blockNumber).filter(value => value != null))] as bigint[]
  const timestamps = new Map(
    await Promise.all(
      blockNumbers.map(async blockNumber => [blockNumber, (await client.getBlock({ blockNumber })).timestamp] as const),
    ),
  )
  const byAddress = new Map(deployments.map(deployment => [deployment.bridgeAddress.toLowerCase(), deployment]))
  const fresh = logs.flatMap(log => {
    const deployment = log.address ? byAddress.get(log.address.toLowerCase()) : undefined
    const nonce = log.args?.nonce
    const amount = log.args?.amount
    if (!deployment || nonce == null || amount == null || log.blockNumber == null || log.logIndex == null) return []
    return [
      {
        chainId,
        bridgeAddress: deployment.bridgeAddress,
        token: deployment.token,
        family: deployment.family,
        nonce,
        receiver,
        amount,
        timestamp: timestamps.get(log.blockNumber)!,
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
      } satisfies DelayedEvent,
    ]
  })
  const retained = previous?.events.filter(event => event.blockNumber < fromBlock) ?? []
  return { chainId, cursor: toBlock, events: [...retained, ...fresh] }
}

const confirmClaims = async (config: ReturnType<typeof useConfig>, scans: ChainScan[]): Promise<LayerZeroClaim[]> =>
  (
    await Promise.all(
      groupDelayedEvents(scans.flatMap(({ events }) => events)).map(async event => {
        try {
          const client = getPublicClient(config, { chainId: event.chainId }) as PublicClient | undefined
          if (!client) throw new Error('No public RPC client configured')
          const stored = await client.readContract({
            address: event.bridgeAddress,
            abi: layerZeroRetryAbi,
            functionName: 'delayed',
            args: [event.nonce],
          })
          const expected = getDelayedHash(event)
          if (!isHash(stored) || stored === zeroHash || stored.toLowerCase() !== expected.toLowerCase()) return []
          const block = await client.getBlock()
          const isKilled = await client.readContract({
            address: event.bridgeAddress,
            abi: layerZeroStatusAbi,
            functionName: 'is_killed',
          })
          const wait = await client.readContract({
            address: event.bridgeAddress,
            abi: event.family === 'crv' ? layerZeroCrvCapacityAbi : layerZeroStableCapacityAbi,
            functionName: event.family === 'crv' ? 'period' : 'delay',
          })
          const available =
            event.family === 'crv'
              ? await client.readContract({
                  address: event.bridgeAddress,
                  abi: layerZeroCrvCapacityAbi,
                  functionName: 'available',
                })
              : undefined
          return [
            {
              ...event,
              wait,
              ...(available == null ? {} : { available }),
              status: getClaimStatus({ ...event, wait, now: block.timestamp, isKilled, available }),
            } satisfies LayerZeroClaim,
          ]
        } catch (error) {
          const scan = scans.find(({ chainId }) => chainId === event.chainId)
          if (scan && !scan.error) scan.error = String(error)
          return []
        }
      }),
    )
  ).flat()

export const useLayerZeroClaims = (receiver: Address | undefined) => {
  const config = useConfig()
  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- wagmi config is stable infrastructure, not query data.
  return useQuery({
    queryKey: ['bridge', 'layerzero-claims', receiver],
    enabled: !!receiver,
    staleTime: 60_000,
    queryFn: async (): Promise<ClaimsResult> => {
      if (!receiver) return { claims: [], scans: [] }
      const previous = queryClient.getQueryData<ClaimsResult>(['bridge', 'layerzero-claims', receiver])
      const grouped = Object.values(
        LAYERZERO_CLAIM_DEPLOYMENTS.reduce<Record<number, LayerZeroClaimDeployment[]>>(
          (result, deployment) => ({
            ...result,
            [deployment.chainId]: [...(result[deployment.chainId] ?? []), deployment],
          }),
          {},
        ),
      )
      const scans: ChainScan[] = grouped.map(deployments => ({ chainId: deployments[0].chainId, events: [] }))
      let next = 0
      const worker = async () => {
        while (next < grouped.length) {
          const index = next++
          const deployments = grouped[index]
          const chainId = deployments[0].chainId
          const old = previous?.scans.find(scan => scan.chainId === chainId)
          try {
            scans[index] = await scanChain(config, receiver, deployments, old)
          } catch (error) {
            scans[index] = { chainId, cursor: old?.cursor, events: old?.events ?? [], error: String(error) }
          }
        }
      }
      await Promise.all([worker(), worker()])
      return { scans, claims: await confirmClaims(config, scans) }
    },
  })
}
