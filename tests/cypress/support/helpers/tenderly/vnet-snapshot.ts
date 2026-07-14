import { oneInt } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { assert } from '@primitives/objects.utils'
import { getRpcUrls } from './vnet'

type VirtualNetwork = Parameters<typeof getRpcUrls>[0]

type JsonRpcResponse = {
  error?: unknown
  result?: unknown
}

const requestVirtualNetworkState = ({
  method,
  params = [],
  vnet,
}: {
  method: 'evm_snapshot' | 'evm_revert'
  params?: unknown[]
  vnet: VirtualNetwork
}): Cypress.Chainable<unknown> => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  const body = { jsonrpc: '2.0', method, params, id: oneInt() }

  return cy
    .request<JsonRpcResponse>({
      method: 'POST',
      url: adminRpcUrl,
      body,
      failOnStatusCode: false,
      ...LOAD_TIMEOUT,
    })
    .then(({ body: response, status, statusText }) => {
      assert(
        status >= 200 && status < 300 && !response.error,
        `Tenderly ${method} failed (${status} ${statusText}): ${JSON.stringify(response)}`,
      )
      assert('result' in response, `Tenderly ${method} returned no result: ${JSON.stringify(response)}`)
      return response.result
    })
}

export const snapshotVirtualNetwork = ({ vnet }: { vnet: VirtualNetwork }) =>
  requestVirtualNetworkState({ method: 'evm_snapshot', vnet }).then(snapshotId =>
    assert(
      typeof snapshotId === 'string' && snapshotId,
      `Tenderly evm_snapshot returned an invalid snapshot id: ${JSON.stringify(snapshotId)}`,
    ),
  )

export const revertVirtualNetwork = ({ snapshotId, vnet }: { snapshotId: string; vnet: VirtualNetwork }) =>
  requestVirtualNetworkState({ method: 'evm_revert', params: [snapshotId], vnet }).then(reverted => {
    assert(reverted, `Tenderly evm_revert rejected snapshot '${snapshotId}'`)
  })

export const createVirtualNetworkSnapshot = ({ vnet }: { vnet: VirtualNetwork }) => {
  let snapshotId: string | undefined
  return {
    capture: () => snapshotVirtualNetwork({ vnet }).then(id => (snapshotId = id)),
    revert: () =>
      revertVirtualNetwork({
        vnet,
        snapshotId: assert(snapshotId, 'Tenderly evm_revert was requested before a snapshot was captured'),
      }).then(() => snapshotVirtualNetwork({ vnet }).then(id => (snapshotId = id))),
  }
}

export type VnetSnapshot = ReturnType<typeof createVirtualNetworkSnapshot>
