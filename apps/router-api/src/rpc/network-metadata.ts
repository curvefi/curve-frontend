import { NETWORK_CONSTANTS } from '@curvefi/api/lib/constants/network_constants.js'
import type { CurveJS } from '../curvejs'

/**
 * Sanitize a string to be used as an environment variable key.
 * Converts to uppercase, replaces non-alphanumeric characters with underscores,
 * and trims leading/trailing underscores.
 */
export const sanitizeId = (value: string): string =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()

/**
 * Resolve the RPC URL for a given chain ID from environment variables.
 * Looks for an environment variable named `RPC_URL_{SANITIZED_ID}`.
 * If not found, uses the provided fallback URL.
 * Throws an error if neither is available.
 */
export function resolveEnv(id: string, fallback?: string, env: NodeJS.ProcessEnv = process.env): string {
  const envKey = `RPC_URL_${sanitizeId(id)}`
  const url = env[envKey]?.trim() ?? fallback
  if (!url?.length) throw new Error(`Missing RPC URL for chain ${id}. Add it to environment variable: "${envKey}"`)
  return url
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
  const network = liteNetworks.find((n) => n.chainId === chainId)
  if (network) {
    return { id: network.id, url: resolveEnv(network.id, network.rpcUrl) }
  }

  throw new Error(`Unsupported Curve network for chain ${chainId}`)
}
