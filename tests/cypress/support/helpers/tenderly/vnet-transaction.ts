import type { RpcTransactionRequest } from 'viem'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import type { VnetTransactionResponse } from '@cy/support/helpers/tenderly/vnet-transaction.types'

type SendVnetTransactionOptions = {
  /** Tenderly configuration */
  tenderly: TenderlyConfig
  /** The transaction */
  tx: RpcTransactionRequest
}

/** Sends a raw transaction to a Tenderly Virtual Testnet via the Admin API. */
export async function sendVnetTransaction({
  tenderly: { accountSlug, projectSlug, accessKey, vnetId },
  tx,
}: SendVnetTransactionOptions) {
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
  const { tx_hash } = JSON.parse(text) as VnetTransactionResponse
  console.info(
    'Created VNet transaction',
    `https://dashboard.tenderly.co/${projectSlug}/project/testnet/${vnetId}/tx/${tx_hash}`,
  )
  return tx_hash
}
