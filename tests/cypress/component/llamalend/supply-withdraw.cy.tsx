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

describe.skip('WithdrawForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ isFull, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createWithdrawScenario({ chainId, isFull })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <WithdrawForm market={market} networks={llamaNetworks} chainId={chainId} enabled />
        </MockLoanTestWrapper>,
      )

      writeWithdrawForm({ amount: input.amount })
      checkSupplyActionInfoValues(expected.actionInfo)
      checkSupplySubmitButtonText('withdraw', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.statsFutureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.previewWithdraw).to.have.been.calledWithExactly(...expected.previewWithdraw)
      })

      submitWithdrawForm().then(() => {
        if (isFull) {
          expect(stubs.estimateGasRedeem).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.redeem).to.have.been.calledWithExactly(...expected.submit)
          expect(stubs.withdraw).to.not.have.been.called
        } else {
          expect(stubs.estimateGasWithdraw).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasRedeem).to.not.have.been.called
          expect(stubs.withdraw).to.have.been.calledWithExactly(...expected.submit)
          expect(stubs.redeem).to.not.have.been.called
        }
      })
    })
  })
})
