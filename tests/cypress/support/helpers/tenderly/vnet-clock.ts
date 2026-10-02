import { toHex } from 'viem'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'

const getNextBlock = ({ result, error }: { result?: { timestamp: Hex }; error?: unknown }) => [
  toHex(BigInt(assert(result, `Failed to read fork block: ${JSON.stringify(error)}`).timestamp) + 1n),
]

/** Anchor a newly created fork's clock before funding or transactions advance it to wall-clock time. */
export const setVirtualNetworkClockToFork = ({ adminRpcUrl }: { adminRpcUrl: string }) =>
  cy
    .request<{ result?: { timestamp: Hex }; error?: unknown }>({
      method: 'POST',
      url: adminRpcUrl,
      body: { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 1 },
      ...LOAD_TIMEOUT,
    })
    .then(({ body }) =>
      cy.request<{ result?: number; error?: unknown }>({
        method: 'POST',
        url: adminRpcUrl,
        body: { jsonrpc: '2.0', method: 'evm_setNextBlockTimestamp', params: getNextBlock(body), id: 2 },
        ...LOAD_TIMEOUT,
      }),
    )
    .then(({ body }) => assert(body.result, `Failed to set fork clock: ${JSON.stringify(body.error)}`))
