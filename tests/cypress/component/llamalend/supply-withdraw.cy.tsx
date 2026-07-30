/* eslint-disable @typescript-eslint/no-unused-expressions */
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createWithdrawScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import { submitWithdrawForm, writeWithdrawForm } from '@cy/support/helpers/llamalend/supply/withdraw.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum
const testCases = [
  { isFull: false, title: 'fills and submits partial withdraw', buttonText: 'Withdraw' },
  { isFull: true, title: 'fills and submits full withdraw', buttonText: 'Withdraw All' },
]

describe('WithdrawForm (mocked)', () => {
  beforeEach(resetLlamaTestContext)

  testCases.forEach(({ isFull, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createWithdrawScenario({ chainId, isFull })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
          <WithdrawForm networks={llamaNetworks} />
        </MockLoanTestWrapper>,
      )

      writeWithdrawForm({ amount: input.amount })
      checkSupplyActionInfoValues(expected.actionInfo)
      checkSupplySubmitButtonText('withdraw', buttonText)

      cy.wrap(stubs.walletBalances).should('have.been.calledWithExactly', ...expected.walletBalances)
      cy.wrap(stubs.statsRates).should('have.been.calledWithExactly', ...expected.marketRates)
      cy.wrap(stubs.statsFutureRates).should('have.been.calledWithExactly', ...expected.futureRates)
      cy.wrap(stubs.previewWithdraw).should('have.been.calledWithExactly', ...expected.previewWithdraw)

      submitWithdrawForm()
      if (isFull) {
        cy.wrap(stubs.estimateGasRedeem).should('have.been.calledWithExactly', ...expected.estimateGas)
        cy.wrap(stubs.redeem).should('have.been.calledWithExactly', ...expected.submit)
        cy.then(() => {
          expect(stubs.withdraw).to.not.have.been.called
        })
      } else {
        cy.wrap(stubs.estimateGasWithdraw).should('have.been.calledWithExactly', ...expected.estimateGas)
        cy.wrap(stubs.withdraw).should('have.been.calledWithExactly', ...expected.submit)
        cy.then(() => {
          expect(stubs.estimateGasRedeem).to.not.have.been.called
          expect(stubs.redeem).to.not.have.been.called
        })
      }
    })
  })
})
