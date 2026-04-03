/* eslint-disable @typescript-eslint/no-unused-expressions */
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { submitDepositForm, writeDepositForm } from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import { createDepositScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum
const testCases = [
  { approved: true, title: 'fills and submits (already approved)', buttonText: 'Deposit' },
  { approved: false, title: 'fills, approves, and submits', buttonText: 'Approve & Deposit' },
]

describe.skip('DepositForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ approved, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createDepositScenario({ chainId, approved })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <DepositForm market={market} networks={llamaNetworks} chainId={chainId} enabled />
        </MockLoanTestWrapper>,
      )

      writeDepositForm({ amount: input.amount })
      checkSupplyActionInfoValues(expected.actionInfo)
      checkSupplySubmitButtonText('deposit', buttonText)

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
      })
    })
  })
})
