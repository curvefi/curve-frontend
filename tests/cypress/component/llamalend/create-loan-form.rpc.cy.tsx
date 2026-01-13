import { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { LoanPreset } from '@/llamalend/constants'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import type { CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { networks } from '@/loan/networks'
import { oneBool, oneValueOf } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum
const MARKETS = {
  [LlamaMarketType.Mint]: {
    id: 'lbtc',
    collateralAddress: '0x8236a87084f8b84306f72007f36f2618a5634494' as const, // lbtc
    collateral: '1',
    borrow: '100',
  },
  [LlamaMarketType.Lend]: {
    id: 'one-way-market-14',
    collateralAddress: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' as const, // USDe
    collateral: '1',
    borrow: '0.9',
  },
}
const oneEthInWei = '0xde0b6b3a7640000' // 1 ETH=1e18 wei

const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', form)

type BorrowTabTestProps = { type: LlamaMarketType } & Pick<CreateLoanOptions, 'onCreated'>

const prefetch = () => prefetchMarkets({})

function BorrowTabTest({ type, onCreated }: BorrowTabTestProps) {
  const { isHydrated, llamaApi } = useCurve()
  const { id } = MARKETS[type]
  const market = useMemo(
    () =>
      isHydrated &&
      { [LlamaMarketType.Mint]: llamaApi?.getMintMarket, [LlamaMarketType.Lend]: llamaApi?.getLendMarket }[type]?.(id),
    [isHydrated, id, llamaApi?.getLendMarket, llamaApi?.getMintMarket, type],
  )
  return market ? (
    <CreateLoanForm market={market} networks={networks} chainId={chainId} onUpdate={onUpdate} onCreated={onCreated} />
  ) : (
    <Skeleton />
  )
}

describe('CreateLoanForm Component Tests', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `borrow-tab-${uuid}`,
    display_name: `BorrowTab (${uuid})`,
    // calldata is created by Odos, which uses the real mainnet state. Fork isn't fully synced, but the chance of reverts is smaller this way
    fork_config: { block_number: 'latest' },
  }))

  const marketType = oneValueOf(LlamaMarketType)
  const { collateralAddress: tokenAddress, collateral, borrow } = MARKETS[marketType]
  const leverageEnabled = oneBool() // test with and without leverage

  beforeEach(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, amountWei: oneEthInWei, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, amountWei: oneEthInWei, tokenAddress, recipientAddresses: [address] })
    cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
  })

  const BorrowTabTestWrapper = (props: BorrowTabTestProps) => (
    <ComponentTestWrapper
      config={createTenderlyWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })}
      autoConnect
    >
      <CurveProvider
        app="llamalend"
        network={networks[chainId]}
        onChainUnavailable={console.error}
        hydrate={{ llamalend: prefetch }}
      >
        <Box sx={{ maxWidth: 500 }}>
          <BorrowTabTest {...props} />
        </Box>
      </CurveProvider>
    </ComponentTestWrapper>
  )

  const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

  function assertLoanDetailsLoaded() {
    getActionValue('borrow-band-range')
      .invoke(LOAD_TIMEOUT, 'text')
      .should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
    getActionValue('borrow-price-range')
      .invoke(LOAD_TIMEOUT, 'text')
      .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
    getActionValue('borrow-apr').contains('%')
    getActionValue('borrow-apr-previous').contains('%')
    getActionValue('borrow-ltv').contains('%')
    getActionValue('borrow-n').contains('50')

    if (leverageEnabled) {
      getActionValue('borrow-price-impact').contains('%')
      getActionValue('borrow-slippage').contains('%')
    } else {
      getActionValue('borrow-price-impact').should('not.exist')
      getActionValue('borrow-slippage').should('not.exist')
    }

    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  }

  it(`calculates max debt and health for ${marketType} market ${leverageEnabled ? 'with' : 'without'} leverage`, () => {
    const onCreated = cy.stub()
    cy.mount(<BorrowTabTestWrapper type={marketType} onCreated={onCreated} />)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')
    cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type(collateral)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
    getActionValue('borrow-health').should('have.text', '∞')
    cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type(borrow)
    getActionValue('borrow-health').should('not.contain.text', '∞')

    if (leverageEnabled) {
      cy.get('[data-testid="leverage-checkbox"]').click()
    }

    // open borrow advanced settings and check all fields
    cy.contains('button', 'Health').click()
    assertLoanDetailsLoaded()

    // click max ltv and max borrow, then back to safe, expect error. Clear it by setting max again
    cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
    cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // should only render after loaded
    cy.get('[data-testid="borrow-set-debt-to-max"]', LOAD_TIMEOUT).click()
    cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click()
    cy.get('[data-testid="helper-message-error"]', LOAD_TIMEOUT).should('contain.text', 'Debt is too high')
    cy.get('[data-testid="borrow-set-debt-to-max"]').click() // set max again to fix error
    cy.get('[data-testid="helper-message-error"]').should('not.exist')
    assertLoanDetailsLoaded()

    // create the loan, expect the onCreated to be called
    cy.get('[data-testid="create-loan-submit-button"]').click()
    cy.get('[data-testid="create-loan-submit-button"]').should('be.disabled')
    cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).should('be.enabled')
    cy.get('[data-testid="create-loan-submit-button"]').then(() => expect(onCreated).to.be.called)
  })
})
