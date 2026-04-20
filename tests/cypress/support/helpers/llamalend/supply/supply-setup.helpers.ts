import { parseEther, parseUnits, type Address } from 'viem'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import type { Decimal } from '@primitives/decimal.utils'

export const fundUserForSupplySetup = ({
  vnet,
  userAddress,
  borrowedTokenAddress,
  borrowedAmount,
  borrowedTokenDecimals,
  ethAmount = '1',
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  borrowedTokenAddress: Address
  borrowedAmount: Decimal
  borrowedTokenDecimals: number
  ethAmount?: Decimal
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  const ethAmountWei = parseEther(ethAmount)
  const borrowedAmountWei = parseUnits(borrowedAmount, borrowedTokenDecimals)

  fundEth({ adminRpcUrl, amountWei: `0x${ethAmountWei.toString(16)}`, recipientAddresses: [userAddress] })
  fundErc20({
    adminRpcUrl,
    amountWei: `0x${borrowedAmountWei.toString(16)}`,
    tokenAddress: borrowedTokenAddress,
    recipientAddresses: [userAddress],
  })
}
