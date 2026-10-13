import { createPublicClient, encodeFunctionData, http, parseAbi, parseUnits, toHex, type Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'

/** Aragon agent that executes passed DAO ownership votes on Ethereum. */
const DAO_OWNERSHIP_AGENT = '0x40907540d8a6C65c637785e8f8B742ae6b0b9968'
const GAUGE_CONTROLLER = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB'
const LLV2_CONFIGURATOR = '0x6065858d0eF0AA240DFdf6f1A0B2ae34B41f49bC'

const ACTIVATION_VOTE_ABI = parseAbi([
  'function set_borrow_cap(address _controller, uint256 _borrow_cap)',
  'function set_admin_percentage(address _controller, uint256 _admin_percentage)',
  'function set_callback(address _controller, address _cb)',
  'function add_gauge(address addr, int128 gauge_type, uint256 weight)',
])
const CONTROLLER_ABI = parseAbi(['function borrow_cap() view returns (uint256)'])

/** Gas money for the test accounts and the DAO agent. */
const ETH_FUND_AMOUNT = '1'

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60

/** One call of a DAO vote script, sent by the ownership agent. */
type VoteAction = { description: string; to: Address; data: Hex }

export type LaunchTestMarket = {
  id: string
  label: string
  chainId: LlamaChainId
  controllerAddress: Address
  collateralAddress: Address
  collateralDecimals: number
  borrowedAddress: Address
  borrowedSymbol: string
  borrowedDecimals: number
  /** The DAO vote actions that open the market for borrowing */
  activationVote: readonly VoteAction[]
  /** Liquidity supplied by the lender */
  supply: Decimal
  collateral: Decimal
  borrow: Decimal
  borrowMore: Decimal
  /** Extra borrowed tokens for the borrower, so the full repayment also covers the accrued interest */
  interestBuffer: Decimal
}

const REUSD_SFRXUSD_LP_CONTROLLER = '0x4922995d8CbF9e1f368B2EE521bD2fa2F49eADb1'
const REUSD_SFRXUSD_LP_VAULT_GAUGE = '0x36935206C00CF46f3cE60643034a025557aA5E8e'
const REUSD_SFRXUSD_LP_LM_CALLBACK = '0x80d4BC5bf87A4456DBe85DeAA57AAdD6289A9e3D'

/** First LLv2 market with a Curve LP token as collateral, activated by DAO ownership vote 1501. */
export const REUSD_SFRXUSD_LP_MARKET: LaunchTestMarket = {
  id: 'one-way-market-v2-4',
  label: 'reUSD/sfrxUSD LP-crvUSD LLv2 Lend Market',
  chainId: Chain.Ethereum,
  controllerAddress: REUSD_SFRXUSD_LP_CONTROLLER,
  collateralAddress: '0xed785Af60bEd688baa8990cD5c4166221599A441', // reusdsfrx LP token
  collateralDecimals: DEFAULT_DECIMALS,
  borrowedAddress: CRVUSD_ADDRESS,
  borrowedSymbol: 'crvUSD',
  borrowedDecimals: DEFAULT_DECIMALS,
  activationVote: [
    {
      description: 'set the 3M crvUSD borrow cap',
      to: LLV2_CONFIGURATOR,
      data: encodeFunctionData({
        abi: ACTIVATION_VOTE_ABI,
        functionName: 'set_borrow_cap',
        args: [REUSD_SFRXUSD_LP_CONTROLLER, parseUnits('3000000', DEFAULT_DECIMALS)],
      }),
    },
    {
      description: 'set the 10% admin fee',
      to: LLV2_CONFIGURATOR,
      data: encodeFunctionData({
        abi: ACTIVATION_VOTE_ABI,
        functionName: 'set_admin_percentage',
        args: [REUSD_SFRXUSD_LP_CONTROLLER, parseUnits('0.1', DEFAULT_DECIMALS)],
      }),
    },
    {
      description: 'add the vault gauge',
      to: GAUGE_CONTROLLER,
      data: encodeFunctionData({
        abi: ACTIVATION_VOTE_ABI,
        functionName: 'add_gauge',
        args: [REUSD_SFRXUSD_LP_VAULT_GAUGE, 0n, 0n],
      }),
    },
    {
      description: 'attach the LM callback',
      to: LLV2_CONFIGURATOR,
      data: encodeFunctionData({
        abi: ACTIVATION_VOTE_ABI,
        functionName: 'set_callback',
        args: [REUSD_SFRXUSD_LP_CONTROLLER, REUSD_SFRXUSD_LP_LM_CALLBACK],
      }),
    },
    {
      description: 'add the LM callback gauge',
      to: GAUGE_CONTROLLER,
      data: encodeFunctionData({
        abi: ACTIVATION_VOTE_ABI,
        functionName: 'add_gauge',
        args: [REUSD_SFRXUSD_LP_LM_CALLBACK, 0n, 0n],
      }),
    },
  ],
  supply: '10000',
  collateral: '1000',
  borrow: '500',
  borrowMore: '100',
  interestBuffer: '10',
}

const toWeiHex = (amount: Decimal, decimals: number) => toHex(parseUnits(amount, decimals))

/** Creates a fresh wallet, used as private key by the test wagmi connector. */
export const createTestAccount = () => {
  const privateKey = generatePrivateKey()
  return { privateKey, address: privateKeyToAccount(privateKey).address }
}

/**
 * Sends the activation vote actions from the DAO ownership agent, as Aragon does when the vote is executed.
 * Skipped once the vote was executed on chain, so the test keeps working on forks made after the launch.
 */
export const executeActivationVote = ({
  vnet,
  market: { controllerAddress, activationVote },
}: {
  vnet: CreateVirtualTestnetResponse
  market: LaunchTestMarket
}) => {
  const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)
  const client = createPublicClient({ transport: http(publicRpcUrl) })
  return cy
    .then(TIMEOUTS['evm.contractRead'], () =>
      client.readContract({ address: controllerAddress, abi: CONTROLLER_ABI, functionName: 'borrow_cap' }),
    )
    .then(borrowCap => {
      if (borrowCap > 0n) {
        cy.log(`Activation vote already executed (borrow cap ${borrowCap}), skipping`)
        return
      }
      fundEth({
        adminRpcUrl,
        amountWei: toWeiHex(ETH_FUND_AMOUNT, DEFAULT_DECIMALS),
        recipientAddresses: [DAO_OWNERSHIP_AGENT],
      })
      activationVote.forEach(
        ({ description, to, data }) =>
          void sendAdminTransaction({
            adminRpcUrl,
            client,
            from: DAO_OWNERSHIP_AGENT,
            to,
            data,
            errorMessage: `Activation vote action failed: ${description}`,
          }),
      )
    })
}

/** Gives the lender gas and the borrowed tokens to supply. */
export const fundLender = ({
  vnet,
  userAddress,
  market: { borrowedAddress, borrowedDecimals, supply },
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  market: LaunchTestMarket
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  fundEth({ adminRpcUrl, amountWei: toWeiHex(ETH_FUND_AMOUNT, DEFAULT_DECIMALS), recipientAddresses: [userAddress] })
  return fundErc20({
    adminRpcUrl,
    tokenAddress: borrowedAddress,
    amountWei: toWeiHex(supply, borrowedDecimals),
    recipientAddresses: [userAddress],
  })
}

/** Gives the borrower gas, the collateral, and enough borrowed tokens to also repay the accrued interest. */
export const fundBorrower = ({
  vnet,
  userAddress,
  market: { collateralAddress, collateralDecimals, collateral, borrowedAddress, borrowedDecimals, interestBuffer },
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  market: LaunchTestMarket
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  fundEth({ adminRpcUrl, amountWei: toWeiHex(ETH_FUND_AMOUNT, DEFAULT_DECIMALS), recipientAddresses: [userAddress] })
  fundErc20({
    adminRpcUrl,
    tokenAddress: collateralAddress,
    amountWei: toWeiHex(collateral, collateralDecimals),
    recipientAddresses: [userAddress],
  })
  return fundErc20({
    adminRpcUrl,
    tokenAddress: borrowedAddress,
    amountWei: toWeiHex(interestBuffer, borrowedDecimals),
    recipientAddresses: [userAddress],
  })
}

/**
 * Clicks the 100% chip of the repay input, capped at the debt. Clicking the wallet balance instead would enter the
 * whole wallet, which is more than the debt since the borrower holds an interest buffer.
 */
export const selectMaxRepayAmount = () =>
  cy.get('[data-testid^="repay-input-"] [data-testid="input-chip-100%"]', TIMEOUTS['evm.balances']).click()

/** The repay form detects a full repayment and offers to close the position. */
export const checkFullRepayDetailsLoaded = () => {
  cy.get('[data-testid="repay-submit-button"]', TIMEOUTS['evm.simulation'])
    .should('contain.text', 'Close Position')
    .and('be.enabled')
  cy.get('[data-testid="helper-message-error"]').should('not.exist')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

/** Without a loan, the create loan form is shown again and the whole collateral is back in the wallet. */
export const checkLoanClosedWithCollateralReturned = (collateral: Decimal) => {
  cy.get('[data-testid="borrow-collateral-input"]', TIMEOUTS['evm.contractRead']).should('be.visible')
  cy.get('[data-testid="borrow-collateral-input"] [data-testid="balance-value"]', TIMEOUTS['evm.balances']).should(
    'have.attr',
    'data-value',
    collateral,
  )
}
