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
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
]

describe('BorrowMoreForm (mocked)', () => {
  afterEach(() => {
    resetLlamaTestContext()
  })

  testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
    it(title, () => {
      const {
        borrow,
        expected: { estimateGas, health, isApproved, maxRecv, submit },
        expectedCurrentDebt,
        expectedFutureDebt,
        llamaApi,
        market,
        stubs,
      } = createBorrowMoreScenario({ chainId, approved })
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
        expect(stubs.parameters).to.have.been.calledWithExactly()
        expect(stubs.borrowMoreHealth).to.have.been.calledWithExactly(...health)
        expect(stubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...maxRecv)
        expect(stubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...isApproved)
        if (approved) {
          expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...estimateGas)
        } else {
          expect(stubs.estimateGasBorrowMore).to.not.have.been.called
          if ('estimateGasBorrowMoreApprove' in stubs) {
            expect(stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
          }
        }
      })

      submitBorrowMoreForm().then(() => {
        expect(stubs.borrowMore).to.have.been.calledWithExactly(...submit)
        expect(stubs.borrowMoreApprove).to.not.have.been.called
      })
    })
  })
})
