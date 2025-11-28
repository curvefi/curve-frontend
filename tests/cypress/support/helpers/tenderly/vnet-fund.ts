import type { Hex } from 'viem'
import { oneInt } from '@cy/support/generators'

const thousandEthInWei = '0x3635c9adc5dea00000' // 1000 ETH in wei

/**
 * Funds ETH to multiple addresses in a Tenderly virtual testnet.
 * @param adminRpcUrl Admin RPC URL of the Tenderly virtual testnet
 * @param recipientAddresses Array of recipient addresses to fund
 * @param amountWei Amount of ETH to fund in wei (as a hex string)
 */
export const fundEth = ({
  adminRpcUrl,
  recipientAddresses,
  amountWei = thousandEthInWei,
}: {
  adminRpcUrl: string
  recipientAddresses: Hex[]
  amountWei?: Hex
}) =>
  cy.request({
    method: 'POST',
    url: adminRpcUrl,
    headers: { 'Content-Type': 'application/json' },
    body: {
      jsonrpc: '2.0',
      method: 'tenderly_setBalance',
      params: [recipientAddresses, amountWei],
      id: oneInt(),
    },
  })

/**
 * Funds ERC20 tokens to multiple addresses in a Tenderly virtual testnet.
 * @param adminRpcUrl Admin RPC URL of the Tenderly virtual testnet
 * @param tokenAddress ERC20 token contract address
 * @param recipientAddresses Array of recipient addresses to fund
 * @param amountWei Amount of tokens to fund in wei (as a hex string)
 */
export const fundErc20 = ({
  adminRpcUrl,
  tokenAddress,
  recipientAddresses,
  amountWei = thousandEthInWei,
}: {
  adminRpcUrl: string
  tokenAddress: Hex
  recipientAddresses: Hex[]
  amountWei?: Hex
}) =>
  cy.request({
    method: 'POST',
    url: adminRpcUrl,
    headers: { 'Content-Type': 'application/json' },
    body: {
      jsonrpc: '2.0',
      method: 'tenderly_setErc20Balance',
      params: [tokenAddress, recipientAddresses, amountWei],
      id: oneInt(),
    },
    failOnStatusCode: false,
  })
