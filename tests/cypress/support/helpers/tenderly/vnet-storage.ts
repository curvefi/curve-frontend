import type { Address, Hex } from 'viem'
import { oneInt } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { getRpcUrls } from './vnet'
import type { CreateVirtualTestnetResponse } from './vnet-create'

/** Writes a raw storage slot in a Tenderly virtual testnet. */
export const setVirtualNetworkStorageAt = ({
  vnet,
  contractAddress,
  slot,
  value,
}: {
  vnet: CreateVirtualTestnetResponse
  contractAddress: Address
  slot: Hex
  value: Hex
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  const body = {
    jsonrpc: '2.0',
    method: 'tenderly_setStorageAt',
    params: [contractAddress, slot, value],
    id: oneInt(),
  }

  return cy
    .request<{ error?: unknown; result?: unknown }>({
      method: 'POST',
      url: adminRpcUrl,
      body,
      ...LOAD_TIMEOUT,
    })
    .then(({ body: responseBody, isOkStatusCode }) => {
      const errorMessage = JSON.stringify({ request: body, response: responseBody })
      expect(isOkStatusCode).to.equal(true, errorMessage)
      expect(responseBody.error).to.equal(undefined, errorMessage)
    })
}
