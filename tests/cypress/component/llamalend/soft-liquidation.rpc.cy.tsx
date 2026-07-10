import { parseUnits } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getActionValue, setSlippageTolerance } from '@cy/support/helpers/llamalend/action-info.helpers'
import { setupLlv2BorrowingLiquidity } from '@cy/support/helpers/llamalend/borrow-cap.helpers'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { submitRepayForm, writeRepayLoanForm } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { setupTenderlySoftLiquidation } from '@cy/support/helpers/llamalend/soft-liq-setup.helpers'
import {
  submitClosePositionForm,
  submitResetPositionForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20 } from '@cy/support/helpers/tenderly/vnet-fund'
import { createVirtualNetworkSnapshot } from '@cy/support/helpers/tenderly/vnet-snapshot'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

const WSTETH_USDC_MARKET = {
  id: 'one-way-market-v2-2',
  controllerAddress: '0xb5EC7A3D591877A66BE4f3eafdC4205E98A1BCAA',
  ammAddress: '0x1C6056540690BAE459a6DC6EFaDDA148Fe43C9dc',
  collateralAddress: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
  collateralDecimals: 18,
  borrowedAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  borrowedDecimals: 6,
} as const

const BORROW = '1000' as const
const IMPROVE_HEALTH_AMOUNT = '10' as const
const CLOSE_SLIPPAGE = '2' as const

describe('Manage soft liquidation', () => {
  skipTestsAfterFailure()

  const chainId = Chain.Optimism // Atm llv2 is only deployed on optimism
  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)
  let snapshot: ReturnType<typeof createVirtualNetworkSnapshot>

  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    chain_id: chainId,
    slug: `wsteth-usdc-soft-liq-${uuid}`,
    display_name: `wstETH USDC Soft Liquidation (${uuid})`,
    fork_config: { block_number: '153784690' },
  }))

  before(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)

    setupLlv2BorrowingLiquidity({
      adminRpcUrl,
      publicRpcUrl,
      chainId,
      borrowedLiquidity: '50000',
      borrowCap: '100000',
      ...WSTETH_USDC_MARKET,
    })

    setupTenderlySoftLiquidation({
      vnet,
      userAddress,
      collateral: '1',
      targetPrice: '1500',
      borrow: BORROW,
      range: 50n,
      collateralFundingMultiplier: 2n,
      ...WSTETH_USDC_MARKET,
    })

    // Give extra borrowed funds for reset, improve-health, and close wallet repayments.
    fundErc20({
      adminRpcUrl,
      amountWei: `0x${parseUnits(BORROW, WSTETH_USDC_MARKET.borrowedDecimals).toString(16)}`,
      tokenAddress: WSTETH_USDC_MARKET.borrowedAddress,
      recipientAddresses: [userAddress],
    })

    snapshot = createVirtualNetworkSnapshot({ vnet })
    snapshot.capture()
  })

  const SoftLiquidationTestWrapper = ({ tab }: Pick<LlammalendTestCaseProps, 'tab'>) => (
    <LlammalendTestCase
      type="loan"
      tab={tab}
      vnet={getVirtualNetwork()}
      privateKey={privateKey}
      chainId={chainId}
      userAddress={userAddress}
      marketId={WSTETH_USDC_MARKET.id}
      marketType={LlamaMarketType.Lend}
    />
  )

  beforeEach(() => {
    snapshot.revert()
  })

  it('resets the position', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="reset" />)

    cy.get('[data-testid="reset-position-input-converted-borrowed"] input[type="text"]', LOAD_TIMEOUT).should($input =>
      expect(Number(String($input.val()).replaceAll(',', ''))).to.be.greaterThan(0),
    )
    getActionValue('borrow-price-range', 'previous').should('match', /\d/)
    getActionValue('borrow-price-range').should('match', /\d/)
    getActionValue('borrow-debt', 'previous').should('match', /\d/)
    getActionValue('borrow-debt').should('match', /\d/)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    submitResetPositionForm({ message: 'Position reset!' })
  })

  it('improves health', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="improve-health" />)
    writeRepayLoanForm({ amount: IMPROVE_HEALTH_AMOUNT })
    getActionValue('borrow-price-range', 'previous').should('match', /\d/)
    getActionValue('borrow-price-range').should('match', /\d/)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')
    submitRepayForm()
  })

  it('closes the position', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="close" />)
    getActionValue('borrow-debt', 'previous').should('match', /\d/)
    getActionValue('borrow-debt').should('equal', '0')
    getActionValue('borrow-slippage').should('equal', '0.50%')
    setSlippageTolerance(CLOSE_SLIPPAGE)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    cy.get('[data-testid="close-position-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')
    submitClosePositionForm()
    cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).should('be.visible')
  })
})
