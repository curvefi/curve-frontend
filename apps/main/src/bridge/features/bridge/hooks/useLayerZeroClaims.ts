import { type Address, type PublicClient, zeroHash } from 'viem'
import { useConfig } from 'wagmi'
import { useQueries } from '@tanstack/react-query'
import { getPublicClient } from '@wagmi/core'
import {
  LAYERZERO_CLAIM_DEPLOYMENTS,
  layerZeroCrvCapacityAbi,
  layerZeroRetryAbi,
  layerZeroStableCapacityAbi,
  layerZeroStatusAbi,
  type LayerZeroClaimDeployment,
} from '../layerzero'
import { getDelayedHash, groupDelayedEvents, type DelayedEvent } from '../layerzero-claims'

const CONFIRMATION_BLOCKS = 32n
const RECENT_BLOCKS = 50_000n

export type LayerZeroClaim = DelayedEvent & { wait: bigint; isKilled: boolean; available?: bigint }
type DelayedLog = {
  address?: Address
  args?: { nonce?: bigint; receiver?: Address; amount?: bigint }
  blockNumber?: bigint
  logIndex?: number
}

const deploymentsByChain = Object.values(
  LAYERZERO_CLAIM_DEPLOYMENTS.reduce<Record<number, LayerZeroClaimDeployment[]>>(
    (result, deployment) => ({
      ...result,
      [deployment.chainId]: [...(result[deployment.chainId] ?? []), deployment],
    }),
    {},
  ),
)

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
) => {
  const chainId = deployments[0].chainId
  const client = getPublicClient(config, { chainId }) as PublicClient | undefined
  if (!client) throw new Error('No public RPC client configured')

  const head = await client.getBlockNumber()
  const toBlock = head > CONFIRMATION_BLOCKS ? head - CONFIRMATION_BLOCKS : head
  const recentBlock = toBlock > RECENT_BLOCKS ? toBlock - RECENT_BLOCKS : 0n
  const deploymentBlock = deployments.reduce(
    (first, deployment) => (deployment.startBlock < first ? deployment.startBlock : first),
    deployments[0].startBlock,
  )
  const fromBlock = recentBlock > deploymentBlock ? recentBlock : deploymentBlock
  const logs = fromBlock <= toBlock ? await getLogs(client, deployments, receiver, fromBlock, toBlock) : []
  const blockNumbers = [...new Set(logs.flatMap(log => (log.blockNumber == null ? [] : [log.blockNumber])))]
  const timestamps = new Map(
    await Promise.all(
      blockNumbers.map(async blockNumber => [blockNumber, (await client.getBlock({ blockNumber })).timestamp] as const),
    ),
  )
  const byAddress = new Map(deployments.map(deployment => [deployment.bridgeAddress.toLowerCase(), deployment]))
  const events = logs.flatMap(log => {
    const deployment = log.address ? byAddress.get(log.address.toLowerCase()) : undefined
    const nonce = log.args?.nonce
    const amount = log.args?.amount
    let timestamp
    if (log.blockNumber != null) timestamp = timestamps.get(log.blockNumber)
    if (
      !deployment ||
      nonce == null ||
      amount == null ||
      timestamp == null ||
      log.blockNumber == null ||
      log.logIndex == null
    )
      return []
    return [
      {
        ...deployment,
        receiver,
        nonce,
        amount,
        timestamp,
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
      } satisfies DelayedEvent,
    ]
  })

  return (
    await Promise.all(
      groupDelayedEvents(events).map(async event => {
        const stored = await client.readContract({
          address: event.bridgeAddress,
          abi: layerZeroRetryAbi,
          functionName: 'delayed',
          args: [event.nonce],
        })
        if (stored === zeroHash || stored.toLowerCase() !== getDelayedHash(event).toLowerCase()) return []
        const [isKilled, wait, available] = await Promise.all([
          client.readContract({ address: event.bridgeAddress, abi: layerZeroStatusAbi, functionName: 'is_killed' }),
          client.readContract({
            address: event.bridgeAddress,
            abi: event.family === 'crv' ? layerZeroCrvCapacityAbi : layerZeroStableCapacityAbi,
            functionName: event.family === 'crv' ? 'period' : 'delay',
          }),
          event.family === 'crv'
            ? client.readContract({
                address: event.bridgeAddress,
                abi: layerZeroCrvCapacityAbi,
                functionName: 'available',
              })
            : undefined,
        ])
        return [{ ...event, isKilled, wait, ...(available == null ? {} : { available }) } satisfies LayerZeroClaim]
      }),
    )
  ).flat()
}

export const useLayerZeroClaims = (receiver: Address | undefined) => {
  const config = useConfig()
  const queries = useQueries({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- wagmi config is stable infrastructure, not query data.
    queries: deploymentsByChain.map(deployments => ({
      queryKey: ['bridge', 'layerzero-claims', receiver, deployments[0].chainId],
      enabled: !!receiver,
      staleTime: 60_000,
      queryFn: () => scanChain(config, receiver!, deployments),
    })),
  })

  return {
    claims: queries.flatMap(query => query.data ?? []),
    failures: queries.flatMap((query, index) => (query.error ? [deploymentsByChain[index][0].chainId] : [])),
    isLoading: queries.every(query => query.isPending),
    refetch: () => Promise.all(queries.map(query => query.refetch())),
  }
}
