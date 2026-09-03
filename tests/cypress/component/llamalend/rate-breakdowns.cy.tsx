import {
  buildBorrowRateBreakdown,
  buildSupplyRateBreakdown,
  PointsCampaignsTable,
  RateBreakdownTable,
  type RateBreakdownData,
} from '@/llamalend/features/rate-breakdown/MarketRateBreakdowns'
import type { MarketToken } from '@/llamalend/llama.utils'
import type { BorrowRate, SupplyRate } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { q } from '@evm-ui/types/util'
import { aprToApy, formatNumber } from '@evm-ui/utils'

const TOKEN_A = '0x0000000000000000000000000000000000000001'
const TOKEN_B = '0x0000000000000000000000000000000000000002'
const collateralToken: MarketToken = { address: TOKEN_A, symbol: 'wstETH', decimals: 18 }
const borrowToken: MarketToken = { address: TOKEN_B, symbol: 'USDC', decimals: 6 }

const campaign = (overrides: Partial<CampaignRewards> = {}): CampaignRewards =>
  ({
    campaignName: 'Test campaign',
    platform: 'Merkl',
    platformImageId: '/images/default-crypto.png',
    dashboardLink: 'https://example.com/campaign',
    action: 'borrow',
    tags: [],
    address: TOKEN_A,
    network: 'ethereum',
    description: null,
    lock: false,
    reward: { type: 'apr', value: 3, address: TOKEN_B, price: 1 },
    symbol: 'USDC',
    ...overrides,
  })

const borrowRate = (overrides: Partial<BorrowRate> = {}): BorrowRate => ({
  rate: 10,
  averageRate: null,
  averageCategory: 'llamalend.market.rate',
  rebasingYield: null,
  averageRebasingYield: null,
  totalBorrowRate: 10,
  totalAverageBorrowRate: null,
  extraRewards: [],
  ...overrides,
})

const supplyRate = (overrides: Partial<SupplyRate> = {}): SupplyRate =>
  ({
    supplyApy: 5,
    supplyApyCrvMinBoost: null,
    supplyApyCrvMaxBoost: null,
    userBoostApy: null,
    rebasingYield: null,
    extraIncentivesTotalApy: 0,
    totalMinBoost: 5,
    totalMaxBoost: 5,
    totalUserBoost: null,
    averageLendApy: null,
    averageApyCrvMinBoost: null,
    averageApyCrvMaxBoost: null,
    averageUserBoostApy: null,
    averageRebasingYield: null,
    averageExtraIncentivesApy: null,
    totalAverageMinBoost: null,
    totalAverageMaxBoost: null,
    totalAverageUserBoost: null,
    averageCategory: 'llamalend.market.rate',
    extraIncentives: [],
    extraRewards: [],
    ...overrides,
  })

const renderRateTable = (
  rateType: 'borrow' | 'supply',
  data?: RateBreakdownData,
  { isLoading = false, error = null }: { isLoading?: boolean; error?: Error | null } = {},
) =>
  cy.mount(
    <ComponentTestWrapper>
      <RateBreakdownTable rateType={rateType} query={q({ data, isLoading, error })} />
    </ComponentTestWrapper>,
  )

const borrowBreakdown = (rate = borrowRate(), prices?: Record<string, number>) =>
  buildBorrowRateBreakdown({ rate, chainId: 1, blockchainId: 'ethereum', collateralToken, prices })

const supplyBreakdown = (rate = supplyRate(), prices?: Record<string, number>) =>
  buildSupplyRateBreakdown({ rate, chainId: 1, blockchainId: 'ethereum', borrowToken, prices })

describe('LlamaLend rate breakdowns', () => {
  beforeEach(() => cy.viewport(1000, 700))

  it('renders base-only borrow and supply rates', () => {
    renderRateTable('borrow', borrowBreakdown())
    cy.get('[data-testid="borrow-rate-breakdown"] tbody tr').should('have.length', 1)
    cy.get('[data-testid="borrow-rate-breakdown"]')
      .should('contain.text', 'Borrow APR')
      .and('contain.text', formatNumber(10, 'percent.rate'))
    cy.get('[data-testid="borrow-rate-breakdown"] tfoot').should('not.exist')

    renderRateTable('supply', supplyBreakdown())
    cy.get('[data-testid="supply-rate-breakdown"] tbody tr').should('have.length', 1)
    cy.get('[data-testid="supply-rate-breakdown"]')
      .should('contain.text', 'Supply APY')
      .and('contain.text', formatNumber(5, 'percent.rate'))
    cy.get('[data-testid="supply-rate-breakdown"] tfoot').should('contain.text', 'Total APY')
  })

  it('renders borrow incentives and rebasing yield as negative adjustments', () => {
    const data = borrowBreakdown(borrowRate({ extraRewards: [campaign()], rebasingYield: 2, totalBorrowRate: 5 }), {
      [TOKEN_A]: 3_500,
      [TOKEN_B]: 1,
    })
    renderRateTable('borrow', data)

    cy.get('[data-testid="borrow-rate-breakdown"] tbody')
      .should('contain.text', formatNumber(-3, 'percent.rate'))
      .and('contain.text', formatNumber(-2, 'percent.rate'))
    cy.get('[data-testid="borrow-rate-breakdown"] tfoot')
      .should('contain.text', 'Net Borrow APR')
      .and('contain.text', formatNumber(5, 'percent.rate'))
  })

  it('converts external supply campaign APR using weekly compounding', () => {
    const expected = aprToApy(10)
    const reward = campaign({ action: 'supply', reward: { type: 'apr', value: 10, address: TOKEN_A } })
    const converted = supplyBreakdown(supplyRate({ extraRewards: [reward] }))

    expect(converted.rows.find(({ source }) => source.address === TOKEN_A)?.rate).to.equal(expected)
    renderRateTable('supply', converted)
    cy.get('[data-testid="supply-rate-breakdown"] tbody').should('contain.text', formatNumber(expected, 'percent.rate'))
  })

  it('omits null rebasing yields and preserves zero rebasing yields', () => {
    expect(borrowBreakdown(borrowRate({ rebasingYield: null })).rows).to.have.length(1)
    const zeroBorrow = borrowBreakdown(borrowRate({ rebasingYield: 0 }))
    expect(zeroBorrow.rows).to.have.length(2)
    expect(zeroBorrow.hasAdjustments).to.equal(true)

    expect(supplyBreakdown(supplyRate({ rebasingYield: null })).rows).to.have.length(1)
    const zeroSupply = supplyBreakdown(supplyRate({ rebasingYield: 0 }))
    expect(zeroSupply.rows).to.have.length(2)
    expect(zeroSupply.rows[0].rate).to.equal(0)
  })

  it('shows minimum and distinct maximum boost totals', () => {
    const data = supplyBreakdown(
      supplyRate({
        supplyApyCrvMinBoost: 2,
        supplyApyCrvMaxBoost: 8,
        totalMinBoost: 7,
        totalMaxBoost: 13,
      }),
    )
    renderRateTable('supply', data)

    cy.get('[data-testid="supply-rate-breakdown"] tfoot')
      .should('contain.text', formatNumber(7, 'percent.rate'))
      .and('contain.text', `Max boost ${formatNumber(13, 'percent.rate')}`)
  })

  it('renders typed and legacy points campaigns separately', () => {
    const typed = campaign({ reward: { type: 'points', value: 20 } })
    const legacy = campaign({ platform: 'Legacy', reward: undefined, symbol: '12x' })
    const data = borrowBreakdown(borrowRate({ extraRewards: [typed, legacy] }))

    cy.mount(
      <ComponentTestWrapper>
        <PointsCampaignsTable rateType="borrow" rows={data.points} />
      </ComponentTestWrapper>,
    )
    cy.get('[data-testid="borrow-points-campaigns"] tbody')
      .should('contain.text', '20x')
      .and('contain.text', '12x')
      .and('contain.text', 'To campaign')
  })

  it('uses a placeholder when a token price is missing', () => {
    const data = borrowBreakdown(borrowRate({ rebasingYield: 1 }))
    renderRateTable('borrow', data)
    cy.get('[data-testid="borrow-rate-breakdown"] [data-testid="data-table-cell-price"]')
      .first()
      .should('have.text', '-')
  })

  it('keeps the card mounted during loading and errors', () => {
    renderRateTable('borrow', undefined, { isLoading: true })
    cy.get('[data-testid="borrow-rate-breakdown"]').should('be.visible')
    cy.get('[data-testid="borrow-rate-breakdown"] [data-testid^="data-table-loading-"]').should('exist')

    renderRateTable('borrow', undefined, { error: new Error('rate failure') })
    cy.get('[data-testid="borrow-rate-breakdown"]')
      .should('be.visible')
      .and('contain.text', 'Could not load borrow cost breakdown')
  })

  it('hides the price column on mobile', () => {
    cy.viewport(375, 667)
    renderRateTable('borrow', borrowBreakdown())
    cy.get('[data-testid="borrow-rate-breakdown"] [data-testid="data-table-header-price"]').should('not.exist')
    cy.get('[data-testid="borrow-rate-breakdown"] [data-testid="data-table-header-source"]').should('be.visible')
  })
})
