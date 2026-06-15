import { type Address, createPublicClient, encodeFunctionData, http, parseAbi, parseUnits } from 'viem'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { fundEth } from '../tenderly/vnet-fund'

const CONTROLLER_V2_ABI = parseAbi([
  'function configurator() view returns (address)',
  'function vault() view returns (address)',
  'function configure_lend(uint256 _borrow_cap, uint256 _admin_percentage)',
  'function on_borrowed_token_transfer_in(uint256 _amount)',
])

/** keccak("SKIP_CONFIG") sentinel for leaving admin_percentage unchanged when calling configure_lend. */
const SKIP_CONFIG_UINT256 = 34683848501677104821777960696933802007602333377339998839659032476042327981902n

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
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    const configuratorAddress = await client.readContract({
      address: controllerAddress,
      abi: CONTROLLER_V2_ABI,
      functionName: 'configurator',
    })
    const vaultAddress = await client.readContract({
      address: controllerAddress,
      abi: CONTROLLER_V2_ABI,
      functionName: 'vault',
    })

    return { borrowCapWei, client, configuratorAddress, vaultAddress }
  }).then(({ borrowCapWei, client, configuratorAddress, vaultAddress }) =>
    fundEth({
      adminRpcUrl,
      amountWei: '0xde0b6b3a7640000',
      recipientAddresses: [configuratorAddress, vaultAddress],
    })
      .then(() =>
        sendAdminTransaction({
          adminRpcUrl,
          client,
          from: configuratorAddress,
          to: controllerAddress,
          data: encodeFunctionData({
            abi: CONTROLLER_V2_ABI,
            functionName: 'configure_lend',
            args: [borrowCapWei, SKIP_CONFIG_UINT256],
          }),
        }),
      )
      .then(() =>
        sendAdminTransaction({
          adminRpcUrl,
          from: vaultAddress,
          to: controllerAddress,
          data: encodeFunctionData({
            abi: CONTROLLER_V2_ABI,
            functionName: 'on_borrowed_token_transfer_in',
            args: [borrowCapWei],
          }),
          client,
        }),
      ),
  )
}
