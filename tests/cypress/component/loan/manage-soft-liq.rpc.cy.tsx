import { useEffect, useMemo } from 'react'
import { LoanManageSoftLiquidation } from '@/loan/components/PageLoanManage/LoanManageSoftLiquidation'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ClientWrapper } from '@cy/support/helpers/ClientWrapper'
import { createTestWagmiConfigFromVNet, forkVirtualTestnet } from '@cy/support/helpers/tenderly'
import Skeleton from '@mui/material/Skeleton'
import { ConnectionProvider, useConnection } from '@ui-kit/features/connect-wallet'
import { Chain } from '@ui-kit/utils'

describe('Manage soft liquidation', () => {
  const privateKey = '0xc9dc976b6701eb9d79c8358317c565cfc6d238a6ecbb0839b352d4f5d71953c9' // 0xDD84Be02F834295ebE3328e0fE03C015492e2A51
  const network = networks[Chain.Ethereum]
  const MARKET_ID = 'wsteth' // https://www.curve.finance/crvusd/ethereum/markets/wstETH/create

  const getVirtualNetwork = forkVirtualTestnet((uuid) => ({
    vnet_id: 'a967f212-c4a3-4d65-afb6-2e79055f7a6f',
    display_name: `crvUSD wstETH Soft Liquidation Fork ${uuid}`,
  }))

  const TestComponent = () => {
    const { llamaApi } = useConnection()
    const market = useMemo(() => llamaApi?.getMintMarket(MARKET_ID), [llamaApi])
    const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
    const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)

    useEffect(() => {
      if (llamaApi && market) {
        void fetchLoanDetails(llamaApi, market)
        void fetchUserLoanDetails(llamaApi, market)
      }
    }, [fetchLoanDetails, fetchUserLoanDetails, llamaApi, market])

    return market ? <LoanManageSoftLiquidation marketId={MARKET_ID} /> : <Skeleton />
  }

  const TestComponentWrapper = () => (
    <ClientWrapper config={createTestWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })} autoConnect>
      <ConnectionProvider app="llamalend" network={network} onChainUnavailable={console.error}>
        <TestComponent />
      </ConnectionProvider>
    </ClientWrapper>
  )

  describe('loan', () => {
    it(`manual test`, () => {
      cy.mount(<TestComponentWrapper />)
      cy.pause()
    })
  })
})
