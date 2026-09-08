import type { Hash, Hex, PublicClient, RpcTransactionRequest } from 'viem'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'

/** Sends an eth_sendTransaction request through the Tenderly VNet admin RPC and waits for success. */
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
  data: Hex
  client: PublicClient
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

/** Creates a raw transaction through Tenderly's VNet transactions API. */
export async function sendVnetTransaction({
  tenderly: { accountSlug, projectSlug, accessKey, vnetId },
  tx,
}: {
  /** Tenderly configuration */
  tenderly: TenderlyConfig
  /** The transaction */
  tx: RpcTransactionRequest
}) {
  const response = await fetch(
    `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/${vnetId}/transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Access-Key': accessKey },
      body: JSON.stringify({ callArgs: tx }),
    },
  )

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Failed to send virtual testnet transaction: ${response.status} ${response.statusText}: ${text}`)
  }
  const { tx_hash } = JSON.parse(text) as { tx_hash: Hash }
  console.info(
    'Created VNet transaction',
    `https://dashboard.tenderly.co/${projectSlug}/project/testnet/${vnetId}/tx/${tx_hash}`,
  )
  return tx_hash
}

/** Sends a Tenderly VNet transaction and waits for a successful receipt. */
export const sendVnetTransactionAndWait = async ({
  client,
  errorMessage = 'Tenderly transaction failed',
  tenderly,
  tx,
}: {
  client: PublicClient
  errorMessage?: string
  tenderly: TenderlyConfig
  tx: RpcTransactionRequest
}) => {
  const txHash = await sendVnetTransaction({ tenderly, tx })
  const receipt = await client.waitForTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') {
    throw new Error(`${errorMessage}: ${txHash}`)
  }

  return txHash
}
