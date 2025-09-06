import { LoanManageSoftLiq } from '@/loan/components/PageLoanManage/LoanManageSoftLiq'
import { ClientWrapper, type Config } from '@cy/support/helpers/ClientWrapper'
import { createTestWagmiConfigFromVNet, forkVirtualTestnet } from '@cy/support/helpers/tenderly'

const privateKey = '0xc9dc976b6701eb9d79c8358317c565cfc6d238a6ecbb0839b352d4f5d71953c9'

const getVirtualNetwork = forkVirtualTestnet((uuid) => ({
  vnet_id: 'a967f212-c4a3-4d65-afb6-2e79055f7a6f',
  display_name: `crvUSD wstETH Soft Liquidation Fork ${uuid}`,
}))

const TestComponent = ({ config }: { config: Config }) => (
  <ClientWrapper config={config} autoConnect={false}>
    <LoanManageSoftLiq market={undefined} />
  </ClientWrapper>
)

describe('Manage soft liquidation', () => {
  it(`should work for loan app`, () => {
    const vnet = getVirtualNetwork()
    if (!vnet) {
      cy.log('Could not fetch virtual testnet')
      return
    }

    const config = createTestWagmiConfigFromVNet({ vnet, privateKey })
    cy.mount(<TestComponent config={config} />)
    cy.pause()
  })
})
