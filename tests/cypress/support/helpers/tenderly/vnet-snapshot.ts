import { LOAD_TIMEOUT } from '@cy/support/ui'
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
  const body = { jsonrpc: '2.0', method, params, id: Date.now() }

  return cy
    .request<JsonRpcResponse>({
      method: 'POST',
      url: adminRpcUrl,
      body,
      failOnStatusCode: false,
      ...LOAD_TIMEOUT,
    })
    .then(({ body: response, status, statusText }) => {
      if (status < 200 || status >= 300 || response.error) {
        throw new Error(`Tenderly ${method} failed (${status} ${statusText}): ${JSON.stringify(response)}`)
      }

      if (!('result' in response)) {
        throw new Error(`Tenderly ${method} returned no result: ${JSON.stringify(response)}`)
      }

      return response.result
    })
}

export const snapshotVirtualNetwork = ({ vnet }: { vnet: VirtualNetwork }) =>
  requestVirtualNetworkState({ method: 'evm_snapshot', vnet }).then(snapshotId => {
    if (typeof snapshotId !== 'string' || !snapshotId) {
      throw new Error(`Tenderly evm_snapshot returned an invalid snapshot id: ${JSON.stringify(snapshotId)}`)
    }
    return snapshotId
  })

export const revertVirtualNetwork = ({ snapshotId, vnet }: { snapshotId: string; vnet: VirtualNetwork }) =>
  requestVirtualNetworkState({ method: 'evm_revert', params: [snapshotId], vnet }).then(reverted => {
    if (!reverted) throw new Error(`Tenderly evm_revert rejected snapshot '${snapshotId}'`)
  })

export const createVirtualNetworkSnapshot = ({ vnet }: { vnet: VirtualNetwork }) => {
  let snapshotId: string | undefined

  const capture = () =>
    snapshotVirtualNetwork({ vnet }).then(id => {
      snapshotId = id
    })

  const revert = () => {
    if (!snapshotId) throw new Error('Tenderly evm_revert was requested before a snapshot was captured')
    return revertVirtualNetwork({ vnet, snapshotId }).then(capture)
  }

  return { capture, revert }
}
