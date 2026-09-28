import type { Hex } from 'viem'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { oneDecimal } from '@cy/support/generators'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import {
  fakeCollateralEvents,
  ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA,
} from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createBorrowMoreScenario } from '@cy/support/helpers/llamalend/mocks/borrow-more.mocks'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { mockMintSnapshots } from '@cy/support/helpers/minting-mocks'
import { MarketVersion } from '@evm-ui/types/market'
import { Chain } from '@primitives/network.utils'
import { constQ } from '@ui/features/queries/util'

const chainId = Chain.Ethereum

type BorrowMoreTestCase = {
  approved: boolean
  title: string
  withCollateral: boolean
  buttonText: string
  leverage: boolean
  controllerApproved?: boolean
  marketVersion?: MarketVersion
  routeCalldata?: Hex
}

const testCases: BorrowMoreTestCase[] = [
  ...[
    { approved: true, title: 'fills and submits (already approved)', withCollateral: false, buttonText: 'Borrow More' },
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
      buttonText: 'Approve, Add & Borrow More',
    },
  ].flatMap(testCase => [
    { ...testCase, leverage: false },
    { ...testCase, title: `${testCase.title} with zapV2 leverage`, leverage: true },
  ]),
  {
    title: 'approves delegation and borrows more on LLv2 with oversized calldata',
    approved: true,
    withCollateral: false,
    buttonText: 'Approve & Borrow More',
    leverage: true,
    controllerApproved: false,
    marketVersion: MarketVersion.v2,
    routeCalldata: ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA,
  },
]

describe('BorrowMoreForm (mocked)', () => {
  beforeEach(() => {
    setupMockedLlamalendComponentTest()
    mockMintSnapshots({ limit: 1 })
  })

  testCases.forEach(
    ({
      approved,
      title,
      withCollateral,
      leverage,
      buttonText,
      controllerApproved = true,
      marketVersion,
      routeCalldata,
    }) => {
      it(title, () => {
        const userCollateral = withCollateral ? oneDecimal(0.01, 0.5, 3) : undefined
        const { borrow, expectedCurrentDebt, expectedFutureDebt, llamaApi, market, assertPreSubmit, assertSubmit } =
          createBorrowMoreScenario({
            chainId,
            approved,
            collateral: userCollateral,
            leverage,
            leverageImplementation: leverage ? 'zapV2' : undefined,
            controllerApproved,
            marketVersion,
            routeCalldata,
          })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId })

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
          hasLeverageManagement: leverage,
          leverageEnabled: leverage,
          waitForRoutes: leverage,
        })
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt,
          expectedFutureDebt,
          leverageEnabled: leverage,
          borrowedSymbol: 'crvUSD',
        })
        cy.get('[data-testid="borrow-more-submit-button"]').should('be.enabled').and('have.text', buttonText)

        cy.then(assertPreSubmit)
        submitBorrowMoreForm({ controllerApproved }).then(assertSubmit)
      })
    },
  )
})
