import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { oneOf } from '@cy/support/generators'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
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
  readStakeAvailableAmount,
  submitStakeForm,
  touchStakeForm,
  writeStakeForm,
} from '@cy/support/helpers/llamalend/supply/stake.helpers'
import { fundUserForSupplySetup } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import {
  checkCurrentSuppliedAmount,
  checkCurrentStakedAmount,
  SUPPLY_TEST_MARKETS,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  checkUnstakeDetailsLoaded,
  readUnstakeAvailableAmount,
  submitUnstakeForm,
  touchUnstakeForm,
  writeUnstakeForm,
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

      it('deposits into the vault', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm({})
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('partially withdraws from the vault', () => {
        cy.mount(<SupplyTestWrapper tab="withdraw" />)
        writeWithdrawForm({ amount: partialWithdraw })
        checkWithdrawDetailsLoaded({
          amountSupplied: suppliedAfterPartialWithdraw,
          prevAmountSupplied: suppliedAfterDeposit,
        })
        submitWithdrawForm()
        touchWithdrawForm()
        checkCurrentSuppliedAmount(suppliedAfterPartialWithdraw)
      })

      it('redeems the remaining vault balance', () => {
        cy.mount(<SupplyTestWrapper tab="withdraw" />)
        selectMaxWithdraw()
        checkWithdrawDetailsLoaded({
          amountSupplied: '0',
          prevAmountSupplied: suppliedAfterPartialWithdraw,
          expectedButtonText: 'Withdraw All',
        })
        submitWithdrawForm()
        touchWithdrawForm()
        checkCurrentSuppliedAmount('0')
      })

      it('deposits into the vault again', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm({})
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('stakes into the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="stake" />)
        readStakeAvailableAmount().then(stakeAmount => {
          writeStakeForm({ amount: stakeAmount })
          checkStakeDetailsLoaded({
            vaultShares: stakeAmount,
            prevVaultShares: '0',
            amountSupplied: suppliedAfterDeposit,
            prevAmountSupplied: '0',
            expectedButtonText: 'Approve & Stake',
            checkEstimatedTxCost: false,
          })
          submitStakeForm()
          touchStakeForm()
          checkCurrentStakedAmount({
            expectedVaultShares: stakeAmount,
            expectedAmountSupplied: suppliedAfterDeposit,
          })
        })
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
        checkClaimDetailsLoaded({ hasOtherRewards: false })
        submitClaimAndSettle('crv', { waitForEmptyState: true })
        validateClaimTabState()
      })

      it('unstakes from the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="unstake" />)
        readUnstakeAvailableAmount().then(unstakeAmount => {
          writeUnstakeForm({ amount: unstakeAmount })
          checkUnstakeDetailsLoaded({
            vaultShares: '0',
            prevVaultShares: unstakeAmount,
            amountSupplied: '0',
            prevAmountSupplied: suppliedAfterDeposit,
            checkEstimatedTxCost: false,
          })
          submitUnstakeForm()
          touchUnstakeForm()
          checkCurrentStakedAmount({
            expectedVaultShares: '0',
            expectedAmountSupplied: '0',
          })
        })
      })
    })
  },
)
