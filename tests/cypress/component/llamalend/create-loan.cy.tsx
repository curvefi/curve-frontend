/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { llamaNetworks, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const chainId = 1
const testCases = [
  { approved: false, title: 'fills, approves, and submits' },
  { approved: true, title: 'fills and submits' },
].flatMap(testCase => [
  {
    ...testCase,
    hasLeverage: false,
    leverageEnabled: false,
  },
  {
    ...testCase,
    title: `${testCase.title} with leverage`,
    hasLeverage: true,
    leverageEnabled: true,
  },
])

describe('CreateLoanForm (mocked)', () => {
  testCases.forEach(({ approved, hasLeverage, leverageEnabled, title }) => {
    it(title, () => {
      const { llamaApi, expected, market, borrow, stubs, collateral } = createCreateLoanScenario({
        chainId,
        presetRange: 50,
        approved,
        leverage: hasLeverage,
      })
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <CreateLoanForm
            market={market}
            networks={llamaNetworks}
            chainId={chainId}
            onPricesUpdated={onPricesUpdated}
          />
        </MockLoanTestWrapper>,
      )

      writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage })
      checkLoanDetailsLoaded({ leverageEnabled })

      cy.then(() => {
        expect(stubs.createLoanHealth).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanPrices).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.createLoanIsApproved).to.have.been.calledWithExactly(...expected.approved)
        if (expected.leverage) {
          const { expectedCollateral, priceImpact } = expected.leverage
          expect(stubs.createLoanExpectedCollateral).to.have.been.calledWithExactly(...expectedCollateral)
          expect(stubs.createLoanPriceImpact).to.have.been.calledWithExactly(...priceImpact)
        }
        if (approved) {
          expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasCreateLoanApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasCreateLoanApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitCreateLoanForm().then(() => {
        expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.estimateGas)
        if (approved) {
          expect(stubs.createLoanApprove).to.not.have.been.called
        } else {
          expect(stubs.createLoanApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(stubs.createLoan).to.have.been.calledWithExactly(...expected.submit)
      })
    })
  })
})
