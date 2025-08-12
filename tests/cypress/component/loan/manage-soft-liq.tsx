import React from 'react'
import { ClientWrapper, type Config } from '@/support/helpers/ClientWrapper'
import { createTestWagmiConfigFromVNet, withVirtualTestnet } from '@/support/helpers/tenderly'

const getVirtualNetwork = withVirtualTestnet((uuid) => ({
  slug: `pegkeepers-${uuid}`,
  display_name: `Pegkeepers (${uuid})`,
  fork_config: {
    block_number: '23039344',
  },
}))

const TestComponent = ({ config }: { config: Config }) => (
  <ClientWrapper config={config} autoConnect={false}>
    Yolo mag swagginton
  </ClientWrapper>
)

describe('PegKeeper', () => {
  it(`should work for loan app`, () => {
    const vnet = getVirtualNetwork()
    if (!vnet) {
      cy.log('Could not create virtual testnet')
      return
    }

    const config = createTestWagmiConfigFromVNet(vnet)
    cy.mount(<TestComponent config={config} />)
  })
})
