import { type ReactElement } from 'react'
import { type Address } from 'viem'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createMockMintMarket } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedErc20BalanceForAddresses } from '@cy/support/helpers/llamalend/query-cache.helpers'
import { checkRepayDetailsLoaded } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  submitClosePositionForm,
  submitImproveHealthForm,
  writeImproveHealthForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>

const seedCrvUsdBalance = () => {
  seedErc20BalanceForAddresses({
    chainId: 1,
    tokenAddress: CRVUSD_ADDRESS,
    addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
    rawBalance: 10_000_000_000_000_000_000n,
  })
}

const createMockMarket = () =>
  createMockMintMarket({
    stats: { parameters: cy.stub().resolves({ rate: '0.08', future_rate: '0.09' }) },
    estimateGas: {
      repay: cy.stub().resolves(180000),
      repayApprove: cy.stub().resolves(120000),
      selfLiquidate: cy.stub().resolves(200000),
    },
    wallet: { balances: cy.stub().resolves({ stablecoin: '6', collateral: '0.05' }) },
    userState: cy.stub().resolves({ collateral: '0.05', stablecoin: '5.0', debt: '10' }),
    userHealth: cy.stub().resolves('45.0'),
    repayHealth: cy.stub().resolves('55.0'),
    repayPrices: cy.stub().resolves(['3500', '3200']),
    repayIsApproved: cy.stub().resolves(true),
    repayApprove: cy.stub().resolves(['0xfake']),
    repay: cy.stub().resolves(TEST_TX_HASH),
    selfLiquidateIsApproved: cy.stub().resolves(true),
    selfLiquidateApprove: cy.stub().resolves(['0xfake']),
    selfLiquidate: cy.stub().resolves(TEST_TX_HASH),
  })

describe('Soft Liquidation Forms (mocked)', () => {
  let market: ReturnType<typeof createMockMarket>
  let onRepaid: ReturnType<typeof cy.spy>
  let onClosed: ReturnType<typeof cy.spy>

  const mountForm = (form: ReactElement, withCrvUsdBalance = false) => {
    if (withCrvUsdBalance) seedCrvUsdBalance()
    const llamaApi = createMockLlamaApi(1, market)
    globalLibs.current.llamaApi = llamaApi as never

    cy.mount(
      <MockLoanTestWrapper chainId={1} mockMarket={market} llamaApi={llamaApi}>
        {form}
      </MockLoanTestWrapper>,
    )
  }

  beforeEach(() => {
    onRepaid = cy.spy().as('onRepaid')
    onClosed = cy.spy().as('onClosed')
    market = createMockMarket()
  })

  afterEach(() => {
    queryClient.clear()
    globalLibs.current = {} as never
    globalLibs.hydrated = {}
  })

  describe('ImproveHealthForm', () => {
    it('renders and fills the improve health form', () => {
      mountForm(<ImproveHealthForm market={market} networks={networks} chainId={1} onRepaid={onRepaid} />, true)
      writeImproveHealthForm({ amount: '1' })
      checkRepayDetailsLoaded({ debt: ['10', '4', 'crvUSD'] })
    })

    it('submits the improve health form', () => {
      mountForm(<ImproveHealthForm market={market} networks={networks} chainId={1} onRepaid={onRepaid} />, true)
      writeImproveHealthForm({ amount: '1' })
      checkRepayDetailsLoaded({ debt: ['10', '4', 'crvUSD'] })
      cy.then(seedCrvUsdBalance)
      cy.get('[data-testid="improve-health-submit"]').should('not.be.disabled')
      submitImproveHealthForm().then(() => {
        expect(onRepaid.callCount).to.eq(1)
        expect(market.repay.callCount).to.eq(1)
      })
    })
  })

  describe('ClosePositionForm', () => {
    it('renders and shows close position details', () => {
      mountForm(<ClosePositionForm market={market} networks={networks} chainId={1} onClosed={onClosed} />)
      cy.get('[data-testid="loan-info-accordion"] button').first().click()
      checkClosePositionDetailsLoaded({ debt: '10' })
    })

    it('submits the close position form', () => {
      mountForm(<ClosePositionForm market={market} networks={networks} chainId={1} onClosed={onClosed} />)
      submitClosePositionForm().then(() => {
        expect(onClosed.callCount).to.eq(1)
        expect(market.selfLiquidate.callCount).to.eq(1)
      })
    })
  })
})
