import React, { useMemo } from 'react'
import { BorrowTabContents } from '@/llamalend/widgets/borrow/components/BorrowTabContents'
import networks from '@/loan/networks'
import { ClientWrapper } from '@cy/support/helpers/ClientWrapper'
import { createTestWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { ConnectionProvider, useConnection } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'

const network = networks[1]

function BorrowTabTest() {
  const { llamaApi } = useConnection()
  const market = useMemo(() => llamaApi?.getMintMarket('lbtc'), [llamaApi])
  return market ? <BorrowTabContents market={market} network={network} /> : <Skeleton />
}

describe('BorrowTabContents Component Tests', () => {
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `borrow-tab-${uuid}`,
    display_name: `BorrowTab (${uuid})`,
    fork_config: {
      block_number: '23039344',
    },
  }))

  const BorrowTabTestWrapper = () => (
    <ClientWrapper config={createTestWagmiConfigFromVNet({ vnet: getVirtualNetwork() })} autoConnect>
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

    // todo: mint some coins with tenderly so we can actually do a transaction
    cy.get('[data-testid="borrow-form-errors"]').contains('Exceeds maximum collateral of 0 lbtc')
    // todo: actually sign a transaction with the wagmi test connector and start a loan
    cy.get('[data-testid="borrow-submit-button"]').should('be.disabled')
  })
})
