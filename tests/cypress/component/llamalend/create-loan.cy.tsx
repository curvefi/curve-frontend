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
import { resetLlamaTestContext, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1

describe('CreateLoanForm (mocked)', () => {
  const createScenario = ({ approved }: { approved: boolean }) =>
    createCreateLoanScenario({ chainId, presetRange: 50, approved })

  afterEach(() => {
    resetLlamaTestContext()
  })

  const runCase = ({ approved, title }: { approved: boolean; title: string }) =>
    it(title, () => {
      const scenario = createScenario({ approved })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')
      const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

      setLlamaApi(llamaApi)

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
        expect(stubs.createLoanBands).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanPrices).to.have.been.calledWithExactly(...expected.query)
        expect(stubs.createLoanMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.createLoanIsApproved).to.have.been.calledWithExactly(...expected.approved)
        if ('estimateGasCreateLoanApprove' in stubs) {
          expect(stubs.estimateGasCreateLoanApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        } else {
          expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.query)
        }
      })

      submitCreateLoanForm().then(() => {
        expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.query)
        if ('createLoanApprove' in stubs) {
          expect(stubs.createLoanApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(stubs.createLoan).to.have.been.calledWithExactly(...expected.submit)
      })
    })

  runCase({ approved: true, title: 'fills and submits with randomized rules (already approved)' })
  runCase({ approved: false, title: 'fills, approves, and submits with randomized rules' })
})
