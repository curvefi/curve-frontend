import { useNetworksQuery } from '@/dex/entities/networks'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { CurveProvider } from '@evm-ui/features/connect-wallet/lib/CurveProvider'
import { usePathname } from '@evm-ui/hooks/router'
import { useNetworkFromUrl } from '@evm-ui/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@evm-ui/hooks/useOnChainUnavailable'
import { Chain } from '@evm-ui/utils'
import Box from '@mui/material/Box'

function Test() {
  const { data: networks } = useNetworksQuery()
  const network = useNetworkFromUrl(networks)
  const onChainUnavailable = useOnChainUnavailable(networks)
  const pathname = usePathname()
  return (
    networks && (
      <CurveProvider app="dex" network={network} onChainUnavailable={onChainUnavailable} hydrate={{}}>
        <Box id="pathname">{pathname}</Box>
        <Box id="network">{network?.id}</Box>
      </CurveProvider>
    )
  )
}

describe('RootLayout RPC Tests', () => {
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `root-layout-${uuid}`,
    display_name: `RootLayout (${uuid})`,
    fork_config: { block_number: '23039344' },
    chain_id: Chain.Arbitrum,
  }))

  it(`redirects to arbitrum when the wallet is connected to it`, () => {
    cy.mount(
      <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet: getVirtualNetwork() })} autoConnect>
        <Test />
      </ComponentTestWrapper>,
    )
    cy.get('#network').should('have.text', `arbitrum`)
    cy.get('#pathname').should('contain.text', `arbitrum`)
  })
})
