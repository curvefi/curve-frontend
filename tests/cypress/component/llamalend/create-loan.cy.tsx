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
  const createScenario = () => createCreateLoanScenario({ chainId, presetRange: 50 })

  afterEach(() => {
    resetLlamaTestContext()
  })

  it('fills and submits the form with randomized rules', () => {
    const scenario = createScenario()
    const onMutated = cy.spy().as('onMutated')
    const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

    setLlamaApi(llamaApi)

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi}>
        <CreateLoanForm
          market={market}
          networks={networks}
          chainId={chainId}
          onUpdate={async () => undefined}
          onMutated={onMutated}
        />
      </MockLoanTestWrapper>,
    )

    writeCreateLoanForm({ collateral, borrow, leverageEnabled: false })
    checkLoanDetailsLoaded({ leverageEnabled: false })

    cy.then(() => {
      expect(stubs.createLoanHealth).to.have.been.calledWithExactly(...expected.query)
      expect(stubs.createLoanBands).to.have.been.calledWithExactly(...expected.query)
      expect(stubs.createLoanPrices).to.have.been.calledWithExactly(...expected.query)
      expect(stubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...expected.query)
      expect(stubs.createLoanMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
      expect(stubs.createLoanIsApproved).to.have.been.calledWithExactly(...expected.approved)
    })

    submitCreateLoanForm().then(() => {
      expect(stubs.createLoan).to.have.been.calledWithExactly(...expected.submit)
    })
  })
})
