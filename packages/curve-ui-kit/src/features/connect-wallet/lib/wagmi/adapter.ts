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

  return new JsonRpcProvider(transport.url, network)
}
