import React from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useNetworksQuery } from '@/dex/entities/networks'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTestWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import Box from '@mui/material/Box'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet/lib/ConnectionProvider'
import { usePathname } from '@ui-kit/hooks/router'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Arbitrum

describe('Root redirect', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `root-redirect-${uuid}`,
    display_name: `RootRedirect (${uuid})`,
    fork_config: { block_number: '23039344' },
  }))

  const Test = () => {
    const { data: networks } = useNetworksQuery()
    const onUnavailable = useOnChainUnavailable(networks)
    const pathname = usePathname()
    const network = useNetworkFromUrl(networks)
    return (
      <ConnectionProvider app="dex" network={network} onChainUnavailable={onUnavailable} hydrate={{}}>
        <Box data-testid="test-pathname">{pathname}</Box>
      </ConnectionProvider>
    )
  }

  const TestWrapper = () => (
    <ComponentTestWrapper config={createTestWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })} autoConnect>
      <Test />
    </ComponentTestWrapper>
  )

  it(`redirects to the right chain`, () => {
    cy.mount(<TestWrapper />)
    cy.get('[data-testid="test-pathname"]', LOAD_TIMEOUT).should('have.text', '/dex/arbitrum/networks')
  })
})
