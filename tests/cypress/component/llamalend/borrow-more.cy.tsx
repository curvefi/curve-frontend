/* eslint-disable @typescript-eslint/no-unused-expressions */
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
      const {
        borrow,
        expected: { estimateGas, health, isApproved, maxRecv, submit },
        expectedCurrentDebt,
        expectedFutureDebt,
        llamaApi,
        market,
        stubs: {
          borrowMore,
          borrowMoreApprove,
          borrowMoreHealth,
          borrowMoreIsApproved,
          borrowMoreMaxRecv,
          estimateGasBorrowMore,
          parameters,
        },
      } = createScenario({ approved })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

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
        expectedCurrentDebt,
        expectedFutureDebt,
        leverageEnabled: false,
      })

      cy.then(() => {
        expect(parameters).to.have.been.calledWithExactly()
        expect(borrowMoreHealth).to.have.been.calledWithExactly(...health)
        expect(borrowMoreMaxRecv).to.have.been.calledWithExactly(...maxRecv)
        expect(borrowMoreIsApproved).to.have.been.calledWithExactly(...isApproved)
      })

      submitBorrowMoreForm().then(() => {
        expect(estimateGasBorrowMore).to.have.been.calledWithExactly(...estimateGas)
        expect(borrowMore).to.have.been.calledWithExactly(...submit)
        if (approved) {
          expect(borrowMoreApprove).to.not.have.been.called
        } else {
          expect(borrowMoreApprove).to.have.been.calledWithExactly(...submit)
        }
      })
    })

  runCase({ approved: true, title: 'fills and submits (already approved)' })
  runCase({ approved: false, title: 'fills, approves, and submits' })
})
