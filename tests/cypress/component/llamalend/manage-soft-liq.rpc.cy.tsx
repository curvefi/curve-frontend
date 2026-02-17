import { useMemo, type ReactNode } from 'react'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet, forkVirtualTestnet } from '@cy/support/helpers/tenderly'
import Skeleton from '@mui/material/Skeleton'
import { CurveProvider, useCurve } from '@ui-kit/features/connect-wallet'
import { Chain } from '@ui-kit/utils'

describe('Manage soft liquidation', () => {
  const privateKey = '0xc9dc976b6701eb9d79c8358317c565cfc6d238a6ecbb0839b352d4f5d71953c9' // 0xDD84Be02F834295ebE3328e0fE03C015492e2A51
  const network = networks[Chain.Ethereum]
  const softLiqNetworks = networks as unknown as NetworkDict<LlamaChainId>
  const MARKET_ID = 'wsteth' // https://www.curve.finance/crvusd/ethereum/markets/wstETH/create

  const getVirtualNetwork = forkVirtualTestnet((uuid) => ({
    vnet_id: 'a967f212-c4a3-4d65-afb6-2e79055f7a6f',
    display_name: `crvUSD wstETH Soft Liquidation Fork ${uuid}`,
  }))

  const TestComponent = ({ tab }: { tab: 'improve-health' | 'close-position' }) => {
    const { isHydrated, llamaApi } = useCurve()
    const market = useMemo(() => isHydrated && llamaApi?.getMintMarket(MARKET_ID), [isHydrated, llamaApi])
    if (!market) return <Skeleton />
    return tab === 'improve-health' ? (
      <ImproveHealthForm market={market} networks={softLiqNetworks} chainId={Chain.Ethereum} enabled={isHydrated} />
    ) : (
      <ClosePositionForm market={market} networks={softLiqNetworks} chainId={Chain.Ethereum} enabled={isHydrated} />
    )
  }

  const TestComponentWrapper = ({ children }: { children: ReactNode }) => (
    <ComponentTestWrapper
      config={createTenderlyWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })}
      autoConnect
    >
      <CurveProvider
        app="llamalend"
        network={network}
        onChainUnavailable={console.error}
        hydrate={{ llamalend: () => prefetchMarkets({}) }}
      >
        {children}
      </CurveProvider>
    </ComponentTestWrapper>
  )

  beforeEach(() => {
    // Makes the card more readable
    cy.viewport(450, 720)
  })

  describe('improve health form', () => {
    it.skip(`manual test`, () => {
      cy.mount(
        <TestComponentWrapper>
          <TestComponent tab="improve-health" />
        </TestComponentWrapper>,
      )
      cy.pause()
    })
  })

  describe('close position form', () => {
    it.skip(`manual test`, () => {
      cy.mount(
        <TestComponentWrapper>
          <TestComponent tab="close-position" />
        </TestComponentWrapper>,
      )
      cy.pause()
    })
  })

  /**
   * TODO
   * Add an automated component test that:
   * 0. Verify initial amounts in action infos, user wallet balance and metric values in the "Close Position" tab.
   * 1. When a user inputs a balance to repay to improve health, the action infos update accordingly.
   * 2. When a user inputs more than their wallet balance, an error is shown.
   * 3. When a user inputs more than the total debt, an error is shown.
   * 4. When a user clicks the "Repay" button
   *  a. The button text changes to a loading state.
   *  b. The max button's value will be reduced by the repaid amount.
   *  c. The user crvUSD wallet balance gets reduced by the repaid amount.
   *  d. The action infos update accordingly.
   * 5. User goes to "Close Position" tab.
   * 6. Verify the metric values in the "Close Position" tab now a part has been repaid
   * 7. User clicks the "Close Position" button
   *  a. The button text changes to a loading state.
   *  b. The metric values are zero.
   *  c. Action infos are updated accordingly.
   *  d. User wallet balances are updated accordingly in improve health tab.
   */
})
