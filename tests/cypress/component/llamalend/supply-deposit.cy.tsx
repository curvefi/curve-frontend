/* eslint-disable @typescript-eslint/no-unused-expressions */
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  blurSupplyInput,
  checkSupplyActionInfoValues,
  submitDepositForm,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createDepositScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum
const testCases = [
  { approved: true, title: 'fills and submits (already approved)', buttonText: 'Deposit' },
  { approved: false, title: 'fills, approves, and submits', buttonText: 'Approve & Deposit' },
]

describe('DepositForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ approved, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createDepositScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <DepositForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />
        </MockLoanTestWrapper>,
      )

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
        if (approved) {
          expect(stubs.estimateGasDeposit).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasDepositApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasDepositApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitDepositForm().then(() => {
        expect(stubs.deposit).to.have.been.calledWithExactly(...expected.submit)
        if (approved) {
          expect(stubs.depositApprove).to.not.have.been.called
        } else {
          expect(stubs.depositApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
})
