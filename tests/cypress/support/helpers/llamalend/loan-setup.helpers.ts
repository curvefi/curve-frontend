import {
  createPublicClient,
  encodeFunctionData,
  http,
  parseAbi,
  parseEther,
  parseUnits,
  type Address,
  type PublicClient,
} from 'viem'
import { loadTenderlyAccount, type TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { approveErc20, fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransactionAndWait } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

const CONTROLLER_ABI = parseAbi(['function create_loan(uint256 collateral, uint256 debt, uint256 N)'])

/**
 * Adds eth and collateral tokens to the user's account, enough so that our tests can setup a loan.
 */
const fundUserForLoanSetup = ({
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

const createLoanOnController = async ({
  client,
  tenderly,
  userAddress,
  controllerAddress,
  collateralAmountWei,
  debtAmountWei,
  range = 10n,
}: {
  client: PublicClient
  tenderly: TenderlyConfig
  userAddress: Address
  controllerAddress: Address
  collateralAmountWei: bigint
  debtAmountWei: bigint
  range?: bigint
}) =>
  sendVnetTransactionAndWait({
    client,
    errorMessage: 'Tenderly create_loan transaction failed',
    tenderly,
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
  controllerAddress,
  collateral,
  collateralAddress,
  collateralDecimals,
  borrowedDecimals,
  borrow,
  range,
  collateralFundingMultiplier,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateral: Decimal
  collateralAddress: Address
  collateralDecimals: number
  controllerAddress: Address
  borrow: Decimal
  borrowedDecimals: number
  range: bigint
  collateralFundingMultiplier: bigint
}) => {
  const collateralWei = parseUnits(collateral, collateralDecimals)
  const borrowWei = parseUnits(borrow, borrowedDecimals)
  const fundedCollateral = collateralWei * collateralFundingMultiplier
  const { publicRpcUrl } = getRpcUrls(vnet)
  const client = createPublicClient({ transport: http(publicRpcUrl) })

  fundUserForLoanSetup({
    vnet,
    userAddress,
    collateralAddress,
    collateralAmountWei: fundedCollateral,
  })

  // the call above uses cy.request, but to use async we need cy.then()
  loadTenderlyAccount().then(LOAD_TIMEOUT, async tenderlyAccount => {
    await approveErc20({
      client,
      tenderly: { ...tenderlyAccount, vnetId: vnet.id },
      userAddress,
      tokenAddress: collateralAddress,
      spenderAddress: controllerAddress,
      tokenAmountWei: collateralWei,
    })

    await createLoanOnController({
      client,
      tenderly: { ...tenderlyAccount, vnetId: vnet.id },
      userAddress,
      controllerAddress,
      collateralAmountWei: collateralWei,
      debtAmountWei: borrowWei,
      range,
    })
  })
}
