import { useMemo } from 'react'
import { BridgeActionInfos } from '@/bridge/features/bridge/components/BridgeActionInfos'
import { BridgeFormContent } from '@/bridge/features/bridge/components/BridgeFormContent'
import { BridgeTokenSelector } from '@/bridge/features/bridge/components/BridgeTokenSelector'
import { getBridgeDestinationChainIds, getBridgeRoute, LAYERZERO_TOKENS } from '@/bridge/features/bridge/layerzero'
import type { BridgeFormValues } from '@/bridge/features/bridge/types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
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
] as NetworkDef[]

const BridgeRouteHarness = () => {
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
        tokenAddress={LAYERZERO_TOKENS[values.token][Chain.Ethereum]}
        tokenBlockchainId="ethereum"
        tokenSymbol={values.token}
        tokenSelector={<BridgeTokenSelector form={form} token={values.token} disabled={false} />}
        bridgeDisabledAlert={
          route
            ? undefined
            : { alertType: 'info', message: 'This route is not currently supported. Use the canonical bridge instead.' }
        }
        disableBridge={!route}
        loading={false}
        isPending={false}
        isApproved={true}
        isConnected={true}
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
      <ComponentTestWrapper>
        <BridgeRouteHarness />
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="bridge-provider-value"]').should('have.text', 'FastBridge')
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
    cy.get('[data-testid="menu-item-chain-arbitrum"]').should('not.exist')

    cy.get('body').type('{esc}')
    cy.get('[data-testid="bridge-origin-select"]').click()
    cy.get('[data-testid="menu-item-chain-arbitrum"]').trigger('mousedown')
    cy.get('[data-testid="bridge-token-select"]').click()
    cy.contains('Select Token').should('be.visible')
    cy.get('[data-testid="token-option-CRV"]').click()
    cy.contains('This route is not currently supported. Use the canonical bridge instead.').should('be.visible')
    cy.get('[data-testid="bridge-submit-button"]').should('be.disabled')
  })
})
