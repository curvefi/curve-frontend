import { parseEther, toHex } from 'viem'
import { mainnet } from 'viem/chains'
import { FormClaimFees } from '@/dao/components/PageVeCrv/components/FormClaimFees'
import { networks } from '@/dao/networks'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { setupMockedDaoComponentTest } from '@cy/support/helpers/dao/test-context.helpers'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { setVirtualNetworkClockToFork } from '@cy/support/helpers/tenderly/vnet-clock'
import { fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { CurveProvider } from '@evm-ui/features/connect-wallet'

const USER_ADDRESS = '0xD4f9FE0039Da59e6DDb21bbb6E84e0C9e83D73eD'
const REWARDS = { '3CRV': '0.0000012155', crvUSD: '24.422' }

describe('FormClaimFees (RPC)', () => {
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `claim-fees-${uuid}`,
    display_name: `Claim fees (${uuid})`,
    fork_config: { block_number: '26055408' }, // At this point in time USER_ADDRESS has a claim on both types of fees (3crv and crvusd)
  }))

  before(() => setVirtualNetworkClockToFork(getRpcUrls(getVirtualNetwork())))

  beforeEach(setupMockedDaoComponentTest)

  it('claims both fee tokens and refreshes their rows', () => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    const config = createTenderlyWagmiConfigFromVNet({ vnet, account: USER_ADDRESS })
    fundEth({ adminRpcUrl, recipientAddresses: [USER_ADDRESS], amountWei: toHex(parseEther('1')) })

    cy.mount(
      <ComponentTestWrapper config={config} autoConnect>
        <CurveProvider app="dao" network={networks[mainnet.id]} onChainUnavailable={console.error}>
          <FormClaimFees chainId={mainnet.id} />
        </CurveProvider>
      </ComponentTestWrapper>,
    )

    Object.entries(REWARDS).forEach(([token, amount]) => {
      cy.get(`[data-testid="claim-fees-${token}"]`, LOAD_TIMEOUT)
        .should('contain.text', amount)
        .find('button')
        .should('be.enabled')
    })

    Object.keys(REWARDS).forEach(token => {
      cy.get(`[data-testid="claim-fees-${token}"]`).find('button').should('be.enabled').click()
      cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).should(
        'contain.text',
        `${token} fees have been claimed and sent to your wallet.`,
      )
      cy.get(`[data-testid="claim-fees-${token}"]`).within(() => {
        cy.contains(/^0$/).should('be.visible')
        cy.get('button').should('be.visible').and('be.disabled')
      })
    })

    cy.get('[data-testid^="claim-fees-"] button:disabled').should('have.length', 2)
  })
})
