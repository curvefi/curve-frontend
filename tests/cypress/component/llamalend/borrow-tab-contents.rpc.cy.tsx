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

  const BorrowTabTestWrapper = () => {
    const vnet = getVirtualNetwork()
    if (!vnet) throw new Error('Unable to get Virtual Network, check your tenderly configuration')
    return (
      <ClientWrapper config={createTestWagmiConfigFromVNet({ vnet })} autoConnect>
        <ConnectionProvider app="llamalend" network={network} onChainUnavailable={console.error}>
          <Box sx={{ maxWidth: 500 }}>
            <BorrowTabTest />
          </Box>
        </ConnectionProvider>
      </ClientWrapper>
    )
  }

  it('calculates max debt and health', () => {
    cy.mount(<BorrowTabTestWrapper />)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('have.text', '?')
    cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type('1')
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
    cy.get('[data-testid="borrow-health-value"]').should('have.text', '∞')
    cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type('100')
    cy.get('[data-testid="borrow-health-value"]').should('not.contain.text', '∞')
  })
})
