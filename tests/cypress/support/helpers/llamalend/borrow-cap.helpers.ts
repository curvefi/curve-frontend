import { type Address, createPublicClient, encodeFunctionData, http, parseAbi, parseUnits } from 'viem'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@ui-kit/utils'
import { fundErc20, fundEth } from '../tenderly/vnet-fund'

const CONTROLLER_V2_ABI = parseAbi([
  'function configurator() view returns (address)',
  'function vault() view returns (address)',
  'function configure_lend(uint256 _borrow_cap, uint256 _admin_percentage)',
  'function on_borrowed_token_transfer_in(uint256 _amount)',
  'function total_debt() view returns (uint256)',
])

/** keccak("SKIP_CONFIG") sentinel for leaving admin_percentage unchanged when calling configure_lend. */
const SKIP_CONFIG_UINT256 = 34683848501677104821777960696933802007602333377339998839659032476042327981902n

export const setControllerBorrowCap = ({
  adminRpcUrl,
  publicRpcUrl,
  controllerAddress,
  borrowCap,
  availableBalance = borrowCap,
  borrowedDecimals,
}: {
  adminRpcUrl: string
  publicRpcUrl: string
  controllerAddress: Address
  borrowCap: Decimal
  availableBalance?: Decimal
  borrowedDecimals: number
}) => {
  cy.then(LOAD_TIMEOUT, async () => {
    const borrowCapWei = parseUnits(borrowCap, borrowedDecimals)
    const availableBalanceWei = parseUnits(availableBalance, borrowedDecimals)
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    const totalDebtWei = await client.readContract({
      address: controllerAddress,
      abi: CONTROLLER_V2_ABI,
      functionName: 'total_debt',
    })
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
    // On latest forks, markets can already have live debt. The configured borrow cap is a total cap,
    // so make sure it leaves room for the liquidity we add in this setup.
    const minimumBorrowCapWei = totalDebtWei + availableBalanceWei
    const effectiveBorrowCapWei = borrowCapWei > minimumBorrowCapWei ? borrowCapWei : minimumBorrowCapWei

    return {
      availableBalanceWei,
      borrowCapWei: effectiveBorrowCapWei,
      client,
      configuratorAddress,
      vaultAddress,
    }
  }).then(({ availableBalanceWei, borrowCapWei, client, configuratorAddress, vaultAddress }) =>
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
            args: [availableBalanceWei],
          }),
          client,
        }),
      ),
  )
}

export const setupLlv2BorrowingLiquidity = ({
  adminRpcUrl,
  publicRpcUrl,
  chainId,
  controllerAddress,
  borrowedAddress,
  borrowedDecimals,
  borrowedLiquidity = '10',
  borrowCap = '1000',
}: {
  adminRpcUrl: string
  publicRpcUrl: string
  chainId: Chain
  controllerAddress: Address
  borrowedAddress: Address
  borrowedDecimals: number
  borrowedLiquidity?: Decimal
  borrowCap?: Decimal
}) => {
  if (chainId !== Chain.Optimism) return

  return fundErc20({
    adminRpcUrl,
    amountWei: `0x${parseUnits(borrowedLiquidity, borrowedDecimals).toString(16)}`,
    tokenAddress: borrowedAddress,
    recipientAddresses: [controllerAddress],
  }).then(() =>
    setControllerBorrowCap({
      adminRpcUrl,
      publicRpcUrl,
      controllerAddress,
      borrowCap,
      availableBalance: borrowedLiquidity,
      borrowedDecimals,
    }),
  )
}
