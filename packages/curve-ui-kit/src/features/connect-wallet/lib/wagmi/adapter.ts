import { JsonRpcProvider } from 'ethers'
import type { Chain, Client, Transport } from 'viem'

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
