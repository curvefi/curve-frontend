import { Eip1193Provider, FallbackProvider, JsonRpcProvider } from 'ethers'
import { AbstractProvider } from 'ethers/lib.commonjs/providers/abstract-provider'
import type { Chain, Client, Transport } from 'viem'
import type { Wallet } from '@ui-kit/features/connect-wallet'
import type { Address } from '@ui-kit/utils'

/**
 * Action to convert a viem Client to an ethers.js Provider.
 * Based on https://wagmi.sh/react/guides/ethers
 */
export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback') {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) => new JsonRpcProvider(value?.url, network),
    )
    if (providers.length === 1) return providers[0]
    return new FallbackProvider(providers)
  }
  return new JsonRpcProvider(transport.url, network)
}

export const createEip1193Provider = (p: AbstractProvider): Eip1193Provider => ({
  request: async ({
    method,
    params = [],
  }: {
    method: string
    params?: Array<any> | Record<string, any>
  }): Promise<any> => {
    async function callJsonRpc(provider: JsonRpcProvider) {
      try {
        return await provider.send(method, params)
      } catch (error) {
        console.error('Error in EIP-1193 request', { method, params, provider }, error)
        throw error
      }
    }

    function callFallbackProvider({ providerConfigs }: FallbackProvider): Promise<any> {
      // todo: the fallback provider should handle the fallbacks itself, but I couldn't figure out how to call it
      const errors = []
      // let i = 1
      for (const config of providerConfigs) {
        try {
          // console.log(`calling provider ${i++}/${providerConfigs.length}`, config.provider)
          return callAbstractProvider(config.provider)
        } catch (e) {
          errors.push(e)
        }
      }
      throw new Error(`All providers failed: ${errors.map((e) => e.message).join(', ')}`)
    }

    async function callAbstractProvider(provider: AbstractProvider) {
      if ('send' in provider) {
        return await callJsonRpc(provider as JsonRpcProvider)
      }
      if ('providerConfigs' in provider) {
        return callFallbackProvider(provider as FallbackProvider)
      }
      throw new Error(`Unsupported provider type: ${provider.constructor.name}`)
    }

    return await callAbstractProvider(p)
  },
})

export const createWallet = ({
  client,
  label,
  address,
  ensName,
}: {
  client: Client<Transport, Chain>
  label?: string
  address: Address
  ensName?: string | null
}): Wallet => ({
  label,
  account: { address, ...(ensName && { ensName }) },
  chainId: client.chain.id,
  provider: client.transport,
})
