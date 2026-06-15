import {
  type Address,
  createPublicClient,
  encodeFunctionData,
  type Hex,
  http,
  maxUint256,
  parseAbi,
  parseUnits,
} from 'viem'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

const CONTROLLER_V2_ABI = parseAbi([
  'function configurator() view returns (address)',
  'function vault() view returns (address)',
  'function borrow_cap() view returns (uint256)',
  'function available_balance() view returns (uint256)',
  'function configure_lend(uint256 _borrow_cap, uint256 _admin_percentage)',
  'function on_borrowed_token_transfer_in(uint256 _amount)',
])

const callAdminRpc = async <T>({
  adminRpcUrl,
  method,
  params,
}: {
  adminRpcUrl: string
  method: string
  params: unknown[]
}) => {
  const response = await fetch(adminRpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    }),
  })
  const { result, error, ...rest } = (await response.json()) as { result?: T; error?: unknown }
  if (!response.ok || error || !result) {
    throw new Error(`Admin RPC ${method} failed: ${JSON.stringify({ result, error, ...rest })}`)
  }
  return result
}

export const setControllerBorrowCap = ({
  adminRpcUrl,
  publicRpcUrl,
  controllerAddress,
  borrowCap,
  borrowedDecimals,
}: {
  adminRpcUrl: string
  publicRpcUrl: string
  controllerAddress: Address
  borrowCap: Decimal
  borrowedDecimals: number
}) => {
  cy.then(LOAD_TIMEOUT, async () => {
    const borrowCapWei = parseUnits(borrowCap, borrowedDecimals)
    const publicClient = createPublicClient({ transport: http(publicRpcUrl) })
    const configuratorAddress = await publicClient.readContract({
      address: controllerAddress,
      abi: CONTROLLER_V2_ABI,
      functionName: 'configurator',
    })
    const vaultAddress = await publicClient.readContract({
      address: controllerAddress,
      abi: CONTROLLER_V2_ABI,
      functionName: 'vault',
    })
    await callAdminRpc({
      adminRpcUrl,
      method: 'tenderly_setBalance',
      params: [[configuratorAddress, vaultAddress], '0xde0b6b3a7640000'],
    })

    const hash = await callAdminRpc<Hex>({
      adminRpcUrl,
      method: 'eth_sendTransaction',
      params: [
        {
          from: configuratorAddress,
          to: controllerAddress,
          data: encodeFunctionData({
            abi: CONTROLLER_V2_ABI,
            functionName: 'configure_lend',
            args: [borrowCapWei, maxUint256],
          }),
        },
      ],
    })
    const { status } = await publicClient.waitForTransactionReceipt({ hash })
    if (status !== 'success') {
      throw new Error(`Failed to set borrow cap: transaction ${hash} reverted`)
    }

    const hookHash = await callAdminRpc<Hex>({
      adminRpcUrl,
      method: 'eth_sendTransaction',
      params: [
        {
          from: vaultAddress,
          to: controllerAddress,
          data: encodeFunctionData({
            abi: CONTROLLER_V2_ABI,
            functionName: 'on_borrowed_token_transfer_in',
            args: [borrowCapWei],
          }),
        },
      ],
    })
    const { status: hookStatus } = await publicClient.waitForTransactionReceipt({ hash: hookHash })
    if (hookStatus !== 'success') {
      throw new Error(`Failed to set available balance: transaction ${hookHash} reverted`)
    }
  })
}
