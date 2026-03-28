import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  LlamalendSupplyTestCase,
  type LlamalendSupplyTestCaseProps,
} from '@cy/support/helpers/llamalend/LlamalendSupplyTestCase'
import { SUPPLY_TEST_MARKETS } from '@cy/support/helpers/llamalend/supply-rpc.helpers'
import {
  checkpointTenderlySupplyRewards,
  fundUserForSupplySetup,
  setupTenderlySupplyClaimRewards,
  setupTenderlySupplyStake,
  waitForErc20Balance,
} from '@cy/support/helpers/llamalend/supply-setup.helpers'
import {
  captureWalletBalance,
  checkClaimDetailsLoaded,
  checkCurrentSuppliedAmount,
  checkDepositDetailsLoaded,
  checkStakeDetailsLoaded,
  checkUnstakeDetailsLoaded,
  checkWithdrawDetailsLoaded,
  expectWalletBalanceDelta,
  expectSupplyCallbacks,
  selectMaxWithdraw,
  submitClaimForm,
  submitDepositForm,
  submitStakeForm,
  submitUnstakeForm,
  submitWithdrawForm,
  touchClaimForm,
  touchDepositForm,
  touchStakeForm,
  touchUnstakeForm,
  touchWithdrawForm,
  writeDepositForm,
  writeStakeForm,
  writeUnstakeForm,
  writeWithdrawForm,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

SUPPLY_TEST_MARKETS.forEach(
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
      const unstakePrivateKey = generatePrivateKey()
      const { address: unstakeAddress } = privateKeyToAccount(unstakePrivateKey)
      const claimPrivateKey = generatePrivateKey()
      const { address: claimAddress } = privateKeyToAccount(claimPrivateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))
      const rewardAccrualSeconds = 7 * 24 * 60 * 60
      const legacyMarketRewardAmount = '1000' as Decimal
      const advanceVirtualNetworkClock = (seconds: number) => {
        const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())

        return cy
          .request({
            method: 'POST',
            url: adminRpcUrl,
            body: { jsonrpc: '2.0', method: 'evm_increaseTime', params: [seconds], id: 1 },
          })
          .then((response) => {
            expect(response.body.error).to.equal(undefined)
            return cy.request({
              method: 'POST',
              url: adminRpcUrl,
              body: { jsonrpc: '2.0', method: 'evm_mine', params: [], id: 2 },
            })
          })
          .then((response) => {
            expect(response.body.error).to.equal(undefined)
          })
      }

      const suppliedAfterDeposit = deposit
      const suppliedAfterPartialWithdraw = new BigNumber(deposit).minus(partialWithdraw).toFixed() as Decimal

      let onSuccess: ReturnType<typeof cy.stub>

      const SupplyTestWrapper = ({
        tab,
        privateKey: currentPrivateKey = privateKey,
        userAddress = address,
      }: Pick<LlamalendSupplyTestCaseProps, 'tab'> & {
        privateKey?: typeof privateKey
        userAddress?: typeof address
      }) => (
        <LlamalendSupplyTestCase
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={currentPrivateKey}
          chainId={chainId}
          marketId={id}
          userAddress={userAddress}
          onSuccess={onSuccess}
        />
      )

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
        submitDepositForm().then(() => expectSupplyCallbacks({ onSuccess }))
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
        submitWithdrawForm().then(() => expectSupplyCallbacks({ onSuccess }))
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
        submitWithdrawForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchWithdrawForm()
        checkCurrentSuppliedAmount('0')
      })

      it('deposits into the vault again', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('stakes into the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="stake" />)
        captureWalletBalance('stake').then((balanceBefore) => {
          const stakeAmount = balanceBefore as Decimal
          const expectedStakeDelta = new BigNumber(stakeAmount).negated().toFixed() as Decimal

          expect(new BigNumber(stakeAmount).gt(0)).to.equal(true)

          writeStakeForm({ amount: stakeAmount })
          checkStakeDetailsLoaded({
            vaultShares: stakeAmount,
            prevVaultShares: '0',
            amountSupplied: suppliedAfterDeposit,
            prevAmountSupplied: '0',
            expectedButtonText: 'Approve & Stake',
            checkEstimatedTxCost: false,
          })
          submitStakeForm().then(() => expectSupplyCallbacks({ onSuccess }))
          touchStakeForm()
          checkStakeDetailsLoaded({
            vaultShares: stakeAmount,
            prevVaultShares: stakeAmount,
            amountSupplied: suppliedAfterDeposit,
            prevAmountSupplied: suppliedAfterDeposit,
            checkEstimatedTxCost: false,
          })
          expectWalletBalanceDelta({
            type: 'stake',
            balanceBefore: stakeAmount,
            expectedDelta: expectedStakeDelta,
          })
        })
      })

      it('unstakes from the gauge', () => {
        setupTenderlySupplyStake({
          vnet: getVirtualNetwork(),
          userAddress: unstakeAddress,
          borrowedTokenAddress,
          borrowedTokenDecimals,
          vaultAddress,
          gaugeAddress,
          deposit,
        })

        cy.wrap(null).then(() =>
          waitForErc20Balance({
            vnet: getVirtualNetwork(),
            userAddress: unstakeAddress,
            tokenAddress: gaugeAddress,
            predicate: (balance) => balance > 0n,
            description: gaugeAddress,
          }),
        )
        cy.mount(<SupplyTestWrapper tab="stake" privateKey={unstakePrivateKey} userAddress={unstakeAddress} />)
        captureWalletBalance('stake').then((vaultBalanceBefore) => {
          cy.mount(<SupplyTestWrapper tab="unstake" privateKey={unstakePrivateKey} userAddress={unstakeAddress} />)
          captureWalletBalance('unstake')
            .should((balanceBefore) => {
              expect(new BigNumber(balanceBefore as string).gt(0)).to.equal(true)
            })
            .then((balanceBefore) => {
              const unstakeAmount = balanceBefore as Decimal

              writeUnstakeForm({ amount: unstakeAmount })
              checkUnstakeDetailsLoaded({
                vaultShares: '0',
                prevVaultShares: unstakeAmount,
                amountSupplied: '0',
                prevAmountSupplied: suppliedAfterDeposit,
                checkEstimatedTxCost: false,
              })
              submitUnstakeForm().then(() => expectSupplyCallbacks({ onSuccess }))
              cy.wrap(null).then(() =>
                waitForErc20Balance({
                  vnet: getVirtualNetwork(),
                  userAddress: unstakeAddress,
                  tokenAddress: gaugeAddress,
                  predicate: (balance) => balance === 0n,
                  description: gaugeAddress,
                }),
              )
              touchUnstakeForm()
              checkUnstakeDetailsLoaded({
                vaultShares: '0',
                prevVaultShares: '0',
                amountSupplied: '0',
                prevAmountSupplied: '0',
                checkEstimatedTxCost: false,
              })

              cy.mount(<SupplyTestWrapper tab="stake" privateKey={unstakePrivateKey} userAddress={unstakeAddress} />)
              expectWalletBalanceDelta({
                type: 'stake',
                balanceBefore: vaultBalanceBefore as Decimal,
                expectedDelta: unstakeAmount,
              })
            })
        })
      })

      it('claims rewards', () => {
        setupTenderlySupplyStake({
          vnet: getVirtualNetwork(),
          userAddress: claimAddress,
          borrowedTokenAddress,
          borrowedTokenDecimals,
          vaultAddress,
          gaugeAddress,
          deposit,
        })

        cy.wrap(null).then(() =>
          waitForErc20Balance({
            vnet: getVirtualNetwork(),
            userAddress: claimAddress,
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
        cy.wrap(null).then(() => advanceVirtualNetworkClock(rewardAccrualSeconds))
        if (id !== 'one-way-market-7') {
          cy.wrap(null).then(() =>
            checkpointTenderlySupplyRewards({
              vnet: getVirtualNetwork(),
              userAddress: claimAddress,
              gaugeAddress,
            }),
          )
        }
        cy.mount(<SupplyTestWrapper tab="claim" privateKey={claimPrivateKey} userAddress={claimAddress} />)
        checkClaimDetailsLoaded(id === 'one-way-market-7' ? { expectedSymbols: ['crvUSD'] } : undefined)
        submitClaimForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchClaimForm()
        checkClaimDetailsLoaded({ hasRewards: false, checkEstimatedTxCost: false })
      })
    })
  },
)
