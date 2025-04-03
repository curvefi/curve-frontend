import { Eip1193Provider, JsonRpcProvider } from 'ethers'
import type { Chain, Client, Transport } from 'viem'
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
  // todo: handle fallback providers, they need to be converted to I
  // if (transport.type === 'fallback') {
  //   const providers = (transport.transports as ReturnType<Transport>[]).map(
  //     ({ value }) => new JsonRpcProvider(value?.url, network),
  //   )
  //   if (providers.length === 1) return providers[0]
  //   return new FallbackProvider(providers)
  // }
  return new JsonRpcProvider(transport.url, network)
}

export const createEip1193Provider = (provider: JsonRpcProvider) =>
  ({
    request: (request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> =>
      provider.send(request.method, request.params ?? []),
  }) satisfies Eip1193Provider

export function createWallet({
  client,
  label,
  address,
  ensName,
}: {
  client: Client<Transport, Chain>
  label: string
  address: Address
  ensName?: string | null
}) {
  const provider = clientToProvider(client)
  return {
    wallet: {
      label,
      account: { address, ...(ensName && { ensName }) },
      chainId: client.chain.id,
      provider: createEip1193Provider(provider),
    },
    provider,
  }
}
