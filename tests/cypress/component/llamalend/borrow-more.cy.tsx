import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/borrow-more.helpers'
import { createMockLlamaApi, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createMockMintMarket } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>

const createMockMarket = () =>
  createMockMintMarket({
    stats: { parameters: cy.stub().resolves({ rate: '0.08', future_rate: '0.09' }) },
    estimateGas: {
      borrowMore: cy.stub().resolves(180000),
      borrowMoreApprove: cy.stub().resolves(120000),
    },
    userState: cy.stub().resolves({ collateral: '0.1', stablecoin: '0', debt: '10' }),
    userHealth: cy.stub().resolves('45.0'),
    currentLeverage: cy.stub().resolves('1.0'),
    borrowMoreHealth: cy.stub().resolves('35.2'),
    borrowMoreMaxRecv: cy.stub().resolves('500'),
    borrowMoreIsApproved: cy.stub().resolves(true),
    borrowMoreApprove: cy.stub().resolves(['0xfake']),
    borrowMore: cy.stub().resolves(TEST_TX_HASH),
  })

describe('BorrowMoreForm (mocked)', () => {
  let market: ReturnType<typeof createMockMarket>
  let onBorrowedMore: ReturnType<typeof cy.spy>

  const mountForm = () => {
    const llamaApi = createMockLlamaApi(1, market)
    globalLibs.current.llamaApi = llamaApi as never

    cy.mount(
      <MockLoanTestWrapper chainId={1} mockMarket={market} llamaApi={llamaApi}>
        <BorrowMoreForm market={market} networks={networks} chainId={1} onMutated={onBorrowedMore} fromWallet={false} />
      </MockLoanTestWrapper>,
    )
  }

  beforeEach(() => {
    onBorrowedMore = cy.spy().as('onBorrowedMore')
    market = createMockMarket()
  })

  afterEach(() => {
    queryClient.clear()
    globalLibs.current = {} as never
    globalLibs.hydrated = {}
  })

  it('renders and fills the borrow more form', () => {
    mountForm()
    writeBorrowMoreForm({ debt: '2' })
    checkBorrowMoreDetailsLoaded({
      expectedCurrentDebt: '10',
      expectedFutureDebt: '12',
      leverageEnabled: false,
    })
  })

  it('submits the borrow more form', () => {
    mountForm()
    writeBorrowMoreForm({ debt: '2' })
    submitBorrowMoreForm().then(() => {
      expect(onBorrowedMore.callCount).to.eq(1)
      expect(market.borrowMore.callCount).to.eq(1)
    })
  })
})
