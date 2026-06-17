import type { createPublicClient, Hex } from 'viem'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'

export const sendAdminTransaction = ({
  adminRpcUrl,
  from,
  to,
  data,
  client,
}: {
  adminRpcUrl: string
  from: Address
  to: Address
  data: Address
  client: ReturnType<typeof createPublicClient>
}) =>
  cy
    .request<{ result?: Hex; error?: unknown }>({
      method: 'POST',
      url: adminRpcUrl,
      body: {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [{ from, to, data }],
        id: 2,
      },
      ...LOAD_TIMEOUT,
    })
    .then(({ body }) =>
      client.waitForTransactionReceipt({
        hash: assert(body.result, `Failed to send available balance transaction: ${JSON.stringify(body.error)}`),
      }),
    )
    .then(({ status }) => assert(status == 'success', 'Failed to set available balance'))
