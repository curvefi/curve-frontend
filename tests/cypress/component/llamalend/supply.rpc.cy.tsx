import { BigNumber } from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { oneBool, oneOf } from '@cy/support/generators'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import {
  checkClaimDetailsLoaded,
  prepareClaimRewards,
  submitClaimAndSettle,
  validateClaimTabState,
} from '@cy/support/helpers/llamalend/supply/claim.helpers'
import {
  checkDepositDetailsLoaded,
  submitDepositForm,
  touchDepositForm,
  writeDepositForm,
} from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import {
  checkStakeDetailsLoaded,
  selectMaxStake,
  submitStakeForm,
  touchStakeForm,
} from '@cy/support/helpers/llamalend/supply/stake.helpers'
import { fundUserForSupplySetup } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import {
  checkCurrentSuppliedAmount,
  checkCurrentStakedAmount,
  SUPPLY_TEST_MARKETS,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  checkUnstakeDetailsLoaded,
  selectMaxUnstake,
  submitUnstakeForm,
  touchUnstakeForm,
} from '@cy/support/helpers/llamalend/supply/unstake.helpers'
import {
  checkWithdrawDetailsLoaded,
  selectMaxWithdraw,
  submitWithdrawForm,
  touchWithdrawForm,
  writeWithdrawForm,
} from '@cy/support/helpers/llamalend/supply/withdraw.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { LlamaMarketType } from '@ui-kit/types/market'

const testCases = [oneOf(...SUPPLY_TEST_MARKETS)]

testCases.forEach(
  ({
    id,
    label,
    chainId,
    borrowedTokenAddress,
    gaugeAddress,
    deposit,
    partialWithdraw,
    borrowedTokenDecimals,
    hasClaimableRewards = false,
  }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const hasApi = oneBool() // tests must work with or without api access
      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet(uuid => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        chain_id: chainId,
        fork_config: { block_number: 'latest' },
      }))

      const suppliedAfterDeposit = deposit
      const suppliedAfterPartialWithdraw = new BigNumber(deposit).minus(partialWithdraw).toFixed() as Decimal
      const SupplyTestWrapper = ({ tab }: Pick<LlammalendTestCaseProps, 'tab'>) => (
        <LlammalendTestCase
          type="supply"
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={privateKey}
          chainId={chainId}
          marketId={id}
          userAddress={address}
          marketType={LlamaMarketType.Lend}
        />
      )

      before(() => {
        fundUserForSupplySetup({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedAmount: '1000',
          borrowedTokenDecimals,
        })
      })

      beforeEach(() => {
        if (!hasApi) blockUnmockedApis()
      })

      it('deposits into the vault', () => {
        cy.mount(<SupplyTestWrapper tab="deposit" />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ suppliedAssets: deposit, prevSuppliedAssets: '0', hasApi })
        submitDepositForm({})
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('partially withdraws from the vault', () => {
        cy.mount(<SupplyTestWrapper tab="withdraw" />)
        writeWithdrawForm({ amount: partialWithdraw })
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
        selectMaxWithdraw()
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
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ suppliedAssets: deposit, prevSuppliedAssets: '0', hasApi })
        submitDepositForm({})
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('stakes into the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="stake" />)
        selectMaxStake()
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
        prepareClaimRewards({
          vnet: getVirtualNetwork(),
          userAddress: address,
          gaugeAddress,
        })

        cy.mount(<SupplyTestWrapper tab="claim" />)
        if (!hasClaimableRewards) {
          validateClaimTabState()
          return
        }
        // only claim CRV rewards, no markets with external rewards yet
        checkClaimDetailsLoaded({ hasOtherRewards: false, hasApi })
        submitClaimAndSettle('crv', { waitForEmptyState: true })
        validateClaimTabState()
      })

      it('unstakes from the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="unstake" />)
        selectMaxUnstake()
        checkUnstakeDetailsLoaded({ prevSuppliedAssets: suppliedAfterDeposit, hasApi })
        submitUnstakeForm()
        touchUnstakeForm()
        checkCurrentStakedAmount({ expectedAmountSupplied: '0' })
      })
    })
  },
)
