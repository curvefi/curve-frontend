import { BigNumber } from 'bignumber.js'
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
  readStakeAvailableAssets,
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
  readUnstakeAvailableAssets,
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

      it('deposits into the vault', () => {
        cy.mount(<SupplyTestWrapper tab="deposit" />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ suppliedAssets: deposit, prevSuppliedAssets: '0' })
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
        })
        submitWithdrawForm()
        touchWithdrawForm()
        checkCurrentSuppliedAmount('0')
      })

      it('deposits into the vault again', () => {
        cy.mount(<SupplyTestWrapper tab="deposit" />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ suppliedAssets: deposit, prevSuppliedAssets: '0' })
        submitDepositForm({})
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('stakes into the gauge', () => {
        cy.mount(<SupplyTestWrapper tab="stake" />)
        readStakeAvailableAssets().then(stakeAssets => {
          writeStakeForm({ assets: stakeAssets })
          checkStakeDetailsLoaded({
            prevVaultShares: '0',
            suppliedAssets: suppliedAfterDeposit,
            prevSuppliedAssets: '0',
            expectedButtonText: 'Approve & Stake',
            checkEstimatedTxCost: false,
          })
          submitStakeForm()
          touchStakeForm()
          checkCurrentStakedAmount({ expectedAmountSupplied: suppliedAfterDeposit })
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
        readUnstakeAvailableAssets().then(unstakeAssets => {
          writeUnstakeForm({ assets: unstakeAssets })
          checkUnstakeDetailsLoaded({ prevSuppliedAssets: suppliedAfterDeposit, checkEstimatedTxCost: false })
          submitUnstakeForm()
          touchUnstakeForm()
          checkCurrentStakedAmount({ expectedVaultShares: '0', expectedAmountSupplied: '0' })
        })
      })
    })
  },
)
