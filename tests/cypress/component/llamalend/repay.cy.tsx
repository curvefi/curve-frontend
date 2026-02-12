import { type Address } from 'viem'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createMockMintMarket } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedErc20BalanceForAddresses } from '@cy/support/helpers/llamalend/query-cache.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>

const seedCrvUsdBalance = () =>
  seedErc20BalanceForAddresses({
    chainId: 1,
    tokenAddress: CRVUSD_ADDRESS,
    addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
    rawBalance: 10_000_000_000_000_000_000n,
  })

const createMockMarket = () =>
  createMockMintMarket({
    stats: { parameters: cy.stub().resolves({ rate: '0.08', future_rate: '0.09' }) },
    estimateGas: {
      repay: cy.stub().resolves(180000),
      repayApprove: cy.stub().resolves(120000),
    },
    userState: cy.stub().resolves({ collateral: '0.1', stablecoin: '0', debt: '12' }),
    userHealth: cy.stub().resolves('45.0'),
    repayHealth: cy.stub().resolves('55.0'),
    repayPrices: cy.stub().resolves(['3500', '3200']),
    repayIsApproved: cy.stub().resolves(true),
    repayApprove: cy.stub().resolves(['0xfake']),
    repay: cy.stub().resolves(TEST_TX_HASH),
  })

describe('RepayForm (mocked)', () => {
  let market: ReturnType<typeof createMockMarket>
  let onRepaid: ReturnType<typeof cy.spy>

  const mountForm = () => {
    seedCrvUsdBalance()
    const llamaApi = createMockLlamaApi(1, market)
    globalLibs.current.llamaApi = llamaApi as never

    cy.mount(
      <MockLoanTestWrapper chainId={1} mockMarket={market} llamaApi={llamaApi}>
        <RepayForm market={market} networks={networks} chainId={1} onRepaid={onRepaid} />
      </MockLoanTestWrapper>,
    )
  }

  beforeEach(() => {
    onRepaid = cy.spy().as('onRepaid')
    market = createMockMarket()
  })

  afterEach(() => {
    queryClient.clear()
    globalLibs.current = {} as never
    globalLibs.hydrated = {}
  })

  it('renders and fills the repay form', () => {
    mountForm()
    selectRepayToken({ symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, hasLeverage: false })
    writeRepayLoanForm({ amount: '1' })
    checkRepayDetailsLoaded({
      debt: ['12', '11', 'crvUSD'],
      leverageEnabled: false,
    })
  })

  it('submits the repay form', () => {
    mountForm()
    selectRepayToken({ symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, hasLeverage: false })
    writeRepayLoanForm({ amount: '1' })
    submitRepayForm().then(() => {
      expect(onRepaid.callCount).to.eq(1)
      expect(market.repay.callCount).to.eq(1)
    })
  })
})
