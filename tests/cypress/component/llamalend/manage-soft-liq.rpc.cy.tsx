import { parseUnits } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { setupLlv2BorrowingLiquidity } from '@cy/support/helpers/llamalend/borrow-cap.helpers'
import { LlammalendTestCase } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupTenderlySoftLiquidation } from '@cy/support/helpers/llamalend/soft-liq-setup.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20 } from '@cy/support/helpers/tenderly/vnet-fund'
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

describe('Manage soft liquidation', () => {
  const chainId = Chain.Optimism // Atm llv2 is only deployed on optimism
  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)

  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    chain_id: chainId,
    slug: `wsteth-usdc-soft-liq-${uuid}`,
    display_name: `wstETH USDC Soft Liquidation (${uuid})`,
    fork_config: { block_number: '153784690' },
  }))

  before(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)

    const borrow = '1000' as const

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
      borrow,
      range: 50n,
      collateralFundingMultiplier: 2n,
      ...WSTETH_USDC_MARKET,
    })

    // Give extra borrowed funds to test (full or additional) repays
    fundErc20({
      adminRpcUrl,
      amountWei: `0x${parseUnits(borrow, WSTETH_USDC_MARKET.borrowedDecimals).toString(16)}`,
      tokenAddress: WSTETH_USDC_MARKET.borrowedAddress,
      recipientAddresses: [userAddress],
    })
  })

  const ManageSoftLiquidationTest = ({ tab }: { tab: 'reset' | 'improve-health' | 'close' }) => (
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
    // Makes the card more readable.
    cy.viewport(450, 720)
  })

  describe('should show soft liquidation forms', () => {
    it.skip('shows reset position form', () => {
      cy.mount(<ManageSoftLiquidationTest tab="reset" />)
      cy.get('[data-testid="reset-position-submit-button"]').should('exist')
      cy.pause()
    })

    it.skip('shows improve health form', () => {
      cy.mount(<ManageSoftLiquidationTest tab="improve-health" />)
      cy.get('[data-testid="repay-submit-button"]').should('exist')
      cy.pause()
    })

    it.skip('shows close position form', () => {
      cy.mount(<ManageSoftLiquidationTest tab="close" />)
      cy.get('[data-testid="close-position-submit-button"]').should('exist')
      cy.pause()
    })
  })
})
