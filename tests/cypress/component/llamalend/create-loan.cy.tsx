/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1
const testCases = [
  { approved: false, title: 'fills, approves, and submits' },
  { approved: true, title: 'fills and submits' },
]

describe('CreateLoanForm (mocked)', () => {
  testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
    it(title, () => {
      const { llamaApi, expected, market, borrow, stubs, collateral } = createCreateLoanScenario({
        chainId,
        presetRange: 50,
        approved,
      })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <CreateLoanForm
            market={market}
            networks={networks}
            chainId={chainId}
            onSuccess={onSuccess}
            onPricesUpdated={onPricesUpdated}
          />
        </MockLoanTestWrapper>,
      )

      writeCreateLoanForm({ collateral, borrow, leverageEnabled: false })
      checkLoanDetailsLoaded({ leverageEnabled: false })

      cy.then(() => {
        expect(stubs.createLoanHealth).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanPrices).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.createLoanIsApproved).to.have.been.calledWithExactly(...expected.approved)
        if (approved) {
          expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasCreateLoanApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasCreateLoanApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitCreateLoanForm().then(() => {
        expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.query)
        if (approved) {
          expect(stubs.createLoanApprove).to.not.have.been.called
        } else {
          expect(stubs.createLoanApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(stubs.createLoan).to.have.been.calledWithExactly(...expected.submit)
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
})
