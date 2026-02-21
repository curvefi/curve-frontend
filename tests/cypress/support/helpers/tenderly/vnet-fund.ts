import type { Hex } from 'viem'
import { oneInt } from '@cy/support/generators'

/**
 * Sets contract storage at a specific slot in a Tenderly virtual testnet.
 * @param adminRpcUrl Admin RPC URL of the Tenderly virtual testnet
 * @param contractAddress Contract address to modify
 * @param slot 32-byte padded hex slot index
 * @param value 32-byte padded hex value to set
 */
export const setStorageAt = ({
  adminRpcUrl,
  contractAddress,
  slot,
  value,
}: {
  adminRpcUrl: string
  contractAddress: Hex
  slot: Hex
  value: Hex
}) =>
  cy.request({
    method: 'POST',
    url: adminRpcUrl,
    headers: { 'Content-Type': 'application/json' },
    body: {
      jsonrpc: '2.0',
      method: 'tenderly_setStorageAt',
      params: [contractAddress, slot, value],
      id: oneInt(),
    },
  })

/**
 * Returns the timestamp of the latest block as a hex string.
 * @param adminRpcUrl Admin RPC URL of the Tenderly virtual testnet
 */
export const getLatestBlockTimestamp = (adminRpcUrl: string): Cypress.Chainable<Hex> =>
  cy
    .request({
      method: 'POST',
      url: adminRpcUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: oneInt(),
      },
    })
    .then(({ body }) => body.result.timestamp as Hex)

/**
 * Funds ETH to multiple addresses in a Tenderly virtual testnet.
 * @param adminRpcUrl Admin RPC URL of the Tenderly virtual testnet
 * @param recipientAddresses Array of recipient addresses to fund
 * @param amountWei Amount of ETH to fund in wei (as a hex string)
 */
export const fundEth = ({
  adminRpcUrl,
  recipientAddresses,
  amountWei,
}: {
  adminRpcUrl: string
  recipientAddresses: Hex[]
  amountWei: Hex
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
  amountWei,
}: {
  adminRpcUrl: string
  tokenAddress: Hex
  recipientAddresses: Hex[]
  amountWei: Hex
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
  })
