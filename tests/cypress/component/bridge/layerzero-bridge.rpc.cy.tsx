import { parseEther } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { BridgeForm } from '@/bridge/features/bridge/components/BridgeForm'
import { networks } from '@/loan/networks'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createVirtualTestnet, createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { BaseConfig } from '@legacy-ui/utils'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { Chain } from '@ui-kit/utils'

const PRIVATE_KEY = generatePrivateKey()
const { address: ADDRESS } = privateKeyToAccount(PRIVATE_KEY)
const AMOUNT = `0x${parseEther('10').toString(16)}` as const
const NATIVE_AMOUNT = `0x${parseEther('10').toString(16)}` as const
const BRIDGE_NETWORKS = networks as unknown as Record<number, BaseConfig>

const runBridgeTest = ({
  chainId,
  network,
  tokenAddress,
  token,
}: {
  chainId: Chain
  network: BaseConfig
  tokenAddress: `0x${string}`
  token: string
}) => {
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `layerzero-bridge-${chainId}-${uuid}`,
    display_name: `LayerZeroBridge ${chainId} (${uuid})`,
    chain_id: chainId,
    fork_config: { block_number: 'latest' },
  }))

  beforeEach(() => {
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({ adminRpcUrl, amountWei: NATIVE_AMOUNT, recipientAddresses: [ADDRESS] })
    fundErc20({ adminRpcUrl, amountWei: AMOUNT, recipientAddresses: [ADDRESS], tokenAddress })
  })

  it(`approves and bridges ${token}`, () => {
    const vnet = getVirtualNetwork()
    cy.mount(
      <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey: PRIVATE_KEY })} autoConnect>
        <CurveProvider app="bridge" network={network} onChainUnavailable={console.error}>
          <BridgeForm chainId={chainId} networks={networks} />
        </CurveProvider>
      </ComponentTestWrapper>,
    )

    if (token !== 'crvUSD') {
      cy.get('[data-testid="bridge-token-select"]').click()
      cy.get(`[data-testid="token-option-${token}"]`).click()
    }
    cy.get('input[name="amount"]').type('1')
    cy.get('[data-testid="bridge-submit-button"]').should('contain.text', 'Approve').click()
    cy.get('[data-testid="bridge-submit-button"]').should('contain.text', `Bridge ${token}`).click()
    cy.contains(`Bridged ${token}`).should('be.visible')
  })
}

describe('LayerZero bridge amount-first contract', () => {
  skipTestsAfterFailure()
  runBridgeTest({
    chainId: Chain.Ethereum,
    network: BRIDGE_NETWORKS[Chain.Ethereum],
    token: 'crvUSD',
    tokenAddress: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
  })
})

describe('LayerZero bridge receiver-first contract', () => {
  skipTestsAfterFailure()
  runBridgeTest({
    chainId: Chain.Bsc,
    network: BRIDGE_NETWORKS[Chain.Bsc],
    token: 'CRV',
    tokenAddress: '0x9996D0276612d23b35f90C51EE935520B3d7355B',
  })
})
