import { encodeFunctionData, parseAbi, parseEther, parseUnits, type Address } from 'viem'
import { loadTenderlyAccount, type TenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransaction } from '@cy/support/helpers/tenderly/vnet-transaction'
import type { Decimal } from '@primitives/decimal.utils'

const ERC20_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const VAULT_ABI = parseAbi(['function deposit(uint256 assets)'])

export const fundUserForSupplySetup = ({
  vnet,
  userAddress,
  borrowedTokenAddress,
  borrowedAmountWei,
  ethAmountWei = parseEther('1'),
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  borrowedTokenAddress: Address
  borrowedAmountWei: bigint
  ethAmountWei?: bigint
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)

  fundEth({ adminRpcUrl, amountWei: `0x${ethAmountWei.toString(16)}`, recipientAddresses: [userAddress] })
  fundErc20({
    adminRpcUrl,
    amountWei: `0x${borrowedAmountWei.toString(16)}`,
    tokenAddress: borrowedTokenAddress,
    recipientAddresses: [userAddress],
  })
}

const approveTokenForSpender = ({
  vnet,
  userAddress,
  tokenAddress,
  spenderAddress,
  tokenAmountWei,
  tenderlyAccount,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  tokenAddress: Address
  spenderAddress: Address
  tokenAmountWei: bigint
  tenderlyAccount: TenderlyAccount
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, tokenAmountWei],
      }),
    },
  })

const depositIntoVault = ({
  vnet,
  userAddress,
  vaultAddress,
  depositAmountWei,
  tenderlyAccount,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  vaultAddress: Address
  depositAmountWei: bigint
  tenderlyAccount: TenderlyAccount
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: vaultAddress,
      data: encodeFunctionData({
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [depositAmountWei],
      }),
    },
  })

export const setupTenderlySupplyDeposit = ({
  vnet,
  userAddress,
  borrowedTokenAddress,
  borrowedTokenDecimals,
  vaultAddress,
  deposit,
  borrowedFundingMultiplier = 2n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  borrowedTokenAddress: Address
  borrowedTokenDecimals: number
  vaultAddress: Address
  deposit: Decimal
  borrowedFundingMultiplier?: bigint
}) => {
  const depositWei = parseUnits(deposit, borrowedTokenDecimals)

  fundUserForSupplySetup({
    vnet,
    userAddress,
    borrowedTokenAddress,
    borrowedAmountWei: depositWei * borrowedFundingMultiplier,
  })

  loadTenderlyAccount().then(async (tenderlyAccount) => {
    await approveTokenForSpender({
      vnet,
      userAddress,
      tokenAddress: borrowedTokenAddress,
      spenderAddress: vaultAddress,
      tokenAmountWei: depositWei,
      tenderlyAccount,
    })
    await depositIntoVault({
      vnet,
      userAddress,
      vaultAddress,
      depositAmountWei: depositWei,
      tenderlyAccount,
    })
  })
}
