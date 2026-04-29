import { NETWORK_CONSTANTS } from '@curvefi/api/lib/constants/network_constants.js'
import { assert } from '@primitives/objects.utils'
import type { CurveJS } from './curvejs'

/**
 * Resolve the RPC URL for a given chain ID from environment variables.
 * Looks for an environment variable named `RPC_URL_{SANITIZED_ID}`.
 * If not found, uses the provided fallback URL.
 * Throws an error if neither is available.
 */
function resolveEnv(id: string, fallback?: string, env: NodeJS.ProcessEnv = process.env): string {
  // Converts to uppercase, replaces non-alphanumeric characters with underscores and trims leading/trailing underscores
  const envKey = `RPC_URL_${id
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()}`
  return assert(
    env[envKey]?.trim() ?? fallback,
    `Missing RPC URL for chain ${id}. Add it to environment variable: "${envKey}"`,
  )
}

/**
 * Resolve the RPC URL and network ID for a given chain ID using CurveJS.
 */
export async function resolveRpc(
  chainId: number,
  curve: CurveJS,
): Promise<{
  id: string
  url: string
}> {
  if (chainId in NETWORK_CONSTANTS) {
    const id = NETWORK_CONSTANTS[chainId].NAME
    return { id, url: resolveEnv(id) }
  }
  const liteNetworks = await curve.getCurveLiteNetworks() // note: this is already memoized inside curvejs
  const { id, rpcUrl } = assert(
    liteNetworks.find(n => n.chainId === chainId),
    `Unsupported chain ${chainId}`,
  )
  return { id, url: resolveEnv(id, rpcUrl) }
}
