import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { DECIMAL_REGEX, DECIMAL_RANGE_REGEX, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { setupLlv2BorrowingLiquidity } from '@cy/support/helpers/llamalend/borrow-cap.helpers'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { submitRepayForm, writeRepayLoanForm } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { setupTenderlySoftLiquidation } from '@cy/support/helpers/llamalend/soft-liq-setup.helpers'
import {
  submitClosePositionForm,
  submitResetPositionForm,
  writeResetPositionWalletAmount,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { resetLlamaTestContext } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { createVirtualNetworkSnapshot, type VnetSnapshot } from '@cy/support/helpers/tenderly/vnet-snapshot'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import { MarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const WSTETH_USDC_MARKET = {
  id: 'one-way-market-v2-2',
  controllerAddress: '0xb5EC7A3D591877A66BE4f3eafdC4205E98A1BCAA',
  ammAddress: '0x1C6056540690BAE459a6DC6EFaDDA148Fe43C9dc',
  collateralAddress: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
  collateralDecimals: 18,
  borrowedAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  borrowedDecimals: 6,
} as const

const BORROW = '800' as const
const IMPROVE_HEALTH_AMOUNT = '200' as const
const RESET_WALLET_AMOUNT = '25' as const

describe('Manage liquidation', () => {
  skipTestsAfterFailure()

  const chainId = Chain.Optimism // Atm llv2 is only deployed on optimism
  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)
  let snapshot: VnetSnapshot

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
      borrow: BORROW,
      range: 50n,
      collateralFundingMultiplier: 2n,
      ...WSTETH_USDC_MARKET,
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
      marketType={MarketType.Lend}
    />
  )

  beforeEach(() => {
    resetLlamaTestContext()
    snapshot.revert()
  })

  it('resets the position', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="reset" />)

    getActionValue('borrow-price-range', 'previous').should('match', DECIMAL_RANGE_REGEX)
    getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
    getActionValue('borrow-debt', 'previous').should('match', DECIMAL_REGEX)
    getActionValue('borrow-debt').should('match', DECIMAL_REGEX)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    writeResetPositionWalletAmount({ amount: RESET_WALLET_AMOUNT })
    submitResetPositionForm({ message: 'Position reset!' })
  })

  it('improves health', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="improve-health" />)
    writeRepayLoanForm({ amount: IMPROVE_HEALTH_AMOUNT })
    getActionValue('borrow-price-range', 'previous').should('match', DECIMAL_RANGE_REGEX)
    getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')
    submitRepayForm()
  })

  it('closes the position', () => {
    cy.mount(<SoftLiquidationTestWrapper tab="close" />)
    getActionValue('borrow-debt', 'previous').should('match', DECIMAL_REGEX)
    getActionValue('borrow-debt').should('equal', '0')
    getActionValue('borrow-slippage').should('equal', `${Number(SLIPPAGE.leverage.default).toFixed(2)}%`)
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    cy.get('[data-testid="close-position-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')
    submitClosePositionForm()
    cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).should('be.visible')
  })
})
