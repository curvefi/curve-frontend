import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  advanceVirtualNetworkClock,
  checkClaimDetailsLoaded,
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
import {
  checkpointTenderlySupplyRewards,
  fundUserForSupplySetup,
  setupTenderlySupplyClaimRewards,
  setupTenderlySupplyStake,
  waitForErc20Balance,
} from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import {
  checkCurrentSuppliedAmount,
  checkCurrentStakedAmount,
  getSupplyRpcTestMarkets,
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
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

getSupplyRpcTestMarkets().forEach(
  ({
    id,
    label,
    chainId,
    borrowedTokenAddress,
    vaultAddress,
    gaugeAddress,
    deposit,
    partialWithdraw,
    borrowedTokenDecimals,
  }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))
      const rewardAccrualSeconds = 7 * 24 * 60 * 60
      const legacyMarketRewardAmount = '1000' as Decimal

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

      it('claims rewards', () => {
        cy.wrap(null).then(() =>
          setupTenderlySupplyStake({
            vnet: getVirtualNetwork(),
            userAddress: address,
            borrowedTokenAddress,
            borrowedTokenDecimals,
            vaultAddress,
            gaugeAddress,
            deposit,
          }),
        )
        cy.then(LOAD_TIMEOUT, () =>
          waitForErc20Balance({
            vnet: getVirtualNetwork(),
            userAddress: address,
            tokenAddress: gaugeAddress,
            predicate: (balance) => balance > 0n,
            description: gaugeAddress,
          }),
        )
        if (id === 'one-way-market-7') {
          // This legacy gauge no longer accrues claimables on the latest fork, so seed a
          // deterministic reward schedule on Tenderly and advance time before opening the claim tab.
          setupTenderlySupplyClaimRewards({
            vnet: getVirtualNetwork(),
            gaugeAddress,
            rewardTokenAddress: borrowedTokenAddress,
            rewardTokenDecimals: borrowedTokenDecimals,
            rewardAmount: legacyMarketRewardAmount,
            rewardEpochSeconds: rewardAccrualSeconds,
          })
        }
        cy.wrap(null).then(() =>
          advanceVirtualNetworkClock({
            vnet: getVirtualNetwork(),
            seconds: rewardAccrualSeconds,
          }),
        )
        if (id !== 'one-way-market-7') {
          cy.wrap(null).then(() =>
            checkpointTenderlySupplyRewards({
              vnet: getVirtualNetwork(),
              userAddress: address,
              gaugeAddress,
            }),
          )
        }
        cy.mount(<SupplyTestWrapper tab="claim" />)
        checkClaimDetailsLoaded(id === 'one-way-market-7' ? { expectedSymbols: ['crvUSD'] } : undefined)
        submitClaimAndSettle({ waitForEmptyState: true }).then(expectCallbacks)
        checkClaimDetailsLoaded({ hasRewards: false, checkEstimatedTxCost: false })
      })
    })
  },
)
