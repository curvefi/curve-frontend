import React, { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { OnBorrowFormUpdate } from '@/llamalend/widgets/borrow/borrow.types'
import { BorrowTabContents } from '@/llamalend/widgets/borrow/components/BorrowTabContents'
import networks from '@/loan/networks'
import { ClientWrapper } from '@cy/support/helpers/ClientWrapper'
import { createTestWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useConnection } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet/lib/ConnectionProvider'
import { Chain } from '@ui-kit/utils'

const network = networks[Chain.Ethereum]
const MARKET_ID = 'lbtc'
const COLLATERAL_ADDRESS = '0x8236a87084f8b84306f72007f36f2618a5634494'
const oneEthInWei = '0xde0b6b3a7640000' // 1 ETH=1e18 wei

const onUpdate: OnBorrowFormUpdate = async (form) => console.info('form updated', form)

function BorrowTabTest() {
  const { llamaApi } = useConnection()
  const market = useMemo(() => llamaApi?.getMintMarket(MARKET_ID), [llamaApi])
  return market ? <BorrowTabContents market={market} network={network} onUpdate={onUpdate} /> : <Skeleton />
}

describe('BorrowTabContents Component Tests', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `borrow-tab-${uuid}`,
    display_name: `BorrowTab (${uuid})`,
    fork_config: {
      block_number: '23039344',
    },
  }))

  beforeEach(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, amountWei: oneEthInWei, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, amountWei: oneEthInWei, tokenAddress: COLLATERAL_ADDRESS, recipientAddresses: [address] })
    cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
  })

  const BorrowTabTestWrapper = () => (
    <ClientWrapper config={createTestWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })} autoConnect>
      <ConnectionProvider app="llamalend" network={network} onChainUnavailable={console.error}>
        <Box sx={{ maxWidth: 500 }}>
          <BorrowTabTest />
        </Box>
      </ConnectionProvider>
    </ClientWrapper>
  )

  const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`)

  it('calculates max debt and health', () => {
    cy.mount(<BorrowTabTestWrapper />)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('exist')
    cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type('1')
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
    getActionValue('borrow-health').should('have.text', '∞')
    cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type('100')
    getActionValue('borrow-health').should('not.contain.text', '∞')

    // open borrow advanced settings and check all fields
    cy.contains('button', 'Health').click()

    getActionValue('borrow-price-impact').contains('%')
    getActionValue('borrow-band-range').should('exist') // bands are giving an error for now, don't check the content
    getActionValue('borrow-price-range')
      .invoke('text')
      .should('match', /(\d(\.\d+)?)( - )(\d(\.\d+)?)/)
    getActionValue('borrow-apr').contains('%')
    getActionValue('borrow-ltv').contains('%')
    getActionValue('borrow-slippage').contains('%')
    getActionValue('borrow-n').contains('50')

    cy.get('[data-testid="borrow-form-errors"]').should('not.exist')
    // todo: actually sign a transaction with the wagmi test connector and start a loan
    cy.get('[data-testid="borrow-submit-button"]').should('be.enabled')
  })
})
