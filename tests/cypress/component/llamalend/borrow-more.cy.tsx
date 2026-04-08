/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { oneDecimal } from '@cy/support/generators'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import { fakeCollateralEvents } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { mockMintSnapshots } from '@cy/support/helpers/minting-mocks'
import { constQ } from '@ui-kit/types/util'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum

const testCases = [
  {
    approved: true,
    title: 'fills and submits (already approved)',
    withCollateral: false,
    buttonText: 'Borrow More',
  },
  {
    approved: false,
    title: 'fills, approves, and submits',
    withCollateral: false,
    buttonText: 'Approve & Borrow More',
  },
  {
    approved: true,
    title: 'fills with collateral and submits',
    withCollateral: true,
    buttonText: 'Add & Borrow More',
  },
  {
    approved: false,
    title: 'fills with collateral, approves and submits',
    withCollateral: true,
    buttonText: 'Add, Approve & Borrow More',
  },
]

describe('BorrowMoreForm (mocked)', () => {
  beforeEach(() => mockMintSnapshots({ limit: 1 }))

  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ approved, title, withCollateral, buttonText }) => {
    it(title, () => {
      const userCollateral = withCollateral ? oneDecimal(0.01, 0.5, 3) : undefined
      const { borrow, expected, expectedCurrentDebt, expectedFutureDebt, llamaApi, market, stubs } =
        createBorrowMoreScenario({ chainId, approved, collateral: userCollateral })
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <BorrowMoreForm
            market={market}
            networks={llamaNetworks}
            chainId={chainId}
            onPricesUpdated={onPricesUpdated}
            enabled
            collateralEvents={constQ(fakeCollateralEvents)}
          />
        </MockLoanTestWrapper>,
      )

      writeBorrowMoreForm({ debt: borrow, userCollateral })
      checkBorrowMoreDetailsLoaded({
        expectedCurrentDebt,
        expectedFutureDebt,
        leverageEnabled: false,
      })
      cy.get('[data-testid="borrow-more-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.parameters).to.have.been.calledWithExactly()
        expect(stubs.borrowMoreHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...expected.maxRecv)
        expect(stubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        if (approved) {
          expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        } else {
          expect(stubs.estimateGasBorrowMoreApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitBorrowMoreForm().then(() => {
        expect(stubs.borrowMore).to.have.been.calledWithExactly(...expected.submit)
        if (approved) {
          expect(stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.borrowMoreApprove).to.not.have.been.called
        } else {
          expect(stubs.borrowMoreApprove).to.have.been.calledWithExactly(...expected.approve)
        }
      })
    })
  })
})
