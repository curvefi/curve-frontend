import { BigNumber } from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { oneBool } from '@cy/support/generators'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupLlammalendTestCaseMocks } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { claimSupplyRewards, prepareClaimRewards } from '@cy/support/helpers/llamalend/supply/claim.helpers'
import {
  checkDepositDetailsLoaded,
  submitDepositForm,
  touchDepositForm,
  writeDepositForm,
} from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import {
  checkStakeDetailsLoaded,
  submitStakeForm,
  touchStakeForm,
} from '@cy/support/helpers/llamalend/supply/stake.helpers'
import {
  pickSupplyTestMarket,
  SUPPLY_DEPOSIT,
  SUPPLY_PARTIAL_WITHDRAW,
  SUPPLY_TEST_CHAIN_ID,
  type SupplyTestMarket,
} from '@cy/support/helpers/llamalend/supply/supply-markets.helpers'
import { fundUserWithCrvUsd } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import {
  checkCurrentStakedAmount,
  checkCurrentSuppliedAmount,
  selectMaxSupplyInput,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  checkUnstakeDetailsLoaded,
  submitUnstakeForm,
  touchUnstakeForm,
} from '@cy/support/helpers/llamalend/supply/unstake.helpers'
import {
  checkWithdrawDetailsLoaded,
  submitWithdrawForm,
  touchWithdrawForm,
  writeWithdrawForm,
} from '@cy/support/helpers/llamalend/supply/withdraw.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { MarketType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'

describe('Lend Market Supply', () => {
  skipTestsAfterFailure()

  const hasApi = oneBool() // tests must work with or without api access
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `supply-integration-${uuid}`,
    display_name: `SupplyIntegration (${uuid})`,
    chain_id: SUPPLY_TEST_CHAIN_ID,
    fork_config: { block_number: 'latest' },
  }))

  let market: SupplyTestMarket // picked once the fork exists
  const suppliedAfterDeposit = SUPPLY_DEPOSIT
  const suppliedAfterPartialWithdraw = new BigNumber(SUPPLY_DEPOSIT).minus(SUPPLY_PARTIAL_WITHDRAW).toFixed() as Decimal
  const SupplyTestWrapper = ({ tab }: Pick<LlammalendTestCaseProps, 'tab'>) => (
    <LlammalendTestCase
      type="supply"
      tab={tab}
      vnet={getVirtualNetwork()}
      account={privateKey}
      chainId={SUPPLY_TEST_CHAIN_ID}
      marketId={market.id}
      userAddress={address}
      marketType={MarketType.Lend}
    />
  )

  before(() => {
    pickSupplyTestMarket(getVirtualNetwork()).then(picked => {
      market = picked
      cy.task('log', `Supply test market: ${market.id}`)
    })
    fundUserWithCrvUsd({ vnet: getVirtualNetwork(), userAddress: address, crvUsdAmount: '1000', ethAmount: '1' })
  })

  beforeEach(() => {
    setupLlammalendTestCaseMocks({ hasApi })
  })

  it('deposits into the vault', () => {
    cy.mount(<SupplyTestWrapper tab="deposit" />)
    writeDepositForm({ amount: SUPPLY_DEPOSIT })
    checkDepositDetailsLoaded({ suppliedAssets: SUPPLY_DEPOSIT, prevSuppliedAssets: '0', hasApi })
    submitDepositForm({})
    touchDepositForm()
    checkCurrentSuppliedAmount(suppliedAfterDeposit)
  })

  it('partially withdraws from the vault', () => {
    cy.mount(<SupplyTestWrapper tab="withdraw" />)
    writeWithdrawForm({ amount: SUPPLY_PARTIAL_WITHDRAW })
    checkWithdrawDetailsLoaded({
      suppliedAssets: suppliedAfterPartialWithdraw,
      prevSuppliedAssets: suppliedAfterDeposit,
      hasApi,
    })
    submitWithdrawForm()
    touchWithdrawForm()
    checkCurrentSuppliedAmount(suppliedAfterPartialWithdraw)
  })

  it('redeems the remaining vault balance', () => {
    cy.mount(<SupplyTestWrapper tab="withdraw" />)
    selectMaxSupplyInput('withdraw')
    checkWithdrawDetailsLoaded({
      suppliedAssets: '0',
      prevSuppliedAssets: suppliedAfterPartialWithdraw,
      expectedButtonText: 'Withdraw All',
      hasApi,
    })
    submitWithdrawForm()
    touchWithdrawForm()
    checkCurrentSuppliedAmount('0')
  })

  it('deposits into the vault again', () => {
    cy.mount(<SupplyTestWrapper tab="deposit" />)
    writeDepositForm({ amount: SUPPLY_DEPOSIT })
    checkDepositDetailsLoaded({ suppliedAssets: SUPPLY_DEPOSIT, prevSuppliedAssets: '0', hasApi })
    submitDepositForm({})
    touchDepositForm()
    checkCurrentSuppliedAmount(suppliedAfterDeposit)
  })

  it('stakes into the gauge', () => {
    cy.mount(<SupplyTestWrapper tab="stake" />)
    selectMaxSupplyInput('stake')
    checkStakeDetailsLoaded({
      prevVaultShares: '0',
      suppliedAssets: suppliedAfterDeposit,
      prevSuppliedAssets: '0',
      expectedButtonText: 'Approve & Stake',
      hasApi,
    })
    submitStakeForm()
    touchStakeForm()
    checkCurrentStakedAmount({ expectedAmountSupplied: suppliedAfterDeposit })
  })

  it('claims rewards', () => {
    const { gaugeAddress } = market
    prepareClaimRewards({ vnet: getVirtualNetwork(), userAddress: address, gaugeAddress })
    cy.mount(<SupplyTestWrapper tab="claim" />)
    claimSupplyRewards({ vnet: getVirtualNetwork(), userAddress: address, gaugeAddress, hasApi })
  })

  it('unstakes from the gauge', () => {
    cy.mount(<SupplyTestWrapper tab="unstake" />)
    selectMaxSupplyInput('unstake')
    checkUnstakeDetailsLoaded({ prevSuppliedAssets: suppliedAfterDeposit, hasApi })
    submitUnstakeForm()
    touchUnstakeForm()
    checkCurrentStakedAmount({ expectedAmountSupplied: '0' })
  })
})
