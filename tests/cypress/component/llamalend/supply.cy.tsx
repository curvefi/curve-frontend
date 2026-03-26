/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneAddress } from '@cy/support/generators'
import {
  createClaimScenario,
  createDepositScenario,
  createStakeScenario,
  createUnstakeScenario,
  createWithdrawScenario,
} from '@cy/support/helpers/llamalend/supply-scenarios.helpers'
import {
  blurSupplyInput,
  checkClaimTableState,
  checkSupplyActionInfoValues,
  checkSupplyAlert,
  mountSupplyComponent,
  submitSupplyAction,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { resetLlamaTestContext } from '@cy/support/helpers/llamalend/test-context.helpers'
import { TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum

describe('Llamalend supply helpers', () => {
  afterEach(() => resetLlamaTestContext())
  ;[
    { approved: true, buttonText: 'Deposit' },
    { approved: false, buttonText: 'Approve & Deposit' },
  ].forEach(({ approved, buttonText }) => {
    it(`handles deposit (${buttonText})`, () => {
      const { input, market, llamaApi, expected, stubs } = createDepositScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')

      mountSupplyComponent({
        chainId,
        networks,
        llamaApi,
        children: <DepositForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />,
      })

      writeSupplyInput({ type: 'deposit', amount: input.amount })
      blurSupplyInput('deposit')
      checkSupplyActionInfoValues(expected.actionInfo)
      cy.get('[data-testid="supply-deposit-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.statsFutureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.previewDeposit).to.have.been.calledWithExactly(...expected.previewDeposit)
        expect(stubs.depositIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
      })

      submitSupplyAction('deposit')
      cy.wrap({}, TRANSACTION_LOAD_TIMEOUT).should(() => {
        if (approved) {
          expect(stubs.depositApprove).to.not.have.been.called
          expect(stubs.estimateGasDeposit).to.have.been.calledWithExactly(...expected.estimateGas)
        } else {
          expect(stubs.depositApprove).to.have.been.calledWithExactly(...expected.approve)
          expect(stubs.estimateGasDepositApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
        expect(stubs.deposit).to.have.been.calledWithExactly(...expected.submit)
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
  ;[
    { approved: true, buttonText: 'Stake' },
    { approved: false, buttonText: 'Approve & Stake' },
  ].forEach(({ approved, buttonText }) => {
    it(`handles stake (${buttonText})`, () => {
      const { input, market, llamaApi, expected, stubs } = createStakeScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')

      mountSupplyComponent({
        chainId,
        networks,
        llamaApi,
        children: <StakeForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />,
      })

      writeSupplyInput({ type: 'stake', amount: input.amount })
      blurSupplyInput('stake')
      checkSupplyActionInfoValues(expected.actionInfo)
      cy.get('[data-testid="supply-stake-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.stakeIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
      })

      submitSupplyAction('stake')
      cy.wrap({}, TRANSACTION_LOAD_TIMEOUT).should(() => {
        if (approved) {
          expect(stubs.stakeApprove).to.not.have.been.called
          expect(stubs.estimateGasStake).to.have.been.calledWithExactly(...expected.estimateGas)
        } else {
          expect(stubs.stakeApprove).to.have.been.calledWithExactly(...expected.approve)
          expect(stubs.estimateGasStakeApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
        expect(stubs.stake).to.have.been.calledWithExactly(...expected.submit)
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
  ;[
    { isFull: false, buttonText: 'Withdraw' },
    { isFull: true, buttonText: 'Withdraw All' },
  ].forEach(({ isFull, buttonText }) => {
    it(`handles ${isFull ? 'full' : 'partial'} withdraw`, () => {
      const { input, market, llamaApi, expected, stubs } = createWithdrawScenario({ chainId, isFull })
      const onSuccess = cy.spy().as('onSuccess')

      mountSupplyComponent({
        chainId,
        networks,
        llamaApi,
        children: <WithdrawForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />,
      })

      writeSupplyInput({ type: 'withdraw', amount: input.amount })
      blurSupplyInput('withdraw')
      checkSupplyActionInfoValues(expected.actionInfo)
      cy.get('[data-testid="supply-withdraw-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.statsFutureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.previewWithdraw).to.have.been.calledWithExactly(...expected.previewWithdraw)
      })

      submitSupplyAction('withdraw')
      cy.wrap({}, TRANSACTION_LOAD_TIMEOUT).should(() => {
        expect(isFull ? stubs.estimateGasRedeem : stubs.estimateGasWithdraw).to.have.been.calledWithExactly(
          ...expected.estimateGas,
        )
        expect(isFull ? stubs.redeem : stubs.withdraw).to.have.been.calledWithExactly(...expected.submit)
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })

  it('handles unstake with the shared alert helper', () => {
    const { input, market, llamaApi, expected, stubs } = createUnstakeScenario({ chainId })
    const onSuccess = cy.spy().as('onSuccess')

    mountSupplyComponent({
      chainId,
      networks,
      llamaApi,
      children: <UnstakeForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />,
    })

    checkSupplyAlert(expected.alert)
    writeSupplyInput({ type: 'unstake', amount: input.amount })
    blurSupplyInput('unstake')
    checkSupplyActionInfoValues(expected.actionInfo)

    cy.then(() => {
      expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
      expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
    })

    submitSupplyAction('unstake')
    cy.wrap({}, TRANSACTION_LOAD_TIMEOUT).should(() => {
      expect(stubs.estimateGasUnstake).to.have.been.calledWithExactly(...expected.estimateGas)
      expect(stubs.unstake).to.have.been.calledWithExactly(...expected.submit)
      expect(onSuccess).to.have.been.calledOnce
    })
  })
  ;[
    { title: 'no rewards', claimableCrv: '0', claimableRewards: [] },
    { title: 'crv only', claimableCrv: '5.00', claimableRewards: [] },
    { title: 'rewards only', claimableCrv: '0', claimableRewards: [{ amount: '2.50', symbol: 'CVX' }] },
    {
      title: 'crv and rewards',
      claimableCrv: '5.00',
      claimableRewards: [{ amount: '2.50', symbol: 'CVX' }],
    },
  ].forEach(({ title, claimableCrv, claimableRewards }) => {
    it(`handles claim table state: ${title}`, () => {
      const { market, llamaApi, expected, stubs } = createClaimScenario({
        chainId,
        claimableCrv,
        claimableRewards: claimableRewards.map((reward) => ({ ...reward, token: oneAddress() })),
      })

      mountSupplyComponent({
        chainId,
        networks,
        llamaApi,
        children: <ClaimTab market={market} networks={networks} chainId={chainId} enabled />,
      })

      checkClaimTableState({
        rows: expected.table.rows,
        totalNotional: expected.table.totalNotional,
        buttonDisabled: expected.buttonDisabled,
      })

      cy.then(() => {
        expect(stubs.claimableCrv).to.have.been.calledWithExactly(...expected.claimableCrv)
        expect(stubs.claimableRewards).to.have.been.calledWithExactly(...expected.claimableRewards)
      })

      if (expected.buttonDisabled) return

      submitSupplyAction('claim')
      cy.wrap({}, TRANSACTION_LOAD_TIMEOUT).should(() => {
        expect(stubs.estimateGasClaimCrv.callCount > 0).to.equal(expected.shouldClaimCrv)
        expect(stubs.estimateGasClaimRewards.callCount > 0).to.equal(expected.shouldClaimRewards)
        expect(stubs.claimCrv.callCount > 0).to.equal(expected.shouldClaimCrv)
        expect(stubs.claimRewards.callCount > 0).to.equal(expected.shouldClaimRewards)
      })
    })
  })
})
