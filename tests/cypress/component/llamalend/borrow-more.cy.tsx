import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/borrow-more.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { resetLlamaTestContext, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1

describe('BorrowMoreForm (mocked)', () => {
  const createScenario = ({ approved }: { approved: boolean }) => createBorrowMoreScenario({ chainId, approved })

  afterEach(() => {
    resetLlamaTestContext()
  })

  const runCase = ({ approved, title }: { approved: boolean; title: string }) =>
    it(title, () => {
      const scenario = createScenario({ approved })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')
      const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

      void collateral
      setLlamaApi(llamaApi)

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <BorrowMoreForm
            market={market}
            networks={networks}
            chainId={chainId}
            onSuccess={onSuccess}
            onPricesUpdated={onPricesUpdated}
            fromWallet={false}
          />
        </MockLoanTestWrapper>,
      )

      writeBorrowMoreForm({ debt: borrow })
      checkBorrowMoreDetailsLoaded({
        expectedCurrentDebt: scenario.expectedCurrentDebt,
        expectedFutureDebt: scenario.expectedFutureDebt,
        leverageEnabled: false,
      })

      cy.then(() => {
        expect(stubs.parameters).to.have.been.calledWithExactly()
        expect(stubs.borrowMoreHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
      })

      submitBorrowMoreForm().then(() => {
        expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...expected.estimateGas)
        expect(stubs.borrowMore).to.have.been.calledWithExactly(...expected.submit)
      })
    })

  runCase({ approved: true, title: 'fills and submits with randomized data (already approved)' })
  runCase({ approved: false, title: 'fills, approves, and submits with randomized data' })
})
