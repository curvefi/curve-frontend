import { encodeFunctionData, parseAbi, parseEther, parseUnits, type Address } from 'viem'
import { tenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransaction } from '@cy/support/helpers/tenderly/vnet-transaction'
import type { Decimal } from '@ui-kit/utils'

const ERC20_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const CONTROLLER_ABI = parseAbi(['function create_loan(uint256 collateral, uint256 debt, uint256 N)'])
const ERC20_DECIMALS_CALLDATA = '0x313ce567'

export const fundUserForLoanSetup = ({
  vnet,
  userAddress,
  collateralAddress,
  collateralAmountWei,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateralAddress: Address
  collateralAmountWei: bigint
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  // 1 ETH is enough for test transactions and keeps setup explicit.
  fundEth({ adminRpcUrl, amountWei: `0x${parseEther('1').toString(16)}`, recipientAddresses: [userAddress] })
  fundErc20({
    adminRpcUrl,
    amountWei: `0x${collateralAmountWei.toString(16)}`,
    tokenAddress: collateralAddress,
    recipientAddresses: [userAddress],
  })
}

export const approveTokenForSpender = ({
  vnet,
  userAddress,
  tokenAddress,
  spenderAddress,
  tokenAmountWei,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  tokenAddress: Address
  spenderAddress: Address
  tokenAmountWei: bigint
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

export const createLoanOnController = ({
  vnet,
  userAddress,
  controllerAddress,
  collateralAmountWei,
  debtAmountWei,
  range = 10n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  controllerAddress: Address
  collateralAmountWei: bigint
  debtAmountWei: bigint
  range?: bigint
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: controllerAddress,
      data: encodeFunctionData({
        abi: CONTROLLER_ABI,
        functionName: 'create_loan',
        args: [collateralAmountWei, debtAmountWei, range],
      }),
    },
  })

export const setupProgrammaticLoan = ({
  vnet,
  userAddress,
  collateralAddress,
  controllerAddress,
  collateral,
  borrow,
  collateralFundingMultiplier = 2n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateralAddress: Address
  controllerAddress: Address
  collateral: Decimal
  borrow: Decimal
  collateralFundingMultiplier?: bigint
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)

  cy.request({
    method: 'POST',
    url: adminRpcUrl,
    headers: { 'Content-Type': 'application/json' },
    body: {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: collateralAddress, data: ERC20_DECIMALS_CALLDATA }, 'latest'],
      id: 1,
    },
  }).then(({ body }) => {
    const collateralDecimals = Number.parseInt(body.result, 16)
    const collateralWei = parseUnits(collateral, collateralDecimals)
    const borrowWei = parseUnits(borrow, 18)
    const fundedCollateral = collateralWei * collateralFundingMultiplier

    fundUserForLoanSetup({
      vnet,
      userAddress,
      collateralAddress,
      collateralAmountWei: fundedCollateral,
    })

    cy.then(async () => {
      await approveTokenForSpender({
        vnet,
        userAddress,
        tokenAddress: collateralAddress,
        spenderAddress: controllerAddress,
        tokenAmountWei: collateralWei,
      })
      await createLoanOnController({
        vnet,
        userAddress,
        controllerAddress,
        collateralAmountWei: collateralWei,
        debtAmountWei: borrowWei,
      })
    })
  })
}
