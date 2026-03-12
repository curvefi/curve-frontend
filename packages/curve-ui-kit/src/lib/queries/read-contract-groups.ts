import { ChainDoesNotSupportContract, type ContractFunctionParameters } from 'viem'
import { type Config, multicall, readContract, type ReadContractsReturnType } from '@wagmi/core'

type ContractGroup = readonly ContractFunctionParameters[]

type ReadContractGroupsReturnType<groups extends readonly ContractGroup[]> = {
  [K in keyof groups]: ReadContractsReturnType<groups[K]>
}

const splitGroupedResults = (
  groups: readonly ContractGroup[],
  results: readonly unknown[],
  startIndex = 0,
): readonly unknown[][] => {
  const [group, ...rest] = groups
  if (group == null) return []
  const nextIndex = startIndex + group.length
  return [results.slice(startIndex, nextIndex), ...splitGroupedResults(rest, results, nextIndex)]
}

const readContractGroupWithoutMulticall = async <const group extends ContractGroup>(
  config: Config,
  group: group,
): Promise<ReadContractsReturnType<group>> =>
  (await Promise.all(
    group.map((contract) =>
      readContract(config, contract as never)
        .then((result) => ({ status: 'success', result }) as const)
        .catch((error) => ({ status: 'failure', error }) as const),
    ),
  )) as ReadContractsReturnType<group>

/**
 * Read logical groups of view contracts while preserving group boundaries in the result.
 *
 * This intentionally owns the multicall fallback instead of relying on wagmi's higher-level
 * helpers. We need this specific behavior for prefetch paths that flatten many grouped reads
 * into one multicall and must stay best-effort on chains that are missing configured
 * `multicall3` metadata (for example Arc Testnet).
 *
 * Behavior:
 * - on supported chains, execute one multicall for the flattened contract list
 * - if viem throws `ChainDoesNotSupportContract`, retry each contract individually with `readContract`
 * - preserve the original group boundaries in the returned result either way
 */
export const readContractGroups = async <const groups extends readonly ContractGroup[]>(
  config: Config,
  { groups }: { groups: groups },
): Promise<ReadContractGroupsReturnType<groups>> => {
  try {
    return splitGroupedResults(
      groups,
      await multicall(config, { contracts: groups.flat() as ContractFunctionParameters[] }),
    ) as ReadContractGroupsReturnType<groups>
  } catch (error) {
    if (error instanceof ChainDoesNotSupportContract || (error as Error).name === 'ChainDoesNotSupportContract') {
      return (await Promise.all(
        groups.map((group) => readContractGroupWithoutMulticall(config, group)),
      )) as ReadContractGroupsReturnType<groups>
    }
    throw error
  }
}
