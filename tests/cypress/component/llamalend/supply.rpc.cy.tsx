import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  checkClaimDetailsLoaded,
  prepareClaimRewards,
  submitClaimAndSettle,
} from '@cy/support/helpers/llamalend/supply/claim.helpers'
import {
  checkDepositDetailsLoaded,
  submitDepositForm,
  touchDepositForm,
  writeDepositForm,
} from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import {
  LlamalendSupplyTestCase,
  type LlamalendSupplyTestCaseProps,
} from '@cy/support/helpers/llamalend/supply/LlamalendSupplyTestCase'
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
  supplyTestMarkets,
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

supplyTestMarkets().forEach(
  ({
    id,
    label,
    chainId,
    borrowedTokenAddress,
    gaugeAddress,
    deposit,
    partialWithdraw,
    borrowedTokenDecimals,
    hasClaimableRewards = true,
  }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        chain_id: chainId,
        fork_config: { block_number: 'latest' },
      }))

      const suppliedAfterDeposit = deposit
      const suppliedAfterPartialWithdraw = new BigNumber(deposit).minus(partialWithdraw).toFixed() as Decimal

      let onSuccess: ReturnType<typeof cy.stub>

      const SupplyTestWrapper = ({ tab }: Pick<LlamalendSupplyTestCaseProps, 'tab'>) => (
        <LlamalendSupplyTestCase
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={privateKey}
          chainId={chainId}
          marketId={id}
          userAddress={address}
          onSuccess={onSuccess}
        />
      )

      const expectCallbacks = () => {
        expect(onSuccess).to.have.callCount(1)
      }

      before(() => {
        fundUserForSupplySetup({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedAmountWei: 10n ** BigInt(borrowedTokenDecimals + 3),
        })
        cy.log(`Funded some eth and crvUSD to ${address} in vnet ${getVirtualNetwork().slug}`)
      })

      beforeEach(() => {
        onSuccess = cy.stub().as('onSuccess')
      })

      it('deposits into the vault', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm().then(expectCallbacks)
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
        submitWithdrawForm().then(expectCallbacks)
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
        submitWithdrawForm().then(expectCallbacks)
        touchWithdrawForm()
        checkCurrentSuppliedAmount('0')
      })

      it('deposits into the vault again', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm().then(expectCallbacks)
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('stakes into the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="stake" />)
        readStakeAvailableAmount().then((stakeAmount) => {
          writeStakeForm({ amount: stakeAmount })
          checkStakeDetailsLoaded({
            vaultShares: stakeAmount,
            prevVaultShares: '0',
            amountSupplied: suppliedAfterDeposit,
            prevAmountSupplied: '0',
            expectedButtonText: 'Approve & Stake',
            checkEstimatedTxCost: false,
          })
          submitStakeForm().then(expectCallbacks)
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
          checkClaimDetailsLoaded({ hasRewards: false, checkEstimatedTxCost: false })
          return
        }
        checkClaimDetailsLoaded()
        submitClaimAndSettle({ waitForEmptyState: true }).then(expectCallbacks)
        checkClaimDetailsLoaded({ hasRewards: false, checkEstimatedTxCost: false })
      })

      it('unstakes from the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="unstake" />)
        readUnstakeAvailableAmount().then((unstakeAmount) => {
          writeUnstakeForm({ amount: unstakeAmount })
          checkUnstakeDetailsLoaded({
            vaultShares: '0',
            prevVaultShares: unstakeAmount,
            amountSupplied: '0',
            prevAmountSupplied: suppliedAfterDeposit,
            checkEstimatedTxCost: false,
          })
          submitUnstakeForm().then(expectCallbacks)
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
