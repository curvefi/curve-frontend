import React from 'react'
import { useNetworksQuery } from '@/dex/entities/networks'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTestWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import Box from '@mui/material/Box'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet/lib/ConnectionProvider'
import { usePathname } from '@ui-kit/hooks/router'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { Chain } from '@ui-kit/utils'

function Test() {
  const { data: networks } = useNetworksQuery()
  const network = useNetworkFromUrl(networks)
  const onChainUnavailable = useOnChainUnavailable(networks)
  const pathname = usePathname()
  return (
    networks && (
      <ConnectionProvider app="dex" network={network} onChainUnavailable={onChainUnavailable} hydrate={{}}>
        <Box id="pathname">{pathname}</Box>
        <Box id="network">{network?.id}</Box>
      </ConnectionProvider>
    )
  )
}

describe('RootLayout RPC Tests', () => {
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `root-layout-${uuid}`,
    display_name: `RootLayout (${uuid})`,
    fork_config: { block_number: '23039344' },
    chain_id: Chain.Arbitrum,
  }))

  it(`redirects to arbitrum when the wallet is connected to it`, () => {
    cy.mount(
      <ComponentTestWrapper config={createTestWagmiConfigFromVNet({ vnet: getVirtualNetwork() })} autoConnect>
        <Test />
      </ComponentTestWrapper>,
    )
    cy.get('#network').should('have.text', `arbitrum`)
    cy.get('#pathname').should('contain.text', `arbitrum`)
  })
})
