import { encodeFunctionData, parseAbi, parseEther, parseUnits, type Address } from 'viem'
import { tenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransaction } from '@cy/support/helpers/tenderly/vnet-transaction'
import type { Decimal } from '@primitives/decimal.utils'

const ERC20_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const CONTROLLER_ABI = parseAbi(['function create_loan(uint256 collateral, uint256 debt, uint256 N)'])

/**
 * Adds eth and collateral tokens to the user's account, enough so that our tests can setup a loan.
 */
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

/** Approves a token for a spender so the loan can be created. */
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

/**
 * Sets up a loan via the Tenderly API, which allows us to create loans for any user during tests without knowing the private keys.
 */
export const setupTenderlyLoan = ({
  vnet,
  userAddress,
  collateralAddress,
  controllerAddress,
  collateralDecimals,
  collateral,
  borrow,
  collateralFundingMultiplier = 2n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateralAddress: Address
  controllerAddress: Address
  collateralDecimals: number
  collateral: Decimal
  borrow: Decimal
  collateralFundingMultiplier?: bigint
}) => {
  const collateralWei = parseUnits(collateral, collateralDecimals)
  const borrowWei = parseUnits(borrow, 18)
  const fundedCollateral = collateralWei * collateralFundingMultiplier

  fundUserForLoanSetup({
    vnet,
    userAddress,
    collateralAddress,
    collateralAmountWei: fundedCollateral,
  })

  // the call above uses cy.request, but to use async we need cy.then()
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
}
