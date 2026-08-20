import { useMemo } from 'react'
import { BridgeActionInfos } from '@/bridge/features/bridge/components/BridgeActionInfos'
import { BridgeFormContent } from '@/bridge/features/bridge/components/BridgeFormContent'
import { BridgeTokenSelector } from '@/bridge/features/bridge/components/BridgeTokenSelector'
import { getBridgeDestinationChainIds, getBridgeRoute, LAYERZERO_TOKENS } from '@/bridge/features/bridge/layerzero'
import type { BridgeFormValues } from '@/bridge/features/bridge/types'
import { NATIVE_BRIDGES } from '@/bridge/features/bridges/bridges'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import type { NetworkDef } from '@ui/utils'
import { useForm } from '@ui-kit/features/forms'
import { constQ, q } from '@ui-kit/types/util'
import { Chain } from '@ui-kit/utils'

const NETWORKS = [
  { chainId: Chain.Ethereum, id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { chainId: Chain.Arbitrum, id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH' },
  { chainId: Chain.Optimism, id: 'optimism', name: 'Optimism', symbol: 'ETH' },
  { chainId: Chain.Fraxtal, id: 'fraxtal', name: 'Fraxtal', symbol: 'frxETH' },
  { chainId: Chain.Bsc, id: 'bsc', name: 'BSC', symbol: 'BNB', isLite: true },
  { chainId: Chain.Avalanche, id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', isLite: true },
  { chainId: Chain.Fantom, id: 'fantom', name: 'Fantom', symbol: 'FTM', isLite: true },
  { chainId: Chain.Kava, id: 'kava', name: 'Kava', symbol: 'KAVA' },
  { chainId: Chain.Sonic, id: 'sonic', name: 'Sonic', symbol: 'S', isLite: true },
  { chainId: Chain.Xdc, id: 'xdc', name: 'XDC', symbol: 'XDC', isLite: true },
  { chainId: Chain.Etherlink, id: 'etherlink', name: 'Etherlink', symbol: 'XTZ', isLite: true },
] as NetworkDef[]

const BridgeRouteHarness = ({ isConnected = true }: { isConnected?: boolean }) => {
  const form = useForm<BridgeFormValues>({
    defaultValues: {
      fromChainId: Chain.Arbitrum,
      toChainId: Chain.Ethereum,
      token: 'crvUSD',
      amount: '1',
      min: undefined,
      max: undefined,
      walletBalance: '10',
    },
  })
  const values = form.watchValues()
  const route = getBridgeRoute(values)
  const ethereumChainId = NETWORKS.find(({ id }) => id === 'ethereum')?.chainId
  const nativeNetwork = NETWORKS.find(
    ({ chainId }) => chainId === (values.fromChainId === ethereumChainId ? values.toChainId : values.fromChainId),
  )
  const nativeBridgeUrl = NATIVE_BRIDGES.find(({ imageId }) => imageId === `chains/${nativeNetwork?.id}.png`)?.appUrl
  const destinationNetworks = useMemo(
    () => NETWORKS.filter(network => getBridgeDestinationChainIds(values.fromChainId).includes(network.chainId)),
    [values.fromChainId],
  )

  return (
    <>
      <BridgeFormContent
        networks={NETWORKS}
        fromChainId={values.fromChainId}
        toChainId={values.toChainId}
        destinationNetworks={destinationNetworks}
        onNetworkSelected={network =>
          form.update({
            fromChainId: network.chainId,
            toChainId: getBridgeDestinationChainIds(network.chainId)[0],
            amount: undefined,
          })
        }
        onDestinationSelected={network => form.update({ toChainId: network.chainId, amount: undefined })}
        amount={q({ data: values.amount, isLoading: false, error: null })}
        walletBalance={{ balance: values.walletBalance }}
        inputBalanceUsd={undefined}
        tokenAddress={LAYERZERO_TOKENS[values.token]}
        tokenBlockchainId="ethereum"
        tokenSymbol={values.token}
        tokenSelector={<BridgeTokenSelector form={form} token={values.token} disabled={false} />}
        bridgeDisabledAlert={
          route
            ? undefined
            : {
                alertType: 'warning',
                message: (
                  <>
                    This route is not currently supported.{' '}
                    <a href={nativeBridgeUrl} target="_blank" rel="noreferrer">
                      Use the network&apos;s native bridge instead.
                    </a>
                  </>
                ),
              }
        }
        disableAmount={!route}
        disableBridge={!route}
        loading={false}
        isPending={false}
        isApproved={true}
        isConnected={isConnected}
        isWrongNetwork={false}
        onAmount={amount => form.update({ amount })}
        onSubmit={() => undefined}
        onChangeNetwork={() => undefined}
      />
      <BridgeActionInfos
        bridgeCost={constQ(0.001)}
        gas={constQ({ estGasCostUsd: 0.1 })}
        isApproved={true}
        nativeTokenSymbol="ETH"
        provider={route?.provider}
      />
    </>
  )
}

describe('bridge route selection', () => {
  it('combines bridge networks and reports unsupported token routes', () => {
    cy.mount(
      <ComponentTestWrapper config={mockedWagmiConfig}>
        <BridgeRouteHarness />
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="bridge-provider-value"]').should('have.text', 'FastBridge')
    cy.get('input[name="amount"], [data-testid="bridge-origin-select"]').first().should('have.attr', 'name', 'amount')
    cy.get('[data-testid="bridge-origin-select"]').click()
    cy.contains('Select origin network').should('be.visible')
    for (const network of NETWORKS) cy.contains(network.name).should('be.visible')

    cy.get('[data-testid="menu-item-chain-ethereum"]').trigger('mousedown')
    cy.get('[data-testid="bridge-provider-value"]').should('have.text', 'LayerZero')
    cy.get('[data-testid="bridge-destination-select"]').click()
    cy.contains('Select destination network').should('be.visible')
    cy.get('[data-testid="menu-item-chain-bsc"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-avalanche"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-fantom"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-kava"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-sonic"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-xdc"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-etherlink"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-arbitrum"]').should('not.exist')

    cy.get('body').type('{esc}')
    cy.get('[data-testid="bridge-origin-select"]').click()
    cy.get('[data-testid="menu-item-chain-arbitrum"]').trigger('mousedown')
    cy.get('[data-testid="bridge-token-select"]').click()
    cy.contains('Select Token').should('be.visible')
    cy.get('[data-testid="token-option-CRV"]').click()
    cy.contains('This route is not currently supported.').should('be.visible')
    cy.contains('No FastBridge or LayerZero route supports CRV from Arbitrum to Ethereum.').should('not.exist')
    cy.contains('a', "Use the network's native bridge instead.")
      .should('have.attr', 'href', 'https://arbitrum.io/')
      .and('have.attr', 'target', '_blank')
    cy.get('[role="alert"]').should('have.class', 'MuiAlert-colorWarning')
    cy.get('input[name="amount"]').should('be.disabled')
    cy.get('[data-testid="bridge-submit-button"]').should('be.disabled')

    cy.get('[data-testid="bridge-origin-select"]').click()
    cy.get('[data-testid="menu-item-chain-xdc"]').trigger('mousedown')
    cy.get('[data-testid="bridge-token-select"]').click()
    cy.get('[data-testid="token-option-crvUSD"]').click()
    cy.contains('No FastBridge or LayerZero route supports crvUSD from XDC to Ethereum.').should('not.exist')
    cy.contains('a', "Use the network's native bridge instead.").should('have.attr', 'href', 'https://bridge.xdc.org')
    cy.get('[data-testid="bridge-submit-button"]').should('be.disabled')
  })

  it('keeps the amount editable before wallet connection', () => {
    cy.mount(
      <ComponentTestWrapper config={mockedWagmiConfig}>
        <BridgeRouteHarness isConnected={false} />
      </ComponentTestWrapper>,
    )

    cy.get('input[name="amount"]').should('be.enabled').clear().type('2')
  })
})
