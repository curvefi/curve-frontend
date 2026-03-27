import { encodeFunctionData, parseAbi, parseEther, parseUnits, type Address } from 'viem'
import { loadTenderlyAccount, type TenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransaction } from '@cy/support/helpers/tenderly/vnet-transaction'
import type { Decimal } from '@primitives/decimal.utils'

const ERC20_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const ERC20_BALANCE_ABI = parseAbi(['function balanceOf(address account) view returns (uint256)'])
const VAULT_ABI = parseAbi(['function deposit(uint256 assets)'])
const GAUGE_ABI = parseAbi(['function deposit(uint256 _value)', 'function withdraw(uint256 _value)'])

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

const stakeIntoGauge = ({
  vnet,
  userAddress,
  gaugeAddress,
  stakeAmountWei,
  tenderlyAccount,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  gaugeAddress: Address
  stakeAmountWei: bigint
  tenderlyAccount: TenderlyAccount
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: gaugeAddress,
      data: encodeFunctionData({
        abi: GAUGE_ABI,
        functionName: 'deposit',
        args: [stakeAmountWei],
      }),
    },
  })

const readErc20Balance = async ({
  vnet,
  userAddress,
  tokenAddress,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  tokenAddress: Address
}) => {
  const { publicRpcUrl } = getRpcUrls(vnet)
  const response = await fetch(publicRpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [userAddress],
          }),
        },
        'latest',
      ],
      id: 1,
    }),
  })

  const { result } = (await response.json()) as { result: `0x${string}` }
  return BigInt(result)
}

export const waitForErc20Balance = async ({
  vnet,
  userAddress,
  tokenAddress,
  predicate,
  retries = 10,
  delayMs = 1_000,
  description = tokenAddress,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  tokenAddress: Address
  predicate: (balance: bigint) => boolean
  retries?: number
  delayMs?: number
  description?: string
}) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const balance = await readErc20Balance({ vnet, userAddress, tokenAddress })
    if (predicate(balance)) return balance
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  throw new Error(`Balance for ${userAddress} on ${description} did not match the expected predicate`)
}

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

export const setupTenderlySupplyStake = ({
  vnet,
  userAddress,
  borrowedTokenAddress,
  borrowedTokenDecimals,
  vaultAddress,
  gaugeAddress,
  deposit,
  borrowedFundingMultiplier = 2n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  borrowedTokenAddress: Address
  borrowedTokenDecimals: number
  vaultAddress: Address
  gaugeAddress: Address
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
    const stakedVaultSharesWei = await waitForErc20Balance({
      vnet,
      userAddress,
      tokenAddress: vaultAddress,
      predicate: (balance) => balance > 0n,
      description: vaultAddress,
    })
    await approveTokenForSpender({
      vnet,
      userAddress,
      tokenAddress: vaultAddress,
      spenderAddress: gaugeAddress,
      tokenAmountWei: stakedVaultSharesWei,
      tenderlyAccount,
    })
    await stakeIntoGauge({
      vnet,
      userAddress,
      gaugeAddress,
      stakeAmountWei: stakedVaultSharesWei,
      tenderlyAccount,
    })
  })
}
