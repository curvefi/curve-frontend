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
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum
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
      const { borrow, expected, expectedCurrentDebt, expectedFutureDebt, llamaApi, market, stubs } =
        createBorrowMoreScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <BorrowMoreForm
            market={market}
            networks={networks}
            chainId={chainId}
            onSuccess={onSuccess}
            onPricesUpdated={onPricesUpdated}
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
        expect(stubs.borrowMoreHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        if (approved) {
          expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        }
      })

      submitBorrowMoreForm().then(() => {
        expect(stubs.borrowMore).to.have.been.calledWithExactly(...expected.submit)
        if (approved) {
          expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.borrowMoreApprove).to.not.have.been.called
        } else {
          expect(stubs.borrowMoreApprove).to.not.have.been.called
        }
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
})
