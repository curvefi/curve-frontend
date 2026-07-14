import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { oneDecimal } from '@cy/support/generators'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import { fakeCollateralEvents } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/mocks/borrow-more.mocks'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
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
].flatMap(testCase => [
  {
    ...testCase,
    hasLeverageManagement: false,
    leverageEnabled: false,
    leverageImplementation: undefined,
  },
  {
    ...testCase,
    title: `${testCase.title} with zapV2 leverage`,
    hasLeverageManagement: true,
    leverageEnabled: true,
    leverageImplementation: 'zapV2' as const,
  },
])

describe('BorrowMoreForm (mocked)', () => {
  beforeEach(() => {
    resetLlamaTestContext()
    mockMintSnapshots({ limit: 1 })
  })

  testCases.forEach(
    ({
      approved,
      title,
      withCollateral,
      hasLeverageManagement,
      leverageEnabled,
      leverageImplementation,
      buttonText,
    }) => {
      it(title, () => {
        const userCollateral = withCollateral ? oneDecimal(0.01, 0.5, 3) : undefined
        const { borrow, expectedCurrentDebt, expectedFutureDebt, llamaApi, market, assertPreSubmit, assertSubmit } =
          createBorrowMoreScenario({
            chainId,
            approved,
            collateral: userCollateral,
            leverage: hasLeverageManagement,
            leverageImplementation,
          })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks: llamaNetworks })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
            <BorrowMoreForm
              networks={llamaNetworks}
              onPricesUpdated={cy.spy()}
              collateralEvents={constQ(fakeCollateralEvents)}
            />
          </MockLoanTestWrapper>,
        )
        writeBorrowMoreForm({
          debt: borrow,
          userCollateral,
          hasLeverageManagement,
          leverageEnabled,
          waitForRoutes: leverageImplementation === 'zapV2',
        })
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt,
          expectedFutureDebt,
          leverageEnabled,
          borrowedSymbol: 'crvUSD',
        })
        cy.get('[data-testid="borrow-more-submit-button"]').should('have.text', buttonText)

        cy.then(assertPreSubmit)
        submitBorrowMoreForm().then(assertSubmit)
      })
    },
  )
})
